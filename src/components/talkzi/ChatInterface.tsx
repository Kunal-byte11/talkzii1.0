
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '@/types/talkzi';
import { MessageBubble } from './MessageBubble';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator } from './TypingIndicator';
import { SubscriptionModal } from './SubscriptionModal';
import { useChatCounter } from '@/hooks/useChatCounter';
import { detectCrisis } from '@/ai/flows/crisis-detection';
import { hinglishAICompanion, type HinglishAICompanionInput } from '@/ai/flows/hinglish-ai-companion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { personaOptions, getDefaultPersonaImage, getPersonaTheme, type PersonaTheme } from '@/lib/personaOptions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const getChatHistoryKey = (userId?: string) => userId ? `talkzii_chat_history_${userId}` : 'talkzii_chat_history_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzii_ai_friend_type_${userId}` : 'talkzii_ai_friend_type_guest';

const GUEST_MESSAGE_LIMIT = 10;
const LOGGED_IN_FREE_TIER_MESSAGE_LIMIT = 20;

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
  const viewportRef = useRef<HTMLDivElement | null>(null); // To store the actual scrollable viewport
  const messagesEndRef = useRef<HTMLDivElement>(null); // Fallback for simple scrollIntoView

  const [currentAiFriendType, setCurrentAiFriendType] = useState<string>('default');
  const [currentAiPersonaImage, setCurrentAiPersonaImage] = useState<string>(getDefaultPersonaImage());
  const [currentPersonaTheme, setCurrentPersonaTheme] = useState<PersonaTheme | undefined>(getPersonaTheme('default'));
  const [isClientSide, setIsClientSide] = useState(false);
  
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);


  const { chatCount, incrementChatCount, isLoading: isChatCountLoading } = useChatCounter(user?.id);

  const [localStorageKeys, setLocalStorageKeys] = useState({
    chatHistory: getChatHistoryKey(user?.id),
    aiFriendType: getAIFriendTypeKey(user?.id),
  });

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (viewportRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: viewportRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      };
      viewportRef.current.scrollTo(scrollOptions);
    } else if (messagesEndRef.current) { // Fallback
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!viewportRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 150; // Increased threshold
    
    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom && messages.length > 3); // Show if not near bottom and some messages exist
  }, [messages.length]);

  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;
    if (scrollAreaElement) {
      const viewportElement = scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewportElement) {
        viewportRef.current = viewportElement;
        viewportElement.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        handleScroll();

        return () => {
          viewportElement.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [handleScroll, isClientSide]); // Rerun if isClientSide changes, to ensure viewportRef is set

  useEffect(() => {
    // Auto-scroll if user is near bottom OR if a new message was added by user/AI
    const newMessagesAdded = messages.length > lastMessageCount;
    if (isNearBottom || newMessagesAdded) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(true);
      }, newMessagesAdded ? 50 : 100); // Quicker scroll for new messages
      
      return () => clearTimeout(timeoutId);
    }
    // Update lastMessageCount only if not scrolling, to track new messages correctly
    if (!newMessagesAdded) {
       setLastMessageCount(messages.length);
    }
  }, [messages, isNearBottom, lastMessageCount, scrollToBottom]);

  useEffect(() => {
    // Specifically scroll when AI starts loading and user is near bottom
    if (isAiLoading && isNearBottom) {
      scrollToBottom(true);
    }
  }, [isAiLoading, isNearBottom, scrollToBottom]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSubscriptionModal) {
        setShowSubscriptionModal(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'end') {
        e.preventDefault();
        scrollToBottom(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSubscriptionModal, scrollToBottom]);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    setLocalStorageKeys({
      chatHistory: getChatHistoryKey(user?.id),
      aiFriendType: getAIFriendTypeKey(user?.id),
    });
  }, [user]);


  useEffect(() => {
    if (isAuthLoading || !isClientSide) return;

    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      const loadedMessages = storedHistory ? JSON.parse(storedHistory) : [];
      setMessages(loadedMessages);
      setLastMessageCount(loadedMessages.length); // Initialize lastMessageCount
      
      if (loadedMessages.length > 0) {
         // Use requestAnimationFrame to ensure DOM is ready for scrolling
        requestAnimationFrame(() => {
          scrollToBottom(false); // Immediate scroll on load
        });
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage", error);
      setMessages([]);
    }

    let activePersonaType = 'default';
    if (!user) {
      try {
        localStorage.removeItem(getAIFriendTypeKey());
      } catch (e) { console.error("Error clearing guest AI friend type", e); }
    } else {
      try {
        activePersonaType = localStorage.getItem(localStorageKeys.aiFriendType) || 'default';
      } catch (error) {
        console.error("Error loading AI friend type from localStorage", error);
      }
    }
    setCurrentAiFriendType(activePersonaType);
    const persona = personaOptions.find(p => p.value === activePersonaType);
    setCurrentAiPersonaImage(persona?.imageUrl || getDefaultPersonaImage());
    setCurrentPersonaTheme(persona?.theme || getPersonaTheme('default'));

  }, [localStorageKeys, isAuthLoading, isClientSide, user, scrollToBottom]);


  useEffect(() => {
    if (isAuthLoading || !isClientSide) return;
    try {
      localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage", error);
    }
  }, [messages, localStorageKeys.chatHistory, isAuthLoading, isClientSide]);

   const addMessage = (text: string, sender: ChatMessage['sender'], options: Partial<ChatMessage> = {}) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      sender,
      timestamp: Date.now(),
      feedback: null,
      ...options,
    };
    setMessages(prev => {
      const newMessages = [...prev, newMessage];
      setLastMessageCount(newMessages.length); // Update immediately for scroll logic
      return newMessages;
    });
    return newMessage;
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    if (!isChatCountLoading) {
      const currentLimit = user ? LOGGED_IN_FREE_TIER_MESSAGE_LIMIT : GUEST_MESSAGE_LIMIT;
      if (chatCount >= currentLimit) {
        setShowSubscriptionModal(true);
        toast({
          title: "Message Limit Reached",
          description: `You've used all your ${user ? 'free tier' : 'guest'} messages. Please subscribe for unlimited chats!`,
          variant: "default"
        });
        return;
      }
    } else {
      toast({ title: "Please wait", description: "Verifying message allowance..." });
      return;
    }

    const userMessage = addMessage(userInput, 'user');
    incrementChatCount();
    setIsAiLoading(true);
    
    // Explicitly scroll after user sends a message
    // setTimeout(() => scrollToBottom(true), 50); // Already handled by useEffect on messages change

    try {
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        addMessage(crisisResponse.response, 'system', { isCrisis: true });
        setIsAiLoading(false);
        return;
      }

      const companionInput: HinglishAICompanionInput = { message: userInput };
      
      if (user && profile?.gender && (profile.gender === 'male' || profile.gender === 'female' || profile.gender === 'prefer_not_to_say')) {
        companionInput.userGender = profile.gender;
      }
      
      const personaForAI = currentAiFriendType as HinglishAICompanionInput['aiFriendType'];
      if (personaForAI && personaForAI !== 'default') {
          companionInput.aiFriendType = personaForAI;
      }
      
      const activePersona = personaOptions.find(p => p.value === (personaForAI || 'default'));
      const personaImg = activePersona?.imageUrl || getDefaultPersonaImage();
      const personaBubbleTheme = activePersona?.theme;

      const aiResponse = await hinglishAICompanion(companionInput);
      if (aiResponse.response) {
        addMessage(aiResponse.response, 'ai', { 
          userPromptText: userMessage.text, 
          personaImage: personaImg,
          aiBubbleColor: personaBubbleTheme?.primaryColor,
          aiTextColor: personaBubbleTheme?.bubbleTextColor,
        });
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
  }, [user, profile, toast, currentAiFriendType, chatCount, incrementChatCount, isChatCountLoading, scrollToBottom]); 

  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'liked' | 'disliked') => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to give feedback.", variant: "destructive" });
      return;
    }

    let userPromptForThisAi = "";
    let aiResponseText = "";
    let finalFeedback: 'liked' | 'disliked' | null = feedbackType;
    let personaForFeedback = currentAiFriendType || 'default';

    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.sender === 'ai') {
          userPromptForThisAi = msg.userPromptText || "";
          aiResponseText = msg.text;
          finalFeedback = msg.feedback === feedbackType ? null : feedbackType;
          return { ...msg, feedback: finalFeedback };
        }
        return msg;
      })
    );

    if (finalFeedback && userPromptForThisAi && aiResponseText) {
      await saveMessageFeedbackToSupabase({
        message_id: messageId,
        user_id: user.id,
        ai_response_text: aiResponseText,
        user_prompt_text: userPromptForThisAi,
        feedback: finalFeedback,
        ai_persona: personaForFeedback,
      });
    }
  }, [user, toast, currentAiFriendType]);


  const handleSubscribe = () => {
    toast({ title: "Subscribed! (Demo)", description: "Enjoy unlimited chats! (Note: Chat count reset for this demo session)" });
    setShowSubscriptionModal(false);
  };

  const personaDisplayName = personaOptions.find(p => p.value === currentAiFriendType)?.label || 'Talkzii';
  const messageLimit = user ? LOGGED_IN_FREE_TIER_MESSAGE_LIMIT : GUEST_MESSAGE_LIMIT;
  const messagesRemaining = isChatCountLoading ? '...' : Math.max(0, messageLimit - chatCount);


  if (isAuthLoading || !isClientSide) {
    return <div className="flex flex-col items-center justify-center h-full"><TypingIndicator personaImageUrl={currentAiPersonaImage} personaName={personaDisplayName} /> <p className="ml-2 text-sm text-muted-foreground">Loading chat state...</p></div>;
  }
  
  const activeFontClass = currentPersonaTheme?.fontClassName || 'font-poppins';

  return (
    <div className={cn("flex flex-col h-full bg-background relative", activeFontClass)}>
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4 pb-4">
          {messages.length === 0 && !isAiLoading && (
            <div className="text-center text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4 text-primary/70" />
              <p className="text-lg font-semibold">Start a conversation!</p>
              <p className="text-sm">
                Chatting with: <span className="font-semibold capitalize" style={{color: currentPersonaTheme?.accentColor || 'hsl(var(--primary))'}}>{personaDisplayName}</span>
              </p>
              {user && profile?.gender && (
                <p className="text-sm">Your gender is set to: <span className="font-semibold capitalize" style={{color: currentPersonaTheme?.accentColor || 'hsl(var(--primary))'}}>{profile.gender.replace(/_/g, ' ')}</span>.</p>
              )}
              <p className="text-sm">
                Messages remaining: <span className="font-semibold" style={{color: currentPersonaTheme?.accentColor || 'hsl(var(--primary))'}}>{messagesRemaining} / {messageLimit}</span>
              </p>
              <p className="text-sm mt-1">Type your first message below.</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {isAiLoading && <TypingIndicator personaImageUrl={currentAiPersonaImage} personaName={personaDisplayName} personaTheme={currentPersonaTheme} />}
          <div ref={messagesEndRef} /> {/* Element to scroll to */}
        </div>
      </ScrollArea>

      {showScrollToBottom && (
        <Button
          onClick={() => scrollToBottom(true)}
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 md:right-6 z-20 rounded-full w-10 h-10 p-0 shadow-lg bg-background/80 hover:bg-muted border-border backdrop-blur-sm transition-all duration-200 hover:scale-110"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5 text-foreground" />
        </Button>
      )}

      <div className="px-4 py-1 text-center text-xs text-muted-foreground border-t">
        {isChatCountLoading ? 'Loading message count...' : `Messages used: ${chatCount} / ${messageLimit}. ${user ? 'Logged in.' : 'Guest session.'}`}
      </div>
      
      <ChatInputBar 
        onSendMessage={handleSendMessage} 
        isLoading={isAiLoading || isChatCountLoading} 
        sendButtonAccentColor={currentPersonaTheme?.accentColor}
        onFocus={() => {
          if (window.innerWidth < 768 && !isNearBottom) {
             // Delay slightly for virtual keyboard
            setTimeout(() => scrollToBottom(true), 300);
          }
        }}
      />
      
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        accentColor={currentPersonaTheme?.accentColor}
      />
    </div>
  );
}
