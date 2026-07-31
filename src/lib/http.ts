/**
 * Safely parses a fetch Response as JSON, throwing a readable Error instead
 * of letting a non-JSON body (e.g. a dev-server HTML error page) crash the
 * caller with a raw "Unexpected token '<'" SyntaxError.
 */
export async function readJson<T = unknown>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    const looksLikeHtml = /^\s*</.test(text);
    throw new Error(
      looksLikeHtml || !text
        ? `Server error (${res.status}). Check the terminal running "npm run dev" for details.`
        : text.slice(0, 300),
    );
  }

  return (await res.json()) as T;
}
