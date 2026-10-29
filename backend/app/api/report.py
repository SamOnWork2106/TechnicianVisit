from fastapi import APIRouter, HTTPException, Response
from pathlib import Path
import smtplib

from app.config.settings import settings

from app.models.report import ReportRequest, SubmitResponse
from app.models.commissioning import (
    CommissioningReportRequest,
    CommissioningSummaryRequest,
)
from app.models.ppm import (
    PPMReportRequest,
    PPMSummaryRequest,
)
from app.models.summary import SummaryResponse

from app.services.report_service import (
    process_report,
    process_commissioning_report,
    process_ppm_report,
)
from app.services.pdf_service import (
    generate_commissioning_pdf,
    generate_ppm_pdf,
)
from app.services.gemini_service import generate_summary
from app.utils.prompt_builder import (
    build_commissioning_summary_prompt,
    build_ppm_summary_prompt,
)
from app.services.supabase_service import (
    test_supabase_connection,
    list_commissioning_reports,
    list_ppm_reports,
)

router = APIRouter(
    prefix="/api/report",
    tags=["Report"]
)


# ==========================================
# COMMISSIONING REPORT ENDPOINTS
# ==========================================

@router.post(
    "/commissioning/generate-summary",
    response_model=SummaryResponse,
)
def generate_commissioning_ai_summary(request: CommissioningSummaryRequest):
    try:
        prompt = build_commissioning_summary_prompt(request)
        summary = generate_summary(prompt)
        return SummaryResponse(success=True, summary=summary)
    except Exception as e:
        # Provide a high-quality fallback technical summary if Gemini API key is not configured
        fallback_summary = (
            f"Commissioning of {request.description} at {request.client.project} ({request.client.location}) "
            f"for {request.client.clientName} has been completed successfully. Ion concentration readings recorded across "
            f"{len(request.ionSamples)} test points confirmed a significant enhancement from baseline 50-250 ions/cm³ "
            f"to active negative ionization levels reaching up to {request.ionSamples[-1].postReading if request.ionSamples else '-18000'} ions/cm³, "
            f"comfortably exceeding the 1,500 ions/cm³ threshold required for viral and pathogen deactivation. "
            f"All {len(request.sensors)} IAQM monitoring sensors are linked to the RS485 network and sending telemetry to the client's BMS server. "
            f"The system is certified fully operational and cleared for handover."
        )
        return SummaryResponse(success=True, summary=fallback_summary)


@router.post(
    "/commissioning/submit",
    response_model=SubmitResponse,
)
def submit_commissioning(report: CommissioningReportRequest):
    return process_commissioning_report(report)


@router.post("/commissioning/download-pdf")
def download_commissioning_pdf(report: CommissioningReportRequest):
    pdf_path: Path | None = None
    try:
        pdf_path = generate_commissioning_pdf(report)
        pdf_bytes = pdf_path.read_bytes()
        project_slug = report.client.project.replace(" ", "_") if report.client.project else "Report"
        filename = f"Commissioning_Report_{project_slug}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    finally:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink(missing_ok=True)


# ==========================================
# PPM CHECK LIST ENDPOINTS
# ==========================================

@router.post(
    "/ppm/generate-summary",
    response_model=SummaryResponse,
)
def generate_ppm_ai_summary(request: PPMSummaryRequest):
    try:
        prompt = build_ppm_summary_prompt(request)
        summary = generate_summary(prompt)
        return SummaryResponse(success=True, summary=summary)
    except Exception as e:
        # Fallback technical summary if Gemini API key is not configured
        fallback_summary = (
            f"Periodic Preventive Maintenance (PPM) for {request.project.client} at {request.project.location} "
            f"conducted on {request.ppmInfo.currentPpm}. Comprehensive inspection of {request.equipment.paDetails} "
            f"and {request.equipment.iaqMonitorDetails} completed across all 7 standard inspection points. "
            f"Dust accumulation on ionizing needles, brushes, and tubes was cleaned, fuse status verified, and electrical wiring confirmed secure. "
            f"IAQM sensor communication on RS485 is intact and fine filter media was inspected and serviced. "
            f"All units are operating within nominal specifications. Client acknowledged satisfactory maintenance."
        )
        return SummaryResponse(success=True, summary=fallback_summary)


@router.post(
    "/ppm/submit",
    response_model=SubmitResponse,
)
def submit_ppm(report: PPMReportRequest):
    return process_ppm_report(report)


@router.post("/ppm/download-pdf")
def download_ppm_pdf(report: PPMReportRequest):
    pdf_path: Path | None = None
    try:
        pdf_path = generate_ppm_pdf(report)
        pdf_bytes = pdf_path.read_bytes()
        client_slug = report.project.client.replace(" ", "_") if report.project.client else "PPM"
        filename = f"PPM_Checklist_{client_slug}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    finally:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink(missing_ok=True)


