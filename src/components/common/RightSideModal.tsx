import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface RightSideModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
  panelClassName?: string;
  bare?: boolean;
}

export const RightSideModal: React.FC<RightSideModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
  panelClassName,
  bare = false,
}) => {
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-slate-950/55 backdrop-blur-[2px] flex items-center justify-end p-3 sm:p-5 md:pl-[270px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-full min-w-0 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-right-4 duration-150',
          maxWidthClass,
          !bare &&
            'bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4',
          panelClassName
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
