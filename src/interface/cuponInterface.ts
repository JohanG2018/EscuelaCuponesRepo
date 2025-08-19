export interface Local {
  id: string | number;
  local: string;
  establecimiento?: string;
  almacen?: string;
  nombre?: string;
}

export interface Producto {
  itemid: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  proveedor: string;
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

export interface Cupon {
  id: number;
  titulo: string;
  descripcion: string;
  descripcionTicket: string;
  textoLegal: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  estado: boolean | number | string;
  tipoAplicacion: string;
  valorMinimo: number;
  esRecurrente: boolean | number | string;
  idTipoFormato: number | string;
  logo: File | null;
  nombreLogo: string;
  tipoAmbiente: string;
  esConsumidorFinal: boolean | number | string;
  aplicaLocales: boolean | number | string;
  combinarCondiciones: boolean | number | string;
  cantidadProductos: number | string;
  criterio:string;
  formatoLogo:string
  legal:string
  factura:boolean
  locales: Local[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  productos: Producto[];
  productosExcluidos: Producto[];
  proveedores: Proveedor[];

  // Tabla
  combinaciones: Combinacion[];
}


export interface Combinacion {
  excluida: boolean;
  key: string;
  nombre: string;
  tipo: string;
  valor: number;
  cantidad: number;
}
