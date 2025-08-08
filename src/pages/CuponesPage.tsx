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
        const response = await fetch('http://localhost/appdelportal/wp-json/delportal/v1/listado_cupones/xml');
        const xmlText = await response.text();
        // Convertir XML a JSON (usando DOMParser)
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const items = Array.from(xml.getElementsByTagName('coupon'));
        const data = items.map((item) => ({
          id: parseInt(item.getElementsByTagName('id')[0].textContent ?? "0"),
          titulo: item.getElementsByTagName('title')[0].textContent ?? "",
          //estado: "activo",
          fechaInicio: item.getElementsByTagName('startDate')[0].textContent ?? "",
          fechaFin: item.getElementsByTagName('endDate')[0].textContent ?? "",
          //tipoAplicacion: item.getElementsByTagName('applicationType')[0].textContent ?? "",
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
  // const [cupones, setCupones] = useState<Cupon[]>([
  //   {
  //     id: 1,
  //     index: 1,
  //     titulo: "Descuento del 20%",
  //     estado: "activo",
  //     fechaInicio: "2023-10-01",
  //     fechaFin: "2023-10-31",
  //     tipoAplicacion: "General"
  //   },
  //   {
  //     id: 2,
  //     index: 2,
  //     titulo: "Compra 1 y lleva 1 gratis",
  //     estado: "inactivo",
  //     fechaInicio: "2023-11-01",
  //     fechaFin: "2023-11-30",
  //     tipoAplicacion: "por mecanica"
  //   },
  //   {
  //     id: 2,
  //     index: 3,
  //     titulo: "Compra 1 y lleva 1 gratis",
  //     estado: "inactivo",
  //     fechaInicio: "2023-11-01",
  //     fechaFin: "2023-11-30",
  //     tipoAplicacion: "por mecanica"
  //   }, {
  //     id: 2,
  //     index: 4,
  //     titulo: "Compra 1 y lleva 1 gratis",
  //     estado: "inactivo",
  //     fechaInicio: "2023-11-01",
  //     fechaFin: "2023-11-30",
  //     tipoAplicacion: "por mecanica"
  //   },
  //   {
  //     id: 2,
  //     index: 5,
  //     titulo: "Compra 1 y lleva 1 gratis",
  //     estado: "inactivo",
  //     fechaInicio: "2023-11-01",
  //     fechaFin: "2023-11-30",
  //     tipoAplicacion: "por mecanica"
  //   },
  //   {
  //     id: 2,
  //     index: 6,
  //     titulo: "Compra 1 y lleva 1 gratis",
  //     estado: "inactivo",
  //     fechaInicio: "2023-11-01",
  //     fechaFin: "2023-11-30",
  //     tipoAplicacion: "por mecanica"
  //   },
  // ]);
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

  return (
    <>
      <div className="">
        <h1 className="text-center font-semibold text-2xl p-5 bg-[#9b0e0e] text-white">Administrador de cupones</h1>
        <div className="flex justify-between items-center p-5 ">
          <h2 className="text-xl font-semibold">Listado de Cupones</h2>
          <Button label="Crear cupón" icon="pi pi-plus" raised className="bg-[#ff2c2c] text-white p-2 hover:bg-[#8b1f1f]" onClick={onCrear} />
        </div>
        <div className="m-5">
          <CuponesTable cupones={coupons} onEdit={onEditar} onStatus={onEliminar} />
        </div>
      </div>
    </>
  )
}

export default CuponesPage; 