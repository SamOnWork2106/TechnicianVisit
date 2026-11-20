from pathlib import Path
import tempfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    Image as RLImage,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

from app.models.commissioning import CommissioningReportRequest
from app.models.ppm import PPMReportRequest
from app.models.report import ReportRequest

ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
LOGO_PATH = ASSETS_DIR / "company_logo.png"

PRIMARY_GREEN = colors.HexColor("#0f766e")
ACCENT_GREEN = colors.HexColor("#16a34a")
DARK_TEXT = colors.HexColor("#1e293b")
BORDER_COLOR = colors.HexColor("#334155")
LIGHT_BG = colors.HexColor("#f8fafc")


def _clean_str(text) -> str:
    """Escapes XML entities (&, <, >) to avoid breaking ReportLab Paragraph parser."""
    if text is None:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _get_custom_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="BrandHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=PRIMARY_GREEN,
            alignment=TA_CENTER,
        )
    )

    styles.add(
        ParagraphStyle(
            name="ReportSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=DARK_TEXT,
            alignment=TA_CENTER,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=DARK_TEXT,
        )
    )

    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=DARK_TEXT,
        )
    )

    styles.add(
        ParagraphStyle(
            name="TableCellBold",
            parent=styles["TableCell"],
            fontName="Helvetica-Bold",
        )
    )

    styles.add(
        ParagraphStyle(
            name="TableCellCenter",
            parent=styles["TableCell"],
            alignment=TA_CENTER,
        )
    )

    styles.add(
        ParagraphStyle(
            name="TableCellCenterBold",
            parent=styles["TableCell"],
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        )
    )

    styles.add(
        ParagraphStyle(
            name="DisclaimerText",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#334155"),
            alignment=TA_JUSTIFY,
        )
    )

    styles.add(
        ParagraphStyle(
            name="FooterStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_CENTER,
        )
    )

    return styles


