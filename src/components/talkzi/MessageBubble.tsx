
"use client";

import type { ChatMessage } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle } from 'lucide-react'; // Removed ThumbsUp, ThumbsDown
// import { format } from 'date-fns'; // Timestamp removed from design
import React from 'react';

interface MessageBubbleProps {
  message: ChatMessage;
  // onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void; // Feedback removed from design
}

const MessageBubbleComponent = ({ message }: MessageBubbleProps) => { // Removed onFeedback
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system'; // For crisis or other system messages
  const isCrisis = message.isCrisis;

  const AvatarComponent = isUser ? User : Bot;
  const avatarBgClass = isUser ? 'bg-primary/20' : 'bg-input';
  const avatarTextClass = isUser ? 'text-primary' : 'text-foreground';

  const bubbleColorClass = isUser
    ? 'bg-primary text-primary-foreground'
    : isCrisis
    ? 'bg-destructive/80 text-destructive-foreground' // Retain distinct crisis styling
    : 'bg-input text-foreground';
  
  const messageAlignment = isUser ? 'items-end justify-end' : 'items-start justify-start';
  const labelText = isUser ? "User" : isCrisis ? "System" : "AI"; // Use "AI" as generic label for AI persona

  // System messages (like crisis) might not need an avatar or the "AI" label
  if (isSystem && !isCrisis) { // Generic system message (e.g. "couldn't process")
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
  // Crisis messages styling
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
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start",
          avatarBgClass,
          avatarTextClass
        )}>
          <AvatarComponent className="h-5 w-5" />
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
      {/* Timestamp and feedback removed based on new design */}
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = 'MessageBubble';
