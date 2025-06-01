
"use client";

import { BackgroundPaths } from "@/components/ui/background-paths";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoBackgroundPathsPage() {
    const handleDiscoverClick = () => {
        // Example action: navigate or log
        console.log("Discover Excellence clicked!");
        // You could use router.push('/') or any other path here
    };

    return (
        <>
            <BackgroundPaths 
                title="Animated Background" 
                ctaText="Explore Talkzii"
                onCtaClick={handleDiscoverClick}
            />
            <div className="absolute top-4 left-4 z-20">
                <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </>
    );
}
