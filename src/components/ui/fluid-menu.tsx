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
import { X } from "lucide-react"; // for close icon

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
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the main toggle container, not the fullscreen panel

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // useOnClickOutside is now handled by the overlay click or explicit close button
  // For the fullscreen menu, useOnClickOutside on menuRef might not be what we want,
  // as the menu itself is fullscreen. The overlay handles outside clicks.

  const items = Children.toArray(children).filter(isValidElement);
  const toggleItem = items[0];
  const menuItems = items.slice(1);

  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
      <div className={cn("relative", className)} ref={menuRef} data-expanded={isOpen}>
        {/* Toggle Button */}
        {toggleItem && cloneElement(toggleItem as React.ReactElement<any>, { isToggle: true })}

        {/* Fullscreen Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay - click to close */}
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMenu} // Close menu when overlay is clicked
              />

              {/* Menu Panel */}
              <motion.div
                className="fixed top-0 left-0 right-0 bottom-0 bg-background z-50 flex flex-col p-4"
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                // ref for the panel itself is not strictly needed for useOnClickOutside here
                // as the overlay handles "outside" clicks.
              >
                <div className="flex justify-end mb-4"> {/* Added margin for spacing */}
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-full hover:bg-muted/50 transition-colors text-foreground"
                    aria-label="Close menu"
                  >
                    <X className="w-7 h-7" /> {/* Slightly larger icon */}
                  </button>
                </div>
                <ul className="flex flex-col gap-3 mt-2 overflow-y-auto"> {/* Adjusted gap and margin, added overflow */}
                  {menuItems.map((child, index) => (
                    <li key={child.key ?? index} className="block">
                      {cloneElement(child as React.ReactElement<any>, {
                        // Ensure child props and context interact correctly for styling/state
                        className: cn(child.props.className, "text-lg py-2"), // Example: Make items larger
                        onClick: (event?: React.MouseEvent<HTMLElement>) => {
                          child.props.onClick?.(event);
                          setTimeout(() => {
                            closeMenu();
                          }, 150); // Delay to allow navigation/action
                        },
                      })}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MenuContext.Provider>
  );
};


// MenuItem component remains the same as your last working version.
// This is the version that supports icon, children, href, onClick, isToggle, etc.
// This version was provided in your previous prompt: "add this on navbar for mobile..."
interface MenuItemProps {
  icon?: React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  className?: string;
  isToggle?: boolean;
  children?: React.ReactNode;
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
      onClick(event);
      // For non-toggle items, the closing is handled by the MenuContainer's wrapper
    } else if (href && !isToggle && context?.closeMenu) {
      // If it's a link and not a toggle, also ensure menu closes,
      // this is belt-and-suspenders as MenuContainer also handles it.
      setTimeout(() => {
         context.closeMenu?.();
      }, 150);
    }
  };

  const commonClasses = cn(
    "flex items-center w-full text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60",
    isToggle
      ? "p-2 rounded-md justify-center hover:bg-muted/50 transition-colors"
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
    return (
      <button
        type="button"
        className={commonClasses}
        onClick={handleClick}
        aria-expanded={context?.isOpen}
        aria-controls={isToggle ? "mobile-menu-dropdown" : undefined} // ID of the panel
        aria-label={ariaLabel || "Toggle navigation menu"}
      >
        {icon}
      </button>
    );
  }

  // For navigation items within the fullscreen menu
  if (href) {
    return (
      <a
        href={href}
        className={commonClasses}
        onClick={handleClick}
        aria-label={ariaLabel || (typeof children === 'string' ? children : "Menu item")}
      >
        {content}
      </a>
    );
  }

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
