from app.models.summary import SummaryRequest
from app.models.commissioning import CommissioningReportRequest, CommissioningSummaryRequest
from app.models.ppm import PPMReportRequest, PPMSummaryRequest


def build_commissioning_summary_prompt(
    report: CommissioningReportRequest | CommissioningSummaryRequest,
) -> str:
    samples_text = ""
    for s in report.ionSamples:
        samples_text += f"- {s.sampleName}: Pre-test Standard {s.preStandard} ions/cm³, Post-test {s.postReading} ions/cm³\n"

    sensors_text = ""
    for idx, sensor in enumerate(report.sensors, start=1):
        sensors_text += f"{idx}. {sensor.location} (MAC: {sensor.macId})\n"

    return f"""
You are an expert HVAC & Indoor Air Quality (IAQ) Commissioning Field Engineer at IntelliGreen Technologies.

Generate ONLY a concise, professional executive summary for an IntelliGreen-IAQ Solution Commissioning Report.

Rules:
- Length: 120-170 words.
- Tone: Technical, authoritative, executive-ready.
- Plain text only (no markdown, no bold asterisks, no bullets, no greetings).
- Highlight:
  1. The successful commissioning of installed models ({report.description}) at project '{report.client.project}' for '{report.client.clientName}' in {report.client.location}.
  2. The significant enhancement in negative ion concentration from standard ambient levels (50-250 ions/cm³) to post-commissioning active levels (reaching up to high density negative ions), comfortably exceeding the 1,500 ions/cm³ threshold established by global OEM studies for viral and pathogen deactivation (including COVID-19).
  3. The RS485 communication network integration of {len(report.sensors)} IAQM monitoring sensors transmitting real-time telemetry to the client's BMS server.
  4. Final handover readiness and confirmation of operational parameters.

Details:
Date: {report.commissioningDate}
Installer: {report.installer.installerName} (Technician: {report.installer.contactPerson})
Client: {report.client.clientName} | Project: {report.client.project} | Location: {report.client.location}
Samples Tested:
{samples_text}
Sensors Deployed:
{sensors_text}
"""


def build_ppm_summary_prompt(
    report: PPMReportRequest | PPMSummaryRequest,
) -> str:
    checklist_text = ""
    for item in report.checkList:
        checklist_text += f"{item.sn}. {item.checkList}: Condition = '{item.condition}', Action Taken = '{item.actionTaken}'\n"

    return f"""
You are an expert Air Purification Field Service Engineer at IntelliGreen Technologies.

Generate ONLY a concise, professional executive summary for a Periodic Preventive Maintenance (PPM) Report for Central Air Purification Systems.

Rules:
- Length: 110-160 words.
- Tone: Formal engineering and field maintenance tone.
- Plain text only (no markdown, no bold asterisks, no bullets, no greetings).
- Highlight:
  1. Client ({report.project.client}) and site location ({report.project.location}), maintenance date ({report.ppmInfo.currentPpm}), and equipment serviced ({report.equipment.paDetails}, {report.equipment.iaqMonitorDetails}).
  2. Summary of 7-point preventive maintenance tasks performed (ionizing needle/brush cleaning, fuse and indicator light status, electrical wiring integrity, IAQM sensor connectivity, and fine filter inspection/replacement).
  3. Key actions taken to optimize system performance and maintain peak purification efficacy.
  4. Confirmation of operational parameters, client feedback acknowledgment, and reminder for the next scheduled PPM.

Checklist Details:
{checklist_text}
Technician: {report.signatures.technicianName}
Client Representative: {report.signatures.clientRepName}
Client Remarks: {report.signatures.clientFeedback}
"""


def build_summary_prompt(report: SummaryRequest) -> str:
    visits = ""
    for index, visit in enumerate(report.visits, start=1):
        visits += f"""
Visit {index}
Visit Type: {visit.visitType}
Client: {visit.clientName}
Location: {visit.location}
Person Met: {visit.personMet}
Designation: {visit.designation}
Discussion: {visit.discussionSummary}
Next Action: {visit.nextAction}
Follow Up: {visit.followUpDate}
"""

    return f"""
You are an internal Sales Reporting Assistant.

Generate ONLY a professional end-of-day sales summary.

Rules:
- Maximum 150 words.
- Return plain text only.
- Do NOT use markdown.
- Do NOT use bullet points.
- Do NOT use headings.
- Do NOT greet anyone.
- Do NOT provide templates.
- Do NOT explain anything.
- Write as if this summary will be emailed to a manager.
- Mention customer interactions, key outcomes, opportunities, challenges and next actions.
- End naturally.

Employee Name:
{report.employee.employeeName}

City:
{report.employee.city}

Date:
{report.employee.date}

Customer Visits:
{visits}

Key Win:
{report.daySummary.keyWin}

Challenges:
{report.daySummary.challenges}

Remarks:
{report.daySummary.otherRemarks}
"""