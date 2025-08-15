export interface Cupon {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio: string; // 'YYYY-MM-DD'
  fechaFin: string;
  tipoAplicacion?: string;
  tipoAmbiente?: string;
  valorMinimo?: number;
  estado?: string;
}
