import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import CuponesTable from "../components/CuponesTable";
import { fetchCupones } from "../service/cupon";
import type { Cupon } from "../components/CuponesTable";

const CuponesPage: React.FC = () => {
  const [cupons, setCupons] = useState<Cupon[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCupones({ signal: ctrl.signal });
        setCupons(data);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: err?.message || "No se pudo cargar el listado",
            life: 3000,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const onCrear = () => {
    navigate("/crear");
  };

  const onEditar = (cupon: Cupon) => {
    navigate(`/editar/${cupon.id}`);
  };

  const onEliminar = (cupon: Cupon) => {
    if (confirm(`¿Eliminar cupón "${cupon.titulo}"?`)) {
      setCupons(prev => prev.filter(c => c.id !== cupon.id));
    }
  };

  const onToggleEstado = (cupon: Cupon) => {
    setCupons(prev =>
      prev.map(c =>
        c.id === cupon.id
          ? { ...c, estado: c.estado === "activo" ? "inactivo" : "activo" }
          : c
      )
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <div>
        <h1 className="text-center font-semibold text-2xl p-5 bg-[#9b0e0e] text-white">
          Administrador de cupones
        </h1>
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-semibold">Listado de Cupones</h2>
          <Button
            label="Crear cupón"
            icon="pi pi-plus"
            raised
            className="bg-[#ff2c2c] text-white p-2 hover:bg-[#8b1f1f]"
            onClick={onCrear}
          />
        </div>
        <div className="m-5">
          <CuponesTable
            cupones={cupons}
            onEdit={onEditar}
            onEliminar={onEliminar}
            onToggleStatus={onToggleEstado}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default CuponesPage;
