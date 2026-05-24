import React from 'react';
import { SupplySubmitForm } from '@/components/vendor/SupplySubmitForm';
import { Store, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubmitSupplyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-4">
        <Link 
          href="/vendor/listings" 
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="size-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          BACK TO LISTINGS
        </Link>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Supply</h1>
            <p className="text-muted-foreground">Market pricing and stock availability submission.</p>
          </div>
        </div>
      </header>

      <main>
        <SupplySubmitForm />
      </main>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Weytin Operations Console • Vendor Node
        </p>
      </footer>
    </div>
  );
}
