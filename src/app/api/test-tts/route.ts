import { NextResponse } from 'next/server';

const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/mms-tts-eng";
const HF_API_KEY = process.env.HF_TOKEN;

export async function GET() {
  try {
    if (!HF_API_KEY) {
      return NextResponse.json(
        { error: 'Hugging Face API key not configured' },
        { status: 500 }
      );
    }

    // Test with a simple text
    const testText = "Hello, this is a test message.";

    console.log('Making test request to Hugging Face API...');
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: testText,
        options: {
          use_cache: true,
          wait_for_model: true
        }
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'API request failed',
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({
        error: 'Received empty audio data',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: 500 });
    }

    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Test TTS Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 