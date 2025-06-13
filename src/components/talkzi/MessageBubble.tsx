"use client";

import type { ChatMessage } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, Volume2 } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import { personaOptions } from '@/lib/personaOptions';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedbackType: 'liked' | 'disliked') => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

const MessageBubbleComponent = ({ message, onFeedback, onSpeak, isSpeaking }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';
  const isCrisis = message.isCrisis;

  const AvatarComponent = isUser ? User : Bot;
  
  // Default avatar styles
  let avatarBgClass = isUser ? 'bg-primary/20' : 'bg-input';
  let avatarTextClass = isUser ? 'text-primary' : 'text-foreground';

  // Default bubble styles
  let bubbleColorClass = isUser
    ? 'bg-primary text-primary-foreground'
    : 'bg-input text-foreground';
  
  let bubbleStyle = {};

  if (isAI) {
    if (message.aiBubbleColor && message.aiTextColor) {
      bubbleStyle = { backgroundColor: message.aiBubbleColor, color: message.aiTextColor };
      // Avatar background for AI can be a lighter shade of its bubble or a neutral
      avatarBgClass = 'bg-muted'; // Or derive from aiBubbleColor
      avatarTextClass = message.aiTextColor; // Or a fixed contrast color
    }
  } else if (isCrisis) {
    bubbleColorClass = 'bg-destructive/80 text-destructive-foreground';
    avatarBgClass = 'bg-destructive text-destructive-foreground';
  }
  
  const messageAlignment = isUser ? 'items-end justify-end' : 'items-start justify-start';
  const labelText = isUser ? "You" : isCrisis ? "System Alert" : (personaOptions.find(p=>p.imageUrl === message.personaImage)?.label || "AI");


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
            avatarBgClass 
          )}>
            <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
          </div>
          <div
            className={cn(
              'p-3 shadow-md min-w-[60px] rounded-xl', 
              bubbleColorClass,
              'border border-destructive'
            )}
            style={bubbleStyle}
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
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start overflow-hidden",
          avatarBgClass
        )}>
          {isAI && message.personaImage ? (
            <Image src={message.personaImage} alt="AI Persona" width={40} height={40} className="object-cover" />
          ) : (
            <AvatarComponent className={cn("h-5 w-5", avatarTextClass)} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'px-4 py-3 shadow-md min-w-[60px] rounded-xl',
              isAI ? '' : bubbleColorClass
            )}
            style={isAI ? bubbleStyle : {}}
          >
            <p className="text-base font-normal leading-normal whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          {isAI && onSpeak && (
            <button
              onClick={onSpeak}
              disabled={isSpeaking}
              className={cn(
                'self-start px-2 py-1 text-xs rounded-full transition-colors',
                'bg-muted hover:bg-muted/80 text-muted-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-1'
              )}
            >
              <Volume2 size={14} />
              {isSpeaking ? 'Speaking...' : 'Speak'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = 'MessageBubble';
