export function generateReportPdf(payload = {}) {
  return payload && payload.transcript
}

export async function generatePDF(payload = {}) {
  return generateReportPdf(payload)
}
