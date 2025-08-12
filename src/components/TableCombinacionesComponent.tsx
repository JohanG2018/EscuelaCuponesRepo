// src/components/TableCombinacionesComponent.tsx
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

export type TipoCombinacion =
  | "Categoria"
  | "Subcategoria"
  | "Proveedor"
  | "Producto";

export interface Combinacion {
  key: string;          
  nombre: string;      
  tipo: TipoCombinacion;
  cantidad: number;     
  valor: number;        
}

interface Props {
  combinaciones: Combinacion[];
  setCombinaciones: (rows: Combinacion[]) => void;
  currency?: string;  
  locale?: string;    
  onRowDelete?: (rowKey: Combinacion) => void;   
}

export default function TableCombinacionesComponent({
  combinaciones,
  setCombinaciones,
  currency = "USD",
  locale = "es-EC",
  onRowDelete
}: Props) {
  const onChangeCantidad = (rowKey: string, cantidad: number) => {
    setCombinaciones(
      combinaciones.map((r) => (r.key === rowKey ? { ...r, cantidad } : r))
    );
  };

  const onChangeValor = (rowKey: string, valor: number) => {
    setCombinaciones(
      combinaciones.map((r) => (r.key === rowKey ? { ...r, valor } : r))
    );
  };

  const onDelete = (row: Combinacion) => {
    setCombinaciones(combinaciones.filter(r => r.key !== row.key));
    onRowDelete?.(row); // 👈 avisa al padre
  };
  const cantidadBody = (row: Combinacion) => (
    <InputNumber
      value={row.cantidad}
      onValueChange={(e) => onChangeCantidad(row.key, e.value ?? 0)}
      showButtons
      min={0}
      inputClassName="w-24"
    />
  );

  const valorBody = (row: Combinacion) => (
    <InputNumber
      value={row.valor}
      onValueChange={(e) => onChangeValor(row.key, e.value ?? 0)}
      mode="currency"
      currency={currency}
      locale={locale}
      inputClassName="w-36"
    />
  );

  const accionesBody = (row: Combinacion) => (
    <Button
      icon="pi pi-trash"
      className="p-button-text p-button-danger"
      onClick={() => onDelete(row)}
      aria-label="Eliminar"
    />
  );
  return (
    <div className="card col-span-2">
      <DataTable
        value={combinaciones}
        dataKey="key"
        stripedRows
        className="mt-3"
        emptyMessage="No hay combinaciones agregadas."
        
      >
        <Column field="nombre" header="Nombre" style={{ width: "40%" }} />
        <Column field="tipo" header="Tipo" style={{ width: "20%" }} />
        <Column header="Cantidad" body={cantidadBody} style={{ width: "20%" }} />
        <Column header="Valor" body={valorBody} style={{ width: "20%" }} />
        <Column body={accionesBody} header="Acciones" style={{ width: "10rem" }} />
      </DataTable>
    </div>
  );
}
