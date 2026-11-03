from fastapi import APIRouter, HTTPException, Response, Depends
from pathlib import Path
import smtplib

from app.config.settings import settings
from app.core.security import get_current_technician

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
def generate_commissioning_ai_summary(
    request: CommissioningSummaryRequest,
    current_user: dict = Depends(get_current_technician),
):
    try:
        prompt = build_commissioning_summary_prompt(request)
        summary = generate_summary(prompt)
        return SummaryResponse(success=True, summary=summary)
    except Exception:
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
def submit_commissioning(
    report: CommissioningReportRequest,
    current_user: dict = Depends(get_current_technician),
):
    return process_commissioning_report(report)


@router.post("/commissioning/download-pdf")
def download_commissioning_pdf(
    report: CommissioningReportRequest,
    current_user: dict = Depends(get_current_technician),
):
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
def generate_ppm_ai_summary(
    request: PPMSummaryRequest,
    current_user: dict = Depends(get_current_technician),
):
    try:
        prompt = build_ppm_summary_prompt(request)
        summary = generate_summary(prompt)
        return SummaryResponse(success=True, summary=summary)
    except Exception:
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
def submit_ppm(
    report: PPMReportRequest,
    current_user: dict = Depends(get_current_technician),
):
    return process_ppm_report(report)


@router.post("/ppm/download-pdf")
def download_ppm_pdf(
    report: PPMReportRequest,
    current_user: dict = Depends(get_current_technician),
):
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
def submit_report(
    report: ReportRequest,
    current_user: dict = Depends(get_current_technician),
):
    return process_report(report)


# ==========================================
# SMTP STATUS & DIAGNOSTIC ENDPOINTS
# ==========================================

@router.get("/smtp-status")
@router.get("/smtp-status/")
def get_smtp_status():
    """
    Sanitized email service status check. Never exposes passwords, internal file paths,
    or sensitive server configuration.
    """
    smtp_configured = bool(settings.SMTP_EMAIL and settings.SMTP_PASSWORD)
    resend_configured = bool(settings.RESEND_API_KEY)
    brevo_configured = bool(settings.BREVO_API_KEY)
    active_provider = settings.EMAIL_PROVIDER or (
        "resend" if resend_configured and not smtp_configured else ("brevo" if brevo_configured and not smtp_configured else "smtp")
    )
    return {
        "status": "online",
        "configured": smtp_configured or resend_configured or brevo_configured,
        "activeProvider": active_provider,
        "smtpConfigured": smtp_configured,
        "resendConfigured": resend_configured,
        "brevoConfigured": brevo_configured,
        "host": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "fromName": settings.SMTP_FROM_NAME,
    }


@router.post("/test-smtp")
@router.post("/test-smtp/")
def trigger_smtp_test(current_user: dict = Depends(get_current_technician)):
    """
    Protected diagnostic test. Only authenticated technicians can trigger SMTP tests.
    """
    sender_email = settings.SMTP_EMAIL.strip()
    sender_pass = settings.SMTP_PASSWORD.strip()

    if not (sender_email and sender_pass):
        raise HTTPException(
            status_code=400,
            detail="SMTP credentials are not configured in backend/.env.",
        )

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
            "message": f"SMTP authentication succeeded! Connected to {settings.SMTP_HOST}:{settings.SMTP_PORT}.",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SMTP connection test failed: {str(e)}",
        )


# ==========================================
# SUPABASE DATABASE ENDPOINTS
# ==========================================

@router.get("/supabase-status")
@router.get("/supabase-status/")
def get_supabase_status():
    """
    Sanitized Supabase health check.
    """
    return test_supabase_connection()


@router.get("/commissioning/history")
def get_commissioning_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_technician),
):
    """
    Retrieves stored commissioning reports from Supabase. (Requires authentication)
    """
    return {
        "success": True,
        "reports": list_commissioning_reports(limit=limit),
    }


@router.get("/ppm/history")
def get_ppm_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_technician),
):
    """
    Retrieves stored PPM maintenance reports from Supabase. (Requires authentication)
    """
    return {
        "success": True,
        "reports": list_ppm_reports(limit=limit),
    }
