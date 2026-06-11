'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { LocationPicker } from '@/components/location/LocationPicker';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { Product } from '@/types/product.types';
import { Package, MapPin, BadgeDollarSign, Info, PlusCircle } from 'lucide-react';
import { normaliseError } from '@/lib/utils/errors';

interface LocationOption {
  id: string;
  name: string;
  state: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export function SupplySubmitForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [locationId, setLocationId] = useState('');

  // Suggestion Modal State
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestCategory, setSuggestCategory] = useState('');
  const [suggestUnit, setSuggestUnit] = useState('Unit');

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

  // Fetch Categories for Suggestion Form
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to load categories');
        }
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSuggestCategory(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    fetchCategories();
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

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName || !suggestCategory) {
      toast.error('Product Name and Category are required');
      return;
    }

    setIsSuggesting(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestName,
          categoryId: suggestCategory,
          unit: suggestUnit,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit suggestion');
      }

      toast.success('Product suggestion submitted', {
        description: 'Administrators will review and approve your suggestion soon.',
      });
      setIsSuggestOpen(false);
      setSuggestName('');
      setSuggestUnit('Unit');
    } catch (err: any) {
      toast.error('Suggestion failed', { description: err.message });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="product_id" className="data-label flex items-center gap-2">
                    <Package className="size-3" aria-hidden="true" /> Product
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsSuggestOpen(true)}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 font-mono uppercase tracking-wider font-bold"
                  >
                    <PlusCircle className="size-3" aria-hidden="true" /> Suggest New
                  </button>
                </div>
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
                  <MapPin className="size-3" aria-hidden="true" /> Location
                </Label>
                <LocationPicker
                  id="location_id"
                  name="location_id"
                  required
                  value={locationId}
                  onChange={(val) => setLocationId(val)}
                  placeholder="Select State and Local Government Area"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="data-label flex items-center gap-2">
                  <BadgeDollarSign className="size-3" aria-hidden="true" /> Current Price (₦)
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
                  <Info className="size-3" aria-hidden="true" /> Available Quantity
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
              <Info className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your report will be cross-referenced with other seller data and pricing rules. 
                Accurate reporting helps keep market prices accurate and trustworthy for everyone.
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

      {/* Suggest Product Modal */}
      <Modal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        title="Suggest New Product"
        description="Recommend a new commodity to be added to the monitoring catalog. This suggestion will be visible to administrators for approval."
      >
        <form onSubmit={handleSuggestSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggest-name">Product Name</Label>
            <Input
              id="suggest-name"
              placeholder="e.g. Yellow Garri, Local Beans"
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggest-category">Category</Label>
            <Select
              id="suggest-category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={suggestCategory}
              onChange={(val) => setSuggestCategory(val)}
              placeholder="Select Category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggest-unit">Measurement Unit</Label>
            <Input
              id="suggest-unit"
              placeholder="e.g. 50kg bag, 1 Litre, Paint Bucket"
              value={suggestUnit}
              onChange={(e) => setSuggestUnit(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setIsSuggestOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSuggesting}>
              {isSuggesting ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
