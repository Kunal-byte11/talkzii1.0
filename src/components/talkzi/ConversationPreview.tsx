import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { MessageSquareText } from "lucide-react";

interface Preview {
  title: string;
  snippetUser: string;
  snippetAI: string;
  emoji: string;
}

const previews: Preview[] = [
  {
    title: "Feeling Low?",
    snippetAI: "Koi na, buddy! Bata kya hua? Sab theek ho jayega.",
    snippetUser: "Yaar, aaj mood off hai...",
    emoji: "😔",
  },
  {
    title: "Exam Stress!",
    snippetAI: "Kal exam hai, bahut tension ho rahi hai 😭",
    snippetUser: "Chill maar! You've got this. Thoda break le aur deep breaths.",
    emoji: "📚",
  },
  {
    title: "Just Vibing",
    snippetAI: "Bas, chilling! Tu bata, any new series binge-watched?",
    snippetUser: "Aur bata, Talkzi! Kya chal raha hai?",
    emoji: "😎",
  },
];

export function ConversationPreviewCarousel() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What can you talk about?
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          From daily rants to deep thoughts, Talkzi is here to listen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {previews.map((preview, index) => (
            <Card 
              key={index} 
              className="neumorphic-shadow-soft bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/10">
                <CardTitle className="text-lg font-semibold text-primary">{preview.title}</CardTitle>
                <span className="text-3xl">{preview.emoji}</span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {/* User Message - Blue, Right */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-none max-w-[80%]">
                      <p className="text-sm">{preview.snippetUser}</p>
                    </div>
                  </div>

                  {/* AI Message - Gray, Left */}
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground p-3 rounded-lg rounded-bl-none max-w-[80%]">
                      <p className="text-sm">{preview.snippetAI}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

