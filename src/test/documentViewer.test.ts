import { describe, it, expect } from "vitest";

function detectFileType(name: string, mime?: string) {
  const n = name.toLowerCase();
  const m = (mime || "").toLowerCase();

  if (n.endsWith(".pdf") || m.includes("pdf")) return "pdf";
  if (
    n.endsWith(".docx") ||
    n.endsWith(".doc") ||
    m.includes("word") ||
    m.includes("officedocument.wordprocessingml")
  ) {
    return "docx";
  }
  if (
    n.match(/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/) ||
    m.startsWith("image/")
  ) {
    return "image";
  }
  if (
    n.match(/\.(txt|json|csv|md|log|xml|js|ts|html|css|py)$/) ||
    m.startsWith("text/")
  ) {
    return "text";
  }
  return "unsupported";
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

describe("Dynamic Document Viewer logic", () => {
  it("accurately detects PDF documents", () => {
    expect(detectFileType("letter_of_motivation.pdf")).toBe("pdf");
    expect(detectFileType("my_cv", "application/pdf")).toBe("pdf");
  });

  it("accurately detects Word (.docx and .doc) documents", () => {
    expect(detectFileType("Essay_Draft.docx")).toBe("docx");
    expect(detectFileType("Old_CV.doc")).toBe("docx");
    expect(detectFileType("document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("docx");
  });

  it("accurately detects image documents", () => {
    expect(detectFileType("certificate.png")).toBe("image");
    expect(detectFileType("passport_scan.jpeg")).toBe("image");
    expect(detectFileType("photo.webp")).toBe("image");
  });

  it("accurately detects text documents", () => {
    expect(detectFileType("notes.txt")).toBe("text");
    expect(detectFileType("readme.md")).toBe("text");
  });

  it("formats file sizes cleanly", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
