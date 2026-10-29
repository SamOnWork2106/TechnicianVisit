import api from "./api";
import type { CommissioningForm } from "../types/commissioning";

export const generateCommissioningSummary = async (data: Partial<CommissioningForm>) => {
  const response = await api.post("/report/commissioning/generate-summary", data);
  return response.data;
};

export const submitCommissioningReport = async (data: CommissioningForm) => {
  const response = await api.post("/report/commissioning/submit", data);
  return response.data;
};

export const downloadCommissioningPDF = async (data: CommissioningForm) => {
  const response = await api.post("/report/commissioning/download-pdf", data, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const projectSlug = data.client.project ? data.client.project.replace(/\s+/g, "_") : "Report";
  link.download = `Commissioning_Report_${projectSlug}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
