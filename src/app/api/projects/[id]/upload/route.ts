import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { extensionOf, linesFromText, parseUpload, SUPPORTED_EXTENSIONS } from "@/lib/ingest/parse";
import { addDocument, getProjectState } from "@/lib/store";
import type { DocumentSource } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getProjectState(id)) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const ext = extensionOf(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
    return NextResponse.json(
      { error: `Unsupported file type .${ext || "unknown"}. Use: ${SUPPORTED_EXTENSIONS.join(", ")}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseUpload(file.name, buffer);
    if (!parsed.text.trim()) {
      return NextResponse.json(
        { error: parsed.warning || "Could not extract any text from that file" },
        { status: 422 },
      );
    }

    const doc: DocumentSource = {
      id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      filename: file.name,
      mime: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.username,
      lines: linesFromText(parsed.text),
    };

    addDocument(id, doc);
    return NextResponse.json({ document: doc, warning: parsed.warning ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
