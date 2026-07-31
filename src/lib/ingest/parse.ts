import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import type { DocumentLine } from "@/lib/types";

export interface ParsedDocument {
  text: string;
  warning?: string;
}

export const SUPPORTED_EXTENSIONS = ["txt", "md", "vtt", "pdf", "docx"] as const;

export function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export async function parseUpload(
  filename: string,
  buffer: Buffer,
): Promise<ParsedDocument> {
  const ext = extensionOf(filename);

  if (ext === "txt" || ext === "md") {
    return { text: buffer.toString("utf-8") };
  }

  if (ext === "vtt") {
    return { text: stripVtt(buffer.toString("utf-8")) };
  }

  if (ext === "pdf") {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return { text: Array.isArray(text) ? text.join("\n") : text };
    } catch (err) {
      return {
        text: "",
        warning: `Could not parse PDF: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  if (ext === "docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        warning: result.messages.length
          ? "DOCX parsed with formatting warnings — text extraction is best-effort."
          : undefined,
      };
    } catch (err) {
      return {
        text: "",
        warning: `Could not parse DOCX: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return { text: "", warning: `Unsupported file type: .${ext || "unknown"}` };
}

function stripVtt(raw: string): string {
  return raw
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed === "WEBVTT") return false;
      if (/^\d+$/.test(trimmed)) return false; // cue index
      if (/-->/.test(trimmed)) return false; // timecode line
      if (/^NOTE\b/.test(trimmed)) return false;
      return true;
    })
    .join("\n");
}

export function linesFromText(text: string): DocumentLine[] {
  return text
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t, idx) => ({ id: idx + 1, text: t }));
}
