import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { type Cupon } from "../interface/cuponInterface"; 

interface Props {
  cupones: Cupon[];
  onEdit: (cupon: Cupon) => void;
  onEliminar: (cupon: Cupon) => boolean | void;
  onToggleStatus: (cupon: Cupon) => void;
  loading: boolean;
}

const CuponesTable: React.FC<Props> = ({
  cupones,
  onEdit,
  onEliminar,
  onToggleStatus,
  loading,
}) => {
  const renderActions = (rowData: Cupon) => {
    const isActivo = rowData.estado === "activo";
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-text"
          onClick={() => onEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-text"
          onClick={() => onEliminar(rowData)}
        />
        <Button
          icon={isActivo ? "pi pi-lock-open" : "pi pi-lock"}
          className="p-button-sm p-button-text"
          style={{ color: isActivo ? "green" : "gray" }}
          onClick={() => onToggleStatus(rowData)}
          tooltip={isActivo ? "Inactivar" : "Activar"}
        />
      </div>
    );
  };

  if (loading) {
    const skeletonRows = Array(5).fill(null);

    return (
      <DataTable value={skeletonRows} responsiveLayout="scroll">
        <Column header="#" body={() => <Skeleton width="3rem" height="1.2rem" />} />
        <Column header="Título" body={() => <Skeleton width="10rem" height="1.2rem" />} />
        <Column header="Tipo de Aplicación" body={() => <Skeleton width="8rem" height="1.2rem" />} />
        <Column header="Inicio" body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Fin" body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Estado" body={() => <Skeleton width="5rem" height="1.2rem" />} />
        <Column header="Acciones" body={() => <Skeleton width="6rem" height="2rem" />} />
      </DataTable>
    );
  }

  const formatEstado = (estado?: string | number | boolean) => {
    if (estado === undefined || estado === null) return "-";
    const estadoStr = String(estado);
    return estadoStr.charAt(0).toUpperCase() + estadoStr.slice(1).toLowerCase();
  };

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
      <Column
        header="Estado"
        body={(rowData: Cupon) => formatEstado(rowData.estado)}
      />
      <Column header="Acciones" body={renderActions} />
    </DataTable>
  );
};

export default CuponesTable;
