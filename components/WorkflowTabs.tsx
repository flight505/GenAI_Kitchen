"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Upload, 
  Palette, 
  Edit, 
  Eye, 
  Clock,
  type LucideIcon
} from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  path: string;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  path?: never;
}

type TabItem = Tab | Separator;

interface WorkflowTabsProps {
  className?: string;
  activeColor?: string;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

// Helper function to combine classNames
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function WorkflowTabs({
  className,
  activeColor = "text-unoform-gold",
}: WorkflowTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "upload";
  
  const workflowTabs: TabItem[] = [
    { title: "Upload", icon: Upload, path: "/dream?tab=upload" },
    { title: "Design", icon: Palette, path: "/dream?tab=design" },
    { title: "Refine", icon: Edit, path: "/dream?tab=refine" },
    { type: "separator" },
    { title: "Compare", icon: Eye, path: "/dream?tab=compare" },
    { title: "History", icon: Clock, path: "/dream?tab=history" },
  ];

  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  // Find the index of the current tab
  React.useEffect(() => {
    const tabIndex = workflowTabs.findIndex(
      (tab) => tab.type !== "separator" && tab.path?.includes(`tab=${currentTab}`)
    );
    setSelected(tabIndex >= 0 ? tabIndex : null);
  }, [currentTab]);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
  });

  const handleSelect = (index: number, path: string) => {
    setSelected(index);
    router.push(path);
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-unoform-gray-dark bg-white p-1 shadow-sm",
        className
      )}
    >
      {workflowTabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="h-6 w-px bg-unoform-gray-light mx-1"
            />
          );
        }

        const Icon = tab.icon;
        const isSelected = selected === index;
        
        return (
          <motion.button
            key={tab.title}
            onClick={() => handleSelect(index, tab.path)}
            className={cn(
              "relative flex items-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
              "hover:bg-unoform-cream hover:text-unoform-gray-dark",
              isSelected && "bg-unoform-cream text-unoform-gold"
            )}
            initial="initial"
            animate="animate"
            variants={buttonVariants}
            custom={isSelected}
            transition={transition}
          >
            <Icon 
              size={20} 
              className={cn(
                "transition-colors",
                isSelected && activeColor
              )}
            />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  className={cn(
                    "overflow-hidden text-sm font-work",
                    activeColor
                  )}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={spanVariants}
                  transition={transition}
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}