"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Smile } from 'lucide-react'; // Changed to SendHorizonal
import { Textarea } from '@/components/ui/textarea';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10 p-2 md:p-4 border-t bg-background/80 backdrop-blur-md"
    >
      <div className="flex items-end space-x-2">
        <Button variant="ghost" size="icon" type="button" className="shrink-0 hidden sm:inline-flex">
          <Smile className="h-6 w-6 text-muted-foreground" />
          <span className="sr-only">Emoji</span>
        </Button>
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message... (Ctrl+Enter to send)"
          className="flex-grow resize-none border-input focus-visible:ring-1 focus-visible:ring-ring min-h-[40px] max-h-[120px] text-base py-2 px-3"
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="gradient-button shrink-0 h-10 w-10 md:h-auto md:w-auto md:px-4">
          <SendHorizonal className="h-5 w-5 md:mr-0 lg:mr-2" />
          <span className="hidden lg:inline">Send</span>
        </Button>
      </div>
    </form>
  );
}
