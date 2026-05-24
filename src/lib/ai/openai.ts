import "server-only";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function getAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5-mini";
}