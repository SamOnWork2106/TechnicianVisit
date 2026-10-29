from datetime import datetime
from app.models.commissioning import CommissioningReportRequest
from app.models.ppm import PPMReportRequest
from app.models.report import ReportRequest


def generate_commissioning_html(report: CommissioningReportRequest) -> str:
    submitted_at = datetime.now().strftime("%d %b %Y %I:%M %p")
    comm_date = (
        report.commissioningDate.strftime("%d %b %Y")
        if hasattr(report.commissioningDate, "strftime")
        else str(report.commissioningDate)
    )

    sample_rows = ""
    for s in report.ionSamples:
        sample_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{s.sampleName}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{s.preStandard}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0f766e;">{s.postReading}</td>
        </tr>
        """

    sensor_rows = ""
    for idx, sensor in enumerate(report.sensors, start=1):
        sensor_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{idx}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{sensor.location}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">{sensor.macId}</td>
        </tr>
        """

    sensor_desc_html = (
        f'<p style="font-size: 13px; color: #475569; margin: 4px 0 10px 0;">{report.sensorDescription}</p>'
        if report.sensorDescription and report.sensorDescription.strip()
        else ""
    )

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
            <p style="margin: 4px 0; font-size: 13px;"><b>Project:</b> {report.client.project}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Client:</b> {report.client.clientName}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Location:</b> {report.client.location}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Client Rep:</b> {report.client.clientRepresentative} ({report.client.contactNo})</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Model Installed:</b> {report.description}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Commissioning Date:</b> {comm_date}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Technician:</b> {report.installer.contactPerson} ({report.installer.contactNo})</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Submitted At:</b> {submitted_at}</p>
        </div>

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

        <h3 style="margin: 25px 0 8px 0; font-size: 16px; color: #0f766e;">IAQM Sensors & BMS Integration</h3>
        {sensor_desc_html}
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
        else str(report.ppmInfo.currentPpm)
    )

    check_rows = ""
    for item in report.checkList:
        condition_badge = f'<span style="background-color: #ecfdf5; color: #065f46; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #a7f3d0;">{item.condition}</span>'
        check_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">{item.sn}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 500;">{item.checkList}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{condition_badge}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 12px;">{item.actionTaken or '-'}</td>
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
            <p style="margin: 4px 0; font-size: 13px;"><b>Client:</b> {report.project.client}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Location:</b> {report.project.location}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>PA Details:</b> {report.equipment.paDetails}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>IAQ Monitor Details:</b> {report.equipment.iaqMonitorDetails}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Last PPM:</b> {report.ppmInfo.lastPpm} &nbsp;|&nbsp; <b>Current PPM:</b> {current_ppm}</p>
            <p style="margin: 4px 0; font-size: 13px;"><b>Technician:</b> {report.signatures.technicianName} &nbsp;|&nbsp; <b>Client Rep:</b> {report.signatures.clientRepName}</p>
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
            <p style="margin: 0; font-size: 13px; color: #334155;">{report.signatures.clientFeedback or 'No specific feedback provided.'}</p>
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
            <td>{visit.clientName}</td>
            <td>{visit.personMet}</td>
            <td>{visit.designation}</td>
            <td>{visit.clientPhoneNumber}</td>
            <td>{visit.discussionSummary}</td>
            <td>{visit.nextAction}</td>
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
    background:#0f766e;
    color:white;
}}

.section {{
    margin-top:25px;
}}
</style>
</head>

<body>

<div style="
    background:#0f766e;
    color:white;
    padding:20px;
    text-align:center;
    border-radius:8px;
">

<h2>INTELLIGREEN TECHNOLOGIES</h2>

<h3>Daily Sales Visit Report</h3>

</div>

<h3>Employee Information</h3>

<p><b>Employee:</b> {report.employee.employeeName}</p>
<p><b>Employee ID:</b> {report.employee.employeeId}</p>
<p><b>Date:</b> {report.employee.date}</p>
<p><strong>Submitted At:</strong> {submitted_at}</p>
<p><b>City:</b> {report.employee.city}</p>

<div class="section">

<h3>Customer Visits</h3>

<table>

<tr>
<th>#</th>
<th>Client</th>
<th>Person Met</th>
<th>Designation</th>
<th>Phone Number</th>
<th>Discussion</th>
<th>Next Action</th>
</tr>

{visit_rows}

</table>

</div>

<div class="section">

<h3>Day Summary</h3>

<p><b>Key Win:</b> {report.daySummary.keyWin}</p>

<p><b>Challenges:</b> {report.daySummary.challenges}</p>

<p><b>Remarks:</b> {report.daySummary.otherRemarks}</p>

</div>

<div class="section">

<h3>AI Summary</h3>

<p>{report.aiSummary}</p>

</div>

</body>

</html>
"""