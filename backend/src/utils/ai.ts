import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy", // ensure it does not break if env is missing at startup
});
