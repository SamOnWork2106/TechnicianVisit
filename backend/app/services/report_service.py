from pathlib import Path
import logging
from fastapi import HTTPException

from app.models.commissioning import CommissioningReportRequest
from app.models.ppm import PPMReportRequest
from app.models.report import ReportRequest, SubmitResponse
from app.services.html_template import (
    generate_html,
    generate_commissioning_html,
    generate_ppm_html,
)
from app.services.pdf_service import (
    generate_pdf,
    generate_commissioning_pdf,
    generate_ppm_pdf,
)
from app.services.email_service import send_email
from app.models.email import EmailData
from app.config.settings import settings
from app.services.supabase_service import (
    save_commissioning_report,
    save_ppm_report,
)

logger = logging.getLogger(__name__)


def process_commissioning_report(report: CommissioningReportRequest) -> SubmitResponse:
    pdf_path: Path | None = None
    try:
        html = generate_commissioning_html(report)
        pdf_path = generate_commissioning_pdf(report)

        # Build recipients list: Currently restricted to Manager only (info@intelligreentech.com & client email blocked per user instruction)
        recipients = [settings.MANAGER_EMAIL]

        # [FUTURE FEATURE TOGGLE] Company Operations email - uncomment when ready to re-enable:
        # if settings.COMPANY_EMAIL and settings.COMPANY_EMAIL not in recipients:
        #     recipients.append(settings.COMPANY_EMAIL)

        # [FUTURE FEATURE TOGGLE] Client Representative email - uncomment when ready to re-enable:
        # if report.client and getattr(report.client, "email", None):
        #     client_mail = str(report.client.email).strip()
        #     if client_mail and "@" in client_mail and client_mail not in recipients:
        #         recipients.append(client_mail)

        receiver_email = ", ".join(recipients)

        comm_date_str = (
            report.commissioningDate.strftime("%d.%m.%Y")
            if hasattr(report.commissioningDate, "strftime")
            else str(report.commissioningDate)
        )

        project_raw = (report.client.project if report.client and report.client.project else "").strip()
        clean_project = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in project_raw).strip("_")
        comm_pdf_name = f"Commissioning_Report_{clean_project}.pdf" if clean_project else "Commissioning_Report.pdf"

        email_data = EmailData(
            receiver_email=receiver_email,
            subject=(
                f"IntelliGreen Commissioning Report | {report.client.project} | "
                f"{report.client.clientName} | {comm_date_str}"
            ),
            html=html,
            pdf_path=pdf_path,
            attachment_name=comm_pdf_name,
        )

        email_sent = False
        email_err_msg = ""
        try:
            email_sent = send_email(email_data)
        except Exception as mail_err:
            email_err_msg = str(mail_err)
            logger.warning("Email sending warning (proceeding with success): %s", mail_err)

        # Persist to Supabase Database
        try:
            pdf_name = f"Commissioning_Report_{report.client.project.replace(' ', '_')}.pdf" if report.client.project else "Commissioning_Report.pdf"
            save_commissioning_report(report, pdf_filename=pdf_name)
        except Exception as db_err:
            logger.warning("Supabase database persistence warning: %s", db_err)

        if email_sent:
            msg = f"Commissioning Report for {report.client.project} submitted and dispatched to: {', '.join(recipients)}."
        elif not (settings.SMTP_EMAIL and settings.SMTP_PASSWORD):
            msg = f"Commissioning Report for {report.client.project} submitted and PDF generated. Note: Email skipped (SMTP_EMAIL / SMTP_PASSWORD not saved in backend/.env)."
        else:
            msg = f"Commissioning Report for {report.client.project} submitted and PDF generated. Note: SMTP connection failed ({email_err_msg or 'check Gmail App Password'})."

        return SubmitResponse(
            success=True,
            message=msg,
            reportType="commissioning",
        )

    except Exception as e:
        logger.exception("Failed to process commissioning report: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Unable to process commissioning report: {str(e)}",
        )
    finally:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink(missing_ok=True)


