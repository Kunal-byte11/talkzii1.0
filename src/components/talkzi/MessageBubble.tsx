
"use client";

import type { ChatMessage } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle } from 'lucide-react';
import React from 'react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void; 
}

const MessageBubbleComponent = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';
  const isCrisis = message.isCrisis;

  const AvatarComponent = isUser ? User : Bot;
  const avatarBgClass = isUser ? 'bg-primary/20' : 'bg-input';
  const avatarTextClass = isUser ? 'text-primary' : 'text-foreground';

  const bubbleColorClass = isUser
    ? 'bg-primary text-primary-foreground'
    : isCrisis
    ? 'bg-destructive/80 text-destructive-foreground'
    : 'bg-input text-foreground';
  
  const messageAlignment = isUser ? 'items-end justify-end' : 'items-start justify-start';
  const labelText = isUser ? "User" : isCrisis ? "System" : "AI";

  if (isSystem && !isCrisis) {
    return (
        <div className="flex flex-col w-full my-2 items-center">
            <div className={cn(
                'p-3 shadow-sm rounded-xl max-w-[80%] sm:max-w-[70%]',
                'bg-muted text-muted-foreground text-sm'
            )}>
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>
        </div>
    );
  }
  if (isCrisis) {
     return (
      <div className={cn('flex flex-col w-full my-2 items-start')}>
         <p className="text-muted-foreground text-[13px] font-normal leading-normal ml-12 mb-0.5">{labelText}</p>
        <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', 'flex-row')}>
          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start",
            "bg-destructive text-destructive-foreground" 
          )}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div
            className={cn(
              'p-3 shadow-md min-w-[60px] rounded-xl', 
              bubbleColorClass,
              'border border-destructive'
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col w-full my-2', messageAlignment)}>
       <p className={cn(
            "text-muted-foreground text-[13px] font-normal leading-normal max-w-[360px] mb-0.5",
            isUser ? 'mr-12 text-right' : 'ml-12 text-left'
        )}>
        {labelText}
      </p>
      <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start overflow-hidden", // Added overflow-hidden
          avatarBgClass // Keep background for fallback or if image fails
        )}>
          {isAI && message.personaImage ? (
            <Image src={message.personaImage} alt="AI Persona" width={40} height={40} className="object-cover" />
          ) : (
            <AvatarComponent className={cn("h-5 w-5", avatarTextClass)} />
          )}
        </div>
        <div
          className={cn(
            'px-4 py-3 shadow-md min-w-[60px] rounded-xl',
            bubbleColorClass
          )}
        >
          <p className="text-base font-normal leading-normal whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = 'MessageBubble';
