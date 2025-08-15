import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";

export type TipoCombinacion = "Categoria" | "Subcategoria" | "Proveedor" | "Producto";

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
  setCombinaciones: (rows: Combinacion[] | ((prev:Combinacion[])=>Combinacion[])) => void;
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
  // ---------- helpers de actualización ----------

  const onChangeCantidad = (rowKey: string, cantidad: number) => {
  setCombinaciones((prev) =>
    prev.map((r) => (r.key === rowKey ? { ...r, cantidad } : r))
  );
};

const onChangeValor = (rowKey: string, valor: number) => {
  setCombinaciones((prev) =>
    prev.map((r) => (r.key === rowKey ? { ...r, valor } : r))
  );
};

const onChangeCombinada = (rowKey: string, checked: boolean) => {
  setCombinaciones((prev) =>
    prev.map((r) => (r.key === rowKey ? { ...r, combinada: checked } : r))
  );
};

const onChangeExcluida = (rowKey: string, checked: boolean) => {
  setCombinaciones((prev) =>
    prev.map((r) => (r.key === rowKey ? { ...r, excluida: checked } : r))
  );
};

const onDelete = (row: Combinacion) => {
  setCombinaciones((prev) => prev.filter((r) => r.key !== row.key));
  onRowDelete?.(row);
};


  const cantidadBody = (row: Combinacion) => (
  <InputNumber
    value={typeof row.cantidad === "number" ? row.cantidad : 0}
    onValueChange={(e) => onChangeCantidad(row.key, e.value ?? 0)}
    showButtons
    min={0}
    inputClassName="w-24"
  />
)
  const valorBody = (row: Combinacion) => (
  <InputNumber
    value={typeof row.valor === "number" ? row.valor : 0}
    onValueChange={(e) => onChangeValor(row.key, e.value ?? 0)}
    mode="currency"
    currency={currency}
    locale={locale}
    inputClassName="w-36"
  />
)

const combinadaBody = (row: Combinacion) => (
  <Checkbox
    checked={!!row.combinada}
    onChange={(e: any) => onChangeCombinada(row.key, !!e.checked)}
  />
);

const excluidaBody = (row: Combinacion) => (
  <Checkbox
    checked={!!row.excluida}
    onChange={(e: any) => onChangeExcluida(row.key, !!e.checked)}
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
        rowsPerPageOptions={[5,10,20,25]}
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
