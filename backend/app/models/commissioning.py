from pydantic import BaseModel, EmailStr
from typing import List
from datetime import date


class InstallerInfo(BaseModel):
    installerName: str = "IntelliGreen Technologies Pvt. Ltd."
    contactPerson: str = "Mr. Lokendra Shekhwat"
    contactNo: str = "8005575735"
    companyAddress: str = (
        "Unit No. COS/3L/Office/17, M3M Cosmopolitan, Sector 66, Gurgaon, Haryana 122002"
    )
    telNo: str = "+91 124 4256862"
    email: EmailStr = "info@intelligreentech.com"
    managerEmail: EmailStr = "vikash@intelligreentech.com"


class ClientInfo(BaseModel):
    clientName: str = ""
    project: str = ""
    clientRepresentative: str = ""
    location: str = ""
    contactNo: str = ""
    telNo: str = "NA"
    email: str = ""
    clientAddress: str = ""


class IonConcentrationSample(BaseModel):
    sampleName: str
    preStandard: str = "50-250"
    postReading: str


class SensorDetail(BaseModel):
    location: str
    macId: str


class CommissioningReportRequest(BaseModel):
    description: str = ""
    commissioningDate: date
    installer: InstallerInfo
    client: ClientInfo
    ionSamples: List[IonConcentrationSample] = []
    sensorDescription: str = ""
    sensors: List[SensorDetail] = []
    bmsNotes: str = ""
    submittedBy: str = "IntelliGreen Technologies Pvt Ltd"
    aiSummary: str = ""


class CommissioningSummaryRequest(BaseModel):
    description: str = ""
    commissioningDate: date
    installer: InstallerInfo
    client: ClientInfo
    ionSamples: List[IonConcentrationSample] = []
    sensorDescription: str = ""
    sensors: List[SensorDetail] = []
    bmsNotes: str = ""
