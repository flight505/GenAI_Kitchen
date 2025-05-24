'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpTrayIcon,
  PaintBrushIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface Tab {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  type?: 'separator';
}

const workflowTabs: Tab[] = [
  { id: 'upload', title: 'Upload', icon: ArrowUpTrayIcon, path: '/dream?tab=upload' },
  { id: 'design', title: 'Design', icon: PaintBrushIcon, path: '/dream?tab=design' },
  { id: 'refine', title: 'Refine', icon: PencilIcon, path: '/dream?tab=refine' },
  { id: 'separator', type: 'separator', title: '', icon: () => null, path: '' },
  { id: 'compare', title: 'Compare', icon: EyeIcon, path: '/dream?tab=compare' },
  { id: 'history', title: 'History', icon: ClockIcon, path: '/dream?tab=history' },
];

export default function WorkflowTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'upload';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabClick = (tab: Tab) => {
    if (tab.type !== 'separator') {
      router.push(tab.path);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button for Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="fixed top-20 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          aria-label="Toggle workflow tabs"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Tab Navigation */}
      <motion.nav
        initial={false}
        animate={{
          x: isMobile && !isExpanded ? '-100%' : '0%',
          width: isExpanded || !isMobile ? 'auto' : '60px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        className={`
          ${isMobile ? 'fixed left-0 top-0 h-full z-40' : 'sticky top-24'}
          bg-white border-r border-gray-200 shadow-sm
          ${isExpanded || !isMobile ? 'w-48' : 'w-16'}
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="p-4 space-y-2">
          {/* Workflow Steps Header */}
          <AnimatePresence>
            {(isExpanded || !isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 pb-2 border-b border-gray-200"
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Workflow Steps
                </h3>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          {workflowTabs.map((tab) => {
            if (tab.type === 'separator') {
              return (
                <div
                  key={tab.id}
                  className={`my-2 border-t border-gray-200 ${
                    isExpanded || !isMobile ? 'mx-2' : 'mx-1'
                  }`}
                />
              );
            }

            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-unoform-gold/10 to-unoform-gold/5 text-unoform-gold border border-unoform-gold/20'
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-unoform-gold rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 ${isExpanded || !isMobile ? 'ml-1' : 'mx-auto'}`}>
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'text-unoform-gold' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {(isExpanded || !isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`
                        text-sm font-medium whitespace-nowrap
                        ${isActive ? 'text-unoform-gold' : 'text-gray-700'}
                      `}
                    >
                      {tab.title}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {tab.title}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {(isExpanded || !isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 border-t border-gray-200"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>2 of 5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    className="bg-unoform-gold h-1.5 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}