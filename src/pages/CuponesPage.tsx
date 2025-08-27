import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useLocation, useNavigate } from "react-router-dom";
import CuponesTable from "../components/CuponesTable";
import { cambiarEstadoCupon, fetchCupones } from "../service/cupon";
import type { Cupon } from "../interface/cuponInterface"; 

const CuponesPage: React.FC = () => {
  const [cupons, setCupons] = useState<Cupon[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
   const location = useLocation();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCupones();
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
  
   useEffect(() => {
  const successMsg = location.state?.success;
  if (!successMsg) return;

  toast.current?.show({
    severity: "success",
    summary: "Éxito",
    detail: successMsg,
    life: 3000,
  });

  // Reemplazar con location limpia SIN state
  navigate(location.pathname, { replace: true, state: {} });
}, [location]);

  const onCrear = () => {
    navigate("/admin/cupon/form");
  };

  const onEditar = (cupon: Cupon) => {
    navigate(`/admin/cupon/form?id=${cupon.id}`);
  };

  const onEliminar = (cupon: Cupon) => {
    if (confirm(`¿Eliminar cupón "${cupon.titulo}"?`)) {
      setCupons(prev => prev.filter(c => c.id !== cupon.id));
    }
  };
  const isActivo = (estado: Cupon["estado"]) => {
  if (typeof estado === "boolean") return estado;
  if (typeof estado === "number") return estado === 1;
  const s = String(estado).trim().toLowerCase();
  return s === "1" || s === "activo" || s === "true";
};

 const onToggleEstado = async (cupon: Cupon) => {
  const actual = isActivo(cupon.estado);
  const next = !actual;

  const prev = cupons;
  setCupons((list) =>
    list.map((c) =>
      c.id === cupon.id ? { ...c, estado: next ? 1 : 0 } : c
    )
  );
  try {
    await cambiarEstadoCupon(cupon.id, next);
    toast.current?.show({
      severity: "success",
      summary: "Estado actualizado",
      detail: `El cupón ahora está ${next ? "Activo" : "Inactivo"}.`,
      life: 2500,
    });
  } catch (err: any) {
    // revertir si falla
    setCupons(prev);
    toast.current?.show({
      severity: "error",
      summary: "No se pudo cambiar el estado",
      detail: err?.message ?? "Error desconocido",
      life: 3500,
    });
  }
};

  return (
    <>
      <Toast ref={toast} />
      <div>
        <h1 className="text-center font-semibold text-2xl p-5 bg-[#124f26] text-white">
          Administrador de cupones
        </h1>
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-semibold">Listado de Cupones</h2>
          <Button
            label="Crear cupón"
            icon="pi pi-plus"
            raised
            className="bg-green-500 text-white p-2 hover:bg-green-600"
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
