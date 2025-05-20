
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
import { MessageSquareText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

const getChatHistoryKey = (userId?: string) => userId ? `talkzi_chat_history_${userId}` : 'talkzi_chat_history_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzi_ai_friend_type_${userId}` : 'talkzi_ai_friend_type_guest';

async function saveMessageFeedbackToSupabase(feedbackData: {
  message_id: string;
  user_id: string;
  ai_response_text: string;
  user_prompt_text: string;
  feedback: 'liked' | 'disliked';
  ai_persona?: string;
}) {
  try {
    const { error } = await supabase.from('message_feedback').insert(feedbackData);
    if (error) {
      console.error("Error saving message feedback to Supabase:", error);
    }
  } catch (e) {
    console.error("Exception while saving message feedback:", e);
  }
}


export function ChatInterface() {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentAiFriendType, setCurrentAiFriendType] = useState<string | undefined>('default');
  const [isClientSide, setIsClientSide] = useState(false); // For client-side checks

  const [localStorageKeys, setLocalStorageKeys] = useState({
    chatHistory: getChatHistoryKey(user?.id),
    aiFriendType: getAIFriendTypeKey(user?.id),
  });

  useEffect(() => {
    setIsClientSide(true); // Component has mounted, safe to use client-side APIs
  }, []);

  useEffect(() => {
    // Update localStorage keys when user logs in or out
    setLocalStorageKeys({
      chatHistory: getChatHistoryKey(user?.id),
      aiFriendType: getAIFriendTypeKey(user?.id),
    });
  }, [user]);


  useEffect(() => {
    // Load data from localStorage
    if (isAuthLoading || !isClientSide) {
      // Wait for auth state to resolve and component to be client-side
      return;
    }

    // Load chat history
    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        setMessages([]); // Important: clear messages if nothing is stored for the current key
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage", error);
      setMessages([]);
    }

    // Load or set AI friend type
    if (!user) { // Guest user
      setCurrentAiFriendType('default');
      try {
        // Ensure guest persona is default, clear any specific persona that might have been set as guest
        localStorage.removeItem(getAIFriendTypeKey());
      } catch (e) { console.error("Error clearing guest AI friend type", e); }
    } else { // Logged-in user
      try {
        const storedFriendType = localStorage.getItem(localStorageKeys.aiFriendType);
        setCurrentAiFriendType(storedFriendType || 'default');
      } catch (error) {
        console.error("Error loading AI friend type from localStorage", error);
        setCurrentAiFriendType('default');
      }
    }
  }, [localStorageKeys, isAuthLoading, isClientSide, user]);

  // Save chat history to localStorage
  useEffect(() => {
    if (isAuthLoading || !isClientSide) {
      // Don't save if auth is loading or not yet client-side
      return;
    }
    // This effect runs when `messages` or `localStorageKeys.chatHistory` changes.
    // It's fine to save an empty array if messages become empty (e.g., user clears history if that feature existed).
    try {
      localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage", error);
    }
  }, [messages, localStorageKeys.chatHistory, isAuthLoading, isClientSide]);

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

  const addMessage = (text: string, sender: ChatMessage['sender'], options: Partial<ChatMessage> = {}) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      sender,
      timestamp: Date.now(),
      feedback: null,
      ...options,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage = addMessage(userInput, 'user');
    setIsAiLoading(true);

    try {
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', { isCrisis: true });
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      
      let activeUserGender: 'male' | 'female' | undefined = undefined;
      if (user && profile?.gender) {
        const userGender = profile.gender as 'male' | 'female' | undefined;
        if (userGender === 'male' || userGender === 'female') {
          activeUserGender = userGender;
        }
      }
      if (activeUserGender) {
        companionInput.userGender = activeUserGender;
      }
      
      let personaForAI: HinglishAICompanionInput['aiFriendType'] | 'default' = 'default';
      if (user) { // Only consider stored persona if user is logged in
        const storedPersona = localStorage.getItem(getAIFriendTypeKey(user.id));
        if (storedPersona && storedPersona !== 'default') {
          personaForAI = storedPersona as HinglishAICompanionInput['aiFriendType'];
        }
      }
      // For guests, personaForAI remains 'default' as setCurrentAiFriendType handles this

      if (personaForAI !== 'default') {
          const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'toxic_friend'];
          if (validPersonaTypes.includes(personaForAI as any)) {
             companionInput.aiFriendType = personaForAI as HinglishAICompanionInput['aiFriendType'];
          }
      }


      const aiResponse = await hinglishAICompanion(companionInput);
      if (aiResponse.response) {
        addMessage(aiResponse.response, 'ai', { userPromptText: userMessage.text });
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
  }, [user, profile, toast, currentAiFriendType]); // Added currentAiFriendType dependency

  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'liked' | 'disliked') => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to give feedback.", variant: "destructive" });
      return;
    }

    let userPromptForThisAi = "";
    let aiResponseText = "";
    let finalFeedback: 'liked' | 'disliked' | null = feedbackType;
    let personaForFeedback = currentAiFriendType || 'default';
     if (!user) { 
        personaForFeedback = 'default';
    }


    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.sender === 'ai') {
          userPromptForThisAi = msg.userPromptText || "";
          aiResponseText = msg.text;
          finalFeedback = msg.feedback === feedbackType ? null : feedbackType; // Toggle feedback
          return { ...msg, feedback: finalFeedback };
        }
        return msg;
      })
    );

    if (finalFeedback && userPromptForThisAi && aiResponseText) { // Only save if feedback is set (not null)
      await saveMessageFeedbackToSupabase({
        message_id: messageId,
        user_id: user.id,
        ai_response_text: aiResponseText,
        user_prompt_text: userPromptForThisAi,
        feedback: finalFeedback,
        ai_persona: personaForFeedback,
      });
    }
    // If finalFeedback is null (toggled off), we might want to send a 'delete' or 'nullify' to Supabase,
    // but current logic only saves if feedback is explicitly 'liked' or 'disliked'. This is fine for now.
  }, [user, toast, currentAiFriendType]);


  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };

  // Loading UI:
  if (isAuthLoading || !isClientSide) {
    return <div className="flex flex-col items-center justify-center h-full"><TypingIndicator /> <p className="ml-2 text-sm text-muted-foreground">Loading chat state...</p></div>;
  }
  
  const personaDisplayForGuest = "Default Talkzi";
  const personaDisplayForUser = currentAiFriendType?.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Default Talkzi';


  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4 pb-4">
          {messages.length === 0 && !isAiLoading && (
            <div className="text-center text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4 text-primary/70" />
              <p className="text-lg font-semibold">Start a conversation!</p>
              {!user && (
                <>
                  <p className="text-sm">You're chatting as a guest.</p>
                  <p className="text-sm">AI Persona: <span className="font-semibold capitalize text-primary">{personaDisplayForGuest}</span>.</p>
                </>
              )}
              {user && profile?.gender && (
                <p className="text-sm">Your gender is set to: <span className="font-semibold capitalize text-primary">{profile.gender}</span>.</p>
              )}
              {user && (
                <p className="text-sm">AI Persona: <span className="font-semibold capitalize text-primary">{personaDisplayForUser}</span>.</p>
              )}
              <p className="text-sm">Type your first message below.</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {isAiLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
      <ChatInputBar onSendMessage={handleSendMessage} isLoading={isAiLoading} />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}

