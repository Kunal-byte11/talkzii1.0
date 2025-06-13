import { NextResponse } from 'next/server';

const HF_TTS_TOKEN = process.env.HF_TTS_TOKEN;

// Voice parameters for different characters
const getVoiceParams = (characterType: string) => {
  switch (characterType) {
    case 'wise_dadi':
      return { voice_id: "female_1", speed: 0.8, pitch: 0.9 };  // Slower, lower pitch female voice
    case 'chill_bro':
      return { voice_id: "male_1", speed: 1.1, pitch: 1.0 };  // Slightly faster male voice
    case 'geeky_bhai':
      return { voice_id: "male_2", speed: 1.0, pitch: 1.1 };  // Higher pitch male voice
    case 'flirty_diva':
      return { voice_id: "female_2", speed: 1.1, pitch: 1.2 };  // Faster, higher pitch female voice
    case 'cheeky_lad':
      return { voice_id: "male_3", speed: 1.2, pitch: 1.1 };  // Fast male voice
    default:
      return { voice_id: "female_1", speed: 1.0, pitch: 1.0 };  // Default female voice
  }
};

export async function POST(req: Request) {
  try {
    if (!HF_TTS_TOKEN) {
      console.error('HF_TTS_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Hugging Face TTS API key not configured' },
        { status: 500 }
      );
    }

    const { text, characterType = 'default_female' } = await req.json();

    if (!text || typeof text !== 'string') {
      console.error('Invalid text input:', text);
      return NextResponse.json(
        { error: 'Invalid text input' },
        { status: 400 }
      );
    }

    // Get voice parameters for the character
    const voiceParams = getVoiceParams(characterType);
    console.log('Using voice parameters for character:', characterType, voiceParams);

    // Using Hugging Face Inference API with Dia model
    console.log('Making request to Hugging Face API...');
    const response = await fetch("https://api-inference.huggingface.co/models/nari-labs/Dia-1.6B", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${HF_TTS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          ...voiceParams,
          return_timestamps: false
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
          { error: 'Invalid or expired API token. Please check your Hugging Face TTS token.' },
          { status: 401 }
        );
      }
      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Model is currently loading. Please try again in a few seconds.' },
          { status: 503 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Failed to generate speech from Hugging Face API: ${errorText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      console.error('Received empty audio data from Hugging Face API');
      return NextResponse.json(
        { error: 'Received empty audio data from API' },
        { status: 500 }
      );
    }

    console.log('Received audio data, size:', arrayBuffer.byteLength);
    
    // Return the audio with proper headers
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Speech Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate speech', details: errorMessage },
      { status: 500 }
    );
  }
} 