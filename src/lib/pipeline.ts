import { CURATED_CONFLICTS, CURATED_INSIGHTS } from "@/lib/demo/curated";
import { embedTexts } from "@/lib/mistral/embed";
import { extractInsights } from "@/lib/mistral/extract";
import { detectConflicts } from "@/lib/mistral/radar";
import { getProjectState, setProcessed } from "@/lib/store";
import type { ProjectState } from "@/lib/types";

const CURATED_FALLBACK_PROJECT_ID = "q3_launch";

export async function processProject(
  projectId: string,
  opts?: { forceCurated?: boolean },
): Promise<{ state: ProjectState; mode: "mistral" | "curated"; note: string }> {
  const project = await getProjectState(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const sampleTexts = [
    `project:${projectId}`,
    ...project.transcript.slice(0, 5).map((l) => l.text),
    ...project.discord.slice(0, 5).map((m) => m.text),
    ...project.documents
      .slice(0, 3)
      .map((d) => d.lines.slice(0, 5).map((l) => l.text).join(" ")),
  ];
  // Soft RAG boundary check: embed project label + a sample of sources.
  await embedTexts(sampleTexts);

  if (opts?.forceCurated) {
    return finishWithCurated(projectId, "Loaded cached reference insights.");
  }

  const hasAnySource =
    project.transcript.length || project.discord.length || project.documents.length;
  if (!hasAnySource) {
    throw new Error(
      "Add a transcript, chat log, or document before processing this project.",
    );
  }

  try {
    const insights = await extractInsights({
      projectId,
      transcript: project.transcript,
      discord: project.discord,
      documents: project.documents,
    });
    const conflicts = await detectConflicts(projectId, insights);
    const state = (await setProcessed(projectId, insights, conflicts))!;
    return {
      state,
      mode: "mistral",
      note: "Extracted via Mistral Large 3 + Alignment Radar diff pass.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isMissingKey = message === "NO_API_KEY";

    if (projectId === CURATED_FALLBACK_PROJECT_ID) {
      const reason = isMissingKey
        ? "No MISTRAL_API_KEY"
        : `Mistral call failed (${message})`;
      return finishWithCurated(
        projectId,
        `${reason} — using cached reference insights for this project.`,
      );
    }

    throw new Error(
      isMissingKey
        ? "Set MISTRAL_API_KEY to process this project."
        : `Mistral call failed: ${message}`,
    );
  }
}

async function finishWithCurated(projectId: string, note: string) {
  const state = (await setProcessed(
    projectId,
    structuredClone(CURATED_INSIGHTS),
    structuredClone(CURATED_CONFLICTS),
  ))!;
  return { state, mode: "curated" as const, note };
}
