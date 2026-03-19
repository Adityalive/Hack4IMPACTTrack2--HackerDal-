// ─── pdfGenerator.js ──────────────────────────────────────────────────────────
// Generates a downloadable Safety Report PDF using jsPDF
// Install: npm install jspdf
// ──────────────────────────────────────────────────────────────────────────────

import { jsPDF } from 'jspdf';

/**
 * Generate and auto-download a VoiceGuard Safety Report PDF
 * @param {object} data
 * @param {string}  data.transcript       - full call transcript
 * @param {object}  data.analysis         - from analyzeCall()
 * @param {number}  data.duration         - recording duration in seconds
 * @param {string}  data.language         - 'hi-IN' or 'en-IN'
 * @param {string}  data.userName         - logged-in user name or 'Anonymous'
 * @param {string}  data.timestamp        - formatted date/time string
 */
export async function generatePDF({
  transcript,
  analysis,
  duration,
  language,
  userName,
  timestamp,
}) {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW   = 210;   // page width mm
  const ML   = 15;    // left margin
  const MR   = 15;    // right margin
  const CW   = PW - ML - MR;  // content width
  let   y    = 20;    // current y cursor

  const riskColor = analysis.score >= 70
    ? [220, 38, 38]    // red
    : analysis.score >= 40
    ? [245, 158, 11]   // amber
    : [34, 197, 94];   // green

  // ── Helper functions ───────────────────────────────────────────────────────
  const setColor  = (r, g, b) => doc.setTextColor(r, g, b);
  const resetColor = ()        => setColor(30, 30, 30);
  const heading   = (text, size = 14) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
  };
  const body = (size = 10) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'normal');
  };
  const line = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(ML, y, PW - MR, y);
    y += 5;
  };
  const gap = (n = 5) => { y += n; };
  const checkPageBreak = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // ── 1. Header ─────────────────────────────────────────────────────────────
  // Red background header bar
  doc.setFillColor(...riskColor);
  doc.rect(0, 0, PW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  heading('VoiceGuard — Safety Report', 18);
  doc.text('VoiceGuard — Safety Report', ML, 12);

  body(9);
  doc.text('Farmer Scam Shield  |  Cybersecurity & Ethical AI', ML, 20);
  doc.text(timestamp, PW - MR, 20, { align: 'right' });

  y = 36;
  resetColor();

  // ── 2. Risk Score Box ─────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(ML, y, CW, 28, 3, 3, 'F');

  // Score number
  doc.setTextColor(...riskColor);
  heading(String(analysis.score), 28);
  doc.text(String(analysis.score), ML + 14, y + 18, { align: 'center' });

  // Risk label
  heading(analysis.riskLevel.label, 16);
  doc.text(analysis.riskLevel.label, ML + 34, y + 12);

  // Sub info
  resetColor();
  body(9);
  doc.text(`Keyword Score: ${analysis.breakdown.keywordScore}/100`, ML + 34, y + 20);
  doc.text(`Audio Score:   ${analysis.breakdown.audioScore}/100`,   ML + 34, y + 26);

  // User
  doc.text(`Reported by: ${userName}`, PW - MR, y + 12, { align: 'right' });
  doc.text(`Duration: ${duration}s`, PW - MR, y + 20, { align: 'right' });
  doc.text(`Language: ${language === 'hi-IN' ? 'Hindi' : 'English'}`, PW - MR, y + 26, { align: 'right' });

  y += 36;
  line();

  // ── 3. Matched Keywords ───────────────────────────────────────────────────
  if (analysis.matchedKeywords.length > 0) {
    checkPageBreak(30);
    heading('Scam Keywords Detected', 12);
    setColor(...riskColor);
    doc.text(`Scam Keywords Detected (${analysis.matchedKeywords.length})`, ML, y);
    resetColor();
    y += 7;

    body(9);
    const kwChunks = [];
    let chunk = [];
    analysis.matchedKeywords.forEach((kw, i) => {
      chunk.push(`"${kw.phrase}" (+${kw.weight})`);
      if (chunk.length === 3 || i === analysis.matchedKeywords.length - 1) {
        kwChunks.push(chunk.join('   '));
        chunk = [];
      }
    });
    kwChunks.forEach(row => {
      doc.text(row, ML, y);
      y += 6;
    });
    y += 2;
    line();
  }

  // ── 4. Audio Flags ────────────────────────────────────────────────────────
  if (analysis.audioFlags.length > 0) {
    checkPageBreak(20);
    setColor(180, 100, 0);
    heading('Voice Pattern Anomalies', 12);
    doc.text('Voice Pattern Anomalies', ML, y);
    resetColor();
    y += 7;
    body(9);
    analysis.audioFlags.forEach(flag => {
      doc.text(`• ${flag}`, ML, y);
      y += 6;
    });
    y += 2;
    line();
  }

  // ── 5. Full Transcript ────────────────────────────────────────────────────
  checkPageBreak(20);
  setColor(50, 50, 50);
  heading('Call Transcript', 12);
  doc.text('Call Transcript', ML, y);
  resetColor();
  y += 7;

  body(9);
  const transcriptText = transcript || 'No transcript captured during this recording.';
  const wrappedLines   = doc.splitTextToSize(transcriptText, CW);

  wrappedLines.forEach(lineText => {
    checkPageBreak(6);
    doc.text(lineText, ML, y);
    y += 5.5;
  });
  y += 4;
  line();

  // ── 6. Safety Tips ────────────────────────────────────────────────────────
  checkPageBreak(40);
  setColor(22, 100, 60);
  heading('Safety Tips', 12);
  doc.text('Safety Tips', ML, y);
  resetColor();
  y += 7;

  body(9);
  const tips = [
    'Never share OTP or PIN on phone calls — banks never ask for it.',
    'Government scheme money is never asked for in advance.',
    'Immediately hang up on suspicious calls and call 1930.',
    'Report cyber fraud at: https://cybercrime.gov.in',
    'This report can be submitted as evidence when filing a cyber crime complaint.',
  ];
  tips.forEach(tip => {
    checkPageBreak(8);
    const wrapped = doc.splitTextToSize(`✓  ${tip}`, CW);
    wrapped.forEach(l => { doc.text(l, ML, y); y += 5.5; });
    y += 1;
  });

  y += 4;
  line();

  // ── 7. Footer ─────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    body(8);
    setColor(150, 150, 150);
    doc.text(
      'DISCLAIMER: VoiceGuard is an advisory tool only. Not 100% accurate. Always contact Cyber Cell 1930 for verified cases.',
      PW / 2, 287, { align: 'center', maxWidth: CW }
    );
    doc.text(`Page ${i} of ${totalPages}  |  VoiceGuard Farmer Scam Shield`, PW / 2, 292, { align: 'center' });
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const filename = `VoiceGuard_Report_${Date.now()}.pdf`;
  doc.save(filename);
}