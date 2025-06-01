"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
}

export function MenuItem({ children, onClick, disabled = false, icon, isActive = false }: MenuItemProps) {
  return (
    <button
      className={`relative block w-full h-16 text-center group
        ${disabled ? "text-gray-400 dark:text-gray-500 cursor-not-allowed" : "text-gray-600 dark:text-gray-300"}
        ${isActive ? "bg-white/10 dark:bg-gray-700/50" : ""}
        hover:bg-gray-100 dark:hover:bg-gray-700
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center h-full"> {/* Removed mt-[5%] for better centering with dynamic content */}
        {icon && (
          <span className={`h-6 w-6 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5] ${children ? 'mr-2' : ''}`}>
            {icon}
          </span>
        )}
        {children}
      </span>
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  }

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);


  return (
    <div className="relative w-[64px]" data-expanded={isExpanded} ref={containerRef}>
      {/* Container for all items */}
      <div className="relative">
        {/* First item - always visible (toggle button) */}
        <div 
          className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 cursor-pointer rounded-full group will-change-transform z-50 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          onClick={handleToggle}
          role="button"
          aria-expanded={isExpanded}
          aria-controls="fluid-menu-items"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle();}}
        >
          {childrenArray[0]}
        </div>

        {/* Other items - animated */}
        <div id="fluid-menu-items">
          {childrenArray.slice(1).map((child, index) => (
            <div 
              key={index} 
              className="absolute top-0 left-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 will-change-transform rounded-full shadow-md flex items-center justify-center"
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * (64 + 8) : 0}px)`, // 64px item height + 8px gap
                opacity: isExpanded ? 1 : 0,
                zIndex: 40 - index, // To ensure proper stacking
                // clipPath: "circle(50% at 50% 50%)", // Simplified clip-path, adjust if specific shape needed
                transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1) ${index * 30}ms,
                           opacity ${isExpanded ? '250ms' : '300ms'} ease-out ${index * 20}ms`,
                backfaceVisibility: 'hidden',
                perspective: 1000,
                WebkitFontSmoothing: 'antialiased',
                pointerEvents: isExpanded ? 'auto' : 'none', // Allow clicks only when expanded
              }}
            >
              {React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, {
                // Pass down onClick to menu items to potentially close menu after action
                onClick: () => {
                  if (child.props.onClick) {
                    child.props.onClick();
                  }
                  // Optionally close menu after item click, or let parent handle it
                  // setIsExpanded(false); 
                }
              }) : child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
