
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-[hsl(var(--chart-5))]"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 6 + Math.random() * 4, // Faster animation
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Background Paths",
    subtitle,
    ctaText = "Discover Excellence",
    onCtaClick,
}: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    onCtaClick?: () => void;
}) {
    const words = title.split(" ");
    const router = useRouter();
    const { user } = useAuth();

    const handleDefaultCtaClick = () => {
        if (user) {
            router.push('/aipersona');
        } else {
            router.push('/auth');
        }
    };

    const finalCtaClick = onCtaClick || handleDefaultCtaClick;

    return (
        <div className="relative min-h-[calc(100vh-4rem)] sm:min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground py-12 sm:py-16">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-2 sm:mr-3 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 20, opacity: 0 }} // Reduced initial y offset
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: wordIndex * 0.02 + letterIndex * 0.01,
                                            type: "tween",
                                            duration: 0.2,
                                            ease: "easeOut",
                                        }}
                                        className="inline-block text-transparent bg-clip-text
                                        bg-gradient-to-r from-foreground to-foreground/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    {subtitle && (
                        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto px-2">
                            {subtitle}
                        </p>
                    )}

                    <div
                        className="inline-block group relative bg-gradient-to-b from-foreground/5 to-background/5
                         p-px rounded-2xl backdrop-blur-lg
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Button
                            variant="ghost"
                            onClick={finalCtaClick}
                            className={cn(
                                "rounded-[1.15rem] px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold backdrop-blur-md",
                                "bg-card/95 hover:bg-card text-card-foreground",
                                "transition-all duration-300 group-hover:-translate-y-0.5 border border-border",
                                "hover:shadow-md"
                            )}
                        >
                            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                {ctaText}
                            </span>
                            <span
                                className="ml-2 sm:ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1
                                transition-all duration-300"
                            >
                                →
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
