'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={cn(
        "relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-200",
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
