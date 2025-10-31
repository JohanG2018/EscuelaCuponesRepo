import type { Local } from "./Local";
import type { Categoria, Producto, Subcategoria } from "./Producto";
import type { Proveedor } from "./Proveedor";

export type TipoCombinacion = "G" | "SG" | "P" | "I" | "M";

export interface Combinacion {
  itemId?: any;
  excluida?: boolean | string;
  key: string;
  nombre: string;
  tipo: TipoCombinacion;
  valor: number;
  cantidad: number;
  combinada?: boolean | string;
}
export interface Cupon {
  id: number | string;
  titulo: string;
  descripcion: string;
  descripcionTicket: string;
  textoLegal: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  estado: boolean;
  tipoAplicacion: string;
  valorMinimo: number;
  esRecurrente: boolean;
  idTipoFormato: number | string;
  logo: File | string;
  nombreLogo: string;
  tipoAmbiente: string;
  esConsumidorFinal: boolean;
  aplicaLocales: boolean;
  combinarCondiciones: boolean;
  cantidadProductos: number;
  criterio: boolean;
  formatoLogo: string


  datosCliente: boolean,

  locales: Local[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  productos: Producto[];
  productosExcluidos: Producto[];
  proveedores: Proveedor[];
  combinaciones: Combinacion[];
}


