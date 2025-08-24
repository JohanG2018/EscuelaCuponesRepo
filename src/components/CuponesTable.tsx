import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import type { Cupon } from "../interface/cuponInterface";

interface Props {
  cupones: Cupon[];
  loading: boolean;
  onEdit: (cupon: Cupon) => void;
  onEliminar: (cupon: Cupon) => void;
  onToggleStatus: (cupon: Cupon) => void;
}

const isActivo = (estado: Cupon["estado"]) => {
  if (typeof estado === "boolean") return estado;
  if (typeof estado === "number") return estado === 1;
  const s = String(estado).trim().toLowerCase();
  return s === "1" || s === "activo" || s === "true";
};

const estadoTexto = (estado: Cupon["estado"]) => (isActivo(estado) ? "Activo" : "Inactivo");

const parseDate = (v: any): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Retorna true si el intervalo [a1,a2] (del cupón) INTERSECA
 * con el intervalo [b1,b2] (filtro del usuario)
 */
const rangesIntersect = (a1: Date | null, a2: Date | null, b1: Date | null, b2: Date | null) => {
  if (!b1 && !b2) return true; // sin filtro, siempre pasa
  if (!a1 && !a2) return false; // cupón sin fechas válidas, no lo consideramos
  const startA = a1 ?? a2!;
  const endA = a2 ?? a1!;
  const startB = b1 ?? b2!;
  const endB = b2 ?? b1!;
  return startA <= endB && endA >= startB;
};

const CuponesTable: React.FC<Props> = ({
  cupones,
  loading,
  onEdit,
  //onEliminar,
  onToggleStatus,
}) => {
  // --- Estados de filtros ---
  const [qTitulo, setQTitulo] = useState<string>("");
  const [rangoFechas, setRangoFechas] = useState<[Date | null, Date | null] | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activo" | "inactivo">("todos");

  const renderActions = (row: Cupon) => {
    const activo = isActivo(row.estado);
    return (
      <div className="flex gap-2 items-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-text"
          onClick={() => onEdit(row)}
          style={{ color: "yellow" }}
          aria-label="Editar cupón"
          tooltip="Editar"
        />
        {/* 
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-text"
          onClick={() => onEliminar(row)}
          style={{ color: "red" }}
          aria-label="Eliminar cupón"
          tooltip="Eliminar"
        /> */}
        <Button
          icon={activo ? "pi-power-on" : "pi-power-off"}
          className="p-button-sm p-button-text"
          style={{ color: activo ? "green" : "yellowgreen" }}
          onClick={() => onToggleStatus(row)}
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
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  };

  // --- Header con filtros ---
  const header = (
    <>
    <div className="card flex flex-col md:flex-row gap-3">
  {/* Buscar por título */}
  <div className="p-inputgroup flex-1">
    <InputText
      value={qTitulo}
      onChange={(e) => setQTitulo(e.target.value)}
      placeholder="Buscar por título"
    />
      </div>

  {/* Filtrar por fechas */}
  <div className="p-inputgroup flex-1">
    
    <Calendar
      value={rangoFechas as any}
      onChange={(e) => setRangoFechas(e.value as [Date | null, Date | null] | null)}
      selectionMode="range"
      dateFormat="dd/mm/yyyy"
      placeholder="Rango de fechas"
      className="w-full"
      
    />
  </div>

  {/* Filtrar por estado */}
  <div className="p-inputgroup flex-1">
    
    <Dropdown
      value={estadoFiltro}
      onChange={(e) => setEstadoFiltro(e.value)}
      options={[
        { label: "Todos", value: "todos" },
        { label: "Activo", value: "activo" },
        { label: "Inactivo", value: "inactivo" },
      ]}
      className="w-full"
    />
  </div>
</div>
    </>  
   

  );

  // --- Aplicar filtros antes de renderizar ---
  const listaFiltrada = useMemo(() => {
    const [desde, hasta] = rangoFechas ?? [null, null];

    return (cupones || []).filter((c) => {
      // Título
      const tituloOk =
        !qTitulo?.trim() ||
        String(c.titulo ?? "")
          .toLowerCase()
          .includes(qTitulo.trim().toLowerCase());

      // Estado
      const activo = isActivo(c.estado);
      const estadoOk =
        estadoFiltro === "todos" ||
        (estadoFiltro === "activo" && activo) ||
        (estadoFiltro === "inactivo" && !activo);

      // Fechas (intersección de intervalos)
      const ci = parseDate(c.fechaInicio);
      const cf = parseDate(c.fechaFin);
      const fechasOk = rangesIntersect(ci, cf, desde, hasta);

      return tituloOk && estadoOk && fechasOk;
    });
  }, [cupones, qTitulo, rangoFechas, estadoFiltro]);
  
  // --- Skeleton mientras carga ---
  if (loading) {
    const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    return (
      <DataTable value={skeletonRows} responsiveLayout="scroll" header={header}>
        <Column header="#" align={"center"} body={() => <Skeleton width="2rem" height="1.2rem" />} />
        <Column header="Título" align={"center"} body={() => <Skeleton width="8rem" height="1.2rem" />} />
        <Column header="Tipo de Aplicación" align={"center"} body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Inicio" align={"center"} body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Fin" align={"center"} body={() => <Skeleton width="6rem" height="1.2rem" />} />
        <Column header="Estado" align={"center"} body={() => <Skeleton width="4rem" height="1.2rem" />} />
        <Column header="Acciones" align={"center"} body={() => <Skeleton width="6rem" height="2rem" />} />
      </DataTable>
    );
  }

  return (
    <DataTable
      value={listaFiltrada}
      dataKey="id"
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 20]}
      header={header}
      emptyMessage="No hay cupones para mostrar."
      responsiveLayout="scroll"
    >
      <Column field="id" header="#" align={"center"} />
      <Column field="titulo" header="Título" align={"center"} />
      <Column field="tipoAplicacion" header="Tipo de Aplicación" align={"center"} />
      <Column field="fechaInicio" header="Inicio" align={"center"} body={(row) => renderFecha(row.fechaInicio)} />
      <Column field="fechaFin" header="Fin" align={"center"} body={(row) => renderFecha(row.fechaFin)} />
      <Column header="Estado" align={"center"} body={renderEstado} />
      <Column header="Acciones" align={"center"} body={renderActions} />
    </DataTable>
  );
};

export default CuponesTable;
