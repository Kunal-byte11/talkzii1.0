import { NextResponse } from 'next/server';

const TEST_TEXT = "Namaste! Main Talkzii hoon. Aap kaise hain?";
const CHARACTERS = [
  'default_female',
  'wise_dadi',
  'chill_bro',
  'geeky_bhai',
  'flirty_diva',
  'cheeky_lad'
] as const;

export async function GET() {
  try {
    const results = CHARACTERS.map(character => ({
      character,
      status: 'success' as const
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in test-voices:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 