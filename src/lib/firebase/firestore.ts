
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config'; // Your Firebase config and initialized Firestore instance
import type { ChatMessage } from '@/types/talkzi';

interface FeedbackData {
  messageId: string;
  userId: string | null; // User ID if available
  liked: boolean; // true for thumbs up, false for thumbs down
  timestamp: any; // Firestore server timestamp
  originalMessageText: string; // To give context to the feedback
  originalResponseText: string;
}

// Function to save feedback to Firestore
export const saveMessageFeedback = async (
  messageId: string,
  userId: string | null,
  liked: boolean,
  originalMessageText: string,
  originalResponseText: string
): Promise<void> => {
  try {
    const feedbackData: FeedbackData = {
      messageId,
      userId,
      liked,
      originalMessageText,
      originalResponseText,
      timestamp: serverTimestamp(),
    };
    // IMPORTANT: Ensure you have a 'messageFeedback' collection in your Firestore
    // and appropriate security rules.
    await addDoc(collection(db, 'messageFeedback'), feedbackData);
    console.log('Feedback saved successfully:', feedbackData);
    // In a real app, you might not log this to console or provide user feedback (e.g., toast)
  } catch (error) {
    console.error('Error saving feedback to Firestore:', error);
    // Handle the error appropriately in your UI if needed
    // For now, we'll just log it. This often indicates Firestore isn't set up
    // or security rules are blocking writes.
    throw error;
  }
};


// Example: Storing user prompts and AI responses (Illustrative - needs proper design)
// This is a simplified example and requires careful consideration for privacy,
// data structure, and security rules in a production application.
export const logChatMessageForTraining = async (userId: string | null, userPrompt: string, aiResponse: string) => {
  try {
    // Consider structuring data by user if privacy allows and is needed
    // Or anonymize if data is purely for model fine-tuning without user context.
    const logEntry = {
      userId: userId || 'anonymous', // Handle anonymous users if applicable
      userPrompt,
      aiResponse,
      timestamp: serverTimestamp(),
      // Add any other relevant metadata, e.g., AI persona used
    };
    // IMPORTANT: Ensure 'trainingLogs' collection and rules are set up
    await addDoc(collection(db, 'trainingLogs'), logEntry);
    console.log('Chat message logged for training:', logEntry);
  } catch (error) {
    console.error('Error logging chat message for training:', error);
  }
};

// Placeholder for user profile creation (e.g., on signup)
export const createUserProfile = async (userId: string, email: string | null) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: email,
        createdAt: serverTimestamp(),
        // Add any other default profile fields
      });
      console.log('User profile created for:', userId);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
