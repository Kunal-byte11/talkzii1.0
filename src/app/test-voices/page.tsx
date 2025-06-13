'use client';

import { useState } from 'react';

const CHARACTERS = [
  { id: 'default_female', name: 'Default Female' },
  { id: 'wise_dadi', name: 'Wise Dadi' },
  { id: 'chill_bro', name: 'Chill Bro' },
  { id: 'geeky_bhai', name: 'Geeky Bhai' },
  { id: 'flirty_diva', name: 'Flirty Diva' },
  { id: 'cheeky_lad', name: 'Cheeky Lad' }
];

const TEST_TEXT = "Namaste! Main Talkzii hoon. Aap kaise hain?";

export default function TestVoices() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const playVoice = async (characterId: string) => {
    try {
      setError(null);
      setIsPlaying(characterId);

      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: TEST_TEXT,
          characterType: characterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError('Error playing audio');
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsPlaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Voice Character Test
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Test Text: "{TEST_TEXT}"
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((character) => (
            <button
              key={character.id}
              onClick={() => playVoice(character.id)}
              disabled={isPlaying !== null}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${isPlaying === character.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-300'
                }
                ${isPlaying !== null && isPlaying !== character.id
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {character.name}
                </h3>
                {isPlaying === character.id && (
                  <p className="mt-2 text-sm text-blue-600">
                    Playing...
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 