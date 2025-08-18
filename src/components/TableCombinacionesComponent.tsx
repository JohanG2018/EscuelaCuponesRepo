import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";

export type TipoCombinacion = "G" | "SG" | "P" | "I" | "M";

export interface Combinacion {
  key: string;
  nombre: string;
  tipo: TipoCombinacion;
  cantidad: number;
  valor: number;
  combinada: boolean;
  excluida: boolean;
}

interface Props {
  combinaciones: Combinacion[];
  setCombinaciones: (rows: Combinacion[]) => void;
  currency?: string;
  locale?: string;
  onRowDelete?: (row: Combinacion) => void;
}

export default function TableCombinacionesComponent({
  combinaciones,
  setCombinaciones,
  currency = "USD",
  locale = "es-EC",
  onRowDelete
}: Props) {
  // Función genérica para actualizar un campo de una fila
  const updateField = (rowKey: string, field: keyof Combinacion, value: any) => {
    const actualizado = combinaciones.map((r) =>
      r.key === rowKey ? { ...r, [field]: value } : r
    );
    setCombinaciones(actualizado);
  };

  const onDelete = (row: Combinacion) => {
    const nuevo = combinaciones.filter((r) => r.key !== row.key);
    setCombinaciones(nuevo);
    onRowDelete?.(row);
  };

  // Templates de las columnas
  const cantidadBody = (row: Combinacion) => (
    <InputNumber
      value={row.cantidad ?? null}
      onValueChange={(e) => updateField(row.key, "cantidad", e.value ?? 0)}
      showButtons
      min={0}
      inputClassName="w-24"
    />
  );

  const valorBody = (row: Combinacion) => (
    <InputNumber
      value={row.valor ?? null}
      onValueChange={(e) => updateField(row.key, "valor", e.value ?? 0)}
      mode="currency"
      currency={currency}
      locale={locale}
      inputClassName="w-36"
    />
  );

  const combinadaBody = (row: Combinacion) => (
    <Checkbox
      checked={!!row.combinada}
      onChange={(e) => updateField(row.key, "combinada", !!e.checked)}
    />
  );

  const excluidaBody = (row: Combinacion) => (
    <Checkbox
      checked={!!row.excluida}
      onChange={(e) => updateField(row.key, "excluida", !!e.checked)}
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
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 25]}
      >
        <Column field="nombre" header="Nombre" style={{ width: "22%" }} />
        <Column field="tipo" header="Tipo" style={{ width: "18%" }} />
        <Column header="Cantidad" body={cantidadBody} style={{ width: "18%" }} />
        <Column header="Valor" body={valorBody} style={{ width: "18%" }} />
        <Column header="Combinada" body={combinadaBody} style={{ width: "12%" }} />
        <Column header="Excluida" body={excluidaBody} style={{ width: "12%" }} />
        <Column header="Acciones" body={accionesBody} style={{ width: "10%" }} />
      </DataTable>
    </div>
  );
}
