export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  unit: string;
  created_at: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}
