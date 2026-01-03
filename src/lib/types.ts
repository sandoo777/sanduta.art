export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

export interface Order {
  id: number;
  products: Product[];
  total: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
}