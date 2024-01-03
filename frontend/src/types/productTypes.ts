export interface Product {
  pages: any;
  id: number;
  category: string;
  title: string;
  description: string;
  price: number;
  texture: string;
  wash: string;
  place: string;
  note: string;
  story: string;
  colors: Color[];
  sizes: string[];
  variants: Variant[];
  main_image: string;
  images: string[] | null;
}
export interface Color {
  code: string;
  name: string;
}
export interface Variant {
  color_code: string;
  size: string;
  stock: number;
}
