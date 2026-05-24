'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Building2, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface VendorApprovalRowProps {
  vendor: {
    id: string;
    email: string;
    business_name: string | null;
    location_id: string | null;
    created_at: string;
  };
}

export function VendorApprovalRow({ vendor }: VendorApprovalRowProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleAction = async (status: 'verified' | 'rejected') => {
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      toast.success(`Vendor ${status === 'verified' ? 'approved' : 'rejected'}`);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded bg-muted flex items-center justify-center">
          <Building2 className="size-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold">{vendor.business_name || 'Unnamed Business'}</h4>
            <Badge variant="outline" className="text-[10px] font-mono uppercase bg-amber-500/5 text-amber-500 border-amber-500/20">
              PENDING
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
            <span className="flex items-center gap-1"><Mail className="size-2.5" /> {vendor.email}</span>
            <span className="flex items-center gap-1"><MapPin className="size-2.5" /> {vendor.location_id || 'Global'}</span>
            <span>Joined: {new Date(vendor.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-unavailable hover:bg-unavailable/10 hover:text-unavailable border-unavailable/20"
          onClick={() => handleAction('rejected')}
          disabled={isProcessing}
        >
          <X className="size-3.5 mr-1.5" /> Reject
        </Button>
        <Button 
          size="sm" 
          className="h-8 bg-supply hover:bg-supply/90 text-white"
          onClick={() => handleAction('verified')}
          disabled={isProcessing}
        >
          <Check className="size-3.5 mr-1.5" /> Approve
        </Button>
      </div>
    </div>
  );
}
