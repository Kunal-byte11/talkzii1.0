"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Add type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  sendButtonAccentColor?: string;
  onFocus?: () => void; // Prop to notify parent about focus
  disabled?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading, sendButtonAccentColor, onFocus, disabled }: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleMicClick = () => {
    router.push('/audiovisualizer');
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (inputValue.trim() && !isLoading && !isComposing && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    if (event.key === 'Enter') {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handleSubmit();
      }
    } else if (event.key === 'Escape' && inputValue) {
      event.preventDefault();
      setInputValue('');
    }
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
    if (window.innerWidth < 768) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  };

  const sendButtonStyle = sendButtonAccentColor
    ? { backgroundColor: sendButtonAccentColor, color: 'hsl(var(--primary-foreground))' }
    : {};

  const canSend = inputValue.trim() && !isComposing && !disabled;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10 p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm"
    >
      <div className="flex items-end w-full bg-input rounded-xl min-h-[48px] px-3 py-2 gap-2 transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/50">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleMicClick}
          disabled={isLoading || disabled}
          className={cn(
            "h-9 w-9 p-0 rounded-lg"
          )}
          aria-label="Start voice input"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={
            window.innerWidth >= 768
            ? "Type your message. Press Enter for new line, Ctrl+Enter to send."
            : "Type a message..."
          }
          className={cn(
            "flex-grow resize-none bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[28px] max-h-[120px] text-base py-1.5 px-0 text-foreground placeholder:text-muted-foreground self-center overflow-y-auto",
            "scrollbar-thin"
          )}
          rows={1}
          disabled={isLoading || disabled}
          onKeyDown={handleKeyDown}
          style={{ lineHeight: '1.6' }}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!canSend || isLoading || disabled}
          className={cn(
            "text-primary-foreground rounded-lg h-9 min-w-9 px-3 text-sm font-medium shrink-0 transition-all duration-150 ease-in-out",
            !sendButtonAccentColor && "bg-primary hover:bg-primary/90",
            (canSend && !isLoading) ? "opacity-100 scale-100" : "opacity-60 scale-95 cursor-not-allowed",
            "shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          style={sendButtonStyle}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <SendHorizonal className="h-4 w-4 @[480px]:mr-1.5" />
              <span className="hidden @[480px]:inline text-xs">Send</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Helper to avoid SSR/hydration issues with window.innerWidth
let isClientRendered = false;
if (typeof window !== 'undefined') {
  isClientRendered = true;
}
