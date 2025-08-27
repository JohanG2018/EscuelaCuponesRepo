export interface Producto {
  itemid: string;
  nombre: string;
  categoria?: string;
  subcategoria?: string;
  proveedor?: string;

}
export interface Categoria {
  id: string;
  name: string;
}
export interface Subcategoria {
  id: string;
  name: string;
}