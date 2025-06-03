
"use client";

import { Bot, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { PersonaTheme } from '@/lib/personaOptions';

interface TypingIndicatorProps {
  personaImageUrl?: string;
  personaName?: string;
  personaTheme?: PersonaTheme;
}

export function TypingIndicator({ personaImageUrl, personaName, personaTheme }: TypingIndicatorProps) {
  const displayName = personaName || 'Talkzii';
  
  const bubbleStyle = personaTheme
    ? { backgroundColor: personaTheme.primaryColor, color: personaTheme.bubbleTextColor }
    : {}; // Default will be handled by CSS classes

  const avatarBgClass = personaTheme ? 'bg-muted' : 'bg-input text-foreground'; // Default or themed
  const avatarTextColor = personaTheme ? personaTheme.bubbleTextColor : 'text-foreground';


  return (
    <div className={cn('flex flex-col w-full my-2 items-start justify-start', personaTheme?.fontClassName)}>
      <p className="text-muted-foreground text-[13px] font-normal leading-normal ml-12 mb-0.5">{displayName}</p>
      <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', 'flex-row')}>
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start overflow-hidden",
          avatarBgClass 
        )}>
          {personaImageUrl ? (
            <Image src={personaImageUrl} alt={`${displayName} Typing`} width={40} height={40} className="object-cover" />
          ) : (
            <Bot className={cn("h-5 w-5", avatarTextColor)} />
          )}
        </div>
        <div
          className={cn(
            'px-4 py-3 shadow-md min-w-[60px] rounded-xl flex items-center space-x-2',
            !personaTheme && 'bg-input text-foreground' // Default class if no theme
          )}
          style={bubbleStyle}
        >
          <LayoutGrid className="h-4 w-4 text-muted-foreground animate-pulse" style={personaTheme ? {color: personaTheme.bubbleTextColor} : {}}/> 
          <p className="text-base font-normal leading-normal whitespace-pre-wrap break-words">
            {displayName} is thinking
          </p>
        </div>
      </div>
    </div>
  );
}
