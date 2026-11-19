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
    clientName: str = "Studiokon Ventures Private Limited"
    project: str = "TCI"
    clientRepresentative: str = "Mr. Barun"
    location: str = "Gurgaon"
    contactNo: str = "9310384285"
    telNo: str = "NA"
    email: EmailStr = "barun.upadhyay@skvindia.com"
    clientAddress: str = (
        "Plot No. 57, Urban Estate, Gurgaon Sector-18, Gurgaon Haryana-122015"
    )


class IonConcentrationSample(BaseModel):
    sampleName: str
    preStandard: str = "50-250"
    postReading: str


class SensorDetail(BaseModel):
    location: str
    macId: str


class CommissioningReportRequest(BaseModel):
    description: str = "Model Installed- PA 604-101 Nos, & IAQM-6 Nos."
    commissioningDate: date
    installer: InstallerInfo
    client: ClientInfo
    ionSamples: List[IonConcentrationSample]
    sensorDescription: str = (
        "Further 6 Nos of IAQM (Indoor Air Quality Monitoring) Sensors are installed each "
        "on Basement, GF, 1st Floor, 2nd Floor, 3rd Floor and 4th Floor. These are connected "
        "with the RS485 network and sending data to client's BMS Server. Mac Id of the sensors are mentioned below-"
    )
    sensors: List[SensorDetail]
    bmsNotes: str = (
        "BMS configuration document is attached along with this report for future reference and requirement."
    )
    submittedBy: str = "IntelliGreen Technologies Pvt Ltd"
    aiSummary: str = ""


class CommissioningSummaryRequest(BaseModel):
    description: str
    commissioningDate: date
    installer: InstallerInfo
    client: ClientInfo
    ionSamples: List[IonConcentrationSample]
    sensorDescription: str
    sensors: List[SensorDetail]
    bmsNotes: str = ""
