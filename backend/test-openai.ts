import { openai } from "./src/utils/ai.js";

async function run() {
  try {
    const stream = await openai.responses.create({
      model: "gpt-4o",
      stream: true,
      instructions: "You are an AI assistant. Provide a concise, well-structured summary of these meeting notes.",
      input: `Title: mock\n\nContent: mock`
    });

    for await (const chunk of stream) {
      if (chunk.type === "response.output_text.delta") {
        console.log(chunk.delta);
      }
    }
  } catch (error) {
    console.error("Caught error:", error);
  }
}

run();
