'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { Product } from '@/types/product.types';
import { Package, MapPin, BadgeDollarSign, Info } from 'lucide-react';
import { normaliseError } from '@/lib/utils/errors';

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

export function SupplySubmitForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/locations?limit=100');
        if (!response.ok) {
          throw new Error('Failed to load locations');
        }
        const data = (await response.json()) as LocationOption[];
        setLocations(data);
      } catch (error: unknown) {
        const normalised = normaliseError(error);
        logger.error('[Vendor] Failed to load locations', { error: normalised.message });
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      product_id: formData.get('product_id'),
      location_id: formData.get('location_id'),
      price: parseFloat(formData.get('price') as string),
      quantity: Number(formData.get('quantity')),
    };

    try {
      const response = await fetch('/api/supply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit supply');
      }

      toast.success('Supply report submitted successfully');
      router.push('/vendor/listings');
      router.refresh();
    } catch (error: unknown) {
      const normalised = normaliseError(error);
      logger.error('[Vendor] Form submission failed', { error: normalised.message });
      toast.error('Submission failed', {
        description: normalised.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">New Supply Report</CardTitle>
        <CardDescription>
          Report current pricing and availability for a product in a specific location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product_id" className="data-label flex items-center gap-2">
                <Package className="size-3" /> Product
              </Label>
              <Select
                id="product_id"
                name="product_id"
                required
                disabled={isLoadingProducts}
                placeholder={isLoadingProducts ? 'Loading products…' : 'Select a product'}
                options={products.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.unit})`,
                }))}
              />
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location_id" className="data-label flex items-center gap-2">
                <MapPin className="size-3" /> Location
              </Label>
              <Select
                id="location_id"
                name="location_id"
                required
                disabled={isLoadingLocations}
                placeholder={isLoadingLocations ? 'Loading locations…' : 'Select a location'}
                options={locations.map((loc) => ({
                  value: loc.id,
                  label: `${loc.name}, ${loc.state}`,
                }))}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="data-label flex items-center gap-2">
                <BadgeDollarSign className="size-3" /> Current Price (₦)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                required
                className="bg-background/50 font-mono"
              />
            </div>

            {/* Quantity/Stock */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="data-label flex items-center gap-2">
                <Info className="size-3" /> Available Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="e.g. 120"
                required
                className="bg-background/50 font-data"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
            <Info className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your report will be cross-referenced with other vendor data and automated price rules. 
              Accurate reporting helps maintain platform integrity and vendor reputation.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
