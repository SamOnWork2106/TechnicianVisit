from pydantic import BaseModel, EmailStr
from typing import List
from datetime import date


class PPMEquipmentDetails(BaseModel):
    paDetails: str = "PA 604 - Central Plasma Air Purification Units - 101 Nos"
    iaqMonitorDetails: str = "IAQM-6 Indoor Air Quality Monitoring Sensors - 6 Nos"


class PPMProjectDetails(BaseModel):
    client: str = "Studiokon Ventures Private Limited / TCI"
    location: str = "Plot No. 57, Sector-18, Gurgaon, Haryana"
    clientEmail: str = ""


class PPMDetails(BaseModel):
    lastPpm: str = "28.05.2025"
    currentPpm: date
    managerEmail: EmailStr = "shikhar@intelligreentech.com"


class PPMChecklistItem(BaseModel):
    sn: int
    checkList: str
    condition: str
    actionTaken: str


class PPMSignatures(BaseModel):
    technicianName: str = "Lokendra Singh"
    clientRepName: str = "Mr. Barun"
    clientFeedback: str = "All equipment inspected and operating satisfactorily."


class PPMReportRequest(BaseModel):
    equipment: PPMEquipmentDetails
    project: PPMProjectDetails
    ppmInfo: PPMDetails
    checkList: List[PPMChecklistItem]
    signatures: PPMSignatures
    aiSummary: str = ""


class PPMSummaryRequest(BaseModel):
    equipment: PPMEquipmentDetails
    project: PPMProjectDetails
    ppmInfo: PPMDetails
    checkList: List[PPMChecklistItem]
    signatures: PPMSignatures