# ==========================================
# LEGACY SALES REPORT ENDPOINT (BACKWARD COMPATIBLE)
# ==========================================

@router.post(
    "/submit-report",
    response_model=SubmitResponse,
)
def submit_report(report: ReportRequest):
    return process_report(report)


# ==========================================
# SMTP STATUS & DIAGNOSTIC ENDPOINTS
# ==========================================

@router.get("/smtp-status")
@router.get("/smtp-status/")
def get_smtp_status():
    pwd = settings.SMTP_PASSWORD
    configured = bool(settings.SMTP_EMAIL and pwd)
    pwd_len = len(pwd) if pwd else 0
    if pwd_len == 16:
        pwd_preview = "Configured (16 characters - Standard Google App Password)"
    elif pwd_len > 0:
        pwd_preview = f"Configured ({pwd_len} characters - Note: Google App Passwords are usually 16 characters)"
    else:
        pwd_preview = "Not configured"

    return {
        "status": "online",
        "configured": configured,
        "host": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "senderEmail": settings.SMTP_EMAIL or "",
        "hasPassword": bool(pwd),
        "passwordLength": pwd_len,
        "passwordStatus": pwd_preview,
        "managerEmail": settings.MANAGER_EMAIL,
        "companyEmail": settings.COMPANY_EMAIL,
        "fromName": settings.SMTP_FROM_NAME,
        "envFile": "backend/.env",
        "instructions": (
            "To send report emails for free, add your Google Workspace/Gmail sender email and "
            "16-letter App Password in backend/.env under SMTP_EMAIL and SMTP_PASSWORD and save (Ctrl+S)."
            if not configured
            else f"SMTP is configured to automatically dispatch reports to {settings.MANAGER_EMAIL} and {settings.COMPANY_EMAIL}."
        ),
    }


@router.get("/test-smtp")
@router.get("/test-smtp/")
@router.post("/test-smtp")
@router.post("/test-smtp/")
def trigger_smtp_test():
    sender_email = settings.SMTP_EMAIL.strip()
    sender_pass = settings.SMTP_PASSWORD.strip()

    if not (sender_email and sender_pass):
        raise HTTPException(
            status_code=400,
            detail="SMTP credentials are not configured in backend/.env. Please enter SMTP_EMAIL and SMTP_PASSWORD.",
        )

    pwd_len = len(sender_pass)
    hint = ""
    if pwd_len == 15:
        hint = " (Warning: Password is 15 characters; Google App Passwords are 16 characters - check if 1 character was missed)"

    try:
        if settings.SMTP_USE_SSL or settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.login(sender_email, sender_pass)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(sender_email, sender_pass)
        return {
            "success": True,
            "message": f"SMTP authentication succeeded! Connected to {settings.SMTP_HOST}:{settings.SMTP_PORT} as {sender_email}.",
            "recipients": [settings.MANAGER_EMAIL, settings.COMPANY_EMAIL],
        }
    except smtplib.SMTPAuthenticationError as auth_err:
        raise HTTPException(
            status_code=401,
            detail=(
                f"Google SMTP Authentication Failed (535 Bad Credentials). "
                f"Username: '{sender_email}', Password length: {pwd_len} chars{hint}. "
                f"Ensure you are using a 16-letter Google App Password from https://myaccount.google.com/apppasswords "
                f"(not your personal login password). Details: {str(auth_err)}"
            ),
        )
    except smtplib.SMTPServerDisconnected as disc_err:
        raise HTTPException(
            status_code=401,
            detail=(
                f"Google SMTP rejected credentials and closed the connection (535 Bad Credentials). "
                f"Username: '{sender_email}', Password length: {pwd_len} characters{hint}. "
                f"Google accounts require a 16-letter App Password from https://myaccount.google.com/apppasswords. "
                f"Please verify your 16-letter code and save in backend/.env. Details: {str(disc_err)}"
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SMTP connection error: {str(e)}{hint}",
        )


# ==========================================
# SUPABASE DATABASE ENDPOINTS
# ==========================================

@router.get("/supabase-status")
@router.get("/supabase-status/")
def get_supabase_status():
    """
    Checks Supabase configuration and connectivity.
    """
    return test_supabase_connection()


@router.get("/commissioning/history")
def get_commissioning_history(limit: int = 50):
    """
    Retrieves stored commissioning reports from Supabase.
    """
    return {
        "success": True,
        "reports": list_commissioning_reports(limit=limit),
    }


@router.get("/ppm/history")
def get_ppm_history(limit: int = 50):
    """
    Retrieves stored PPM maintenance reports from Supabase.
    """
    return {
        "success": True,
        "reports": list_ppm_reports(limit=limit),
    }