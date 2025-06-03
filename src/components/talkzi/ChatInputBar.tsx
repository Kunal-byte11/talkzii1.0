
"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  sendButtonAccentColor?: string;
  onFocus?: () => void; // Prop to notify parent about focus
}

export function ChatInputBar({ onSendMessage, isLoading, sendButtonAccentColor, onFocus }: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false); // For IME input
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form element

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Corresponds to max-h-[120px]
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Handle mobile viewport adjustments and re-focus on visibility change
  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === textareaRef.current && window.innerWidth < 768) {
        // Attempt to keep input visible when keyboard appears/resizes
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    };
    const handleVisibilityChange = () => {
      // Re-focus on textarea if it was active when tab visibility changes (e.g., mobile Safari)
      if (document.visibilityState === 'visible' && document.activeElement === textareaRef.current) {
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (inputValue.trim() && !isLoading && !isComposing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // Attempt to re-focus after sending, slight delay
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return; // Don't submit while composing

    if (event.key === 'Enter') {
      if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
        // Simple Enter
        if (window.innerWidth >= 768) { // Desktop: submit
          event.preventDefault();
          handleSubmit();
        }
        // Mobile: simple Enter creates a new line (default textarea behavior)
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + Enter: always submit
        event.preventDefault();
        handleSubmit();
      }
    } else if (event.key === 'Escape' && inputValue) {
      event.preventDefault();
      setInputValue('');
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
    // Mobile-specific scroll into view on focus, slight delay for keyboard
    if (window.innerWidth < 768) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  };

  const sendButtonStyle = sendButtonAccentColor 
    ? { backgroundColor: sendButtonAccentColor, color: 'hsl(var(--primary-foreground))' }
    : {};
  
  const canSend = inputValue.trim() && !isComposing;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10 p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm"
    >
      <div className="flex items-end w-full bg-input rounded-xl min-h-[48px] px-3 py-2 gap-2 transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/50">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={
            isClientRendered && window.innerWidth >= 768 
            ? "Type a message (Enter to send, Shift+Enter for new line)" 
            : "Type a message..."
          }
          className={cn(
            "flex-grow resize-none bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[28px] max-h-[120px] text-base py-1.5 px-0 text-foreground placeholder:text-muted-foreground self-center overflow-y-auto",
            "scrollbar-thin" // Apply custom scrollbar style
          )}
          rows={1}
          disabled={isLoading}
          onKeyDown={handleKeyDown}
          style={{ lineHeight: '1.6' }} // Ensure enough line height for readability
        />
        
        <Button 
          type="submit" 
          size="sm" // Slightly smaller button
          disabled={!canSend || isLoading} 
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
      
      {isClientRendered && window.innerWidth < 768 && !isLoading && (
        <div className="text-[11px] text-muted-foreground/80 text-center mt-1.5 px-1">
          Press Enter for new line • Ctrl+Enter to send
        </div>
      )}

      {/* Custom scrollbar styling for WebKit browsers */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: hsl(var(--border) / 0.5);
          border-radius: 10px;
          border: 1px solid transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--border));
        }
        @media (max-width: 767px) {
            .scrollbar-thin::-webkit-scrollbar {
                display: none; /* Hide scrollbar on mobile for cleaner look */
            }
            .scrollbar-thin {
                scrollbar-width: none; /* For Firefox */
                -ms-overflow-style: none; /* For IE and Edge */
            }
        }
      `}</style>
    </form>
  );
}

// Helper to avoid SSR/hydration issues with window.innerWidth
let isClientRendered = false;
if (typeof window !== 'undefined') {
  isClientRendered = true;
}

