import html
from datetime import datetime
from typing import Any
from app.models.commissioning import CommissioningReportRequest
from app.models.ppm import PPMReportRequest
from app.models.report import ReportRequest


def _esc(val: Any) -> str:
    """Escapes user input to prevent HTML Injection and XSS."""
    if val is None:
        return ""
    return html.escape(str(val).strip())


def generate_commissioning_html(report: CommissioningReportRequest) -> str:
    submitted_at = datetime.now().strftime("%d %b %Y %I:%M %p")
    comm_date = (
        report.commissioningDate.strftime("%d %b %Y")
        if hasattr(report.commissioningDate, "strftime")
        else _esc(report.commissioningDate)
    )

    sample_rows = ""
    for s in report.ionSamples:
        sample_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{_esc(s.sampleName)}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{_esc(s.preStandard)}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0f766e;">{_esc(s.postReading)}</td>
        </tr>
        """

    sensor_rows = ""
    for idx, sensor in enumerate(report.sensors, start=1):
        sensor_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{idx}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{_esc(sensor.location)}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">{_esc(sensor.macId)}</td>
        </tr>
        """

    sensor_desc_html = (
        f'<p style="font-size: 13px; color: #475569; margin: 4px 0 10px 0;">{_esc(report.sensorDescription)}</p>'
        if report.sensorDescription and report.sensorDescription.strip()
        else ""
    )

    ion_section_html = ""
    if report.ionSamples and len(report.ionSamples) > 0:
        ion_section_html = f"""
        <h3 style="margin: 20px 0 8px 0; font-size: 16px; color: #0f766e;">Ion Concentration Test Results</h3>
        <table>
            <thead>
                <tr>
                    <th style="text-align: center;">Sample</th>
                    <th style="text-align: center;">Pre (Ions/cm³) (Standard)</th>
                    <th style="text-align: center;">Post (Ions/cm³)</th>
                </tr>
            </thead>
            <tbody>
                {sample_rows}
            </tbody>
        </table>
        <p style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">
            * OEM studies confirm ion concentrations &gt;1500 ions/cm³ effectively destroy viral protein surfaces including COVID-19.
        </p>
        """

    sensors_section_html = ""
    if report.sensors or (report.sensorDescription and report.sensorDescription.strip()):
        sensors_section_html = f"""
        <h3 style="margin: 25px 0 8px 0; font-size: 16px; color: #0f766e;">IAQM Sensors & BMS Integration</h3>
        {sensor_desc_html}
        """
        if report.sensors and len(report.sensors) > 0:
            sensors_section_html += f"""
        <table>
            <thead>
                <tr>
                    <th style="width: 10%; text-align: center;">#</th>
                    <th>Location / Floor</th>
                    <th>Sensor MAC ID</th>
                </tr>
            </thead>
            <tbody>
                {sensor_rows}
            </tbody>
        </table>
        """

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
    font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 20px;
    color: #1e293b;
}}
.container {{
    max-width: 700px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}}
