'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInputBar({ onSendMessage, disabled }: ChatInputBarProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimMessage, setInterimMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Set language to English
      recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives for better accuracy

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setMessage(prev => prev + ' ' + finalTranscript);
          setInterimMessage('');
        } else {
          setInterimMessage(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimMessage('');
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart recognition if it was still supposed to be listening
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
          }
        } else {
          setInterimMessage('');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      setMessage(''); // Clear previous message
      setInterimMessage('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimMessage('');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMessage = (message + ' ' + interimMessage).trim();
    if (finalMessage && !disabled) {
      onSendMessage(finalMessage);
      setMessage('');
      setInterimMessage('');
      if (isListening) {
        stopListening();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-white/5 backdrop-blur-lg rounded-lg">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message + (interimMessage ? ' ' + interimMessage : '')}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50"
        />
        
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </button>

        <button
          type="submit"
          disabled={!message.trim() && !interimMessage.trim() || disabled}
          className={`p-2 rounded-full transition-colors ${
            (message.trim() || interimMessage.trim()) && !disabled
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {interimMessage && (
        <div className="text-sm text-white/70 italic">
          {interimMessage}
        </div>
      )}
    </form>
  );
} 