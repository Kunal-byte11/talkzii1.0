
"use client";

import React, { useState, Children, cloneElement, isValidElement, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MenuContextType {
  isOpen: boolean;
  toggleMenu?: () => void;
}
const MenuContext = createContext<MenuContextType | null>(null);

interface MenuContainerProps {
  children: React.ReactNode;
  className?: string;
  itemOffset?: number;
  startAngle?: number;
}

export const MenuContainer: React.FC<MenuContainerProps> = ({
  children,
  className,
  itemOffset = 70, // Distance of items from center
  startAngle = -90, // Start angle for the first item (degrees, -90 is top)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const items = Children.toArray(children).filter(isValidElement);
  const toggleItem = items[0];
  const menuItems = items.slice(1);

  const angleStep = menuItems.length > 0 ? (menuItems.length > 1 ? 360 / menuItems.length : 0) : 0;


  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu }}>
      <div className={cn("relative flex items-center justify-center", className)} data-expanded={isOpen}>
        <AnimatePresence>
          {isOpen &&
            menuItems.map((child, index) => {
              // Distribute items more evenly, e.g. in a semi-circle if few items
              let currentAngleStep = angleStep;
              let currentStartAngle = startAngle;

              if (menuItems.length <= 3 && menuItems.length > 0) { // For 1-3 items, spread over 180 deg
                currentAngleStep = 180 / (menuItems.length +1) ;
                currentStartAngle = startAngle - ( (menuItems.length-1) * currentAngleStep / 2) + currentAngleStep; // Center the arc
              } else if (menuItems.length === 4) { // For 4 items, could be 90deg steps starting from top-left like
                 currentAngleStep = 90;
                 currentStartAngle = -135; // Top-left for 4 items
              }


              const angle = currentStartAngle + index * currentAngleStep;
              const x = Math.cos(angle * (Math.PI / 180)) * itemOffset;
              const y = Math.sin(angle * (Math.PI / 180)) * itemOffset;

              return (
                <motion.div
                  key={child.key !== null && child.key !== undefined ? child.key : index}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: x, y: y }}
                  exit={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.03 }}
                >
                  {cloneElement(child as React.ReactElement<any>, {
                    onClick: () => {
                      if (child.props.onClick) {
                        child.props.onClick();
                      }
                      setIsOpen(false);
                    }
                  })}
                </motion.div>
              );
            })}
        </AnimatePresence>

        <div className="relative z-10">
          {toggleItem && cloneElement(toggleItem as React.ReactElement<any>, { isToggle: true })}
        </div>
      </div>
    </MenuContext.Provider>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  className?: string;
  isToggle?: boolean;
  children?: React.ReactNode;
  'aria-label'?: string;
  // key?: string | number; // Key is a special prop, should not be explicitly defined here
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
  if (!context) {
    return null;
  }
  const { toggleMenu, isOpen } = context;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isToggle && toggleMenu) {
      toggleMenu();
    } else if (onClick) {
      onClick(event); // Pass event if original onClick expects it
    }
    // If it's a link item and menu is open, the MenuContainer's cloneElement onClick will close it.
    // If it's just a button, and an onClick is provided, it runs.
  };

  const commonProps = {
    className: cn(
      "flex items-center justify-center p-3 rounded-full bg-background/70 dark:bg-neutral-800/70 shadow-md hover:bg-primary/10 dark:hover:bg-neutral-700/70 transition-all cursor-pointer border border-border/70 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    onClick: handleClick,
    "aria-label": ariaLabel || (isToggle ? "Toggle menu" : "Menu item"),
  };

  if (href && !isToggle) {
    return (
      <a href={href} {...commonProps}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" {...commonProps}>
      {icon}
      {children}
    </button>
  );
};
