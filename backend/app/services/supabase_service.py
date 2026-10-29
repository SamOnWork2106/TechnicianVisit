from datetime import datetime, date
import logging
from typing import Any, Dict, List, Optional
from supabase import create_client, Client

from app.config.settings import settings
from app.models.commissioning import CommissioningReportRequest
from app.models.ppm import PPMReportRequest

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase client singleton, or None if credentials are missing.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY

    if not url or not key:
        return None

    try:
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        logger.warning("Could not initialize Supabase client: %s", e)
        return None


def is_supabase_configured() -> bool:
    """Returns True if Supabase URL and Key are configured."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)


def test_supabase_connection() -> Dict[str, Any]:
    """
    Tests the connection to Supabase database and verifies the tables are accessible.
    """
    if not is_supabase_configured():
        return {
            "configured": False,
            "connected": False,
            "message": "Supabase credentials are not configured in backend/.env. Please enter SUPABASE_URL and SUPABASE_KEY.",
            "url": None,
        }

    client = get_supabase_client()
    if not client:
        return {
            "configured": True,
            "connected": False,
            "message": "Failed to initialize Supabase client. Check URL and Key syntax.",
            "url": settings.SUPABASE_URL,
        }

    try:
        # Check querying the technicians or commissioning_reports table
        res = client.table("technicians").select("username, full_name, role").limit(5).execute()
        return {
            "configured": True,
            "connected": True,
            "message": f"Successfully connected to Supabase database at {settings.SUPABASE_URL}!",
            "url": settings.SUPABASE_URL,
            "tables": ["technicians", "commissioning_reports", "ppm_reports"],
            "technicians": res.data or [],
        }
    except Exception as e:
        # If the table doesn't exist yet, give a helpful prompt to run supabase_schema.sql
        error_msg = str(e)
        if "relation" in error_msg.lower() or "table" in error_msg.lower():
            hint = "Connected to Supabase, but tables are not created yet. Run backend/supabase_schema.sql in your Supabase SQL Editor."
        else:
            hint = f"Supabase connection test failed: {error_msg}"
        return {
            "configured": True,
            "connected": False,
            "message": hint,
            "url": settings.SUPABASE_URL,
            "error": error_msg,
        }


def save_commissioning_report(
    report: CommissioningReportRequest,
    pdf_filename: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Persists a commissioning report to Supabase PostgreSQL database.
    Saves both high-level indexed fields and the full JSON payload.
    """
    client = get_supabase_client()
    if not client:
        logger.info("Supabase not configured; skipping database persistence.")
        return None

    try:
        comm_date_str = (
            report.commissioningDate.isoformat()
            if isinstance(report.commissioningDate, (date, datetime))
            else str(report.commissioningDate)
        )

        installer_name = getattr(report.installer, "contactPerson", "") if report.installer else ""
        client_rep = getattr(report.client, "clientRepresentative", "") if report.client else ""
        ion_count = len(report.ionSamples) if getattr(report, "ionSamples", None) else 0
        sensors_count = len(report.sensors) if getattr(report, "sensors", None) else 0

        row: Dict[str, Any] = {
            "report_number": f"COMM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "client_name": getattr(report.client, "clientName", "N/A"),
            "project_name": getattr(report.client, "project", "N/A"),
            "site_location": getattr(report.client, "location", ""),
            "system_type": getattr(report, "description", "")[:250],
            "commissioning_date": comm_date_str,
            "technician_id": "TECH-01",
            "technician_name": installer_name or getattr(report, "submittedBy", "Technician"),
            "engineer_name": installer_name,
            "client_rep_name": client_rep,
            "manager_email": settings.MANAGER_EMAIL,
            "company_email": settings.COMPANY_EMAIL,
            "ion_samples_count": ion_count,
            "sensors_count": sensors_count,
            "status": "submitted",
            "pdf_filename": pdf_filename or "",
            "raw_data": report.model_dump(mode="json"),
        }

        response = client.table("commissioning_reports").insert(row).execute()
        logger.info("Commissioning report saved to Supabase: %s", response.data)
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error("Failed to save commissioning report to Supabase: %s", e)
        return None


def save_ppm_report(
    report: PPMReportRequest,
    pdf_filename: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Persists a PPM check list report to Supabase PostgreSQL database.
    """
    client = get_supabase_client()
    if not client:
        logger.info("Supabase not configured; skipping database persistence.")
        return None

    try:
        ppm_date_str = (
            report.ppmInfo.currentPpm.isoformat()
            if isinstance(report.ppmInfo.currentPpm, (date, datetime))
            else str(report.ppmInfo.currentPpm)
        )

        client_name = getattr(report.project, "client", "N/A") if report.project else "N/A"
        location = getattr(report.project, "location", "") if report.project else ""
        tech_name = getattr(report.signatures, "technicianName", "") if report.signatures else ""
        client_rep = getattr(report.signatures, "clientRepName", "") if report.signatures else ""
        client_feedback = getattr(report.signatures, "clientFeedback", "") if report.signatures else ""
        pa_details = getattr(report.equipment, "paDetails", "") if report.equipment else ""

        row: Dict[str, Any] = {
            "report_number": f"PPM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "client_name": client_name,
            "project_name": client_name,
            "site_location": location,
            "system_installed": pa_details,
            "maintenance_date": ppm_date_str,
            "service_contract_no": "",
            "quarter_or_type": "PPM Routine Maintenance",
            "technician_name": tech_name,
            "client_rep_name": client_rep,
            "manager_email": settings.MANAGER_EMAIL,
            "company_email": settings.COMPANY_EMAIL,
            "status": "submitted",
            "client_remarks": client_feedback,
            "pdf_filename": pdf_filename or "",
            "raw_data": report.model_dump(mode="json"),
        }

        response = client.table("ppm_reports").insert(row).execute()
        logger.info("PPM report saved to Supabase: %s", response.data)
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error("Failed to save PPM report to Supabase: %s", e)
        return None


def list_commissioning_reports(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetches recent commissioning reports from Supabase.
    """
    client = get_supabase_client()
    if not client:
        return []
    try:
        res = (
            client.table("commissioning_reports")
            .select("id, report_number, client_name, project_name, site_location, commissioning_date, technician_name, status, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to fetch commissioning reports from Supabase: %s", e)
        return []


def list_ppm_reports(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetches recent PPM reports from Supabase.
    """
    client = get_supabase_client()
    if not client:
        return []
    try:
        res = (
            client.table("ppm_reports")
            .select("id, report_number, client_name, project_name, site_location, maintenance_date, technician_name, status, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to fetch PPM reports from Supabase: %s", e)
        return []
