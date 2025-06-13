import { NextResponse } from 'next/server';

const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/speecht5_tts";
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
        errorText
      }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Test Speech Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 