import type { CommissioningForm } from "../types/commissioning";
import type { PPMForm, PPMChecklistItem } from "../types/ppm";

export const COMMISSIONING_EXAMPLE_DATA: CommissioningForm = {
  description: "Model Installed- PA 604-101 Nos, & IAQM-6 Nos.",
  commissioningDate: "2025-05-28",
  installer: {
    installerName: "IntelliGreen Technologies Pvt. Ltd.",
    contactPerson: "Authorized Field Technician",
    contactNo: "+91 124 4256862",
    companyAddress: "Unit No. COS/3L/Office/17, M3M Cosmopolitan, Sector 66, Gurgaon, Haryana 122002",
    telNo: "+91 124 4256862",
    email: "info@intelligreentech.com",
    managerEmail: "vikash@intelligreentech.com",
  },
  client: {
    clientName: "Studiokon Ventures Private Limited",
    project: "TCI",
    clientRepresentative: "Mr. Barun",
    location: "Gurgaon",
    contactNo: "9310384285",
    telNo: "NA",
    email: "barun.upadhyay@skvindia.com",
    clientAddress: "Plot No. 57, Urban Estate, Gurgaon Sector-18, Gurgaon Haryana-122015",
  },
  ionSamples: [
    { sampleName: "Sample-1", preStandard: "50-250", postReading: "-8650" },
    { sampleName: "Sample-2", preStandard: "50-250", postReading: "-6960" },
    { sampleName: "Sample-3", preStandard: "50-250", postReading: "-4530" },
    { sampleName: "Sample-4", preStandard: "50-250", postReading: "-5650" },
    { sampleName: "Sample-5", preStandard: "50-250", postReading: "-12800" },
    { sampleName: "Sample-6", preStandard: "50-250", postReading: "-4280" },
    { sampleName: "Sample-7", preStandard: "50-250", postReading: "-18380" },
    { sampleName: "Sample-8", preStandard: "50-250", postReading: "-9420" },
  ],
  sensorDescription:
    "Further 6 Nos of IAQM (Indoor Air Quality Monitoring) Sensors are installed each on Basement, GF, 1st Floor, 2nd Floor, 3rd Floor and 4th Floor. These are connected with the RS485 network and sending data to client's BMS Server. Mac Id of the sensors are mentioned below-",
  sensors: [
    { location: "Basement", macId: "E8:06:90:A6:78:A4" },
    { location: "Ground Floor (GF)", macId: "E8:06:90:A6:78:18" },
    { location: "1st Floor", macId: "E8:06:90:A6:7B:5C" },
    { location: "2nd Floor", macId: "E8:06:90:A6:78:4C" },
    { location: "3rd Floor", macId: "E8:06:90:A6:78:88" },
    { location: "4th Floor", macId: "E8:06:90:A6:78:A0" },
  ],
  bmsNotes: "",
  submittedBy: "IntelliGreen Technologies Pvt Ltd",
  aiSummary: "",
};

export const DEFAULT_PPM_CHECKLIST_ITEMS: PPMChecklistItem[] = [
  {
    sn: 1,
    checkList: "Check & Clean Dust Accumulation on Needles/Brush/Tube",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 2,
    checkList: "Check The Status of Fuse",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 3,
    checkList: "Check Indicating Light",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 4,
    checkList: "Check & Fix Wiring of PA Models",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 5,
    checkList: "Check & Clean Dust Accumulation on IAQ Monitor",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 6,
    checkList: "Check & Fix Connectivity of IAQ Monitor",
    condition: "",
    actionTaken: "",
  },
  {
    sn: 7,
    checkList: "Check & Replace The Fine Filter Media",
    condition: "",
    actionTaken: "",
  },
];

export const INITIAL_PPM_DATA: PPMForm = {
  equipment: {
    paDetails: "PA 604 - Central Plasma Air Purification Units - 101 Nos",
    iaqMonitorDetails: "IAQM-6 Indoor Air Quality Monitoring Sensors - 6 Nos",
  },
  project: {
    client: "",
    location: "",
  },
  ppmInfo: {
    lastPpm: "",
    currentPpm: new Date().toISOString().split("T")[0],
    managerEmail: "vikash@intelligreentech.com",
  },
  checkList: DEFAULT_PPM_CHECKLIST_ITEMS,
  signatures: {
    technicianName: "",
    clientRepName: "",
    clientFeedback: "",
  },
  aiSummary: "",
};

export const SAMPLE_FILLED_PPM_DATA: PPMForm = {
  equipment: {
    paDetails: "PA 604 - Central Plasma Air Purification Units - 101 Nos",
    iaqMonitorDetails: "IAQM-6 Indoor Air Quality Monitoring Sensors - 6 Nos",
  },
  project: {
    client: "Studiokon Ventures Private Limited / TCI",
    location: "Plot No. 57, Urban Estate, Sector-18, Gurgaon",
  },
  ppmInfo: {
    lastPpm: "28.05.2025",
    currentPpm: new Date().toISOString().split("T")[0],
    managerEmail: "vikash@intelligreentech.com",
  },
  checkList: [
    {
      sn: 1,
      checkList: "Check & Clean Dust Accumulation on Needles/Brush/Tube",
      condition: "Satisfactory / Cleaned",
      actionTaken: "Cleaned needle tips and ionization tubes with isopropyl swabs; removed dust coating.",
    },
    {
      sn: 2,
      checkList: "Check The Status of Fuse",
      condition: "OK / Normal",
      actionTaken: "Checked glass fuse cartridge continuity and line voltage; operating normally.",
    },
    {
      sn: 3,
      checkList: "Check Indicating Light",
      condition: "Functional",
      actionTaken: "Verified green power and operation LEDs across all units; illumination steady.",
    },
    {
      sn: 4,
      checkList: "Check & Fix Wiring of PA Models",
      condition: "Firm & Intact",
      actionTaken: "Inspected wiring terminals, re-tightened screws on terminal blocks, insulation checked.",
    },
    {
      sn: 5,
      checkList: "Check & Clean Dust Accumulation on IAQ Monitor",
      condition: "Cleaned",
      actionTaken: "Cleared dust from intake vents and optical sensors using anti-static brush.",
    },
    {
      sn: 6,
      checkList: "Check & Fix Connectivity of IAQ Monitor",
      condition: "Connected / Online",
      actionTaken: "Verified RS485 communication link and Modbus polling to client's BMS server.",
    },
    {
      sn: 7,
      checkList: "Check & Replace The Fine Filter Media",
      condition: "Replaced",
      actionTaken: "Inspected filter media; installed fresh replacement fine filter media on all units.",
    },
  ],
  signatures: {
    technicianName: "Authorized Field Technician",
    clientRepName: "Mr. Barun",
    clientFeedback: "Maintenance conducted professionally. Air quality and readings verified on BMS dashboard.",
  },
  aiSummary: "",
};

export const PPM_CONDITION_PRESETS = [
  "Satisfactory / OK",
  "Cleaned & Tested",
  "Serviced / Adjusted",
  "Replaced",
  "Firm & Intact",
  "Connected / Online",
  "Needs Repair / Attention",
  "Pending Parts",
];

export const EAC_CHECKLIST_OPTIONS = [
  "Check on indication of EAC.",
  "Check on fault of EAC.",
  "Check on clean of EAC.",
  "Health of the EAC pad.",
  "Wiring and Power Supply of EAC Pad.",
];

export const CTFA_CHECKLIST_OPTIONS = [
  "Check the Power Connection of CTFA.",
  "Hepa Filter Health.",
  "Pre Filter Health.",
  "Fan/Motor Condition.",
  "Carbon Filter Health.",
];
