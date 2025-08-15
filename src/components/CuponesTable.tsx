import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";

export interface Cupon {
    id: number;
    titulo: string;
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
    tipoAplicacion?: string;
}

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
                <Button icon="pi pi-pencil" className="p-button-sm p-button-text" onClick={() => onEdit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-sm p-button-text" onClick={() => onEliminar(rowData)} />
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

    //  Render tabla con Skeleton
    if (loading) {
        const skeletonRows = Array(5).fill({});

        return (
            <DataTable value={skeletonRows} responsiveLayout="scroll">
                <Column header="#" body={() => <Skeleton width="50px" height="1.2rem" />} />
                <Column header="Título" body={() => <Skeleton width="100%" height="1.2rem" />} />
                <Column header="Tipo de Aplicación" body={() => <Skeleton width="100%" height="1.2rem" />} />
                <Column header="Inicio" body={() => <Skeleton width="100px" height="1.2rem" />} />
                <Column header="Fin" body={() => <Skeleton width="100px" height="1.2rem" />} />
                <Column header="Estado" body={() => <Skeleton width="80px" height="1.2rem" />} />
                <Column header="Acciones" body={() => <Skeleton width="100px" height="2rem" />} />
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
            <Column field="id" header="#" />
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
