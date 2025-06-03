
"use client";

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10 p-3 md:p-4 border-t bg-background" // Adjusted padding, removed backdrop
    >
      <div className="flex items-center w-full bg-input rounded-xl h-12 px-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message"
          className={cn(
            "flex-grow resize-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[120px] text-base py-2.5 px-2 text-foreground placeholder:text-muted-foreground self-center h-full",
            "no-scrollbar" // Utility class to hide scrollbar if needed (add to globals.css if used)
          )}
          rows={1}
          disabled={isLoading}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-1 pr-1">
          {/* <Button variant="ghost" size="icon" type="button" className="shrink-0 text-muted-foreground hover:text-primary h-9 w-9">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Emoji</span>
          </Button> */}
          <Button 
            type="submit" 
            size="default" 
            disabled={isLoading || !inputValue.trim()} 
            className="bg-primary text-primary-foreground rounded-full h-8 px-4 text-sm font-medium shrink-0 min-w-[auto] @[480px]:min-w-[84px]"
          >
            <SendHorizonal className="h-4 w-4 @[480px]:mr-2" />
            <span className="hidden @[480px]:inline">Send</span>
          </Button>
        </div>
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </form>
  );
}
