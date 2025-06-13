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
import { MessageSquareText, ChevronDown, Brain, Trash2, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { personaOptions, getDefaultPersonaImage, getPersonaTheme, type PersonaTheme } from '@/lib/personaOptions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AudioVisualizer from '@/components/AudioVisualizer';

// Enhanced memory system
interface ChatMemory {
  userProfile: {
    name?: string;
    preferences?: string[];
    interests?: string[];
    personalInfo?: Record<string, string>;
  };
  conversationContext: {
    recentTopics: string[];
    lastMentionedEntities: string[];
    conversationTone: 'casual' | 'formal' | 'friendly' | 'professional';
  };
  chatHistory: {
    messageId: string;
    userMessage: string;
    aiResponse: string;
    timestamp: number;
  }[];
}

const getChatHistoryKey = (userId?: string) => userId ? `talkzii_chat_history_${userId}` : 'talkzii_chat_history_guest';
const getChatMemoryKey = (userId?: string) => userId ? `talkzii_chat_memory_${userId}` : 'talkzii_chat_memory_guest';
const getAIFriendTypeKey = (userId?: string) => userId ? `talkzii_ai_friend_type_${userId}` : 'talkzii_ai_friend_type_guest';
const getMemoryWarningKey = (userId?: string) => userId ? `talkzii_memory_warning_shown_${userId}` : 'talkzii_memory_warning_shown_guest';


const GUEST_MESSAGE_LIMIT = 10;
const LOGGED_IN_FREE_TIER_MESSAGE_LIMIT = 20;
const MAX_MEMORY_MESSAGES = 20; 
const MAX_CONTEXT_MESSAGES = 5; 
const MEMORY_WARNING_THRESHOLD = 18; // Show warning when memory is 90% full (18/20)


// Helper functions for memory management
const extractUserInfo = (message: string): Partial<ChatMemory['userProfile']> => {
  const info: Partial<ChatMemory['userProfile']> = {};
  const personalInfo: Record<string, string> = {};
  
  const namePatterns = [
    /(?:my name is|i am|i'm|call me|name's)\s+([a-zA-Z\s]+)(?:$|\s|,|\.|!|\?)/i,
    /(?:i am called|known as|people call me)\s+([a-zA-Z\s]+)(?:$|\s|,|\.|!|\?)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      info.name = match[1].trim().split(' ')[0]; 
      info.name = info.name.charAt(0).toUpperCase() + info.name.slice(1).toLowerCase();
      break;
    }
  }
  
  const interestPatterns = [
    /i (?:like|love|enjoy|prefer)\s+([^.!?]+)/gi,
    /my (?:hobby|hobbies|interest|interests)\s+(?:is|are)\s+([^.!?]+)/gi
  ];
  
  const interests: string[] = [];
  for (const pattern of interestPatterns) {
    const matches = [...message.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1]) interests.push(match[1].trim().toLowerCase());
    });
  }
  if (interests.length > 0) info.interests = [...new Set(interests)]; 
  
  const personalPatterns: Record<string, RegExp> = {
    age: /(?:i am|i'm)\s+(\d+)\s+years?\s+old/i,
    location: /(?:i (?:live|am) (?:in|from|at))\s+([a-zA-Z\s,]+)/i, 
    job: /(?:i (?:work|am)\s+(?:as|a)\s+)([a-zA-Z\s]+)/i,
    profession: /(?:my job is|i am a|i work as)\s+([a-zA-Z\s]+)/i
  };
  
  for (const [key, pattern] of Object.entries(personalPatterns)) {
    const match = message.match(pattern);
    if (match && match[1]) personalInfo[key] = match[1].trim();
  }
  if (Object.keys(personalInfo).length > 0) info.personalInfo = personalInfo;
  
  return info;
};

