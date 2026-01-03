export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  options?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  products: CartItem[];
  total: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
}