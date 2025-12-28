import * as functions from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

functions.setGlobalOptions({maxInstances: 10});

initializeApp();
const db = getFirestore();

type Answers = {
  frontend: number;
  backend: number;
  dsa: number;
  databases: number;
  devops: number;
  systemDesign: number;
};

type SkillAssessment = {
  score: number;
  detectedSkills: string[];
  missingSkills: string[];
  strengthAreas: string[];
  summary: string;
  answers: Answers;
};

type RuntimeConfig = {
  gemini?: {
    key?: string;
  };
};

const getRuntimeConfig = (): RuntimeConfig => {
  const fnAny = functions as unknown as {config?: () => RuntimeConfig};
  if (typeof fnAny.config === "function") {
    return fnAny.config();
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();

const GEMINI_API_KEY: string | undefined = process.env.GEMINI_API_KEY ||
  runtimeConfig.gemini?.key;

export const analyzeSkills = onCall(
  async (request): Promise<SkillAssessment> => {
    const {data, auth} = request;

    if (!auth) {
      throw new Error("unauthenticated: You must be logged in.");
    }

    const answers: Answers = data?.answers;
    if (
      !answers ||
    typeof answers.frontend !== "number" ||
    typeof answers.backend !== "number" ||
    typeof answers.dsa !== "number" ||
    typeof answers.databases !== "number" ||
    typeof answers.devops !== "number" ||
    typeof answers.systemDesign !== "number"
    ) {
      throw new Error(
        "invalid-argument: answers object is missing or invalid.",
      );
    }

    const uid = auth.uid;

    if (!GEMINI_API_KEY) {
      throw new Error("failed-precondition: Gemini API key is not configured.");
    }

    const systemInstruction = `
You are an assistant that analyzes a student's self-rated technical skills.

You MUST respond with valid JSON only, with this exact shape:
{
  "score": number between 0 and 100,
  "detectedSkills": string[],
  "missingSkills": string[],
  "strengthAreas": string[],
  "shortSummary": string
}
Do not include any explanations or text outside of this JSON.
`;

    const prompt = `
The user rated their skills on a scale from 0 (no experience) to 3 (strong):

frontend: ${answers.frontend}
backend: ${answers.backend}
data structures & algorithms: ${answers.dsa}
databases: ${answers.databases}
devops: ${answers.devops}
system design: ${answers.systemDesign}

Based on these ratings, infer:
- concrete skills they likely have (detectedSkills),
- important skills or areas they should work on (missingSkills),
- broader strength areas (strengthAreas),
- an overall readiness/strength score (0–100),
- and a short, encouraging summary (2–3 lines).
`;

    const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent" +
    `?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    let rawText: string;

    try {
      const geminiResponse = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{text: systemInstruction + "\n\n" + prompt}],
            },
          ],
        }),
      });

      if (!geminiResponse.ok) {
        const errBody = await geminiResponse.text().catch(() => "");
        console.error("Gemini error:", geminiResponse.status, errBody);
        throw new Error("internal: Gemini API request failed.");
      }

      const body = await geminiResponse.json();
      rawText =
      body?.candidates?.[0]?.content?.parts?.[0]?.text ||
      body?.candidates?.[0]?.output ||
      "";

      if (!rawText || typeof rawText !== "string") {
        console.error("Unexpected Gemini response:", JSON.stringify(body));
        throw new Error("internal: Gemini did not return any text.");
      }
    } catch (err) {
      console.error("Error calling Gemini:", err);
      throw new Error("internal: Failed to call Gemini API.");
    }

    let parsed: unknown;
    try {
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse Gemini JSON:", rawText, err);
      throw new Error("internal: Gemini response was not valid JSON.");
    }

    const parsedObj = parsed as {
    score?: unknown;
    detectedSkills?: unknown;
    missingSkills?: unknown;
    strengthAreas?: unknown;
    shortSummary?: unknown;
  };

    const result: SkillAssessment = {
      score: Number(parsedObj.score) || 0,
      detectedSkills: Array.isArray(parsedObj.detectedSkills) ?
        parsedObj.detectedSkills.map(String) :
        [],
      missingSkills: Array.isArray(parsedObj.missingSkills) ?
        parsedObj.missingSkills.map(String) :
        [],
      strengthAreas: Array.isArray(parsedObj.strengthAreas) ?
        parsedObj.strengthAreas.map(String) :
        [],
      summary: typeof parsedObj.shortSummary === "string" ?
        parsedObj.shortSummary :
        "",
      answers,
    };

    if (result.score < 0) result.score = 0;
    if (result.score > 100) result.score = 100;

    await db.collection("assessments").doc(uid).set(
      {
        ...result,
        createdAt: FieldValue.serverTimestamp(),
      },
      {merge: true},
    );

    return result;
  },
);
