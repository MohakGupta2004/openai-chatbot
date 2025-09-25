import { MessageType } from "@/app/page";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
})
const conversation: ChatCompletionMessageParam[] = [];

export async function POST(req: Request) {
    const { messages } = await req.json()
    conversation.push({
        role: 'user',
        content: messages
    })
    const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: conversation,
        stream: true
    });
    const encoder = new TextEncoder();
    // for await (const chunk of response) {
    //     return NextResponse.write({
    //         (chunk.choices[0].delta.content);
    // }

    // return NextResponse.json({
    //     type: MessageType.Receiver,
    //     content: result.content
    // })
    return new Response(
        new ReadableStream({
            async start(controller) {
                let content = ""
                for await (const chunk of response) {
                    const token = chunk.choices[0].delta.content;
                    content+=token
                    controller.enqueue(encoder.encode(token!))
                }
                conversation.push({
                    role: 'assistant',
                    content: content
                })
            }
        }),
        {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            }
        }
    )
}