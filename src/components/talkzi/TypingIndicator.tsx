import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-end space-x-2 p-2 my-2 self-start max-w-[70%]">
       <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground shrink-0">
          <Bot className="h-5 w-5" />
        </div>
      <div className="bg-muted text-muted-foreground p-3 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-md">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
       <style jsx>{`
        .animate-bounce {
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .delay-0 { animation-delay: 0s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
