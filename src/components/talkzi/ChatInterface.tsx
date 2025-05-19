
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
import { supabase } from '@/lib/supabase/client'; // Import Supabase client

const getChatHistoryKey = (userId?: string) => userId ? `talkzi_chat_history_${userId}` : 'talkzi_chat_history_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzi_ai_friend_type_${userId}` : 'talkzi_ai_friend_type_guest';

// Function to save feedback to Supabase (we'll define its content later)
async function saveMessageFeedbackToSupabase(feedbackData: {
  message_id: string;
  user_id: string;
  ai_response_text: string;
  user_prompt_text: string;
  feedback: 'liked' | 'disliked';
  ai_persona?: string;
}) {
  // console.log("Attempting to save feedback to Supabase:", feedbackData);
  try {
    const { error } = await supabase.from('message_feedback').insert(feedbackData);
    if (error) {
      console.error("Error saving message feedback to Supabase:", error);
      // Optionally, inform the user via toast if saving fails, though this might be too noisy.
      // For now, primarily log it.
    } else {
      // console.log("Feedback saved to Supabase successfully.");
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
        chatHistory: getChatHistoryKey(), // Generic key for guest/logged out
        aiFriendType: getAIFriendTypeKey(), // Generic key for guest/logged out
      });
    }
  }, [user, isAuthLoading]);


  useEffect(() => {
    if (localStorageKeys.chatHistory === getChatHistoryKey() && !user && !isAuthLoading) {
      // Guest user state, keys are generic - proceed to load
    } else if (localStorageKeys.chatHistory.endsWith('_guest') && user && !isAuthLoading) {
      // User just logged in, keys might still be guest ones - they will update in the next effect cycle.
      // Or, the keys have just updated from guest to user-specific.
      // In this case, we should load from the new user-specific keys.
    } else if (!localStorageKeys.chatHistory.endsWith('_guest') && !user && isAuthLoading) {
      // Still loading auth for a potential user, and keys aren't guest keys yet, so wait.
      return;
    }


    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        setMessages([]); // No history or initial load
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage", error);
      setMessages([]);
    }

    try {
      const storedFriendType = localStorage.getItem(localStorageKeys.aiFriendType);
      setCurrentAiFriendType(storedFriendType || 'default'); // Default to 'default' if nothing is stored
    } catch (error) {
      console.error("Error loading AI friend type from localStorage", error);
      setCurrentAiFriendType('default');
    }
  }, [localStorageKeys, user, isAuthLoading]);

  useEffect(() => {
    // Save messages to localStorage whenever they change, if keys are ready
    if (localStorageKeys.chatHistory === getChatHistoryKey() && !user && !isAuthLoading) {
      // Guest user state, keys are generic - allow saving
    } else if (!localStorageKeys.chatHistory.endsWith('_guest') && !user && isAuthLoading) {
      // Still loading auth for a potential user, don't save yet if keys are not generic
      return;
    }
     if (messages.length === 0 && !localStorage.getItem(localStorageKeys.chatHistory)) {
      // Don't save an empty array if there was no pre-existing history.
      // This prevents overwriting a logged-in user's history with an empty array
      // if they log out and then log back in before any new messages are sent as guest.
      return;
    }

    try {
      localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage", error);
    }
  }, [messages, localStorageKeys.chatHistory, user, isAuthLoading]);

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
    return newMessage; // Return the new message object, useful for getting its ID
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!user && !isAuthLoading) { // Ensure auth state is resolved before blocking
      toast({ title: "Login Required", description: "Please log in to chat.", variant: "destructive"});
      return;
    }
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
      const userGender = profile?.gender as 'male' | 'female' | undefined;
      if (userGender === 'male' || userGender === 'female') {
        companionInput.userGender = userGender;
      }

      const personaToUse = localStorage.getItem(localStorageKeys.aiFriendType) || 'default';
      if (personaToUse && personaToUse !== 'default') {
        const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'toxic_friend'];
        if (validPersonaTypes.includes(personaToUse as any)) {
           companionInput.aiFriendType = personaToUse as HinglishAICompanionInput['aiFriendType'];
        }
      }
      setCurrentAiFriendType(personaToUse); // Update current persona for display

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
  }, [user, profile, isAuthLoading, toast, localStorageKeys.aiFriendType, messages]); // Added messages to deps for userPromptText

  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'liked' | 'disliked') => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to give feedback.", variant: "destructive" });
      return;
    }

    let userPromptForThisAi = "";
    let aiResponseText = "";
    let finalFeedback: 'liked' | 'disliked' | null = feedbackType;

    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.sender === 'ai') {
          userPromptForThisAi = msg.userPromptText || "";
          aiResponseText = msg.text;
          // Toggle feedback: if same feedback clicked again, remove it. Otherwise, set new feedback.
          finalFeedback = msg.feedback === feedbackType ? null : feedbackType;
          return { ...msg, feedback: finalFeedback };
        }
        return msg;
      })
    );

    if (finalFeedback && userPromptForThisAi && aiResponseText) { // Only save if feedback is being set (not cleared)
      await saveMessageFeedbackToSupabase({
        message_id: messageId,
        user_id: user.id,
        ai_response_text: aiResponseText,
        user_prompt_text: userPromptForThisAi,
        feedback: finalFeedback,
        ai_persona: currentAiFriendType || 'default',
      });
    }
    // If feedback is cleared (finalFeedback is null), we might want to delete the record from Supabase,
    // or just update it. For simplicity now, it only saves when feedback is actively set.
  }, [user, toast, currentAiFriendType]);


  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };

  const stillInitializing = isAuthLoading || (user && localStorageKeys.chatHistory.endsWith('_guest')) || (!user && localStorageKeys.chatHistory.endsWith('_guest') && messages.length === 0 && !localStorage.getItem(localStorageKeys.chatHistory));


  if (stillInitializing) {
    return <div className="flex flex-col items-center justify-center h-full"><TypingIndicator /> <p className="ml-2 text-sm text-muted-foreground">Loading chat state...</p></div>;
  }

  const personaDisplay = currentAiFriendType?.replace(/_/g, ' ') || 'Default';

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4 pb-4">
          {messages.length === 0 && !isAiLoading && (
            <div className="text-center text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4 text-primary/70" />
              <p className="text-lg font-semibold">Start a conversation!</p>
              {user && profile?.gender && (
                <p className="text-sm">Your gender is set to: <span className="font-semibold capitalize text-primary">{profile.gender}</span>.</p>
              )}
              <p className="text-sm">AI Persona: <span className="font-semibold capitalize text-primary">{personaDisplay}</span>.</p>
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
