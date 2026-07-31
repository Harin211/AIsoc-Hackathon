import { getMistral, hasMistralKey, MODELS } from "@/lib/mistral/client";

/** Project-scoped embedding for RAG boundary checks */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!hasMistralKey()) {
    return texts.map((_, i) => pseudoEmbed(texts[i] ?? "", i));
  }

  const mistral = getMistral();
  const response = await mistral.embeddings.create({
    model: MODELS.embed,
    inputs: texts,
  });

  return (response.data ?? []).map((row) => row.embedding ?? []);
}

/** Cosine similarity — used to keep retrieval inside one project */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function pseudoEmbed(text: string, salt: number): number[] {
  const vec = new Array<number>(32).fill(0);
  for (let i = 0; i < text.length; i++) {
    const idx = (text.charCodeAt(i) + salt) % 32;
    vec[idx] = (vec[idx] ?? 0) + 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}
