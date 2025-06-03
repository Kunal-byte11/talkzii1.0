
// src/lib/personaOptions.ts
export interface PersonaTheme {
  primaryColor: string; // For AI bubble background
  accentColor: string; // For Send button or other accents
  bubbleTextColor: string; // Text color on AI bubble
  fontClassName: string; // Tailwind class for the font
}
export interface PersonaOption {
  value: string;
  label: string;
  description: string;
  imageHint: string;
  imageUrl: string;
  theme?: PersonaTheme; // Optional: Default Talkzii might not have a specific override
}

export const personaOptions: PersonaOption[] = [
  {
    value: 'default',
    label: 'Talkzii',
    description: 'Your default, empathetic AI companion for all moods.',
    imageHint: 'abstract companion',
    imageUrl: '/icons/assets/talzii.png',
    // No theme override, will use global styles
    theme: {
      primaryColor: 'hsl(var(--primary))', // Use app primary
      accentColor: 'hsl(var(--accent))',   // Use app accent
      bubbleTextColor: 'hsl(var(--primary-foreground))',
      fontClassName: 'font-poppins', // Default app font
    }
  },
  {
    value: 'wise_dadi',
    label: 'Wise Dadi',
    description: 'A comforting grandma with desi wisdom and love.',
    imageHint: 'grandmother wisdom',
    imageUrl: '/icons/assets/dadi.jpg',
    theme: {
      primaryColor: 'hsl(35, 65%, 70%)', // Warm Marigold
      accentColor: 'hsl(340, 70%, 85%)', // Soft Rose Pink
      bubbleTextColor: 'hsl(35, 40%, 20%)', // Dark Brown text
      fontClassName: 'font-hind',
    },
  },
  {
    value: 'chill_bro',
    label: 'Chill Bro',
    description: 'A laid-back bestie to help you vibe and de-stress.',
    imageHint: 'friendly confident',
    imageUrl: '/icons/assets/chillbro.png',
    theme: {
      primaryColor: 'hsl(195, 53%, 79%)', // Powder Blue
      accentColor: 'hsl(180, 40%, 90%)', // Pale Cyan
      bubbleTextColor: 'hsl(195, 25%, 20%)', // Dark Blue-Grey text
      fontClassName: 'font-plus-jakarta-sans', // Or 'font-poppins'
    },
  },
  {
    value: 'geeky_bhai',
    label: 'Geeky Bhai',
    description: 'A nerdy topper for practical tips and quirky humor.',
    imageHint: 'smart glasses',
    imageUrl: '/icons/assets/nerdyfriend.png',
    theme: {
      primaryColor: 'hsl(225, 50%, 55%)', // Indigo/Sapphire
      accentColor: 'hsl(75, 85%, 60%)', // Bright Lime/Yellow (not too harsh)
      bubbleTextColor: 'hsl(0, 0%, 100%)', // White text
      fontClassName: 'font-geist-mono',
    },
  },
  {
    value: 'flirty_diva',
    label: 'Flirty Diva',
    description: 'A sassy gal for playful, flirty chats.',
    imageHint: 'fashion glamour',
    imageUrl: '/icons/assets/Flirty Dia.png',
    theme: {
      primaryColor: 'hsl(330, 80%, 60%)', // Hot Pink/Deep Plum
      accentColor: 'hsl(25, 80%, 80%)', // Rose Gold-ish / Mauve
      bubbleTextColor: 'hsl(0, 0%, 100%)', // White text
      fontClassName: 'font-poppins', // Or a more playful cursive if available
    },
  },
  {
    value: 'cheeky_lad',
    label: 'Cheeky Lad',
    description: 'A charming guy for cheeky, flirty banter.',
    imageHint: 'playful smile',
    imageUrl: '/icons/assets/Cheeky Lad.png',
    theme: {
      primaryColor: 'hsl(0, 60%, 50%)', // Crimson Red
      accentColor: 'hsl(45, 85%, 65%)', // Metallic Gold hint
      bubbleTextColor: 'hsl(0, 0%, 100%)', // White text
      fontClassName: 'font-poppins',
    },
  },
];

export const getDefaultPersonaImage = () => {
  return personaOptions.find(p => p.value === 'default')?.imageUrl || '/icons/assets/talzii.png';
};

export const getPersonaTheme = (personaValue?: string) => {
  const persona = personaOptions.find(p => p.value === (personaValue || 'default'));
  return persona?.theme;
}
