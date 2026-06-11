'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FlaggedItemRowProps {
  flag: {
    id: string;
    reason: string;
    created_at: Date | string;
    supply_entry: {
      price: number;
      product: { name: string; unit: string | null };
      location: { name: string; state: string };
      vendor: { email: string | null };
    };
  };
}

export function FlaggedItemRow({ flag }: FlaggedItemRowProps) {
  const [resolved, setResolved] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const res = await fetch('/api/prices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flag.id, resolved: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to resolve flag');
      }

      setResolved(true);
      toast.success('Flag resolved', {
        description: `Price anomaly for ${flag.supply_entry.product.name} marked as resolved.`,
      });
    } catch (err: unknown) {
      const normalised = normaliseError(err);
      logger.error('[FlaggedItemRow] Resolve failed', { flagId: flag.id, error: normalised.message });
      toast.error('Failed to resolve', { description: normalised.message });
    } finally {
      setIsResolving(false);
    }
  };

  if (resolved) {
    return (
      <div className="flex items-center gap-3 rounded border border-supply/20 bg-supply/5 p-4 opacity-60">
        <CheckCircle2 className="size-5 text-supply shrink-0" />
        <p className="text-sm text-muted-foreground">
          Flag for{' '}
          <span className="font-medium text-foreground">{flag.supply_entry.product.name}</span>{' '}
          — {flag.supply_entry.location.name} resolved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded border border-border/50 bg-secondary/10 p-4">
      <div className="flex gap-4">
        <div className="mt-0.5 size-10 rounded-full bg-unavailable/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-5 text-unavailable" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {flag.supply_entry.location.name},{' '}
            <span className="text-muted-foreground font-normal">
              {flag.supply_entry.location.state}
            </span>{' '}
            — {flag.supply_entry.product.name}{' '}
            <span className="text-muted-foreground text-xs">
              ({flag.supply_entry.product.unit ?? 'unit'})
            </span>
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Reported Price: ₦{Number(flag.supply_entry.price).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Vendor: {flag.supply_entry.vendor.email ?? 'Unknown'} •{' '}
            {new Date(flag.created_at).toLocaleString()}
          </p>
          <p className="text-[10px] font-data uppercase tracking-wider text-unavailable">
            {flag.reason}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 gap-2"
        onClick={handleResolve}
        disabled={isResolving}
      >
        <CheckCircle2 className="size-3.5" />
        {isResolving ? 'Resolving…' : 'Resolve'}
      </Button>
    </div>
  );
}