const buildContextForAI = (memory: ChatMemory, currentMessage: string): string => {
  let contextParts: string[] = [];

  if (memory.userProfile.name) {
    contextParts.push(`User's name is ${memory.userProfile.name}.`);
  }
  
  if (memory.userProfile.personalInfo && Object.keys(memory.userProfile.personalInfo).length > 0) {
    const info = Object.entries(memory.userProfile.personalInfo)
      .map(([key, value]) => `${key} is ${value}`)
      .join(', ');
    if (info) contextParts.push(`Other known info about user: ${info}.`);
  }
  
  if (memory.userProfile.interests?.length) {
    contextParts.push(`User is interested in ${memory.userProfile.interests.join(', ')}.`);
  }
  
  if (memory.chatHistory.length > 0) {
    contextParts.push('\nRecent conversation highlights (last few exchanges):');
    const recentHistory = memory.chatHistory.slice(-MAX_CONTEXT_MESSAGES);
    recentHistory.forEach(exchange => {
      contextParts.push(`User: "${exchange.userMessage}" | AI: "${exchange.aiResponse}"`);
    });
  }
  
  if (contextParts.length === 0) {
    return currentMessage; 
  }

  let finalContext = 'CONTEXT FOR AI:\n';
  finalContext += contextParts.join('\n');
  finalContext += `\n\nCURRENT USER MESSAGE (respond to this naturally, considering the context above): "${currentMessage}"`;
  
  return finalContext;
};

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
  const [chatMemory, setChatMemory] = useState<ChatMemory>({
    userProfile: {},
    conversationContext: { recentTopics: [], lastMentionedEntities: [], conversationTone: 'friendly' },
    chatHistory: []
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMemoryIndicator, setShowMemoryIndicator] = useState(false); 
  const [hasShownMemoryFullWarning, setHasShownMemoryFullWarning] = useState(false);
  const { toast } = useToast();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null); 

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
    chatMemory: getChatMemoryKey(user?.id),
    aiFriendType: getAIFriendTypeKey(user?.id),
    memoryWarning: getMemoryWarningKey(user?.id),
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');

  // Memory management functions
  const updateChatMemory = useCallback((userMessageText: string, aiResponseText: string, messageId: string) => {
    setChatMemory(prevMemory => {
      const newMemory = JSON.parse(JSON.stringify(prevMemory)); 
      
      const extractedInfo = extractUserInfo(userMessageText);
      let infoLearned = false;

      if (extractedInfo.name && newMemory.userProfile.name !== extractedInfo.name) {
        newMemory.userProfile.name = extractedInfo.name;
        infoLearned = true;
      }
      
      if (extractedInfo.interests?.length) {
        const oldInterestsSize = new Set(newMemory.userProfile.interests || []).size;
        const newInterestsArray = [...new Set([...(newMemory.userProfile.interests || []), ...extractedInfo.interests])];
        if (newInterestsArray.length > oldInterestsSize) infoLearned = true;
        newMemory.userProfile.interests = newInterestsArray.slice(-10); 
      }
      
      if (extractedInfo.personalInfo && Object.keys(extractedInfo.personalInfo).length > 0) {
         if (!newMemory.userProfile.personalInfo) newMemory.userProfile.personalInfo = {};
         for (const key in extractedInfo.personalInfo) {
            if (newMemory.userProfile.personalInfo[key] !== extractedInfo.personalInfo[key]) {
                 newMemory.userProfile.personalInfo[key] = extractedInfo.personalInfo[key]!;
                 infoLearned = true;
            }
         }
      }
      
      if (infoLearned) {
        setShowMemoryIndicator(true);
        setTimeout(() => setShowMemoryIndicator(false), 3000);
      }
      
      const newHistoryEntry = { messageId, userMessage: userMessageText, aiResponse: aiResponseText, timestamp: Date.now() };
      newMemory.chatHistory = [...newMemory.chatHistory, newHistoryEntry].slice(-MAX_MEMORY_MESSAGES);
      
      return newMemory;
    });
  }, []);

  const clearChatMemory = useCallback(() => {
    setChatMemory({
      userProfile: {},
      conversationContext: { recentTopics: [], lastMentionedEntities: [], conversationTone: 'friendly' },
      chatHistory: []
    });
    try {
      localStorage.removeItem(localStorageKeys.chatMemory);
      localStorage.removeItem(localStorageKeys.memoryWarning); 
      setHasShownMemoryFullWarning(false); 
      toast({
        title: "Memory Cleared",
        description: "Chat memory has been reset. I won't remember our previous conversations or personal details.",
      });
    } catch (error) {
      console.error("Error clearing chat memory from localStorage:", error);
      toast({ title: "Error", description: "Could not clear chat memory.", variant: "destructive" });
    }
  }, [localStorageKeys.chatMemory, localStorageKeys.memoryWarning, toast]);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottomState = distanceFromBottom < 150; 
    setIsNearBottom(nearBottomState);
    setShowScrollToBottom(!nearBottomState && messages.length > 3); 
  }, [messages.length]);

  useEffect(() => {
    const scrollEl = viewportRef.current;
    if (scrollEl && isClientSide) { 
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); 
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, isClientSide]); 

  useEffect(() => {
    const newMessagesAdded = messages.length > lastMessageCount;
    if (isNearBottom || newMessagesAdded) {
      const timeoutId = setTimeout(() => scrollToBottom(true), newMessagesAdded ? 50 : 100); 
      if (newMessagesAdded) setLastMessageCount(messages.length);
      return () => clearTimeout(timeoutId);
    }
    
    if (!newMessagesAdded) setLastMessageCount(messages.length);
  }, [messages, isNearBottom, lastMessageCount, scrollToBottom]);

  useEffect(() => {
    if (isAiLoading && isNearBottom) scrollToBottom(true);
  }, [isAiLoading, isNearBottom, scrollToBottom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSubscriptionModal) setShowSubscriptionModal(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'end') { e.preventDefault(); scrollToBottom(true); }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'delete' || e.key === 'Backspace')) { 
         if (e.shiftKey) { // Only trigger clear memory if Shift is also pressed
            e.preventDefault(); 
            clearChatMemory(); 
         }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSubscriptionModal, scrollToBottom, clearChatMemory]);

  useEffect(() => {
    setIsClientSide(true);
    const scrollAreaElement = scrollAreaRef.current;
    if (scrollAreaElement) {
      const viewportElement = scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewportElement) viewportRef.current = viewportElement;
    }
  }, []);

  useEffect(() => {
    setLocalStorageKeys({
      chatHistory: getChatHistoryKey(user?.id),
      chatMemory: getChatMemoryKey(user?.id),
      aiFriendType: getAIFriendTypeKey(user?.id),
      memoryWarning: getMemoryWarningKey(user?.id),
    });
  }, [user]);

  useEffect(() => {
    if (isAuthLoading || !isClientSide) return;
    try {
      const storedHistory = localStorage.getItem(localStorageKeys.chatHistory);
      const loadedMessages = storedHistory ? JSON.parse(storedHistory) : [];
      setMessages(loadedMessages);
      setLastMessageCount(loadedMessages.length); 
      
      const storedMemory = localStorage.getItem(localStorageKeys.chatMemory);
      if (storedMemory) setChatMemory(JSON.parse(storedMemory));
      else setChatMemory({ userProfile: {}, conversationContext: { recentTopics: [], lastMentionedEntities: [], conversationTone: 'friendly' }, chatHistory: [] });

      const warningShown = localStorage.getItem(localStorageKeys.memoryWarning) === 'true';
      setHasShownMemoryFullWarning(warningShown);

      if (loadedMessages.length > 0) requestAnimationFrame(() => scrollToBottom(false)); 
    } catch (error) {
      console.error("Error loading data from localStorage", error);
      setMessages([]);
      setChatMemory({ userProfile: {}, conversationContext: { recentTopics: [], lastMentionedEntities: [], conversationTone: 'friendly' }, chatHistory: [] });
      setHasShownMemoryFullWarning(false);
    }

    let activePersonaType = 'default';
    if (!user) { 
      try { localStorage.removeItem(getAIFriendTypeKey(undefined)); } 
      catch (e) { console.error("Error clearing guest AI friend type", e); }
    } else { 
      try { activePersonaType = localStorage.getItem(localStorageKeys.aiFriendType) || 'default'; } 
      catch (error) { console.error("Error loading AI friend type from localStorage", error); }
    }
    setCurrentAiFriendType(activePersonaType);
    const persona = personaOptions.find(p => p.value === activePersonaType);
    setCurrentAiPersonaImage(persona?.imageUrl || getDefaultPersonaImage());
    setCurrentPersonaTheme(persona?.theme || getPersonaTheme('default'));
  }, [localStorageKeys, isAuthLoading, isClientSide, user, scrollToBottom]);

  useEffect(() => {
    if (isAuthLoading || !isClientSide || !messages.length) return; 
    try { localStorage.setItem(localStorageKeys.chatHistory, JSON.stringify(messages)); } 
    catch (error) { console.error("Error saving chat history", error); }
  }, [messages, localStorageKeys.chatHistory, isAuthLoading, isClientSide]);

  useEffect(() => {
    if (isAuthLoading || !isClientSide) return;
    if (chatMemory.userProfile.name || chatMemory.chatHistory.length > 0 || (chatMemory.userProfile.interests && chatMemory.userProfile.interests.length > 0) || (chatMemory.userProfile.personalInfo && Object.keys(chatMemory.userProfile.personalInfo).length > 0) ) {
      try { localStorage.setItem(localStorageKeys.chatMemory, JSON.stringify(chatMemory)); } 
      catch (error) { console.error("Error saving chat memory", error); }
    }
  }, [chatMemory, localStorageKeys.chatMemory, isAuthLoading, isClientSide]);

   const addMessage = (text: string, sender: ChatMessage['sender'], options: Partial<ChatMessage> = {}) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text, sender, timestamp: Date.now(), feedback: null, ...options,
    };
    setMessages(prev => {
      const newMsgs = [...prev, newMessage];
      return newMsgs;
    });
    return newMessage;
  };

  // Function to speak AI response
  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);
      setShowVisualizer(true);

      // Clean up URL when audio ends
      const handleAudioEnd = () => {
        setIsSpeaking(false);
        setShowVisualizer(false);
        URL.revokeObjectURL(audioUrl);
      };

      // Create a hidden audio element to trigger the visualizer
      const audio = new Audio(audioUrl);
      audio.onended = handleAudioEnd;
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        handleAudioEnd();
      };

      try {
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        handleAudioEnd();
      }

    } catch (error) {
      console.error('Speech generation error:', error);
      setIsSpeaking(false);
      setShowVisualizer(false);
      // Fallback to browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsAiLoading(true);
    const userMessage = addMessage(userInput, 'user');
    
    try {
      const crisisResponse = await detectCrisis({ message: userInput });
      if (crisisResponse.isCrisis && crisisResponse.response) {
        const systemMessage = addMessage(crisisResponse.response, 'system', { isCrisis: true });
        setIsAiLoading(false);
        return;
      }

      const messageForAI = buildContextForAI(chatMemory, userInput);
      
      const companionInput: HinglishAICompanionInput = { message: messageForAI };
      if (user && profile?.gender) companionInput.userGender = profile.gender;
      const personaTypeForAI = currentAiFriendType as HinglishAICompanionInput['aiFriendType'];
      if (personaTypeForAI && personaTypeForAI !== 'default') companionInput.aiFriendType = personaTypeForAI;
      
      const activePersona = personaOptions.find(p => p.value === (personaTypeForAI || 'default'));
      const personaImg = activePersona?.imageUrl || getDefaultPersonaImage();
      const personaBubbleTheme = activePersona?.theme;

      const aiLlmResponse = await hinglishAICompanion(companionInput);
      
      const aiMessage = addMessage(aiLlmResponse.response, 'ai', {
          personaImage: personaImg,
        aiBubbleColor: personaBubbleTheme?.bubbleColor,
        aiTextColor: personaBubbleTheme?.textColor,
        });

      // Speak the AI response
      await speakResponse(aiLlmResponse.response);

      // Update chat memory
      updateChatMemory(userInput, aiLlmResponse.response, aiMessage.id);

      // Save to Supabase if user is logged in
      if (user) {
        await saveMessageFeedbackToSupabase({
          message_id: aiMessage.id, user_id: user.id, ai_response_text: aiLlmResponse.response,
          user_prompt_text: userInput, feedback: aiMessage.feedback || 'liked', ai_persona: personaTypeForAI,
        });
      }
      
      incrementChatCount();
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      addMessage('Sorry, something went wrong. Please try again.', 'system');
    } finally {
      setIsAiLoading(false);
    }
  }, [user, profile, currentAiFriendType, chatMemory, addMessage, updateChatMemory, saveMessageFeedbackToSupabase, incrementChatCount]);

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
        message_id: messageId, user_id: user.id, ai_response_text: aiResponseText,
        user_prompt_text: userPromptForThisAi, feedback: finalFeedback, ai_persona: personaForFeedback,
      });
    }
  }, [user, toast, currentAiFriendType]);

  const handleSubscribe = () => {
    toast({ title: "Subscribed! (Demo)", description: "Enjoy unlimited chats! (Chat count reset for demo)" });
    setShowSubscriptionModal(false);
  };

  const personaDisplayName = personaOptions.find(p => p.value === currentAiFriendType)?.label || 'Talkzii';
  const messageLimit = user ? LOGGED_IN_FREE_TIER_MESSAGE_LIMIT : GUEST_MESSAGE_LIMIT;
  const messagesRemaining = isChatCountLoading ? '...' : Math.max(0, messageLimit - chatCount);
  
  if (isAuthLoading || !isClientSide) {
    return <div className="flex flex-col items-center justify-center h-full"><TypingIndicator personaImageUrl={currentAiPersonaImage} personaName={personaDisplayName} /> <p className="ml-2 text-sm text-muted-foreground">Loading chat state...</p></div>;
  }
  
  const activeFontClass = currentPersonaTheme?.fontClassName || 'font-poppins';
  const hasMemoryData = chatMemory.userProfile.name || 
                       (chatMemory.userProfile.interests && chatMemory.userProfile.interests.length > 0) ||
                       (chatMemory.userProfile.personalInfo && Object.keys(chatMemory.userProfile.personalInfo).length > 0) ||
                       (chatMemory.chatHistory && chatMemory.chatHistory.length > 0);

  // Add handlers for mic start/stop
  const handleMicStart = () => setShowVisualizer(true);
  const handleMicStop = () => setShowVisualizer(false);

  return (
    <div className={cn("flex flex-col h-full bg-background relative", activeFontClass)}>
      {showMemoryIndicator && (
        <div className="absolute top-4 right-4 z-30 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg animate-in slide-in-from-right-5 fade-in-0 duration-300">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Brain className="h-3.5 w-3.5" />
            <span>Remembered!</span>
          </div>
        </div>
      )}

      {showVisualizer && (
        <div className="fixed inset-0 z-50">
          <iframe 
            src="/audiovisualizer" 
            className="w-full h-full border-none"
            onLoad={() => {
              // Optionally, you can trigger mic input in the visualizer here
            }}
            onError={(error) => {
              console.error('Error loading visualizer:', error);
              setShowVisualizer(false);
            }}
          />
        </div>
      )}

      {/* Hide chat interface when visualizer is shown */}
      <div className={showVisualizer ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-300"}>
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
                  <p className="text-sm">Gender for AI: <span className="font-semibold capitalize" style={{color: currentPersonaTheme?.accentColor || 'hsl(var(--primary))'}}>{profile.gender.replace(/_/g, ' ')}</span></p>
                )}
                <p className="text-sm">
                  Messages remaining: <span className="font-semibold" style={{color: currentPersonaTheme?.accentColor || 'hsl(var(--primary))'}}>{messagesRemaining} / {messageLimit}</span>
                </p>
                
                {hasMemoryData && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border text-xs max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Memory Active</span>
                    </div>
                    {chatMemory.userProfile.name && (<p>Name: <span className="font-medium">{chatMemory.userProfile.name}</span></p>)}
                    {chatMemory.userProfile.interests && chatMemory.userProfile.interests.length > 0 && (<p>Interests: <span className="font-medium">{chatMemory.userProfile.interests.slice(0,2).join(', ')}{chatMemory.userProfile.interests.length > 2 ? '...' : ''}</span></p>)}
                    {chatMemory.chatHistory.length > 0 && (<p>History: <span className="font-medium">{chatMemory.chatHistory.length} exchanges</span></p>)}
                  </div>
                )}
                <p className="text-sm mt-2">Type your first message below.</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onFeedback={handleFeedback}
                onSpeak={() => speakResponse(msg.text)}
                isSpeaking={isSpeaking}
              />
            ))}
            {isAiLoading && ( <TypingIndicator personaImageUrl={currentAiPersonaImage} personaName={personaDisplayName} personaTheme={currentPersonaTheme} /> )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-2 z-20">
          {hasMemoryData && (
            <Button
              onClick={clearChatMemory}
              variant="outline"
              size="icon"
              className="bg-background/70 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow"
              title="Clear chat memory (Ctrl+Shift+Del/Backspace)"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear Memory</span>
            </Button>
          )}
        </div>

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

        <div className="px-4 py-1 text-center text-xs text-muted-foreground border-t flex items-center justify-center gap-x-3 flex-wrap">
          <span>
            {isChatCountLoading ? 'Loading...' : `Messages remaining: ${messagesRemaining}/${messageLimit}. ${user ? 'Logged in' : 'Guest'}`}
          </span>
        </div>
        
        <ChatInputBar
          onSendMessage={handleSendMessage}
          isLoading={isAiLoading}
          onMicStart={handleMicStart}
          onMicStop={handleMicStop}
          sendButtonAccentColor={currentPersonaTheme?.accentColor}
          onFocus={() => { if (window.innerWidth < 768 && !isNearBottom) setTimeout(() => scrollToBottom(true), 300); }}
          autoStartMicOnFocus={true}
        />
        
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
          accentColor={currentPersonaTheme?.accentColor}
        />
      </div>
    </div>
  );
}

    