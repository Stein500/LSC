import type { SubmissionPdfResponse, SubmissionResponse } from "./api";
import { generateTicketId } from "./format";
import { downloadPdfBase64 } from "./download";

export function isSubmissionPdf(pdf: SubmissionResponse["pdf"]): pdf is SubmissionPdfResponse {
  return Boolean(
    pdf &&
      typeof pdf === "object" &&
      pdf.ok === true &&
      typeof pdf.base64 === "string" &&
      pdf.base64.length > 0 &&
      typeof pdf.filename === "string" &&
      pdf.filename.length > 0,
  );
}

export function downloadSubmissionPdfFromResponse(
  response: SubmissionResponse,
  ref: string = generateTicketId(),
): boolean {
  const pdf = response.pdf;

  if (isSubmissionPdf(pdf)) {
    downloadPdfBase64(pdf.base64, pdf.filename, ref);
    return true;
  }

  return false;
}

export function getSubmissionRef(response: SubmissionResponse, fallbackRef: string = generateTicketId()): string {
  return response.ref && response.ref.trim().length > 0 ? response.ref : fallbackRef;
}
