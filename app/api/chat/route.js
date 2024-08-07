import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `Welcome to HeadstartAI Support!

I’m here to assist you with any questions or issues you may have about our AI-powered interview platform. Whether you need help with navigating the platform, scheduling interviews, or understanding our features, I’m here to help. Please select one of the following options or type your question directly:

Platform Navigation: Get assistance with navigating HeadstartAI's features and interface.
Interview Scheduling: Learn how to schedule, reschedule, or cancel interviews.
Feature Explanation: Understand more about our AI-powered interview tools and functionalities.
Account Support: Help with account-related queries, such as login issues or profile updates.
Technical Issues: Report and get help with any technical problems you might be experiencing.
General Inquiries: Ask any other questions or get information not covered above.
Feel free to type your question if you don't see what you're looking for. I'm here to ensure your experience with HeadstartAI is smooth and effective!   `;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
