import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { answerFromProject } from "@/lib/mistral/chat";
import { appendChatTurn, getProjectState } from "@/lib/store";
import type { ChatTurn } from "@/lib/types";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getProjectState(id);
  if (!state) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (!state.processed) {
    return NextResponse.json(
      { error: "Process the project before chatting." },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { message?: string };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const userTurn: ChatTurn = {
    id: `chat_${Date.now().toString(36)}_u`,
    role: "user",
    content: message,
    createdAt: new Date().toISOString(),
  };
  await appendChatTurn(id, user.id, userTurn);

  try {
    const { answer, citations } = await answerFromProject({
      role: user.role,
      team: user.team,
      message,
      insights: state.insights,
    });

    const assistantTurn: ChatTurn = {
      id: `chat_${Date.now().toString(36)}_a`,
      role: "assistant",
      content: answer,
      citations,
      createdAt: new Date().toISOString(),
    };
    await appendChatTurn(id, user.id, assistantTurn);

    return NextResponse.json({ userTurn, assistantTurn });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 },
    );
  }
}
