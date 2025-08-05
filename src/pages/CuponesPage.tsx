import React from "react";
import { useState } from "react";
import { Button } from "primereact/button";
import type { Cupon } from "../components/CuponesTable";
import CuponesTable from "../components/CuponesTable";

const CuponesPage: React.FC = () => {
    const [cupones, setCupones] = useState<Cupon[]>([
        {
            id: 1,
            index: 1,
            titulo: "Descuento del 20%",
            estado: "activo",
            fechaInicio: "2023-10-01",
            fechaFin: "2023-10-31",
            tipoAplicacion: "General"
        },
        {
            id: 2,
            index: 2,
            titulo: "Compra 1 y lleva 1 gratis",
            estado: "inactivo",
            fechaInicio: "2023-11-01",
            fechaFin: "2023-11-30",
            tipoAplicacion: "por mecanica"
        }
    ]);
    const onCrear = () => {
    alert('Crear nuevo cupón');
  };

  const onEditar = (cupon: Cupon) => {
    alert(`Editar cupón: ${cupon.titulo}`);
  };

  const onEliminar = (cupon: Cupon) => {
    if (confirm(`¿Eliminar cupón "${cupon.titulo}"?`)) {
      setCupones(prev => prev.filter(c => c.id !== cupon.id));
    }
  };

    return (
        <>  
            <div className="p-5">
                <h1 className="text-center">Administrador de cupones</h1>
      <div className="flex justify-between items-center  mb-4 ">
        <h2 className="text-xl font-semibold">Listado de Cupones</h2>
        <Button label="Crear cupón" icon="pi pi-plus" className="p-button-sm" onClick={onCrear} />
      </div>
      <div className="m-20">
         <CuponesTable cupones={cupones} onEdit={onEditar} onDelete={onEliminar} />
      </div>
    </div>
        </>
    )
}

export default CuponesPage;