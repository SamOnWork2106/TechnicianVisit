import os
import smtplib
import base64
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

import requests
from app.config.settings import settings
from app.models.email import EmailData

logger = logging.getLogger(__name__)


def _send_via_smtp(email_data: EmailData, recipients: list[str]) -> bool:
    """
    Sends email via traditional SMTP (e.g. Gmail App Password on port 587 / 465).
    NOTE: Render Free Tier blocks outbound ports 25, 465, and 587.
    """
    sender_email = settings.SMTP_EMAIL.strip()
    sender_pass = settings.SMTP_PASSWORD.strip()
    smtp_host = settings.SMTP_HOST.strip()
    smtp_port = settings.SMTP_PORT
    from_name = settings.SMTP_FROM_NAME.strip()

    logger.info(
        "Attempting dispatch via SMTP (%s:%d) from %s to %s",
        smtp_host,
        smtp_port,
        sender_email,
        recipients,
    )

    message = MIMEMultipart()
    message["Subject"] = email_data.subject
    message["From"] = f"{from_name} <{sender_email}>"
    message["To"] = ", ".join(recipients)

    message.attach(MIMEText(email_data.html, "html"))

    filename = (
        email_data.attachment_name
        or (email_data.pdf_path.name if email_data.pdf_path else "IntelliGreen_Report.pdf")
    )
    if email_data.pdf_path and email_data.pdf_path.exists():
        with email_data.pdf_path.open("rb") as file:
            attachment = MIMEApplication(file.read(), Name=filename)
        attachment["Content-Disposition"] = f'attachment; filename="{filename}"'
        message.attach(attachment)

    # Use a 10s timeout so that blocked cloud firewalls fail quickly
    timeout_sec = 10
    if settings.SMTP_USE_SSL or smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=timeout_sec) as smtp:
            smtp.login(sender_email, sender_pass)
            smtp.send_message(message, from_addr=sender_email, to_addrs=recipients)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=timeout_sec) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(sender_email, sender_pass)
            smtp.send_message(message, from_addr=sender_email, to_addrs=recipients)

    logger.info("Successfully dispatched report email to %s via SMTP (%s)", recipients, smtp_host)
    return True


def _send_via_resend(email_data: EmailData, recipients: list[str]) -> bool:
    """
    Sends email via Resend HTTP REST API over Port 443 (HTTPS).
    Works 100% on Render Free Tier without port blocks. Free 3,000 emails/month.
    """
    import resend

    resend.api_key = settings.RESEND_API_KEY
    filename = (
        email_data.attachment_name
        or (email_data.pdf_path.name if email_data.pdf_path else "IntelliGreen_Report.pdf")
    )
    pdf_base64 = ""
    if email_data.pdf_path and email_data.pdf_path.exists():
        with email_data.pdf_path.open("rb") as pdf_file:
            pdf_base64 = base64.b64encode(pdf_file.read()).decode("utf-8")

    from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()
    from_header = f"{settings.SMTP_FROM_NAME.strip()} <{from_email}>"

    logger.info("Attempting dispatch via Resend HTTP API (Port 443) to %s", recipients)
    params = {
        "from": from_header,
        "to": recipients,
        "subject": email_data.subject,
        "html": email_data.html,
        "attachments": (
            [{"filename": filename, "content": pdf_base64}]
            if pdf_base64
            else []
        ),
    }
    res = resend.Emails.send(params)
    logger.info("Successfully sent email via Resend HTTP API to %s (ID: %s)", recipients, getattr(res, "id", "sent"))
    return True


def _send_via_brevo(email_data: EmailData, recipients: list[str]) -> bool:
    """
    Sends email via Brevo (Sendinblue) HTTP REST API over Port 443 (HTTPS).
    Works 100% on Render Free Tier. Free 300 emails/day to any recipient.
    """
    filename = (
        email_data.attachment_name
        or (email_data.pdf_path.name if email_data.pdf_path else "IntelliGreen_Report.pdf")
    )
    sender_email = settings.SMTP_EMAIL.strip() or os.getenv("BREVO_SENDER_EMAIL", "info@intelligreentech.com").strip()
    from_name = settings.SMTP_FROM_NAME.strip()

    payload = {
        "sender": {"name": from_name, "email": sender_email},
        "to": [{"email": r} for r in recipients],
        "subject": email_data.subject,
        "htmlContent": email_data.html,
    }

    if email_data.pdf_path and email_data.pdf_path.exists():
        with email_data.pdf_path.open("rb") as f:
            b64_content = base64.b64encode(f.read()).decode("utf-8")
        payload["attachment"] = [{"name": filename, "content": b64_content}]

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    logger.info("Attempting dispatch via Brevo HTTP API (Port 443) to %s", recipients)
    resp = requests.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers, timeout=20)
    if resp.status_code in (200, 201, 202):
        logger.info("Successfully dispatched email via Brevo HTTP API to %s", recipients)
        return True
    else:
        raise RuntimeError(f"Brevo HTTP API failed (status {resp.status_code}): {resp.text}")


