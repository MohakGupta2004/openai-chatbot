import { addTwoNumbers, getWeatherTool, webHandler } from "@/lib/tools";
import { Agent, AgentInputItem, Runner } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are assistent",
  tools: [getWeatherTool, addTwoNumbers, webHandler],
  model: "gpt-4o-mini",
});

const conversation: AgentInputItem[] = [];

export async function POST(req: Request) {
  const { message } = await req.json();

  // Wrap user input as AgentInputItem
  const userInput: AgentInputItem = {
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: message }]
  };
  conversation.push(userInput);

  const runner = new Runner();
  const response = await runner.run(agent, conversation, { stream: true });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const nodeStream = response.toTextStream({ compatibleWithNodeStreams: true });
        let msg = ""
        for await (const chunk of nodeStream) {
          const token = Buffer.from(chunk)
          msg += token.toString()
          controller.enqueue(encoder.encode(chunk));
        }
        conversation.push({
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
                {
                    type: 'output_text',
                    text: msg
                }
            ]
        })
        controller.close();
      }
    }),
    {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" }
    }
  );
}