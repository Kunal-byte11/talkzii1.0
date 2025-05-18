
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' for crisis or info messages
  timestamp: number; // Use number (Date.now()) for easier serialization
  isLoading?: boolean; // Optional flag for AI messages being generated
  isCrisis?: boolean; // Optional flag for crisis messages
  // Feedback related properties removed
}

// User profile type for Supabase (example)
export interface UserProfile {
  id: string; // Supabase auth user ID
  email?: string;
  created_at?: string;
  ai_persona_preference?: string | null;
  // Add other profile fields as needed
}
