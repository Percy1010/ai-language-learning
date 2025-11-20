import { NextRequest, NextResponse } from 'next/server';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, word, apiConfig } = await req.json();

    if (!apiConfig || !apiConfig.apiKey) {
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 400 }
      );
    }

    const { apiKey, baseURL, model } = apiConfig;

    const endpoint = baseURL
      ? `${baseURL}/chat/completions`
      : 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = `You are a helpful language learning assistant. The user is learning about the word "${word}".
Answer their questions clearly and concisely. Provide examples, usage tips, and cultural context when relevant.
Keep responses focused and educational.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `API Error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}
