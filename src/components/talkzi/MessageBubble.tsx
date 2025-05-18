
import type { ChatMessage } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  // const isAi = message.sender === 'ai'; // No longer needed for feedback
  const isCrisis = message.isCrisis;

  const alignmentClass = isUser ? 'items-end' : 'items-start';
  const bubbleColorClass = isUser
    ? 'bg-primary text-primary-foreground'
    : isCrisis 
    ? 'bg-destructive/80 text-destructive-foreground' 
    : 'bg-muted text-muted-foreground';
  
  const borderRadiusClass = isUser 
    ? 'rounded-t-2xl rounded-bl-2xl' 
    : 'rounded-t-2xl rounded-br-2xl';

  const Icon = isUser ? User : isCrisis ? AlertTriangle : Bot;

  return (
    <div className={cn('flex flex-col w-full my-2', alignmentClass)}>
      <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {!isUser && (
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full shrink-0 self-start mt-1", // Align icon with top of bubble
            isCrisis ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div
          className={cn(
            'p-3 shadow-md',
            bubbleColorClass,
            borderRadiusClass,
            isCrisis ? 'border border-destructive' : ''
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>
      <div className={cn('flex items-center mt-1 space-x-2', isUser ? 'justify-end' : 'justify-start ml-10')}>
        <p className={cn('text-xs text-muted-foreground/70')}>
          {format(new Date(message.timestamp), 'p')}
        </p>
        {/* Feedback UI removed */}
      </div>
    </div>
  );
}
