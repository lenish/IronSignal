import jsPDF from "jspdf";
import type { DailySummary } from "./types";

function isWeekly(date: string): boolean {
  return date.includes("~");
}

function formatDateLabel(date: string): string {
  if (isWeekly(date)) {
    const [start, end] = date.split("~");
    return `Weekly Briefing | ${start} — ${end}`;
  }
  return `Daily Briefing | ${date}`;
}

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

export function exportSummaryPDF(summary: DailySummary): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("IRONSIGNAL", margin, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("Commodity Market Intelligence", margin + 58, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(formatDateLabel(summary.date), margin, y);
  y += 3;

  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setTextColor(30, 30, 30);

  const lines = summary.content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      y += 3;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      checkPageBreak(12);
      y += 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 80, 140);
      doc.text(stripMarkdownBold(trimmed.replace("## ", "")), margin, y);
      y += 6;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      checkPageBreak(14);
      y += 5;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 60, 120);
      doc.text(stripMarkdownBold(trimmed.replace("# ", "")), margin, y);
      y += 7;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = stripMarkdownBold(trimmed.slice(2));
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const wrapped = doc.splitTextToSize(text, maxWidth - 8);
      checkPageBreak(wrapped.length * 4.5 + 2);
      doc.text("\u2022", margin + 2, y);
      doc.text(wrapped, margin + 7, y);
      y += wrapped.length * 4.5 + 1.5;
      continue;
    }

    const text = stripMarkdownBold(trimmed);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const wrapped = doc.splitTextToSize(text, maxWidth);
    checkPageBreak(wrapped.length * 4.5 + 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.5 + 1.5;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160);
    doc.text(
      `IRONSIGNAL | ironsignal.vercel.app | Page ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  const filename = `IronSignal_${summary.date.replace(/~/g, "_to_")}.pdf`;
  doc.save(filename);
}
