
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '@/types/talkzi';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { SubscriptionModal } from './SubscriptionModal';
import { useChatCounter } from '@/hooks/useChatCounter'; // Stays generic for now
import { detectCrisis } from '@/ai/flows/crisis-detection';
import { hinglishAICompanion, type HinglishAICompanionInput } from '@/ai/flows/hinglish-ai-companion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Keys will be user-specific if user is logged in
const getChatHistoryKey = (userId?: string) => userId ? `talkzi_chat_history_${userId}` : 'talkzi_chat_history_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzi_ai_friend_type_${userId}` : 'talkzi_ai_friend_type_guest';

export function ChatInterface() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { chatCount, incrementChatCount, isLimitReached, isLoading: isCounterLoading } = useChatCounter();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentAiFriendType, setCurrentAiFriendType] = useState<string | undefined>(undefined);
  const [localStorageKeys, setLocalStorageKeys] = useState({
    chatHistory: getChatHistoryKey(),
    aiFriendType: getAIFriendTypeKey(),
  });

  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      setLocalStorageKeys({
        chatHistory: getChatHistoryKey(user.id),
        aiFriendType: getAIFriendTypeKey(user.id),
      });
    } else if (!isAuthLoading && !user) {
      // Use guest keys if not logged in
      setLocalStorageKeys({
        chatHistory: getChatHistoryKey(),
        aiFriendType: getAIFriendTypeKey(),
      });
    }
  }, [user, isAuthLoading]);


  // Load chat history and AI friend type from localStorage
  useEffect(() => {
    // Only run if keys are set (i.e., after user auth state is determined)
    if (localStorageKeys.chatHistory === 'talkzi_chat_history_guest' && !user) { // default keys before auth check
        // Potentially wait or ensure keys are user specific before loading if user exists
    }

    // Do not load if keys are still default and auth is loading
    if (isAuthLoading && localStorageKeys.chatHistory.endsWith('_guest')) return;


    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        setMessages([]); // Initialize with empty messages if no history
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage", error);
      setMessages([]);
    }

    try {
      const storedFriendType = localStorage.getItem(localStorageKeys.aiFriendType);
      setCurrentAiFriendType(storedFriendType || undefined);
    } catch (error) {
      console.error("Error loading AI friend type from localStorage", error);
      setCurrentAiFriendType(undefined);
    }
  }, [localStorageKeys, isAuthLoading]); // Rerun when keys change or auth loading finishes

  // Save chat history to localStorage
  useEffect(() => {
    // Only save if user context is established (keys are not guest or auth is not loading)
    if (isAuthLoading && localStorageKeys.chatHistory.endsWith('_guest')) return;

    // Avoid saving empty array on initial load if there was nothing in localStorage
    if (messages.length === 0 && localStorage.getItem(localStorageKeys.chatHistory) === null) return;
    
    try {
      localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage", error);
    }
  }, [messages, localStorageKeys.chatHistory, isAuthLoading]);

  // Scroll to bottom when new messages are added or AI starts loading
   useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages, isAiLoading]);

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
    if (!user && !isAuthLoading) { // Check if user is not logged in and auth has been checked
      toast({ title: "Login Required", description: "Please log in to chat.", variant: "destructive"});
      // Optionally redirect to login: router.push('/auth');
      return;
    }
    
    if (isLimitReached && !isCounterLoading) {
      setShowSubscriptionModal(true);
      return;
    }

    addMessage(userInput, 'user');
    if (user) incrementChatCount(); // Only increment if logged in, or adjust logic for guest counts
    setIsAiLoading(true);

    try {
      // Crisis detection can remain generic
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', true);
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      try {
        // Use the stateful localStorageKeys.aiFriendType which is user-specific
        const storedFriendType = localStorage.getItem(localStorageKeys.aiFriendType);
        if (storedFriendType && storedFriendType !== 'default') {
          const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend'];
          if (validPersonaTypes.includes(storedFriendType as any)) {
             companionInput.aiFriendType = storedFriendType as HinglishAICompanionInput['aiFriendType'];
          } else {
            console.warn(`Invalid AI friend type stored: ${storedFriendType}. Falling back to default.`);
          }
        }
      } catch (error) {
         console.error("Error reading AI friend type from localStorage for sending message", error);
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
  }, [user, isAuthLoading, isLimitReached, incrementChatCount, toast, isCounterLoading, localStorageKeys.aiFriendType]);

  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };
  
  if (isAuthLoading || isCounterLoading) { 
    return <div className="flex items-center justify-center h-full"><TypingIndicator /> <p>Loading chat state...</p></div>;
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
