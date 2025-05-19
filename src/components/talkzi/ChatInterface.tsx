
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, UserProfile } from '@/types/talkzi';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { SubscriptionModal } from './SubscriptionModal';
// import { useChatCounter } from '@/hooks/useChatCounter'; // Temporarily disabled for free use
import { detectCrisis } from '@/ai/flows/crisis-detection';
import { hinglishAICompanion, type HinglishAICompanionInput } from '@/ai/flows/hinglish-ai-companion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const getChatHistoryKey = (userId?: string) => userId ? `talkzi_chat_history_${userId}` : 'talkzi_chat_history_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzi_ai_friend_type_${userId}` : 'talkzi_ai_friend_type_guest';

export function ChatInterface() {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  // const { chatCount, incrementChatCount, isLimitReached, isLoading: isCounterLoading } = useChatCounter(); // Temporarily disabled
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
      setLocalStorageKeys({
        chatHistory: getChatHistoryKey(),
        aiFriendType: getAIFriendTypeKey(),
      });
    }
  }, [user, isAuthLoading]);


  useEffect(() => {
    // Only load from localStorage if keys are set (i.e., auth state is determined)
    if (localStorageKeys.chatHistory === getChatHistoryKey() && localStorageKeys.aiFriendType === getAIFriendTypeKey() && !user && !isAuthLoading) {
      // Guest user, keys are generic
    } else if (!localStorageKeys.chatHistory.endsWith('_guest') && !user && isAuthLoading) {
      // Still loading auth, and keys aren't guest keys yet, so wait.
      return;
    }


    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        setMessages([]);
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
  }, [localStorageKeys, user, isAuthLoading]); // Added user and isAuthLoading

  useEffect(() => {
    if (localStorageKeys.chatHistory === getChatHistoryKey() && !user && !isAuthLoading) {
       // Guest user, allow saving
    } else if (!localStorageKeys.chatHistory.endsWith('_guest') && !user && isAuthLoading) {
      // Still loading auth for a potential user, don't save yet if keys are not generic
      return;
    }
    if (messages.length === 0 && !localStorage.getItem(localStorageKeys.chatHistory)) return; // Don't save empty if nothing was loaded
    
    try {
      localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage", error);
    }
  }, [messages, localStorageKeys.chatHistory, user, isAuthLoading]); // Added user and isAuthLoading

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
    if (!user && !isAuthLoading) {
      toast({ title: "Login Required", description: "Please log in to chat.", variant: "destructive"});
      // Optionally, you could allow guest chatting here if desired, but current flow requires login
      return;
    }
    
    // Temporarily bypass limit check for early app stage
    // if (isLimitReached && !isCounterLoading && user) { 
    //   setShowSubscriptionModal(true);
    //   return;
    // }

    addMessage(userInput, 'user');
    // if (user) incrementChatCount(); // Still count messages if counter is re-enabled
    setIsAiLoading(true);

    try {
      // The crisis-detection flow is now very passive and unlikely to return isCrisis: true.
      // The primary crisis handling is built into hinglishAICompanion prompt.
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', true); 
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      
      // Pass user gender if available
      const userGender = profile?.gender as 'male' | 'female' | undefined;
      if (userGender === 'male' || userGender === 'female') {
        companionInput.userGender = userGender;
      }

      try {
        const storedFriendType = localStorage.getItem(localStorageKeys.aiFriendType);
        if (storedFriendType && storedFriendType !== 'default') {
          const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'toxic_friend']; // Updated
          if (validPersonaTypes.includes(storedFriendType as any)) {
             companionInput.aiFriendType = storedFriendType as HinglishAICompanionInput['aiFriendType'];
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
  }, [user, profile, isAuthLoading, toast, localStorageKeys.aiFriendType]); // Removed isLimitReached, isCounterLoading, incrementChatCount for now

  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };
  
  // Show loading if auth is loading OR if keys are not yet synced with auth state
  const stillInitializing = isAuthLoading || (user && localStorageKeys.chatHistory.endsWith('_guest'));
  // const counterStillLoading = user ? isCounterLoading : false; // Only consider counter loading if user exists

  if (stillInitializing /*|| counterStillLoading*/) { 
    return <div className="flex flex-col items-center justify-center h-full"><TypingIndicator /> <p className="ml-2 text-sm text-muted-foreground">Loading chat state...</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !isAiLoading && (
            <div className="text-center text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Start a conversation!</p>
              {user && profile?.gender && (
                <p>Your gender is set to: <span className="font-semibold capitalize text-primary">{profile.gender}</span>.</p>
              )}
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
      {/* 
      // Temporarily remove the "limit reached" UI for early app stage
      {isLimitReached && user && (
         <div className="p-3 border-t bg-amber-50 border-amber-200 text-amber-700 text-sm flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>You've reached your free message limit. </span>
            <button onClick={() => setShowSubscriptionModal(true)} className="font-semibold underline hover:text-amber-800">Upgrade to Premium</button>
            <span>.</span>
         </div>
      )} 
      */}
      <ChatInputBar onSendMessage={handleSendMessage} isLoading={isAiLoading} />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
