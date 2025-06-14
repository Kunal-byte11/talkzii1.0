
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  accentColor?: string; // For theming the primary action button
}

export function SubscriptionModal({ isOpen, onClose, onSubscribe, accentColor }: SubscriptionModalProps) {
  const primaryButtonColor = accentColor || 'hsl(var(--primary))';
  const crownColor = accentColor || 'hsl(var(--primary))';
  const priceColor = accentColor || 'hsl(var(--primary))';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12" style={{ color: crownColor }} />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            Unlock Unlimited Chats!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-2">
            You've used all your free messages. Upgrade to Talkzii Premium for unlimited conversations, priority support, and more!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 text-center">
          <p className="text-3xl font-extrabold" style={{color: priceColor}}>
            ₹30 <span className="text-base font-normal text-muted-foreground">/ month</span>
          </p>
          <ul className="mt-4 text-left space-y-2 text-sm text-muted-foreground list-disc list-inside px-4">
            <li>Unlimited messages</li>
            <li>Access to all features</li>
            <li>Priority AI responses</li>
            <li>Support Talkzii's development</li>
          </ul>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Maybe Later</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onSubscribe} 
              className="w-full sm:w-auto text-primary-foreground" // Ensure text color contrasts well
              style={{ backgroundColor: primaryButtonColor }}
            >
              Subscribe Now
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