def _add_page_decorations(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(PRIMARY_GREEN)
    canvas.rect(36, doc.height + 40, doc.width, 3, fill=1, stroke=0)

    # Footer
    footer_text = (
        "Unit No COS/3L/Office/17, M3M Cosmopolitan Sector-66, Gurgaon, Haryana, 122002  |  "
        "Contact - 0124-4256862 | info@intelligreentech.com  |  www.intelligreentech.com"
    )
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawCentredString(doc.pagesize[0] / 2.0, 20, footer_text)

    # Page number
    page_num = canvas.getPageNumber()
    canvas.drawRightString(doc.pagesize[0] - 36, 20, f"Page {page_num}")
    canvas.restoreState()


def generate_commissioning_pdf(report: CommissioningReportRequest) -> Path:
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = Path(temp.name)

    styles = _get_custom_styles()
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=36,
    )

    story = []

    # Title & Header
    if LOGO_PATH.exists():
        header_table = Table(
            [
                [
                    RLImage(str(LOGO_PATH), width=135, height=42.5),
                    [
                        Paragraph("<b>IntelliGreen-IAQ Solution</b>", styles["ReportSubTitle"]),
                        Paragraph("<b>COMMISSIONING REPORT</b>", styles["BrandHeader"]),
                    ],
                ]
            ],
            colWidths=[145, doc.width - 145],
        )
        header_table.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (0, 0), "LEFT"),
                ("ALIGN", (1, 0), (1, 0), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ])
        )
        story.append(header_table)
        story.append(Spacer(1, 6))
    else:
        story.append(
            Paragraph("IntelliGreen TECHNOLOGIES", styles["BrandHeader"])
        )
        story.append(Spacer(1, 4))
        story.append(
            Paragraph("IntelliGreen-IAQ Solution — Commissioning Report", styles["ReportSubTitle"])
        )
        story.append(Spacer(1, 8))

    # General info table
    gen_data = [
        [
            Paragraph(f"<b>Description:</b> {_clean_str(report.description)}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>Commissioning Date:</b> {report.commissioningDate.strftime('%d.%m.%Y') if hasattr(report.commissioningDate, 'strftime') else _clean_str(report.commissioningDate)}", styles["TableCell"]),
        ],
    ]
    gen_table = Table(gen_data, colWidths=[doc.width])
    gen_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(gen_table)
    story.append(Spacer(1, 6))

    # Installer & Client tables
    inst_data = [
        [
            Paragraph(
                f"<b>Installer:</b><br/>{_clean_str(report.installer.installerName)}<br/>"
                f"<b>Company address:</b> {_clean_str(report.installer.companyAddress)}<br/>"
                f"<b>Tel. no.:</b> {_clean_str(report.installer.telNo)} &nbsp;&nbsp;&nbsp;&nbsp; <b>Email:</b> {_clean_str(report.installer.email)}",
                styles["TableCell"],
            ),
            Paragraph(
                f"<b>Contact person:</b> {_clean_str(report.installer.contactPerson)}<br/><br/>"
                f"<b>Contact No.:</b> {_clean_str(report.installer.contactNo)}",
                styles["TableCell"],
            ),
        ]
    ]
    inst_table = Table(inst_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
    inst_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(inst_table)
    story.append(Spacer(1, 6))

    client_data = [
        [
            Paragraph(f"<b>Client:</b> {_clean_str(report.client.clientName)}", styles["TableCell"]),
            "",
        ],
        [
            Paragraph(f"<b>Project:</b> {_clean_str(report.client.project)}", styles["TableCell"]),
            Paragraph(f"<b>Client Representative:</b> {_clean_str(report.client.clientRepresentative)}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>Location:</b> {_clean_str(report.client.location)}", styles["TableCell"]),
            Paragraph(f"<b>Contact No.:</b> {_clean_str(report.client.contactNo)}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>Tel. no.:</b> {_clean_str(report.client.telNo)}", styles["TableCell"]),
            Paragraph(f"<b>Email:</b> {_clean_str(report.client.email)}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>Client Address:</b> {_clean_str(report.client.clientAddress)}", styles["TableCell"]),
            "",
        ],
    ]
    client_table = Table(client_data, colWidths=[doc.width * 0.5, doc.width * 0.5])
    client_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("SPAN", (0, 0), (1, 0)),
            ("SPAN", (0, 4), (1, 4)),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(client_table)
    story.append(Spacer(1, 8))

    # Result - Ion Concentration Table (Render if samples exist)
    if report.ionSamples and len(report.ionSamples) > 0:
        result_data = [
            [
                Paragraph("<b>Result</b>", styles["TableCellCenterBold"]),
                "",
                "",
            ],
            [
                Paragraph("<b>Ion Concentration</b>", styles["TableCellCenterBold"]),
                "",
                "",
            ],
            [
                Paragraph("<b>Samples</b>", styles["TableCellCenterBold"]),
                Paragraph("<b>Pre (Ions/cm³) (Standard)</b>", styles["TableCellCenterBold"]),
                Paragraph("<b>Post (Ions/cm³)</b>", styles["TableCellCenterBold"]),
            ],
        ]

        for sample in report.ionSamples:
            result_data.append([
                Paragraph(sample.sampleName, styles["TableCellCenter"]),
                Paragraph(sample.preStandard, styles["TableCellCenter"]),
                Paragraph(sample.postReading, styles["TableCellCenterBold"]),
            ])

        result_table = Table(
            result_data,
            colWidths=[doc.width * 0.34, doc.width * 0.33, doc.width * 0.33]
        )
        result_table.setStyle(
            TableStyle([
                ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("SPAN", (0, 0), (2, 0)),
                ("SPAN", (0, 1), (2, 1)),
                ("BACKGROUND", (0, 0), (2, 1), PRIMARY_GREEN),
                ("TEXTCOLOR", (0, 0), (2, 1), colors.white),
                ("BACKGROUND", (0, 2), (2, 2), LIGHT_BG),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ])
        )
        story.append(result_table)
        story.append(Spacer(1, 6))

        # OEM Disclaimer
        disclaimer_text = (
            "<b>Note:</b> <i>Various studies and tests done by OEMs globally suggest that ion concentration above "
            "1500 ions/cm³ is capable to destroy the hemagglutinin surface (Viral Protein, that triggers the infection) "
            "and deactivate viruses including COVID-19.</i>"
        )
        story.append(Paragraph(disclaimer_text, styles["DisclaimerText"]))
        story.append(Spacer(1, 10))

    # Page 2 content / Sensors and Summary
    has_sensors = bool(report.sensors or (report.sensorDescription and report.sensorDescription.strip()))
    if has_sensors:
        story.append(PageBreak())

        if LOGO_PATH.exists():
            header_table_p2 = Table(
                [
                    [
                        RLImage(str(LOGO_PATH), width=115, height=36.2),
                        Paragraph("<b>IAQM Sensors & Network Integration</b>", styles["ReportSubTitle"]),
                    ]
                ],
                colWidths=[125, doc.width - 125],
            )
            header_table_p2.setStyle(
                TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (0, 0), "LEFT"),
                    ("ALIGN", (1, 0), (1, 0), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ])
            )
            story.append(header_table_p2)
            story.append(Spacer(1, 8))
        else:
            story.append(
                Paragraph("IntelliGreen TECHNOLOGIES — IAQM Sensors & Network Integration", styles["BrandHeader"])
            )
            story.append(Spacer(1, 8))

        if report.sensorDescription and report.sensorDescription.strip():
            sensor_intro = Paragraph(report.sensorDescription, styles["TableCell"])
            story.append(sensor_intro)
            story.append(Spacer(1, 8))

        if report.sensors and len(report.sensors) > 0:
            sensor_rows = [
                [
                    Paragraph("<b>#</b>", styles["TableCellCenterBold"]),
                    Paragraph("<b>Floor / Location</b>", styles["TableCellBold"]),
                    Paragraph("<b>Sensor MAC ID</b>", styles["TableCellBold"]),
                ]
            ]
            for idx, s in enumerate(report.sensors, start=1):
                sensor_rows.append([
                    Paragraph(str(idx), styles["TableCellCenter"]),
                    Paragraph(s.location, styles["TableCell"]),
                    Paragraph(s.macId, styles["TableCellBold"]),
                ])

            sensor_table = Table(
                sensor_rows,
                colWidths=[doc.width * 0.1, doc.width * 0.45, doc.width * 0.45]
            )
            sensor_table.setStyle(
                TableStyle([
                    ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_GREEN),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ])
            )
            story.append(sensor_table)
            story.append(Spacer(1, 10))

    # Signatures
    sub_data = [
        [
            Paragraph(
                f"<b>Submitted By:</b><br/>"
                f"<b>{report.submittedBy}</b><br/>"
                f"Technician: {report.installer.contactPerson}<br/>"
                f"Contact: {report.installer.contactNo}<br/>"
                f"Status: Certified Commissioning Complete",
                styles["TableCell"],
            ),
            Paragraph(
                f"<b>Client Acknowledgment:</b><br/>"
                f"<b>{report.client.clientName}</b><br/>"
                f"Representative: {report.client.clientRepresentative}<br/>"
                f"Project: {report.client.project} ({report.client.location})<br/>"
                f"Date: {report.commissioningDate}",
                styles["TableCell"],
            ),
        ]
    ]
    sub_table = Table(sub_data, colWidths=[doc.width * 0.5, doc.width * 0.5])
    sub_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(KeepTogether(sub_table))

    doc.build(story, onFirstPage=_add_page_decorations, onLaterPages=_add_page_decorations)
    return pdf_path


