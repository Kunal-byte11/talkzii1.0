
"use client";

import { useState, useEffect, useCallback } from 'react';

const CHAT_COUNT_KEY = 'talkzii_chat_count';
const FREE_TIER_LIMIT = 20;

interface ChatCounterHook {
  chatCount: number;
  incrementChatCount: () => void;
  resetChatCount: () => void;
  isLimitReached: boolean;
  isLoading: boolean;
}

export function useChatCounter(): ChatCounterHook {
  const [isLoading, setIsLoading] = useState(true);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    try {
      const storedChatCount = localStorage.getItem(CHAT_COUNT_KEY);
      if (storedChatCount) {
        setChatCount(parseInt(storedChatCount, 10));
      }
    } catch (error) {
      console.error("Error reading chat count from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const updateStorage = (count: number) => {
    try {
      localStorage.setItem(CHAT_COUNT_KEY, count.toString());
    } catch (error) {
      console.error("Error setting chat count in localStorage", error);
    }
  };

  const incrementChatCount = useCallback(() => {
    setChatCount(prevCount => {
      const newCount = prevCount + 1;
      updateStorage(newCount);
      return newCount;
    });
  }, []);

  const resetChatCount = useCallback(() => {
    setChatCount(0);
    updateStorage(0);
  }, []);

  const isLimitReached = chatCount >= FREE_TIER_LIMIT;

  return { chatCount, incrementChatCount, resetChatCount, isLimitReached, isLoading };
}

