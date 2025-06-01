
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
        })}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl z-20 overflow-hidden"
              id="mobile-menu-dropdown"
            >
              <ul className="py-1">
                {menuItems.map((child, index) => (
                   <li key={child.key !== null && child.key !== undefined ? child.key : index} className="block">
                    {cloneElement(child as React.ReactElement<any>, {
                      onClick: (event?: React.MouseEvent<HTMLElement>) => {
                        if (child.props.onClick) {
                          child.props.onClick(event);
                        }
                        setTimeout(() => {
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
      event.stopPropagation(); // Prevent click from propagating to useOnClickOutside
    } else if (onClick) {
      onClick(event);
      // If it's not a toggle, the closing is handled by cloneElement in MenuContainer
    }
  };

  const commonClasses = cn(
    "flex items-center w-full text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60",
    isToggle 
      ? "p-2 rounded-md justify-center hover:bg-muted/50 transition-colors" 
      : "px-3 py-2.5 hover:bg-muted/50 gap-3 transition-colors", 
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
        aria-controls={isToggle ? "mobile-menu-dropdown" : undefined}
        aria-label={ariaLabel || "Toggle navigation menu"}
      >
        {icon} {/* Toggle button only shows icon, not children */}
      </button>
    );
  }

  // For regular menu items, if href is provided and no onClick, it's an anchor
  // Otherwise, it's a button (especially if onClick is for JS navigation)
  if (href && !onClick) { 
    return (
      <a 
        href={href} 
        className={commonClasses}
        onClick={handleClick} // Allow context to potentially close, or native nav
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
