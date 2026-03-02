import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://rubaahmedkhan.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 200, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400, headers });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: "AI assistant is not configured. Contact the administrator.", citations: [] },
        { headers }
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `You are a helpful AI teaching assistant for a textbook called "Physical AI & Humanoid Robotics".
The textbook covers: ROS 2 fundamentals (nodes, topics, services, actions), Gazebo 3D simulation,
NVIDIA Isaac platform (GPU-accelerated simulation, reinforcement learning), and Vision-Language-Action (VLA) models.
Answer student questions concisely and clearly in simple language.
If a question is unrelated to robotics or AI, politely guide the student back to the textbook topics.`,
          },
          { role: "user", content: question },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "I could not generate a response.";

    return NextResponse.json({ answer, citations: [] }, { headers });
  } catch (error) {
    console.error("[chat/query] error:", error);
    return NextResponse.json(
      { answer: "Sorry, something went wrong. Please try again.", citations: [] },
      { status: 500, headers }
    );
  }
}
