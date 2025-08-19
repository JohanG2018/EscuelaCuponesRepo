import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";

// Códigos
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

type Setter =
  | Combinacion[]
  | ((prev: Combinacion[]) => Combinacion[]);

interface Props {
  combinaciones: Combinacion[];
  // Compatibilidad: aceptar array o updater funcional
  setCombinaciones: (rowsOrUpdater: Setter) => void;
  currency?: string;
  locale?: string;
  onRowDelete?: (row: Combinacion) => void;
}

// Mapeo a etiquetas legibles
const TIPO_LABEL: Record<TipoCombinacion, string> = {
  G: "Categoría",
  SG: "Subcategoría",
  P: "Proveedor",
  I: "Producto",
  M: "Mixto"
};

export default function TableCombinacionesComponent({
  combinaciones,
  setCombinaciones,
  currency = "USD",
  locale = "es-EC",
  onRowDelete
}: Props) {

  // Pequeño helper para resolver el setter a partir del estado actual
  const applySet = (updater: Setter) => {
    if (typeof updater === "function") {
      // delega al padre si ya envuelve funcionalmente,
      // o resuelve acá si el padre no lo hace.
      setCombinaciones((prev) => (updater as (p: Combinacion[]) => Combinacion[])(prev));
    } else {
      setCombinaciones(updater);
    }
  };

  // Genérica: actualiza un campo por key
  const updateField = (rowKey: string, field: keyof Combinacion, value: any) => {
    applySet((prev) =>
      prev.map((r) => (r.key === rowKey ? { ...r, [field]: value } : r))
    );
  };

  const onDelete = (row: Combinacion) => {
    applySet((prev) => prev.filter((r) => r.key !== row.key));
    onRowDelete?.(row);
  };

  // Templates
  const cantidadBody = (row: Combinacion) => (
    <InputNumber
      value={typeof row.cantidad === "number" ? row.cantidad : 0}
      onValueChange={(e) => updateField(row.key, "cantidad", e.value ?? 0)}
      showButtons
      min={0}
      inputClassName="w-24"
    />
  );

  const valorBody = (row: Combinacion) => (
    <InputNumber
      value={typeof row.valor === "number" ? row.valor : 0}
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

  const tipoBody = (row: Combinacion) => (
    <span className="px-2 py-1 rounded-md border text-sm">
      {TIPO_LABEL[row.tipo] ?? row.tipo}
    </span>
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
        <Column field="nombre" header="Nombre" style={{ width: "28%" }} />
        <Column header="Tipo" body={tipoBody} style={{ width: "18%" }} />
        <Column header="Cantidad" body={cantidadBody} style={{ width: "16%" }} />
        <Column header="Valor" body={valorBody} style={{ width: "16%" }} />
        <Column header="Combinada" body={combinadaBody} style={{ width: "11%" }} />
        <Column header="Excluida" body={excluidaBody} style={{ width: "11%" }} />
        <Column header="Acciones" body={accionesBody} style={{ width: "10%" }} />
      </DataTable>
    </div>
  );
}
