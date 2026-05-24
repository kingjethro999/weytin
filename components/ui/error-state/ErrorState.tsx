'use client';

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { AppError } from '@/lib/utils/errors';

interface ErrorStateProps {
  error: AppError | string | null;
  reset?: () => void;
  className?: string;
  title?: string;
}

export function ErrorState({ 
  error, 
  reset, 
  className,
  title = 'Something went wrong' 
}: ErrorStateProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-unavailable/20 bg-unavailable/5',
        className
      )}
    >
      <div className="size-12 rounded-full bg-unavailable/10 flex items-center justify-center mb-4">
        <AlertCircle className="size-6 text-unavailable" />
      </div>
      
      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-6">
        {message}
      </p>

      {reset && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={reset}
          className="gap-2"
        >
          <RefreshCcw className="size-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
