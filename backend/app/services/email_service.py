import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

from app.config.settings import settings
from app.models.email import EmailData

logger = logging.getLogger(__name__)


def send_email(email_data: EmailData) -> bool:
    """
    Sends the report email with a PDF attachment using 100% Free SMTP (e.g. Gmail SMTP).
    Cost: Free of cost ($0.00). Uses standard Google App Password or standard SMTP server.
    Automatically delivers to both the company (info@intelligreentech.com)
    and the manager (shikhar@intelligreentech.com).
    """
    # Build recipient list: ensure manager receives the report
    recipient_set = set()
    if settings.MANAGER_EMAIL:
        recipient_set.add(settings.MANAGER_EMAIL.strip().lower())

    # [FUTURE FEATURE TOGGLE] Company Operations email - temporarily blocked per user instruction
    # To re-enable info@intelligreentech.com in future, simply uncomment below:
    # if settings.COMPANY_EMAIL:
    #     recipient_set.add(settings.COMPANY_EMAIL.strip().lower())

    if email_data.receiver_email:
        for r in email_data.receiver_email.replace(";", ",").split(","):
            cleaned = r.strip().lower()
            if cleaned and "@" in cleaned:
                recipient_set.add(cleaned)

    recipients = list(recipient_set)
    if not recipients:
        recipients = [settings.MANAGER_EMAIL or "shikhar@intelligreentech.com"]

    # 1. Primary Method: 100% Free SMTP (e.g. Gmail SMTP or custom company SMTP)
    if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
        sender_email = settings.SMTP_EMAIL.strip()
        sender_pass = settings.SMTP_PASSWORD.strip()
        smtp_host = settings.SMTP_HOST.strip()
        smtp_port = settings.SMTP_PORT
        from_name = settings.SMTP_FROM_NAME.strip()

        logger.info(
            "Sending report via free SMTP (%s:%d) from %s to %s",
            smtp_host,
            smtp_port,
            sender_email,
            recipients,
        )

        message = MIMEMultipart()
        message["Subject"] = email_data.subject
        message["From"] = f"{from_name} <{sender_email}>"
        message["To"] = ", ".join(recipients)

        # Attach formatted HTML body
        message.attach(MIMEText(email_data.html, "html"))

        # Attach PDF Report with proper descriptive filename based on form
        filename = (
            email_data.attachment_name
            or (email_data.pdf_path.name if email_data.pdf_path else "IntelliGreen_Report.pdf")
        )
        if email_data.pdf_path and email_data.pdf_path.exists():
            with email_data.pdf_path.open("rb") as file:
                attachment = MIMEApplication(file.read(), Name=filename)
            attachment["Content-Disposition"] = f'attachment; filename="{filename}"'
            message.attach(attachment)

        try:
            if settings.SMTP_USE_SSL or smtp_port == 465:
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=25) as smtp:
                    smtp.login(sender_email, sender_pass)
                    smtp.send_message(message, from_addr=sender_email, to_addrs=recipients)
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=25) as smtp:
                    smtp.ehlo()
                    smtp.starttls()
                    smtp.ehlo()
                    smtp.login(sender_email, sender_pass)
                    smtp.send_message(message, from_addr=sender_email, to_addrs=recipients)

            logger.info("Successfully dispatched report email to %s via SMTP (%s)", recipients, smtp_host)
            return True
        except Exception as smtp_err:
            logger.error("Failed to deliver email via SMTP: %s", smtp_err)
            raise

    # 2. Optional Fallback: Resend API (if configured)
    if settings.RESEND_API_KEY:
        try:
            import resend
            import base64

            resend.api_key = settings.RESEND_API_KEY
            pdf_base64 = ""
            filename = (
                email_data.attachment_name
                or (email_data.pdf_path.name if email_data.pdf_path else "IntelliGreen_Report.pdf")
            )

            if email_data.pdf_path and email_data.pdf_path.exists():
                with email_data.pdf_path.open("rb") as pdf_file:
                    pdf_base64 = base64.b64encode(pdf_file.read()).decode("utf-8")

            params = {
                "from": "IntelliGreen Reporting <onboarding@resend.dev>",
                "to": recipients,
                "subject": email_data.subject,
                "html": email_data.html,
                "attachments": (
                    [{"filename": filename, "content": pdf_base64}]
                    if pdf_base64
                    else []
                ),
            }
            resend.Emails.send(params)
            logger.info("Successfully sent email via Resend to %s", recipients)
            return True
        except Exception as resend_err:
            logger.warning("Resend delivery failed: %s", resend_err)
            raise

    logger.warning(
        "Free SMTP credentials are not yet entered in backend/.env (SMTP_EMAIL / SMTP_PASSWORD). "
        "The report PDF was generated and downloaded, but email dispatch was skipped."
    )
    return False