def generate_ppm_pdf(report: PPMReportRequest) -> Path:
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = Path(temp.name)

    styles = _get_custom_styles()
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=36,
    )

    story = []

    # Title & Header
    if LOGO_PATH.exists():
        header_table_ppm = Table(
            [
                [
                    RLImage(str(LOGO_PATH), width=135, height=42.5),
                    [
                        Paragraph(
                            "<b>PERIODIC PREVENTIVE MAINTENANCE</b>",
                            ParagraphStyle(
                                name="PPMHeaderTitle",
                                parent=styles["Normal"],
                                fontName="Helvetica-Bold",
                                fontSize=13,
                                leading=16,
                                textColor=PRIMARY_GREEN,
                                alignment=TA_CENTER,
                            ),
                        ),
                        Spacer(1, 2),
                        Paragraph(
                            "INTELLIGREEN CENTRAL AIR PURIFICATION SYSTEM",
                            ParagraphStyle(
                                name="PPMHeaderSub",
                                parent=styles["Normal"],
                                fontName="Helvetica-Bold",
                                fontSize=9,
                                leading=12,
                                textColor=DARK_TEXT,
                                alignment=TA_CENTER,
                            ),
                        ),
                    ],
                ]
            ],
            colWidths=[145, doc.width - 145],
        )
        header_table_ppm.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (0, 0), "LEFT"),
                ("ALIGN", (1, 0), (1, 0), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ])
        )
        story.append(header_table_ppm)
        story.append(Spacer(1, 6))
    else:
        story.append(
            Paragraph("IntelliGreen TECHNOLOGIES", styles["BrandHeader"])
        )
        story.append(Spacer(1, 4))
        story.append(
            Paragraph("PERIODIC PREVENTIVE MAINTENANCE", styles["ReportSubTitle"])
        )
        story.append(
            Paragraph("INTELLIGREEN CENTRAL AIR PURIFICATION SYSTEM", styles["SectionHeading"])
        )
        story.append(Spacer(1, 8))

    # 3-box Top Header: Equipment Details, Project Details, PPM Details
    box_data = [
        [
            Paragraph("<b>Equipment Details</b>", styles["TableCellCenterBold"]),
            Paragraph("<b>Project Details</b>", styles["TableCellCenterBold"]),
            Paragraph("<b>PPM Details</b>", styles["TableCellCenterBold"]),
        ],
        [
            Paragraph(
                f"<b>PA Details:</b><br/>{_clean_str(report.equipment.paDetails)}<br/><br/>"
                f"<b>IAQ Monitor Details:</b><br/>{_clean_str(report.equipment.iaqMonitorDetails)}",
                styles["TableCell"],
            ),
            Paragraph(
                f"<b>Client:</b><br/>{_clean_str(report.project.client)}<br/><br/>"
                f"<b>Location:</b><br/>{_clean_str(report.project.location)}",
                styles["TableCell"],
            ),
            Paragraph(
                f"<b>Last PPM:</b> {_clean_str(report.ppmInfo.lastPpm)}<br/><br/>"
                f"<b>Current PPM:</b> {report.ppmInfo.currentPpm.strftime('%d.%m.%Y') if hasattr(report.ppmInfo.currentPpm, 'strftime') else _clean_str(report.ppmInfo.currentPpm)}",
                styles["TableCell"],
            ),
        ],
    ]

    box_table = Table(
        box_data,
        colWidths=[doc.width * 0.38, doc.width * 0.34, doc.width * 0.28]
    )
    box_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("VALIGN", (0, 1), (-1, 1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(box_table)
    story.append(Spacer(1, 10))

    # Checklist Table: SN, Check List, Condition, Action Taken
    check_rows = [
        [
            Paragraph("<b>SN</b>", styles["TableCellCenterBold"]),
            Paragraph("<b>Check List</b>", styles["TableCellBold"]),
            Paragraph("<b>Condition</b>", styles["TableCellBold"]),
            Paragraph("<b>Action Taken</b>", styles["TableCellBold"]),
        ]
    ]

    for item in report.checkList:
        check_rows.append([
            Paragraph(str(item.sn), styles["TableCellCenter"]),
            Paragraph(_clean_str(item.checkList), styles["TableCell"]),
            Paragraph(_clean_str(item.condition or "-"), styles["TableCellBold"]),
            Paragraph(_clean_str(item.actionTaken or "-"), styles["TableCell"]),
        ])

    check_table = Table(
        check_rows,
        colWidths=[doc.width * 0.08, doc.width * 0.42, doc.width * 0.22, doc.width * 0.28],
        repeatRows=1,
    )
    check_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(check_table)
    story.append(Spacer(1, 10))

    # Signatures & Feedback Table
    sig_data = [
        [
            Paragraph("<b>IntelliGreen Technologies Pvt Ltd</b>", styles["TableCellBold"]),
            Paragraph("<b>Client's Representative</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph(
                f"<b>Technician's Name:</b> {_clean_str(report.signatures.technicianName)}<br/><br/>"
                f"<b>Signature:</b> [Signed Digitally by Technician]",
                styles["TableCell"],
            ),
            Paragraph(
                f"<b>Name:</b> {_clean_str(report.signatures.clientRepName)}<br/><br/>"
                f"<b>Signature:</b> [Acknowledged On-Site]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>:Stamp</b>",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph(
                f"<b>Client's Remark/Feedback:</b><br/>{_clean_str(report.signatures.clientFeedback or 'No specific remarks.')}",
                styles["TableCell"],
            ),
            "",
        ],
    ]

    sig_table = Table(sig_data, colWidths=[doc.width * 0.5, doc.width * 0.5])
    sig_table.setStyle(
        TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("SPAN", (0, 2), (1, 2)),
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(KeepTogether(sig_table))
    doc.build(story, onFirstPage=_add_page_decorations, onLaterPages=_add_page_decorations)
    return pdf_path


def generate_pdf(report: ReportRequest) -> Path:
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = Path(temp.name)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(str(pdf_path))
    story = []

    story.append(Paragraph("<b>Daily Sales Visit Report</b>", styles["Heading1"]))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(f"<b>Employee:</b> {report.employee.employeeName}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Employee ID:</b> {report.employee.employeeId}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Date:</b> {report.employee.date}", styles["BodyText"]))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("<b>Customer Visits</b>", styles["Heading2"]))
    for i, visit in enumerate(report.visits, start=1):
        story.append(Paragraph(f"<b>{i}. {visit.clientName}</b>", styles["BodyText"]))
        story.append(Paragraph(f"Person Met: {visit.personMet}", styles["BodyText"]))
        story.append(Paragraph(f"Discussion: {visit.discussionSummary}", styles["BodyText"]))
        story.append(Paragraph(f"Next Action: {visit.nextAction}", styles["BodyText"]))
        story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("<b>Day Summary</b>", styles["Heading2"]))
    story.append(Paragraph(report.daySummary.keyWin, styles["BodyText"]))
    story.append(Paragraph(report.daySummary.challenges, styles["BodyText"]))
    story.append(Paragraph(report.daySummary.otherRemarks, styles["BodyText"]))
    story.append(Spacer(1, 0.25 * inch))

    story.append(Paragraph("<b>AI Summary</b>", styles["Heading2"]))
    story.append(Paragraph(report.aiSummary, styles["BodyText"]))

    doc.build(story)
    return pdf_path