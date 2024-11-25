import OpenAI from "openai";

export default function getOpenAI() {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
    organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION ?? "",
  });
  return openai;
}

export function getOpenAIBrowser() {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
    organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION ?? "",
    dangerouslyAllowBrowser: true,
  });
  return openai;
}

export const ASSISTANT_ID = "asst_lX1CxKABQX3ktPhmclqt3cGi";
