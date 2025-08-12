import React from "react";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import type { Cupon } from "../components/CuponesTable";
import CuponesTable from "../components/CuponesTable";
import { useNavigate } from "react-router-dom";

// http://localhost/appdelportal/wp-json/delportal/v1/listado_cupones

const CuponesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [coupons, setCoupons] = useState<Cupon[]>([]);
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('http://localhost:8080/wordpress/wp-json/delportal/v1/listado_cupones/xml');
        const xmlText = await response.text();
        // Convertir XML a JSON (usando DOMParser)
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const items = Array.from(xml.getElementsByTagName('coupon'));
        const data = items.map((item) => ({
          id: parseInt(item.getElementsByTagName('id')[0].textContent ?? "0"),
          titulo: item.getElementsByTagName('title')[0].textContent ?? "",
          //estado: "activo",
            estado: item.getElementsByTagName('status')[0]?.textContent ?? "activo", // <-- cambia según tu XML real

          fechaInicio: item.getElementsByTagName('startDate')[0].textContent ?? "",
          fechaFin: item.getElementsByTagName('endDate')[0].textContent ?? "",
          //tipoAplicacion: item.getElementsByTagName('applicationType')[0].textContent ?? "",
            tipoAplicacion: item.getElementsByTagName('applicationType')[0]?.textContent ?? "General",

        }));
        setCoupons(data);
        console.log("Cupones:", data);
      } catch (error) {
        console.error("Error al traer los cupones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const onCrear = () => {
    navigate('/crear');
  };

  const onEditar = (cupon: Cupon) => {
    navigate(`/editar/${cupon.id}`);
  };

  const onEliminar = (cupon: Cupon) => {
    if (confirm(`¿Eliminar cupón "${cupon.titulo}"?`)) {
      setCoupons(prev => prev.filter(c => c.id !== cupon.id));
    }
  };
  const onToggleEstado = (cupon: Cupon) => {
    setCoupons(prev =>
      prev.map(c => {
        if (c.id === cupon.id) {
          // Intercambia entre activo e inactivo
          const nuevoEstado = cupon.estado === 'activo' ? 'inactivo' : 'activo';
          return { ...c, estado: nuevoEstado };
        }
        return c;
      })
    );
  };
  return (
    <>
      <div className="">
        <h1 className="text-center font-semibold text-2xl p-5 bg-[#9b0e0e] text-white">Administrador de cupones</h1>
        <div className="flex justify-between items-center p-5 ">
          <h2 className="text-xl font-semibold">Listado de Cupones</h2>
          <Button label="Crear cupón" icon="pi pi-plus" raised className="bg-[#ff2c2c] text-white p-2 hover:bg-[#8b1f1f]" onClick={onCrear} />
        </div>
        <div className="m-5">
          <CuponesTable cupones={coupons} onEdit={onEditar} onEliminar={onEliminar}  onToggleStatus={onToggleEstado} />
        </div>
      </div>
    </>
  )
}

export default CuponesPage; 