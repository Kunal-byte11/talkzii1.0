
// src/lib/personaOptions.ts
export interface PersonaOption {
  value: string;
  label: string;
  description: string;
  imageHint: string;
  imageUrl: string;
}

export const personaOptions: PersonaOption[] = [
  {
    value: 'default',
    label: 'Talkzii',
    description: 'Your default, empathetic AI companion for all moods.',
    imageHint: 'abstract companion',
    imageUrl: '/icons/assets/talzii.png',
  },
  {
    value: 'wise_dadi',
    label: 'Wise Dadi',
    description: 'A comforting grandma with desi wisdom and love.',
    imageHint: 'grandmother wisdom',
    imageUrl: '/icons/assets/dadi.jpg',
  },
  {
    value: 'chill_bro',
    label: 'Chill Bro',
    description: 'A laid-back bestie to help you vibe and de-stress.',
    imageHint: 'friendly confident',
    imageUrl: '/icons/assets/chillbro.png',
  },
  {
    value: 'geeky_bhai',
    label: 'Geeky Bhai',
    description: 'A nerdy topper for practical tips and quirky humor.',
    imageHint: 'smart glasses',
    imageUrl: '/icons/assets/nerdyfriend.png',
  },
  {
    value: 'flirty_diva',
    label: 'Flirty Diva',
    description: 'A sassy gal for playful, flirty chats.',
    imageHint: 'fashion glamour',
    imageUrl: '/icons/assets/Flirty Dia.png',
  },
  {
    value: 'cheeky_lad',
    label: 'Cheeky Lad',
    description: 'A charming guy for cheeky, flirty banter.',
    imageHint: 'playful smile',
    imageUrl: '/icons/assets/Cheeky Lad.png',
  },
];

export const getDefaultPersonaImage = () => {
  return personaOptions.find(p => p.value === 'default')?.imageUrl || '/icons/assets/talzii.png';
};
