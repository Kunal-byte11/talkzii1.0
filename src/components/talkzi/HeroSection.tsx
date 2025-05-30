
"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export function HeroSection() {
  const router = useRouter();
  const { user } = useAuth(); // Get user from context

  const handleStartChatting = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth'); // Redirect to new auth page
    }
  };
  
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(30px, -50px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 20px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
      `}</style>

      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
          <span className="block">Feeling lonely?</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Talkzii’s here for you 💙
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Your friendly AI companion, always ready to listen and chat in Hinglish. Share your thoughts, get support, or just have a fun conversation.
        </p>
        
        <Button
          size="lg"
          onClick={handleStartChatting}
          className="gradient-button font-semibold text-lg py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Start Chatting
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <div className="mt-12 flex justify-center space-x-4 text-4xl">
          <motion.span whileHover={{ scale: 1.5, rotate: 15 }} role="img" aria-label="Sad emoji">😞</motion.span>
          <motion.span className="text-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>→</motion.span>
          <motion.span whileHover={{ scale: 1.5, rotate: -15 }} role="img" aria-label="Happy emoji">😊</motion.span>
        </div>
      </motion.div>
    </section>
  );
}