def process_ppm_report(report: PPMReportRequest) -> SubmitResponse:
    pdf_path: Path | None = None
    try:
        html = generate_ppm_html(report)
        pdf_path = generate_ppm_pdf(report)

        # Build recipients list: Currently restricted to Manager only (info@intelligreentech.com & client email blocked per user instruction)
        recipients = [settings.MANAGER_EMAIL]

        # [FUTURE FEATURE TOGGLE] Company Operations email - uncomment when ready to re-enable:
        # if settings.COMPANY_EMAIL and settings.COMPANY_EMAIL not in recipients:
        #     recipients.append(settings.COMPANY_EMAIL)

        # [FUTURE FEATURE TOGGLE] Client Representative email - uncomment when ready to re-enable:
        # if hasattr(report.project, "clientEmail") and report.project.clientEmail:
        #     client_mail = str(report.project.clientEmail).strip()
        #     if client_mail and "@" in client_mail and client_mail not in recipients:
        #         recipients.append(client_mail)

        receiver_email = ", ".join(recipients)

        ppm_date_str = (
            report.ppmInfo.currentPpm.strftime("%d.%m.%Y")
            if hasattr(report.ppmInfo.currentPpm, "strftime")
            else str(report.ppmInfo.currentPpm)
        )

        client_raw = (report.project.client if report.project and report.project.client else "").strip()
        clean_client = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in client_raw).strip("_")
        ppm_pdf_name = f"PPM_Checklist_Report_{clean_client}.pdf" if clean_client else "PPM_Checklist_Report.pdf"

        email_data = EmailData(
            receiver_email=receiver_email,
            subject=(
                f"IntelliGreen PPM Maintenance Report | {report.project.client} | "
                f"{report.signatures.technicianName} | {ppm_date_str}"
            ),
            html=html,
            pdf_path=pdf_path,
            attachment_name=ppm_pdf_name,
        )

        email_sent = False
        email_err_msg = ""
        try:
            email_sent = send_email(email_data)
        except Exception as mail_err:
            email_err_msg = str(mail_err)
            logger.warning("Email sending warning (proceeding with success): %s", mail_err)

        # Persist to Supabase Database
        try:
            pdf_name = ppm_pdf_name
            save_ppm_report(report, pdf_filename=pdf_name)
        except Exception as db_err:
            logger.warning("Supabase database persistence warning: %s", db_err)

        if email_sent:
            msg = f"PPM Check List report for {report.project.client} submitted and dispatched to: {', '.join(recipients)}."
        elif not (settings.SMTP_EMAIL and settings.SMTP_PASSWORD):
            msg = f"PPM Check List report for {report.project.client} submitted and PDF generated. Note: Email skipped (SMTP_EMAIL / SMTP_PASSWORD not saved in backend/.env)."
        else:
            msg = f"PPM Check List report for {report.project.client} submitted and PDF generated. Note: SMTP connection failed ({email_err_msg or 'check Gmail App Password'})."

        return SubmitResponse(
            success=True,
            message=msg,
            reportType="ppm",
        )

    except Exception as e:
        logger.exception("Failed to process PPM report: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Unable to process PPM report: {str(e)}",
        )
    finally:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink(missing_ok=True)


def process_report(report: ReportRequest) -> SubmitResponse:
    pdf_path: Path | None = None
    try:
        html = generate_html(report)
        pdf_path = generate_pdf(report)

        receiver_email = report.employee.managerEmail.strip()
        if not receiver_email:
            raise HTTPException(
                status_code=400,
                detail="Manager email is required.",
            )

        emp_raw = (report.employee.employeeName or "Sales").strip()
        clean_emp = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in emp_raw).strip("_")
        sales_pdf_name = f"Sales_Visit_Report_{clean_emp}_{report.employee.date}.pdf"

        email_data = EmailData(
            receiver_email=receiver_email,
            subject=(
                f"Daily Sales Visit Report | "
                f"{report.employee.employeeName} | "
                f"{report.employee.date}"
            ),
            html=html,
            pdf_path=pdf_path,
            attachment_name=sales_pdf_name,
        )

        send_email(email_data)

        return SubmitResponse(
            success=True,
            message="Report submitted successfully.",
            reportType="sales",
        )

    except Exception:
        logger.exception(
            "Failed to submit report for employee %s",
            report.employee.employeeId,
        )
        raise HTTPException(
            status_code=500,
            detail="Unable to submit report.",
        )
    finally:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink(missing_ok=True)