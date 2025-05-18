
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '@/types/talkzi';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { SubscriptionModal } from './SubscriptionModal'; // Assuming this is still used for message limits
import { useChatCounter } from '@/hooks/useChatCounter'; // Assuming this is still used
import { detectCrisis } from '@/ai/flows/crisis-detection';
import { hinglishAICompanion, type HinglishAICompanionInput } from '@/ai/flows/hinglish-ai-companion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // For getting user ID

const CHAT_HISTORY_KEY_PREFIX = 'talkzi_chat_history_'; // For user-specific chat history
const AI_FRIEND_TYPE_KEY_PREFIX = 'talkzi_ai_friend_type_'; // For user-specific persona

export function ChatInterface() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { chatCount, incrementChatCount, isLimitReached, isLoading: isCounterLoading } = useChatCounter();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentAiFriendType, setCurrentAiFriendType] = useState<string | undefined>(undefined);

  const getChatHistoryStorageKey = useCallback(() => user ? `${CHAT_HISTORY_KEY_PREFIX}${user.id}` : null, [user]);
  const getPersonaStorageKey = useCallback(() => user ? `${AI_FRIEND_TYPE_KEY_PREFIX}${user.id}` : null, [user]);

  // Load chat history and AI friend type from localStorage based on user ID
  useEffect(() => {
    if (authLoading || !user) return; // Wait for auth to resolve and user to be available

    const chatHistoryKey = getChatHistoryStorageKey();
    const personaKey = getPersonaStorageKey();

    if (chatHistoryKey) {
      try {
        const storedHistory = localStorage.getItem(chatHistoryKey);
        if (storedHistory) {
          setMessages(JSON.parse(storedHistory));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading chat history from localStorage", error);
        setMessages([]);
      }
    }

    if (personaKey) {
      try {
        const storedFriendType = localStorage.getItem(personaKey);
        setCurrentAiFriendType(storedFriendType || undefined);
      } catch (error) {
        console.error("Error loading AI friend type from localStorage", error);
        setCurrentAiFriendType(undefined);
      }
    }
     // Initial load or user change: scroll to bottom if messages exist
     if (messages.length > 0 && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [user, authLoading, getChatHistoryStorageKey, getPersonaStorageKey]);

  // Save chat history to localStorage based on user ID
  useEffect(() => {
    if (authLoading || !user) return;
    
    const chatHistoryKey = getChatHistoryStorageKey();
    if (chatHistoryKey) {
       // Avoid saving empty initial array unless it's explicitly being cleared for a user
      if (messages.length === 0 && localStorage.getItem(chatHistoryKey) === null) return;
      try {
        localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history to localStorage", error);
      }
    }
  }, [messages, user, authLoading, getChatHistoryStorageKey]);

  // Scroll to bottom when new messages are added or AI starts loading
   useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isAiLoading]); // Trigger on messages change and AI loading state

  const addMessage = (text: string, sender: ChatMessage['sender'], isCrisisMsg: boolean = false) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      sender,
      timestamp: Date.now(),
      isCrisis: isCrisisMsg,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!user) { // Should not happen if page is protected, but good check
      toast({ title: "Error", description: "You must be logged in to chat.", variant: "destructive"});
      return;
    }
    if (isLimitReached && !isCounterLoading) {
      setShowSubscriptionModal(true);
      return;
    }

    addMessage(userInput, 'user');
    incrementChatCount();
    setIsAiLoading(true);

    try {
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', true);
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      const personaKey = getPersonaStorageKey();
      if (personaKey) {
        const storedFriendType = localStorage.getItem(personaKey);
        if (storedFriendType && storedFriendType !== 'default') {
          const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend'];
          if (validPersonaTypes.includes(storedFriendType as any)) {
             companionInput.aiFriendType = storedFriendType as HinglishAICompanionInput['aiFriendType'];
          } else {
            console.warn(`Invalid AI friend type stored: ${storedFriendType}. Falling back to default.`);
          }
        }
      }
      
      const aiResponse = await hinglishAICompanion(companionInput);
      if (aiResponse.response) {
        addMessage(aiResponse.response, 'ai');
      } else {
        addMessage("Sorry, I couldn't process that. Try again!", 'system');
      }
    } catch (error) {
      console.error('AI interaction error:', error);
      addMessage("Oops! Something went wrong. Please try again later.", 'system');
      toast({
        title: "Error",
        description: "Could not connect to the AI. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [user, isLimitReached, incrementChatCount, toast, isCounterLoading, getPersonaStorageKey]);

  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };
  
  if (authLoading || isCounterLoading) { 
    return <div className="flex items-center justify-center h-full"><TypingIndicator /> <p>Loading chat state...</p></div>;
  }
  if (!user && !authLoading){ // Explicitly handle case where user is definitely not logged in post-auth check
     return <div className="flex items-center justify-center h-full"><p>Please log in to access the chat.</p></div>;
  }


  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !isAiLoading && (
            <div className="text-center text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Start a conversation!</p>
              <p>Your current AI persona is: <span className="font-semibold capitalize text-primary">{currentAiFriendType?.replace(/_/g, ' ') || 'Default'}</span>.</p>
              <p>Type your first message below.</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isAiLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
      {isLimitReached && (
         <div className="p-3 border-t bg-amber-50 border-amber-200 text-amber-700 text-sm flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>You've reached your free message limit. </span>
            <button onClick={() => setShowSubscriptionModal(true)} className="font-semibold underline hover:text-amber-800">Upgrade to Premium</button>
            <span>.</span>
         </div>
      )}
      <ChatInputBar onSendMessage={handleSendMessage} isLoading={isAiLoading} />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
