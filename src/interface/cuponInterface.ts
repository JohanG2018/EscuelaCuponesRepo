export type TipoCombinacion = "G" | "SG" | "P" | "I" | "M";

export interface Local {
  id?: string | number;
  local?: string;
  establecimiento?: string;
  almacen?: string;
  nombre?: string;
  activo?: string | boolean
}

export interface Producto {
  itemid: string;
  nombre: string;
  categoria?: string;
  subcategoria?: string;
  proveedor?: string;
}

export interface Proveedor {
  id: string;
  name: string;
  grupo?: string;
  alias?: string;
}

export interface Categoria {
  id: string;
  name: string;
}
export interface Subcategoria {
  id: string;
  name: string;
}
export interface Combinacion {
  itemId?: any;
  excluida?: boolean | string;
  key: string;
  nombre: string;
  tipo: TipoCombinacion;
  valor: number;
  cantidad: number;
  combinada?:boolean | string;
}


export interface Cupon {
  id: number | string;
  titulo: string;
  descripcion: string;
  descripcionTicket: string;
  textoLegal: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  estado: boolean | number | string;
  tipoAplicacion: string;
  valorMinimo: number |string;
  esRecurrente: boolean | string;
  idTipoFormato: number | string;
  logo: File | string;
  nombreLogo: string;
  tipoAmbiente: string;
  esConsumidorFinal: boolean | string;
  aplicaLocales: boolean | string;
  combinarCondiciones: boolean | string;
  cantidadProductos: number | string;
  criterio:boolean | string;
  
  formatoLogo:string
  legal:string
  factura:boolean
    datosCliente: false,           

  locales: Local[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  productos: Producto[];
  productosExcluidos: Producto[];
  proveedores: Proveedor[];
  combinaciones: Combinacion[];
}


