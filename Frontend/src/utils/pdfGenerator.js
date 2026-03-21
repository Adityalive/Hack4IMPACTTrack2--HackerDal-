import { generatePDF as generateReportPDF } from '../components/ReportPDF';

export function generateReportPdf(payload = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Missing PDF payload.');
  }

  if (!payload.analysis) {
    throw new Error('Missing analysis data for PDF export.');
  }

  return generateReportPDF(payload);
}

export async function generatePDF(payload = {}) {
  return generateReportPdf(payload);
}
