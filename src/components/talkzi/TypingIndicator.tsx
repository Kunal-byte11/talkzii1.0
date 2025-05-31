
import { Bot, LayoutGrid } from 'lucide-react'; // Changed to LayoutGrid
import { cn } from '@/lib/utils';

export function TypingIndicator() {
  return (
    <div className={cn('flex flex-col w-full my-2 items-start justify-start')}>
      <p className="text-muted-foreground text-[13px] font-normal leading-normal ml-12 mb-0.5">AI</p>
      <div className={cn('flex items-end gap-2 max-w-[80%] sm:max-w-[70%]', 'flex-row')}>
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0 self-start",
          'bg-input text-foreground' // Matches AI avatar style
        )}>
          <Bot className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'px-4 py-3 shadow-md min-w-[60px] rounded-xl flex items-center space-x-2',
            'bg-input text-foreground' // Matches AI bubble style
          )}
        >
          <LayoutGrid className="h-4 w-4 text-muted-foreground animate-pulse" /> 
          <p className="text-base font-normal leading-normal whitespace-pre-wrap break-words">
            AI is typing...
          </p>
        </div>
      </div>
    </div>
  );
}
