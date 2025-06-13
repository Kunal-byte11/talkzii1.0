import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text input' },
        { status: 400 }
      );
    }

    // Debug: Check if HF_TOKEN is available
    const hfToken = process.env.HF_TOKEN;
    console.log('HF_TOKEN available:', !!hfToken);
    console.log('HF_TOKEN length:', hfToken?.length);

    if (!hfToken) {
      console.error('Hugging Face API token is not configured');
      return NextResponse.json(
        { error: 'TTS service is not properly configured' },
        { status: 500 }
      );
    }

    // Using Microsoft's SpeechT5 model which is more widely accessible
    console.log('Making request to Hugging Face API...');
    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/speecht5_tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: text,
        options: {
          use_cache: true,
          wait_for_model: true
        }
      }),
    });

    console.log('Hugging Face API response status:', response.status);
    console.log('Hugging Face API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired API token. Please check your Hugging Face token.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to generate speech from Hugging Face API' },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('Received audio data, size:', arrayBuffer.byteLength);

    // Return the audio with proper headers
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 