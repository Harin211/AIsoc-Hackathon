import { Mistral } from "@mistralai/mistralai";

export const MODELS = {
  large: "mistral-large-latest",
  small: "mistral-small-latest",
  embed: "mistral-embed",
  tts: "voxtral-mini-tts-latest",
} as const;

export function hasMistralKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY?.trim());
}

let client: Mistral | null = null;

export function getMistral(): Mistral {
  const key = process.env.MISTRAL_API_KEY?.trim();
  if (!key) {
    throw new Error("MISTRAL_API_KEY is not set");
  }
  if (!client) {
    client = new Mistral({ apiKey: key });
  }
  return client;
}

export async function chatJson<T>(
  system: string,
  user: string,
  options?: { model?: string; temperature?: number },
): Promise<T> {
  const mistral = getMistral();
  const response = await mistral.chat.complete({
    model: options?.model ?? MODELS.large,
    temperature: options?.temperature ?? 0.1,
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) =>
              typeof part === "object" && part !== null && "text" in part
                ? String((part as { text: string }).text)
                : "",
            )
            .join("")
        : "";

  if (!text) {
    throw new Error("Empty response from Mistral");
  }

  return JSON.parse(text) as T;
}
