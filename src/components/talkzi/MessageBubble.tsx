
"use client";

import type { ChatMessage } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void;
}

const MessageBubbleComponent = ({ message, onFeedback }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isAI = message.sender === 'ai';
  const isCrisis = message.isCrisis;

  const alignmentClass = isUser ? 'items-end' : 'items-start';
  const bubbleColorClass = isUser
    ? 'bg-primary text-primary-foreground'
    : isCrisis
    ? 'bg-destructive/80 text-destructive-foreground'
    : 'bg-muted text-muted-foreground';

  const borderRadiusClass = isUser
    ? 'rounded-t-xl rounded-bl-xl' // Adjusted for a slightly more modern feel
    : 'rounded-t-xl rounded-br-xl';

  const Icon = isUser ? User : isCrisis ? AlertTriangle : Bot;

  const handleFeedbackClick = (feedbackType: 'liked' | 'disliked') => {
    if (onFeedback && isAI) {
      onFeedback(message.id, feedbackType);
    }
  };

  return (
    <div className={cn('flex flex-col w-full my-2', alignmentClass)}>
      <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {!isUser && (
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full shrink-0 self-start mt-1 shadow-sm",
            isCrisis ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div
          className={cn(
            'p-3 shadow-md min-w-[60px]', // Added min-w for very short messages
            bubbleColorClass,
            borderRadiusClass,
            isCrisis ? 'border border-destructive' : ''
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>
      <div className={cn('flex items-center mt-1.5 space-x-2 text-xs text-muted-foreground/80', isUser ? 'justify-end pr-1' : 'justify-start ml-10')}>
        <p>
          {format(new Date(message.timestamp), 'p')}
        </p>
        {isAI && onFeedback && (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleFeedbackClick('liked')}
              title="Like response"
              className={cn(
                "p-0.5 rounded-full hover:bg-primary/20 transition-colors",
                message.feedback === 'liked' ? 'text-primary' : 'text-muted-foreground/70 hover:text-primary'
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" strokeWidth={message.feedback === 'liked' ? 2.5 : 2} />
            </button>
            <button
              onClick={() => handleFeedbackClick('disliked')}
              title="Dislike response"
              className={cn(
                "p-0.5 rounded-full hover:bg-destructive/20 transition-colors",
                message.feedback === 'disliked' ? 'text-destructive' : 'text-muted-foreground/70 hover:text-destructive'
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" strokeWidth={message.feedback === 'disliked' ? 2.5 : 2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
MessageBubble.displayName = 'MessageBubble';
