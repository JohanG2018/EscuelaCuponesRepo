import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { Button } from "primereact/button";
import type { Cupon } from "../interface/cuponInterface";

interface Props {
  cupones: Cupon[];
  loading: boolean;
  onEdit: (cupon: Cupon) => void;
  onEliminar: (cupon: Cupon) => void;
  onToggleStatus: (cupon: Cupon) => void;
}

const CuponesTable: React.FC<Props> = ({
  cupones,
  loading,
  onEdit,
  onEliminar,
  onToggleStatus,
}) => {
  // Renderiza acciones normales cuando no está cargando
  const renderActions = (row: Cupon) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-text"
        onClick={() => onEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-text"
        onClick={() => onEliminar(row)}
      />
      <Button
        icon={row.estado === "activo" ? "pi pi-lock-open" : "pi pi-lock"}
        className="p-button-sm p-button-text"
        style={{ color: row.estado === "activo" ? "green" : "gray" }}
        onClick={() => onToggleStatus(row)}
      />
    </div>
  );

  if (loading) {
    // 5 filas fantasma
    const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: i }));

    return (
      <DataTable value={skeletonRows} responsiveLayout="scroll">
        <Column
          header="#"
          body={() => <Skeleton width="2rem" height="1.2rem" />}
        />
        <Column
          header="Título"
          body={() => <Skeleton width="8rem" height="1.2rem" />}
        />
        <Column
          header="Tipo de Aplicación"
          body={() => <Skeleton width="6rem" height="1.2rem" />}
        />
        <Column
          header="Inicio"
          body={() => <Skeleton width="6rem" height="1.2rem" />}
        />
        <Column
          header="Fin"
          body={() => <Skeleton width="6rem" height="1.2rem" />}
        />
        <Column
          header="Estado"
          body={() => <Skeleton width="4rem" height="1.2rem" />}
        />
        <Column
          header="Acciones"
          body={() => <Skeleton width="6rem" height="2rem" />}
        />
      </DataTable>
    );
  }

  return (
    <DataTable
      value={cupones}
      dataKey="id"
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 20]}
      responsiveLayout="scroll"
      emptyMessage="No hay cupones para mostrar."
    >
      <Column field="id" header="#" style={{ width: "3rem" }} />
      <Column field="titulo" header="Título" />
      <Column field="tipoAplicacion" header="Tipo de Aplicación" />
      <Column field="fechaInicio" header="Inicio" />
      <Column field="fechaFin" header="Fin" />
      <Column field="estado" header="Estado" />
      <Column header="Acciones" body={renderActions} />
    </DataTable>
  );
};

export default CuponesTable;
