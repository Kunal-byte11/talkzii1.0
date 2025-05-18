
import type { ChatMessage, FeedbackType } from '@/types/talkzi';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, feedback: FeedbackType) => void;
}

export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isAi = message.sender === 'ai';
  const isCrisis = message.isCrisis;

  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackType | null>(message.feedback || null);


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

  const handleFeedbackClick = (feedback: FeedbackType) => {
    if (onFeedback && feedbackGiven !== feedback) { // Only call if new feedback or changing feedback
      onFeedback(message.id, feedback);
      setFeedbackGiven(feedback);
    } else if (onFeedback && feedbackGiven === feedback) { // Clicking the same feedback again to remove it
       onFeedback(message.id, null); // or a specific "remove" type
       setFeedbackGiven(null);
    }
  };


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
        {isAi && onFeedback && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 p-0.5 text-muted-foreground/70 hover:text-green-500",
                feedbackGiven === 'liked' && "text-green-500 bg-green-500/10"
              )}
              onClick={() => handleFeedbackClick('liked')}
              title="Like response"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 p-0.5 text-muted-foreground/70 hover:text-red-500",
                feedbackGiven === 'disliked' && "text-red-500 bg-red-500/10"
              )}
              onClick={() => handleFeedbackClick('disliked')}
              title="Dislike response"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
