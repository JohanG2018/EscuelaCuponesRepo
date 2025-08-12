import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";


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
}
const CuponesTable: React.FC<Props> = ({ cupones, onEdit, onEliminar, onToggleStatus }) => {
    const toggleStatus = (cupon: Cupon) => {
        const nuevoEstado = cupon.estado === "activo" ? "inactivo" : "activo";
        const actualizado = { ...cupon, estado: nuevoEstado };
        onEdit(actualizado);
    }
    const actionTemplate = (rowData: Cupon) => {
        const isActivo = rowData.estado === "activo";
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-sm p-button-text" onClick={() => onEdit(rowData)}></Button>
                <Button icon="pi pi-trash" className="p-button-sm p-button-text" onClick={() => onEliminar(rowData)}></Button>
                <Button
                    icon={isActivo ? 'pi pi-lock-open' : 'pi pi-lock'}
                    className="p-button-sm p-button-text"
                    style={{ color: isActivo ? 'green' : 'gray' }}
                    onClick={() => onToggleStatus(rowData)}
                    tooltip={isActivo ? 'Inactivar' : 'Activar'}
                />

            </div>
        );
    }
    return (
        <>
            <DataTable value={cupones}
                dataKey={"id"}
                paginator rows={5}
                rowsPerPageOptions={[5, 10, 20]}
                responsiveLayout="scroll" >
                <Column field="id" header="#" />
                <Column field="titulo" header="Titulo" />
                <Column field="tipoAplicacion" header="Tipo de Aplicación" />
                <Column field="fechaInicio" header="Inicio" />
                <Column field="fechaFin" header="Fin" />
                <Column field="estado" header="Estado" />
                <Column header="Acciones" body={actionTemplate} style={{ width: '150px' }} />
            </DataTable>
        </>


    )
}
export default CuponesTable;