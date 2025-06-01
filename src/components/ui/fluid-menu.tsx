
"use client";

import React, {
  useState,
  Children,
  cloneElement,
  isValidElement,
  createContext,
  useContext,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
// X icon from lucide-react is not used in this version, so import can be removed if not needed by MenuItem directly.
// Assuming MenuItem itself doesn't import/use X for its own internal purposes.

interface MenuContextType {
  isOpen: boolean;
  toggleMenu?: () => void;
  closeMenu?: () => void;
}
const MenuContext = createContext<MenuContextType | null>(null);

interface MenuContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MenuContainer: React.FC<MenuContainerProps> = ({
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // useOnClickOutside hook will close the menu when clicking outside of menuRef
  useOnClickOutside(menuRef, () => {
    if (isOpen) {
      closeMenu();
    }
  });

  const items = Children.toArray(children).filter(isValidElement);
  const toggleItem = items[0];
  const menuItems = items.slice(1);

  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
      <div className={cn("relative", className)} ref={menuRef} data-expanded={isOpen}>
        {/* Render Toggle Item */}
        {toggleItem && cloneElement(toggleItem as React.ReactElement<any>, { 
          isToggle: true, 
          // onClick is handled by MenuItem's internal handleClick based on isToggle
        })}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl z-20 overflow-hidden"
              id="mobile-menu-dropdown" // Ensure this ID is unique or contextually appropriate
            >
              <ul className="py-1">
                {menuItems.map((child, index) => (
                   <li key={child.key !== null && child.key !== undefined ? child.key : index} className="block">
                    {cloneElement(child as React.ReactElement<any>, {
                      // Wrap the original onClick to also close the menu after a delay
                      onClick: (event?: React.MouseEvent<HTMLElement>) => {
                        if (child.props.onClick) {
                          child.props.onClick(event); // Execute original onClick (e.g., navigation)
                        }
                        setTimeout(() => { // Delay allows navigation/action to initiate
                          closeMenu();
                        }, 150); 
                      },
                    })}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MenuContext.Provider>
  );
};

interface MenuItemProps {
  icon?: React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  href?: string; // href is used by MenuItem to render as <a> or <button>
  className?: string;
  isToggle?: boolean; // To identify the toggle button
  children?: React.ReactNode; // For text label
  'aria-label'?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  onClick,
  href,
  className,
  isToggle,
  children,
  "aria-label": ariaLabel,
}) => {
  const context = useContext(MenuContext);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isToggle && context?.toggleMenu) {
      context.toggleMenu();
      event.stopPropagation(); // Prevent event from bubbling if it's the toggle
    } else if (onClick) {
      onClick(event); // For non-toggle items, their specific onClick is called
                      // Menu closing is handled by MenuContainer's wrapper
    }
    // If it's a simple href link without a specific onClick,
    // MenuContainer's wrapper handles closing.
  };

  const commonClasses = cn(
    "flex items-center w-full text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60",
    isToggle 
      ? "p-2 rounded-md justify-center hover:bg-muted/50 transition-colors" // Toggle button styling
      : "px-3 py-2.5 hover:bg-muted/50 gap-3 transition-colors", // Standard item styling
    className
  );

  const content = (
    <>
      {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children && <span className="flex-grow text-left truncate">{children}</span>}
    </>
  );

  if (isToggle) {
    // Toggle button
    return (
      <button 
        type="button" 
        className={commonClasses}
        onClick={handleClick}
        aria-expanded={context?.isOpen}
        aria-controls={isToggle ? "mobile-menu-dropdown" : undefined} // ID of the panel
        aria-label={ariaLabel || "Toggle navigation menu"}
      >
        {icon} {/* Icon for the toggle, e.g., animated hamburger/X */}
      </button>
    );
  }

  // Regular menu item (link or button)
  if (href) { // If href is present, render as an anchor tag
    return (
      <a 
        href={href} 
        className={commonClasses}
        onClick={handleClick} // Still call handleClick for potential context interactions or if original onClick needs to run
        aria-label={ariaLabel || (typeof children === 'string' ? children : "Menu item")}
      >
        {content}
      </a>
    );
  }

  // Default to button if not a toggle and no href
  return ( 
    <button 
      type="button" 
      className={commonClasses}
      onClick={handleClick} 
      aria-label={ariaLabel || (typeof children === 'string' ? children : "Menu item")}
    >
      {content}
    </button>
  );
};

    