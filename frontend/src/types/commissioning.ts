export interface InstallerInfo {
  installerName: string;
  contactPerson: string;
  contactNo: string;
  companyAddress: string;
  telNo: string;
  email: string;
  managerEmail?: string;
}

export interface ClientInfo {
  clientName: string;
  project: string;
  clientRepresentative: string;
  location: string;
  contactNo: string;
  telNo: string;
  email: string;
  clientAddress: string;
}

export interface IonConcentrationSample {
  sampleName: string;
  preStandard: string;
  postReading: string;
}

export interface SensorDetail {
  location: string;
  macId: string;
}

export interface CommissioningForm {
  description: string;
  commissioningDate: string;
  installer: InstallerInfo;
  client: ClientInfo;
  ionSamples: IonConcentrationSample[];
  sensorDescription?: string;
  sensors: SensorDetail[];
  bmsNotes?: string;
  submittedBy: string;
  aiSummary?: string;
}
