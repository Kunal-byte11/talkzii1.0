
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' for crisis or info messages
  timestamp: number; // Use number (Date.now()) for easier serialization
  isLoading?: boolean; // Optional flag for AI messages being generated
  isCrisis?: boolean; // Optional flag for crisis messages
}

// User profile type for Supabase
export interface UserProfile {
  id: string; // Supabase auth user ID
  email?: string;
  gender?: 'male' | 'female' | 'prefer_not_to_say' | string; // Allow string for flexibility
  date_of_birth?: string; // Store as YYYY-MM-DD string, matches DATE type in Supabase
  created_at?: string;
  ai_persona_preference?: string | null;
  // Add other profile fields as needed
}
