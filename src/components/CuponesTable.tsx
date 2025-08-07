import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";


export interface Cupon {
    id: number;
    index?: number; 
    titulo: string;
    estado: 'activo' | 'inactivo';
    fechaInicio: string;
    fechaFin: string;
    tipoAplicacion: 'General' | 'por mecanica';
}
interface Props {
    cupones: Cupon[];
    onEdit: (cupon: Cupon) => void;
    onStatus: (cupon: Cupon) => boolean | void;
}
const CuponesTable: React.FC<Props> = ({ cupones, onEdit, onStatus }) => {
    const actionTemplate = (rowData: Cupon) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-sm p-button-text" onClick={() => onEdit(rowData)}></Button>
                <Button icon="pi pi-lock" className="p-button-sm p-button-text" onClick={() => onStatus(rowData)}></Button>
            </div>
        );
    }
    return (
            <>    
            <DataTable value={cupones}
                paginator rows={5}
                rowsPerPageOptions={[5,10,20]} 
                responsiveLayout="scroll" >
                <Column field="index"  header="#" />
                <Column  field="titulo" header="Titulo"  />
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