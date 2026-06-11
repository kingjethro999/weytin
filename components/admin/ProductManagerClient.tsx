'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Filter, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  unit: string | null;
  approved: boolean;
  suggestedBy: string | null;
  createdAt: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductManagerClientProps {
  initialProducts: ProductItem[];
  categories: CategoryOption[];
}

export function ProductManagerClient({
  initialProducts,
  categories,
}: ProductManagerClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unit: 'Unit',
  });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.slug.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && product.approved) || 
      (statusFilter === 'pending' && !product.approved);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Action Handlers
  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve product');
      }

      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, approved: true } : p)));
      toast.success('Product suggestion approved successfully');
      router.refresh();
    } catch (err: any) {
      toast.error('Approval failed', { description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
      router.refresh();
    } catch (err: any) {
      toast.error('Deletion failed', { description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast.error('Name and Category are required');
      return;
    }

    setIsProcessing('create');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create product');
      }

      const newProduct = await res.json();
      setProducts((prev) => [newProduct, ...prev]);
      toast.success('Product created successfully');
      setIsAddOpen(false);
      setFormData({ name: '', categoryId: '', unit: 'Unit' });
      router.refresh();
    } catch (err: any) {
      toast.error('Creation failed', { description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    setIsProcessing('update');
    try {
      const res = await fetch(`/api/products/${currentProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          categoryId: formData.categoryId,
          unit: formData.unit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product');
      }

      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === currentProduct.id ? updated : p)));
      toast.success('Product updated successfully');
      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const openEdit = (product: ProductItem) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      unit: product.unit || 'Unit',
    });
    setIsEditOpen(true);
  };

  const openAdd = () => {
    setFormData({ name: '', categoryId: categories[0]?.id || '', unit: 'Unit' });
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage standardized items, edit units, and approve vendor suggestions.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 shrink-0">
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search products or slugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/40"
          />
        </div>

        {/* Category Selector */}
        <div>
          <Select 
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name }))
            ]}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            placeholder="Filter Category"
          />
        </div>

        {/* Approval Segmented Tabs */}
        <div className="flex border border-border rounded-md overflow-hidden bg-background/20 h-9">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 text-xs font-medium px-2 transition-colors ${statusFilter === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`flex-1 text-xs font-medium px-2 transition-colors border-x border-border ${statusFilter === 'approved' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 text-xs font-medium px-2 transition-colors ${statusFilter === 'pending' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Info callout on suggestions */}
      {products.some(p => !p.approved) && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <span className="font-bold text-amber-500">Unapproved Suggestions:</span> Vendors can only submit supply reports for products once they are marked as approved. Unapproved products are hidden from supply submit forms.
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="rounded-lg border border-border/50 bg-card/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Measurement Unit</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-foreground">{product.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{product.slug}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="font-normal">
                        {product.category?.name || 'Unassigned'}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {product.unit || '—'}
                    </td>
                    <td className="p-4">
                      {product.approved ? (
                        <Badge variant="supply" className="text-[10px] font-mono uppercase">
                          Approved
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-amber-500/5 text-amber-500 border-amber-500/20">
                            Suggested
                          </Badge>
                          {product.suggestedBy && (
                            <div className="text-[9px] text-muted-foreground leading-none font-mono">
                              By: {product.suggestedBy}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!product.approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(product.id)}
                            disabled={isProcessing !== null}
                            className="h-8 text-supply border-supply/20 hover:bg-supply/10 hover:text-supply"
                          >
                            <Check className="size-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(product)}
                          disabled={isProcessing !== null}
                          className="size-8"
                          title="Edit Product"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                          disabled={isProcessing !== null}
                          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Product"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
                    No products found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Standard Product"
        description="Define a new standard commodity for the monitoring catalog."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name"
              placeholder="e.g. Local White Garri"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={formData.categoryId}
              onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
              placeholder="Select Category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Measurement Unit</Label>
            <Input 
              id="unit"
              placeholder="e.g. 50kg bag, 1 Litre, Paint Bucket"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing === 'create'}>
              {isProcessing === 'create' ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Product Details"
        description="Update standard catalog properties for this product."
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Product Name</Label>
            <Input 
              id="edit-name"
              placeholder="e.g. Local White Garri"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-categoryId">Category</Label>
            <Select
              id="edit-categoryId"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={formData.categoryId}
              onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-unit">Measurement Unit</Label>
            <Input 
              id="edit-unit"
              placeholder="e.g. 50kg bag, 1 Litre, Paint Bucket"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing === 'update'}>
              {isProcessing === 'update' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
