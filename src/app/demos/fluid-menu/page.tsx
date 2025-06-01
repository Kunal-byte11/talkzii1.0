"use client"

import { MenuItem, MenuContainer } from "@/components/ui/fluid-menu"
import { Menu as MenuIcon, X, Home, Mail, User, Settings } from "lucide-react"
import Link from "next/link";

// A fluid circular menu that elegantly expands to reveal navigation items with smooth icon transitions
export default function MenuDemoPage() {
  const handleItemClick = (itemName: string) => {
    console.log(`${itemName} clicked`);
    // Add navigation or other actions here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400">Fluid Navigation Demo</h1>
        <p className="text-md text-gray-600 dark:text-gray-400">A circular menu with smooth icon transitions.</p>
         <Link href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
      </div>
      
      <div className="relative flex items-center justify-center" style={{height: '350px'}}> {/* Added height to parent for better viz */}
        {/* Optional: subtle background glow for the menu area */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/20 blur-3xl -z-10 rounded-full w-64 h-64" />
        
        <MenuContainer>
          <MenuItem 
            icon={
              <div className="relative w-6 h-6 text-gray-700 dark:text-gray-200">
                {/* MenuIcon appears when data-expanded is false or not present */}
                <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:-rotate-180">
                  <MenuIcon size={24} strokeWidth={1.5} />
                </div>
                {/* X icon appears when data-expanded is true */}
                <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                  <X size={24} strokeWidth={1.5} />
                </div>
              </div>
            } 
          />
          <MenuItem icon={<Home size={24} strokeWidth={1.5} />} onClick={() => handleItemClick('Home')} />
          <MenuItem icon={<Mail size={24} strokeWidth={1.5} />} onClick={() => handleItemClick('Mail')} />
          <MenuItem icon={<User size={24} strokeWidth={1.5} />} onClick={() => handleItemClick('User')} />
          <MenuItem icon={<Settings size={24} strokeWidth={1.5} />} onClick={() => handleItemClick('Settings')} />
        </MenuContainer>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-8">
        <p>Click the menu icon to expand/collapse.</p>
        <p>Note: This is a demo component. Further styling and functionality may be required for production use.</p>
      </div>
    </div>
  )
}
