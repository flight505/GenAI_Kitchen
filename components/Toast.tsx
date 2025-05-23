import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className={`fixed bottom-5 right-5 ${getBackgroundColor()} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50`}
      >
        <span className="text-xl">{getIcon()}</span>
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}