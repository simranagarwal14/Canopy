import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getAuthUser } from "@/lib/auth";
import { getGardenOverview } from "@/lib/gardenService";
import {
  ROOTLY_SYSTEM_PROMPT,
  analyzeQuestion,
  buildFileAnswer,
  buildGroundingContext,
  buildMissingNote,
  supportedPlantNames,
} from "@/lib/rootlyService";
import type { PlantView } from "@/lib/types";

export const dynamic = "force-dynamic";

type RootlySource = "guardrail" | "ai" | "plant-file";

interface RootlyResponse {
  reply: string;
  source: RootlySource;
  status: string;
  plant: string | null;
  supported: string[];
  aiConfigured: boolean;
  notice?: string;
}

const MAX_QUESTION_LENGTH = 500;

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  let body: { question?: unknown; plant?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim().slice(0, MAX_QUESTION_LENGTH) : "";
  if (!question) return NextResponse.json({ error: "Ask Rootly a question first." }, { status: 400 });
  const selected = typeof body.plant === "string" ? body.plant : null;

  // Personalise with the user's own plants when the database is reachable — never required.
  let userPlants: PlantView[] = [];
  try {
    userPlants = (await getGardenOverview(auth.email))?.plants ?? [];
  } catch {
    userPlants = [];
  }

  const analysis = analyzeQuestion({ question, selectedSpecies: selected, userPlants });
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const base = {
    status: analysis.status,
    plant: analysis.plant?.name ?? null,
    supported: supportedPlantNames(),
    aiConfigured: Boolean(apiKey),
  };

  // 1) Deterministic guardrails — the model is never consulted.
  if (analysis.guardrailReply) {
    const res: RootlyResponse = { ...base, reply: analysis.guardrailReply, source: "guardrail" };
    return NextResponse.json(res);
  }

  // 2) No key yet — answer straight from data/plants.json.
  if (!apiKey) {
    const res: RootlyResponse = {
      ...base,
      reply: buildFileAnswer(analysis),
      source: "plant-file",
      notice: "Rootly's AI isn't switched on yet (no OPENAI_API_KEY), so this answer comes straight from the plant file.",
    };
    return NextResponse.json(res);
  }

  // 3) LangChain + OpenAI, grounded in the matched plant entry only.
  try {
    const llm = new ChatOpenAI({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.2,
      maxTokens: 400,
      maxRetries: 1,
      timeout: 25_000,
      apiKey,
    });
    const result = await llm.invoke([
      new SystemMessage(ROOTLY_SYSTEM_PROMPT),
      new HumanMessage(
        `VERIFIED CONTEXT:\n${buildGroundingContext(analysis)}\n\nUSER QUESTION:\n${question}`,
      ),
    ]);
    let reply = contentToText(result.content).trim();
    if (!reply) throw new Error("Empty model response");

    // Deterministically state what's missing, regardless of what the model said.
    if (analysis.plant && analysis.missingTopics.length) {
      reply += `\n\n${buildMissingNote(analysis.plant, analysis.missingTopics, false)}`;
    }
    const res: RootlyResponse = { ...base, reply, source: "ai" };
    return NextResponse.json(res);
  } catch (err) {
    console.error("[api/rootly]", err);
    const res: RootlyResponse = {
      ...base,
      reply: buildFileAnswer(analysis),
      source: "plant-file",
      notice: "Rootly's AI couldn't be reached just now, so this answer comes straight from the plant file.",
    };
    return NextResponse.json(res);
  }
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : part && typeof part === "object" && "text" in part && typeof (part as { text: unknown }).text === "string"
            ? (part as { text: string }).text
            : "",
      )
      .join("");
  }
  return "";
}
