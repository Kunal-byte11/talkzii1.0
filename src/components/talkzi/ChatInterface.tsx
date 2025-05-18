
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, FeedbackType } from '@/types/talkzi';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { SubscriptionModal } from './SubscriptionModal';
import { useChatCounter } from '@/hooks/useChatCounter';
import { detectCrisis } from '@/ai/flows/crisis-detection';
import { hinglishAICompanion, type HinglishAICompanionInput } from '@/ai/flows/hinglish-ai-companion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { saveMessageFeedback, logChatMessageForTraining } from '@/lib/firebase/firestore'; // Import Firestore function

const CHAT_HISTORY_KEY_PREFIX = 'talkzi_chat_history_'; // Prefix for user-specific history
const AI_FRIEND_TYPE_KEY_PREFIX = 'talkzi_ai_friend_type_';

export function ChatInterface() {
  const { user, isLoading: authIsLoading } = useAuth(); // Get user from auth
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { chatCount, incrementChatCount, isLimitReached, isLoading: isCounterLoading } = useChatCounter();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentAiFriendType, setCurrentAiFriendType] = useState<string | undefined>(undefined);

  const getChatHistoryKey = useCallback(() => user ? `${CHAT_HISTORY_KEY_PREFIX}${user.uid}` : null, [user]);
  const getAiFriendTypeKey = useCallback(() => user ? `${AI_FRIEND_TYPE_KEY_PREFIX}${user.uid}` : null, [user]);


  // Load chat history and AI friend type from localStorage, now user-specific
  useEffect(() => {
    if (authIsLoading || !user) return; // Wait for auth and user

    const chatHistoryKey = getChatHistoryKey();
    const aiFriendTypeKey = getAiFriendTypeKey();

    if (chatHistoryKey) {
      try {
        const storedHistory = localStorage.getItem(chatHistoryKey);
        if (storedHistory) {
          setMessages(JSON.parse(storedHistory));
        } else {
          setMessages([]); // Initialize with empty if no history for this user
        }
      } catch (error) {
        console.error("Error loading chat history from localStorage", error);
        setMessages([]);
      }
    }

    if (aiFriendTypeKey) {
      try {
        const storedFriendType = localStorage.getItem(aiFriendTypeKey);
        setCurrentAiFriendType(storedFriendType || undefined);
      } catch (error) {
        console.error("Error loading AI friend type from localStorage", error);
        setCurrentAiFriendType(undefined);
      }
    }
  }, [user, authIsLoading, getChatHistoryKey, getAiFriendTypeKey]);

  // Save chat history to localStorage, now user-specific
  useEffect(() => {
    if (!user || messages.length === 0) return; // Don't save if no user or no messages
    const chatHistoryKey = getChatHistoryKey();
    if (chatHistoryKey) {
      try {
        localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history to localStorage", error);
      }
    }
  }, [messages, user, getChatHistoryKey]);


  // Scroll to bottom when new messages are added
   useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isAiLoading]);

  const addMessage = (text: string, sender: ChatMessage['sender'], isCrisisMsg: boolean = false, originalUserPrompt?: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // More unique ID
      text,
      sender,
      timestamp: Date.now(),
      isCrisis: isCrisisMsg,
      feedback: null, // Initialize feedback as null
    };
    if (sender === 'ai' && originalUserPrompt) {
      newMessage.originalUserPromptForAiResponse = originalUserPrompt;
    }
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to chat.", variant: "destructive" });
      return;
    }
    if (isLimitReached && !isCounterLoading) {
      setShowSubscriptionModal(true);
      return;
    }

    addMessage(userInput, 'user');
    incrementChatCount(); // This should ideally be tied to AI responses, not just user messages.
    setIsAiLoading(true);

    let aiResponseMessage = "Sorry, I couldn't process that. Try again!"; // Default AI response

    try {
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', true);
        aiResponseMessage = crisisResponse.response; // For logging
        // logChatMessageForTraining(user.uid, userInput, aiResponseMessage); // Log crisis response
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      const friendTypeKey = getAiFriendTypeKey();
      const storedFriendType = friendTypeKey ? localStorage.getItem(friendTypeKey) : null;

      if (storedFriendType && storedFriendType !== 'default') {
        const validPersonaTypes: HinglishAICompanionInput['aiFriendType'][] = ['female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend'];
        if (validPersonaTypes.includes(storedFriendType as any)) {
           companionInput.aiFriendType = storedFriendType as HinglishAICompanionInput['aiFriendType'];
        } else {
          console.warn(`Invalid AI friend type stored: ${storedFriendType}. Falling back to default.`);
        }
      }
      
      const aiResponse = await hinglishAICompanion(companionInput);
      if (aiResponse.response) {
        addMessage(aiResponse.response, 'ai', false, userInput);
        aiResponseMessage = aiResponse.response;
      } else {
        addMessage("Sorry, I couldn't process that. Try again!", 'system');
      }
      // Log successful interaction (optional, implement with care for privacy)
      // await logChatMessageForTraining(user.uid, userInput, aiResponseMessage);

    } catch (error) {
      console.error('AI interaction error:', error);
      addMessage("Oops! Something went wrong. Please try again later.", 'system');
      aiResponseMessage = "Oops! Something went wrong."; // For logging
      // await logChatMessageForTraining(user.uid, userInput, aiResponseMessage); // Log error response

      toast({
        title: "Error",
        description: "Could not connect to the AI. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [user, isLimitReached, incrementChatCount, toast, isCounterLoading, getAiFriendTypeKey]);

  const handleFeedback = async (messageId: string, feedback: FeedbackType) => {
    if (!user) return;

    const messageToUpdate = messages.find(msg => msg.id === messageId);
    if (!messageToUpdate || messageToUpdate.sender !== 'ai') return;

    // Update local state for immediate UI change
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    
    try {
      await saveMessageFeedback(
        messageId,
        user.uid,
        feedback === 'liked', // true for liked, false for disliked (assuming null means no feedback yet or removed)
        messageToUpdate.originalUserPromptForAiResponse || "N/A",
        messageToUpdate.text
      );
      toast({
        title: "Feedback Noted",
        description: `Thanks for your feedback on the message! (${feedback || 'Removed'})`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to save feedback:", error);
      toast({
        title: "Feedback Error",
        description: "Could not save your feedback. Please try again.",
        variant: "destructive",
      });
      // Revert local state if Firestore save fails (optional, for consistency)
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, feedback: messageToUpdate.feedback } : msg // revert to original feedback
        )
      );
    }
  };


  const handleSubscribe = () => {
    toast({ title: "Subscribed!", description: "Welcome to Talkzi Premium! (This is a demo)" });
    setShowSubscriptionModal(false);
  };
  
  if (authIsLoading || isCounterLoading) {
    return <div className="flex items-center justify-center h-full"><TypingIndicator /></div>;
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
            <MessageBubble key={msg.id} message={msg} onFeedback={msg.sender === 'ai' ? handleFeedback : undefined} />
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
