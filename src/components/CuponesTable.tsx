import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag"; // opcional para pintar el estado
import type { Cupon } from "../interface/cuponInterface";

interface Props {
  cupones: Cupon[];
  loading: boolean;
  onEdit: (cupon: Cupon) => void;
  onEliminar: (cupon: Cupon) => void;
  onToggleStatus: (cupon: Cupon) => void; // sigue igual
}

const isActivo = (estado: Cupon["estado"]) => {
  // normaliza cualquier forma
  if (typeof estado === "boolean") return estado;
  if (typeof estado === "number") return estado === 1;
  const s = String(estado).trim().toLowerCase();
  return s === "1" || s === "activo" || s === "true";
};

const estadoTexto = (estado: Cupon["estado"]) => (isActivo(estado) ? "Activo" : "Inactivo");

const CuponesTable: React.FC<Props> = ({
  cupones,
  loading,
  onEdit,
  onEliminar,
  onToggleStatus,
}) => {
  const renderActions = (row: Cupon) => {
    const activo = isActivo(row.estado);
    return (
      <div className="flex gap-2 items-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-text"
          onClick={() => onEdit(row)}
          aria-label="Editar cupón"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-text"
          onClick={() => onEliminar(row)}
          aria-label="Eliminar cupón"
        />
        <Button
          icon={activo ? "pi pi-lock-open" : "pi pi-lock"}
          className="p-button-sm p-button-text"
          style={{ color: activo ? "green" : "gray" }}
          onClick={() => onToggleStatus(row)} // el padre hace el toggle real
          tooltip={activo ? "Desactivar" : "Activar"}
          aria-label={activo ? "Desactivar cupón" : "Activar cupón"}
        />
      </div>
    );
  };

  const renderEstado = (row: Cupon) => (
    <Tag
      value={estadoTexto(row.estado)}
      severity={isActivo(row.estado) ? "success" : "danger"}
      rounded
    />
  );

  const renderFecha = (value: any) => {
    if (!value) return "";
    // si ya viene string "YYYY-MM-DD HH:mm:ss" lo mostramos tal cual o formateamos
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  };

  if (loading) {
    const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    return (
      <DataTable value={skeletonRows} responsiveLayout="scroll">
        <Column header="#" body={() => <Skeleton width="2rem" height="1.2rem" />} />
        <Column header="Título" body={() => <Skeleton width="8rem" height="1.2rem" />} />
        <Column header="Tipo de Aplicación" body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Inicio" body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Fin" body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Estado" body={() => <Skeleton width="4rem" height="1.2rem" />} />
        <Column header="Acciones" body={() => <Skeleton width="6rem" height="2rem" />} />
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
      <Column field="fechaInicio" header="Inicio" body={(row) => renderFecha(row.fechaInicio)} />
      <Column field="fechaFin" header="Fin" body={(row) => renderFecha(row.fechaFin)} />
      <Column header="Estado" body={renderEstado} />
      <Column header="Acciones" body={renderActions} />
    </DataTable>
  );
};

export default CuponesTable;
