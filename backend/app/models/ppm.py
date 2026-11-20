from pydantic import BaseModel, EmailStr
from typing import List
from datetime import date


class PPMEquipmentDetails(BaseModel):
    paDetails: str = ""
    iaqMonitorDetails: str = ""


class PPMProjectDetails(BaseModel):
    client: str = ""
    location: str = ""
    clientEmail: str = ""


class PPMDetails(BaseModel):
    lastPpm: str = ""
    currentPpm: date
    managerEmail: EmailStr = "vikash@intelligreentech.com"


class PPMChecklistItem(BaseModel):
    sn: int
    checkList: str
    condition: str = ""
    actionTaken: str = ""


class PPMSignatures(BaseModel):
    technicianName: str = ""
    clientRepName: str = ""
    clientFeedback: str = ""


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