def send_email(email_data: EmailData) -> bool:
    """
    Unified email dispatcher supporting:
    1. Traditional SMTP (e.g. Gmail App Password on port 587/465)
    2. Resend HTTP Web API (Port 443 HTTPS - 100% allowed on Render Free Tier)
    3. Brevo HTTP Web API (Port 443 HTTPS - 100% allowed on Render Free Tier)
    """
    recipient_set = set()
    if settings.MANAGER_EMAIL:
        recipient_set.add(settings.MANAGER_EMAIL.strip().lower())

    if email_data.receiver_email:
        for r in email_data.receiver_email.replace(";", ",").split(","):
            cleaned = r.strip().lower()
            if cleaned and "@" in cleaned:
                recipient_set.add(cleaned)

    recipients = list(recipient_set)
    if not recipients:
        recipients = [settings.MANAGER_EMAIL or "vikash@intelligreentech.com"]

    provider = settings.EMAIL_PROVIDER.lower()
    is_render = os.getenv("RENDER") == "true" or os.getenv("RENDER_SERVICE_ID") is not None

    # Priority 1: If user explicitly requested an HTTP provider or provided Resend/Brevo on Render
    if provider == "resend" or (settings.RESEND_API_KEY and (provider != "smtp" and (is_render or not (settings.SMTP_EMAIL and settings.SMTP_PASSWORD)))):
        try:
            return _send_via_resend(email_data, recipients)
        except Exception as resend_err:
            logger.error("Resend API failed: %s", resend_err)
            if provider == "resend":
                raise

    if provider == "brevo" or (settings.BREVO_API_KEY and (provider != "smtp" and (is_render or not (settings.SMTP_EMAIL and settings.SMTP_PASSWORD)))):
        try:
            return _send_via_brevo(email_data, recipients)
        except Exception as brevo_err:
            logger.error("Brevo API failed: %s", brevo_err)
            if provider == "brevo":
                raise

    # Priority 2: Standard SMTP (Gmail, etc.)
    smtp_err: Exception | None = None
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD and provider != "resend" and provider != "brevo":
        try:
            return _send_via_smtp(email_data, recipients)
        except Exception as err:
            smtp_err = err
            logger.warning("SMTP delivery attempt failed: %s", err)

            # If on Render and hit Network Unreachable, try HTTP fallbacks before giving up
            if settings.RESEND_API_KEY:
                logger.info("Falling back to Resend HTTP API after SMTP failure...")
                try:
                    return _send_via_resend(email_data, recipients)
                except Exception as res_fb_err:
                    logger.error("Resend fallback also failed: %s", res_fb_err)

            if settings.BREVO_API_KEY:
                logger.info("Falling back to Brevo HTTP API after SMTP failure...")
                try:
                    return _send_via_brevo(email_data, recipients)
                except Exception as br_fb_err:
                    logger.error("Brevo fallback also failed: %s", br_fb_err)

            # If no fallback succeeded, formulate a clear, actionable error
            err_str = str(smtp_err)
            if "101" in err_str or "unreachable" in err_str.lower() or "timeout" in err_str.lower():
                raise RuntimeError(
                    f"SMTP delivery blocked ({err_str}). "
                    f"NOTE: Render Free Tier blocks outbound ports 25, 465, and 587. "
                    f"To send emails for free on Render, add RESEND_API_KEY or BREVO_API_KEY to your Render Environment Variables (works over HTTPS port 443), "
                    f"or upgrade your Render service to Starter ($7/mo) to unlock port 587."
                ) from smtp_err
            raise smtp_err

    # Priority 3: Fallback if SMTP was not configured but Resend/Brevo key exists
    if settings.RESEND_API_KEY:
        return _send_via_resend(email_data, recipients)

    if settings.BREVO_API_KEY:
        return _send_via_brevo(email_data, recipients)

    logger.warning(
        "No email service configured. Please provide SMTP credentials or RESEND_API_KEY/BREVO_API_KEY in environment."
    )
    return False
