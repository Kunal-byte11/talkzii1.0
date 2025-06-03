
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

const GUEST_CHAT_COUNT_KEY_BASE = 'talkzii_chat_count_guest';
const USER_CHAT_COUNT_KEY_BASE = 'talkzii_chat_count_user';

interface ChatCounterHook {
  chatCount: number;
  incrementChatCount: () => void;
  resetChatCount: () => void;
  isLoading: boolean;
}

export function useChatCounter(userId?: string): ChatCounterHook {
  const [isLoading, setIsLoading] = useState(true);
  const [chatCount, setChatCount] = useState(0);

  const CHAT_COUNT_KEY = useMemo(() => {
    return userId ? `${USER_CHAT_COUNT_KEY_BASE}_${userId}` : GUEST_CHAT_COUNT_KEY_BASE;
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedChatCount = localStorage.getItem(CHAT_COUNT_KEY);
      if (storedChatCount) {
        setChatCount(parseInt(storedChatCount, 10));
      } else {
        setChatCount(0); // Ensure count is 0 if nothing is stored
      }
    } catch (error) {
      console.error("Error reading chat count from localStorage for key:", CHAT_COUNT_KEY, error);
      setChatCount(0); // Default to 0 on error
    }
    setIsLoading(false);
  }, [CHAT_COUNT_KEY]);

  const updateStorage = useCallback((count: number) => {
    try {
      localStorage.setItem(CHAT_COUNT_KEY, count.toString());
    } catch (error)      {
      console.error("Error setting chat count in localStorage for key:", CHAT_COUNT_KEY, error);
    }
  }, [CHAT_COUNT_KEY]);

  const incrementChatCount = useCallback(() => {
    setChatCount(prevCount => {
      const newCount = prevCount + 1;
      updateStorage(newCount);
      return newCount;
    });
  }, [updateStorage]);

  const resetChatCount = useCallback(() => {
    setChatCount(0);
    updateStorage(0);
  }, [updateStorage]);

  return { chatCount, incrementChatCount, resetChatCount, isLoading };
}