.header {{
    background: linear-gradient(135deg, #0f766e, #115e59);
    color: #ffffff;
    padding: 24px;
    text-align: center;
}}
.content {{
    padding: 24px;
}}
.card {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 20px;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}}
th {{
    background-color: #0f766e;
    color: white;
    padding: 8px 10px;
    font-size: 13px;
    text-align: left;
    border: 1px solid #0f766e;
}}
td {{
    font-size: 13px;
}}
.footer {{
    text-align: center;
    padding: 16px;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
}}
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">IntelliGreen TECHNOLOGIES</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">IntelliGreen-IAQ Solution — Commissioning Report</p>
    </div>

    <div class="content">
        <div class="card">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f766e;">Project & Installation Information</h3>
            <p style="margin: 4px 0; font-size: 13px;"><b>Project:</b> {_esc(report.client.project)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Client:</b> {_esc(report.client.clientName)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Location:</b> {_esc(report.client.location)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Client Rep:</b> {_esc(report.client.clientRepresentative)} ({_esc(report.client.contactNo)})</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Model Installed:</b> {_esc(report.description)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Commissioning Date:</b> {comm_date}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Technician:</b> {_esc(report.installer.contactPerson)} ({_esc(report.installer.contactNo)})</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Submitted At:</b> {submitted_at}</p>
        </div>

        {ion_section_html}
        {sensors_section_html}
    </div>

    <div class="footer">
        Unit No COS/3L/Office/17, M3M Cosmopolitan Sector-66, Gurgaon, Haryana, 122002<br/>
        Contact: 0124-4256862 | info@intelligreentech.com | www.intelligreentech.com
    </div>
</div>

</body>
</html>
"""


def generate_ppm_html(report: PPMReportRequest) -> str:
    submitted_at = datetime.now().strftime("%d %b %Y %I:%M %p")
    current_ppm = (
        report.ppmInfo.currentPpm.strftime("%d %b %Y")
        if hasattr(report.ppmInfo.currentPpm, "strftime")
        else _esc(report.ppmInfo.currentPpm)
    )

    check_rows = ""
    for item in report.checkList:
        condition_badge = f'<span style="background-color: #ecfdf5; color: #065f46; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #a7f3d0;">{_esc(item.condition)}</span>'
        check_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{item.sn}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 500;">{_esc(item.checkList)}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{condition_badge}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 12px;">{_esc(item.actionTaken) or '-'}</td>
        </tr>
        """

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
    font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 20px;
    color: #1e293b;
}}
.container {{
    max-width: 700px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}}
.header {{
    background: linear-gradient(135deg, #0f766e, #115e59);
    color: #ffffff;
    padding: 24px;
    text-align: center;
}}
.content {{
    padding: 24px;
}}
.grid {{
    display: table;
    width: 100%;
    margin-bottom: 20px;
}}
.col {{
    display: table-cell;
    width: 50%;
    vertical-align: top;
    padding-right: 10px;
}}
.card {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 14px;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}}
th {{
    background-color: #0f766e;
    color: white;
    padding: 8px 10px;
    font-size: 13px;
    text-align: left;
    border: 1px solid #0f766e;
}}
td {{
    font-size: 13px;
}}
.footer {{
    text-align: center;
    padding: 16px;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
}}
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">IntelliGreen TECHNOLOGIES</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Periodic Preventive Maintenance (PPM) Check List Report</p>
    </div>

    <div class="content">
        <div class="card">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f766e;">Service & Equipment Summary</h3>
            <p style="margin: 4px 0; font-size: 13px;"><b>Client:</b> {_esc(report.project.client)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Location:</b> {_esc(report.project.location)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>PA Details:</b> {_esc(report.equipment.paDetails)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>IAQ Monitor Details:</b> {_esc(report.equipment.iaqMonitorDetails)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Last PPM:</b> {_esc(report.ppmInfo.lastPpm)} &nbsp;|&nbsp; <b>Current PPM:</b> {current_ppm}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Technician:</b> {_esc(report.signatures.technicianName)} &nbsp;|&nbsp; <b>Client Rep:</b> {_esc(report.signatures.clientRepName)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Submitted At:</b> {submitted_at}</p>
        </div>

        <h3 style="margin: 20px 0 8px 0; font-size: 16px; color: #0f766e;">7-Point Preventive Maintenance Inspection</h3>
        <table>
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">SN</th>
                    <th style="width: 42%;">Check List</th>
                    <th style="width: 25%;">Condition</th>
                    <th style="width: 25%;">Action Taken</th>
                </tr>
            </thead>
            <tbody>
                {check_rows}
            </tbody>
        </table>

        <div class="card" style="margin-top: 20px;">
            <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #0f766e;">Client's Remark / Feedback:</h4>
            <p style="margin: 0; font-size: 13px; color: #334155;">{_esc(report.signatures.clientFeedback) or 'No specific feedback provided.'}</p>
        </div>
    </div>

    <div class="footer">
        Unit No COS/3L/Office/17, M3M Cosmopolitan Sector-66, Gurgaon, Haryana, 122002<br/>
        Contact: 0124-4256862 | info@intelligreentech.com | www.intelligreentech.com
    </div>
</div>

</body>
</html>
"""


def generate_html(report: ReportRequest) -> str:
    visit_rows = ""
    submitted_at = datetime.now().strftime("%d %b %Y %I:%M %p")

    for index, visit in enumerate(report.visits, start=1):
        visit_rows += f"""
        <tr>
            <td>{index}</td>
            <td>{_esc(visit.clientName)}</td>
            <td>{_esc(visit.personMet)}</td>
            <td>{_esc(visit.designation)}</td>
            <td>{_esc(visit.clientPhoneNumber)}</td>
            <td>{_esc(visit.discussionSummary)}</td>
            <td>{_esc(visit.nextAction)}</td>
        </tr>
        """

    return f"""
<!DOCTYPE html>
<html>
<head>
<style>
body {{
    font-family: Arial, sans-serif;
    padding:20px;
}}

table {{
    border-collapse: collapse;
    width:100%;
}}

th,td {{
    border:1px solid #ccc;
    padding:8px;
}}

th {{
    background-color:#eee;
}}
</style>
</head>
<body>

<h2>Daily Sales Visit Report</h2>
<p><b>Employee ID:</b> {_esc(report.employee.employeeId)}</p>
<p><b>Employee Name:</b> {_esc(report.employee.employeeName)}</p>
<p><b>Date:</b> {_esc(report.employee.date)}</p>
<p><b>City:</b> {_esc(report.employee.city)}</p>
<p><b>Submitted At:</b> {submitted_at}</p>

<table>
<tr>
<th>#</th>
<th>Client Name</th>
<th>Person Met</th>
<th>Designation</th>
<th>Phone Number</th>
<th>Discussion Summary</th>
<th>Next Action</th>
</tr>
{visit_rows}
</table>

<p><b>Key Win:</b> {_esc(report.daySummary.keyWin)}</p>
<p><b>Challenges:</b> {_esc(report.daySummary.challenges)}</p>
<p><b>Other Remarks:</b> {_esc(report.daySummary.otherRemarks)}</p>

<h3>AI Summary</h3>
<p>{_esc(report.aiSummary)}</p>

</body>
</html>
"""
