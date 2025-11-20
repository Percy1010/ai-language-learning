import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { word, apiConfig } = await req.json();

    if (!apiConfig || !apiConfig.apiKey) {
      return NextResponse.json(
        { error: 'API configuration is missing. Please set up your API key in settings.' },
        { status: 400 }
      );
    }

    const { apiKey, baseURL, model, provider } = apiConfig;

    // 构建请求URL
    const endpoint = baseURL
      ? `${baseURL}/chat/completions`
      : 'https://api.openai.com/v1/chat/completions';

    // 构建提示词
    const systemPrompt = `You are a language learning assistant. When given a word, provide a comprehensive analysis in JSON format with the following structure:
{
  "word": "the original word",
  "translation": "Chinese translation",
  "pronunciation": "IPA pronunciation",
  "definition": "English definition",
  "partOfSpeech": "noun/verb/adjective/etc",
  "mnemonic": "A creative memory technique or story to remember this word",
  "image_prompt": "A detailed description for AI image generation that visually represents the word's meaning",
  "example_sentence": "A natural example sentence using this word"
}

Make the mnemonic creative and memorable. The image_prompt should be descriptive and suitable for educational illustration.`;

    // 调用LLM API
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
          { role: 'user', content: `Analyze the word: "${word}"` },
        ],
        response_format: provider === 'openai' ? { type: 'json_object' } : undefined,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('LLM API Error:', errorData);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // 解析JSON响应
    let wordData;
    try {
      // 尝试清理可能的 markdown 代码块包裹
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      wordData = JSON.parse(content);
    } catch (e) {
      // 如果返回的不是标准JSON，尝试提取
      console.error('Failed to parse LLM response as JSON:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response. The model may not support JSON output. Please try again or use a different model.' },
        { status: 500 }
      );
    }

    // 添加时间戳
    wordData.timestamp = new Date().toISOString();

    return NextResponse.json(wordData);

  } catch (error: any) {
    console.error('Generate word error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate word data' },
      { status: 500 }
    );
  }
}
