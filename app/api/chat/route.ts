import { streamText } from 'ai';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/services/ai/system-prompt';
import { getChatTools } from '@/services/ai/tools';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 1. Retrieve & Validate Session headers passed from client UI
    const userId = req.headers.get('x-user-id');
    const userType = req.headers.get('x-user-type');

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'Session credentials (x-user-id, x-user-type) are missing from request headers.' },
        { status: 401 }
      );
    }

    const session = {
      userId,
      userType: userType as 'CITIZEN' | 'ADMIN' | 'WORKER',
    };

    // 2. Select AI Provider based on active Environment Variables
    let aiModel: any;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });
      aiModel = googleProvider('gemini-2.5-flash');
    } else if (openaiKey) {
      const openaiProvider = createOpenAI({ apiKey: openaiKey });
      aiModel = openaiProvider('gpt-4o-mini');
    } else {
      // Fallback default: attempts to use Google Gemini with default env loading
      aiModel = google('gemini-2.5-flash');
    }

    // 3. Call AI SDK streaming with tool-loop agent configuration
    const result = streamText({
      model: aiModel,
      messages,
      system: SYSTEM_PROMPT,
      tools: getChatTools(session),
      maxSteps: 5, // Allows assistant to invoke tools sequentially and format answers
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
