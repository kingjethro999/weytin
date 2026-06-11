'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LocationPicker } from '@/components/location/LocationPicker';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';
import { PlusCircle, Save } from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  unit: string | null;
}

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

interface PriceRuleItem {
  id: string;
  product_id: string;
  location_id: string;
  min_price: number;
  max_price: number;
  updated_at: Date | string;
  product: { name: string; unit: string | null };
  location: { name: string; state: string };
  updater: { email: string | null };
}

interface PriceRuleEditorProps {
  initialRules: PriceRuleItem[];
}

export function PriceRuleEditor({ initialRules }: PriceRuleEditorProps) {
  const [rules, setRules] = useState<PriceRuleItem[]>(initialRules);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (!isFormOpen || products.length > 0) return;
    setIsLoadingOptions(true);

    fetch('/api/products?limit=200')
      .then((r) => r.json())
      .then((prods) => {
        setProducts(Array.isArray(prods) ? prods : []);
      })
      .catch((err) => logger.error('[PriceRuleEditor] Failed to load options', { error: err.message }))
      .finally(() => setIsLoadingOptions(false));
  }, [isFormOpen, products.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !selectedLocation || !minPrice || !maxPrice) {
      toast.error('All fields are required');
      return;
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (isNaN(min) || isNaN(max) || min >= max) {
      toast.error('Min price must be less than max price');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct,
          location_id: selectedLocation,
          min_price: min,
          max_price: max,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save rule');
      }

      // Refresh the list from page
      toast.success('Price rule saved successfully');
      setIsFormOpen(false);
      setSelectedProduct('');
      setSelectedLocation('');
      setMinPrice('');
      setMaxPrice('');

      // Refetch to get updated list with relations
      const refreshed = await fetch('/api/prices/rules').then((r) => r.json());
      if (Array.isArray(refreshed)) {
        setRules(refreshed);
      }
    } catch (err: unknown) {
      const normalised = normaliseError(err);
      logger.error('[PriceRuleEditor] Save failed', { error: normalised.message });
      toast.error('Save failed', { description: normalised.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Rule Form */}
      <Card className="bg-card border-border/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              Price Rule Management
            </CardTitle>
            <CardDescription>
              Set acceptable min/max price bounds per product per location. Submitted prices outside these bounds will be auto-flagged.
            </CardDescription>
          </div>
          {!isFormOpen && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setIsFormOpen(true)}
            >
              <PlusCircle className="size-3.5" />
              Add Rule
            </Button>
          )}
        </CardHeader>

        {isFormOpen && (
          <CardContent className="border-t border-border/50 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-product">Product</Label>
                  <Select
                    id="rule-product"
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    disabled={isLoadingOptions}
                    placeholder={isLoadingOptions ? 'Loading…' : 'Select product'}
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.unit ?? 'unit'})`,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-location">Location</Label>
                  <LocationPicker
                    id="rule-location"
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Select State and Local Government Area"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-min">Minimum Price (₦)</Label>
                  <Input
                    id="rule-min"
                    type="number"
                    placeholder="e.g. 5000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-max">Maximum Price (₦)</Label>
                  <Input
                    id="rule-max"
                    type="number"
                    placeholder="e.g. 80000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSaving} size="sm" className="gap-2">
                  <Save className="size-3.5" />
                  {isSaving ? 'Saving…' : 'Save Rule'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Rules List */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>Active Price Bounds</CardTitle>
          <CardDescription>
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No price rules configured yet. Add a rule above to start enforcing price bounds.
            </p>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="rounded-md border border-border/60 bg-muted/40 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {rule.product.name}{' '}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({rule.product.unit ?? 'unit'})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rule.location.name}, {rule.location.state}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-data font-semibold">
                      ₦{rule.min_price.toLocaleString()}{' '}
                      <span className="text-muted-foreground">–</span>{' '}
                      ₦{rule.max_price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      by {rule.updater?.email ?? 'Admin'} •{' '}
                      {new Date(rule.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
