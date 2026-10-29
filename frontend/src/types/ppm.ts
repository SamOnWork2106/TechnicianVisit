export interface PPMEquipmentDetails {
  paDetails: string;
  iaqMonitorDetails: string;
}

export interface PPMProjectDetails {
  client: string;
  location: string;
  clientEmail?: string;
}

export interface PPMDetails {
  lastPpm: string;
  currentPpm: string;
  managerEmail?: string;
}

export interface PPMChecklistItem {
  sn: number;
  checkList: string;
  condition: string;
  actionTaken: string;
}

export interface PPMSignatures {
  technicianName: string;
  clientRepName: string;
  clientFeedback: string;
}

export interface PPMForm {
  equipment: PPMEquipmentDetails;
  project: PPMProjectDetails;
  ppmInfo: PPMDetails;
  checkList: PPMChecklistItem[];
  signatures: PPMSignatures;
  aiSummary?: string;
}
