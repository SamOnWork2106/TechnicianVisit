import api from "./api";
import type { PPMForm } from "../types/ppm";

export const generatePPMSummary = async (data: Partial<PPMForm>) => {
  const response = await api.post("/report/ppm/generate-summary", data);
  return response.data;
};

export const submitPPMReport = async (data: PPMForm) => {
  const response = await api.post("/report/ppm/submit", data);
  return response.data;
};

export const downloadPPMPDF = async (data: PPMForm) => {
  const response = await api.post("/report/ppm/download-pdf", data, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const clientSlug = data.project.client ? data.project.client.replace(/\s+/g, "_") : "PPM";
  link.download = `PPM_Checklist_${clientSlug}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
