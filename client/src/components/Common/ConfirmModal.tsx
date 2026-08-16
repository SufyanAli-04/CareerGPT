import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAlertLine, RiCloseLine } from 'react-icons/ri';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const getThemeColor = () => {
    switch (type) {
      case 'warning':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', btn: 'bg-amber-600 hover:bg-amber-500' };
      case 'info':
        return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', btn: 'bg-blue-600 hover:bg-blue-500' };
      case 'danger':
      default:
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', btn: 'bg-red-600 hover:bg-red-500' };
    }
  };

  const theme = getThemeColor();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-[#0c0d16] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <RiCloseLine size={18} />
            </button>

            <div className="flex gap-4 items-start mt-2">
              <div className={`p-3 rounded-xl flex-shrink-0 ${theme.bg} ${theme.border} border`}>
                <RiAlertLine className={`text-xl ${theme.text}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer ${theme.btn}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
