import { getMistral, hasMistralKey, MODELS } from "@/lib/mistral/client";

export async function synthesizeSpeech(input: string): Promise<{
  audioBase64: string | null;
  mimeType: string;
  fallbackScript: string;
  mode: "voxtral" | "script_only";
  detail?: string;
}> {
  const script = input.trim();
  if (!script) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      fallbackScript: "",
      mode: "script_only",
      detail: "Empty script",
    };
  }

  if (!hasMistralKey()) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      fallbackScript: script,
      mode: "script_only",
      detail: "Set MISTRAL_API_KEY to enable Voxtral TTS",
    };
  }

  const voiceId = process.env.VOXTRAL_VOICE_ID?.trim();
  if (!voiceId) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      fallbackScript: script,
      mode: "script_only",
      detail:
        "Set VOXTRAL_VOICE_ID (Mistral Studio voice) to enable audio playback",
    };
  }

  const mistral = getMistral();
  const response = await mistral.audio.speech.complete({
    model: MODELS.tts,
    input: script,
    voiceId,
    responseFormat: "mp3",
  });

  const audioData =
    response && typeof response === "object" && "audioData" in response
      ? String((response as { audioData?: string }).audioData ?? "")
      : "";

  if (!audioData) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      fallbackScript: script,
      mode: "script_only",
      detail: "TTS returned empty audio",
    };
  }

  return {
    audioBase64: audioData,
    mimeType: "audio/mpeg",
    fallbackScript: script,
    mode: "voxtral",
  };
}
