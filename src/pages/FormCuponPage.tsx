import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import Dropdown from "../components/MultiselectComponent";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
        

const FormCuponPage: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estadoActivo, setEstadoActivo] = useState(true);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoAplicacion, setTipoAplicacion] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<any[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedSubcategorias, setSelectedSubcategorias] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);

  const locales = [
    { name: "Moderna" },
    { name: "Alborada" },
    { name: "Av. Francisco de Orellana" },
    { name: "Gómez Rendón" },
    { name: "Piazza Samborondón" },
  ];

  const categorias = [
    { name: "Abarrotes" },
    { name: "Cárnicos" },
    { name: "Congelados" },
    { name: "Mascotas" },
    { name: "Panadería" },
  ]

  const subcategorias = [
    { name: "Bebidas" },
    { name: "Lácteos" },
    { name: "Frutas y Verduras" },
    { name: "Cereales" },
    { name: "Snacks" },
  ]

  const provedores = [
    { name: "Provedor A" },
    { name: "Provedor B" },
    { name: "Provedor C" },
    { name: "Provedor D" },
    { name: "Provedor E" },
  ]

  const productos = [
    { name: "Pollo Horneado" },
    { name: "Cerveza Artesanal" },
    { name: "Pan Integral" },
    { name: "Galletas de Avena" },
    { name: "Leche Deslactosada" },
  ];

  const onTipoAplicacionChange = (e: { value: string; checked: boolean }) => {
    const selected = [...tipoAplicacion];
    if (e.checked) selected.push(e.value);
    else selected.splice(selected.indexOf(e.value), 1);
    setTipoAplicacion(selected);
  };

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-center text-2xl font-bold mb-6  ">
        Administrador de Promociones - Cupones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="flex flex-col gap-2">
          <label htmlFor="titulo" className="font-semibold">
            Título del cupón <span className="text-red-500">*</span>
          </label>
          <InputText
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ingrese el título"
          />
        </div>

        {/* Estado */}
        {/* <div className="flex flex-col gap-2">
          <label htmlFor="estado" className="font-semibold invisible">
            Estado
          </label>
          <ToggleButton
            onLabel="Activo"
            offLabel="Inactivo"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={estadoActivo}
            onChange={(e) => setEstadoActivo(e.value)}
            className="w-36"
          />
        </div> */}

        {/* Descripción */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="descripcion" className="font-semibold">
            Descripción del cupón <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            autoResize
            placeholder="Ingrese la descripción"
          />
        </div>

        {/* Fechas */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fechaInicio" className="font-semibold">
            Desde:
          </label>
          <Calendar
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value as Date)}
            showIcon
            placeholder="Seleccione una fecha"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="fechaFin" className="font-semibold">
            Hasta:
          </label>
          <Calendar
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value as Date)}
            showIcon
            placeholder="Seleccione una fecha"
          />
        </div>

        {/* Tipo de Aplicación */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="tipoAplicacion" className="font-semibold">
            Tipo de Aplicación <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="general"
                value="General"
                onChange={onTipoAplicacionChange}
                checked={tipoAplicacion.includes("General")}
              />
              <label htmlFor="general">General</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="mecanica"
                value="Por mecánica"
                onChange={onTipoAplicacionChange}
                checked={tipoAplicacion.includes("Por mecánica")}
              />
              <label htmlFor="mecanica">Por mecánica</label>
            </div>
          </div>
        </div>

        {/* Selector de locales */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="locales" className="font-semibold">
            Locales <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            inputId="locales"
            value={selectedLocales}
            onChange={(e) => setSelectedLocales(e.value)}
            options={locales}
            optionLabel="name"
            placeholder="Seleccione uno o varios locales"
            filter
            className="w-full md:w-80"
            maxSelectedLabels={20}
          />
        </div>
        <label htmlFor="Productos participantes" className="font-semibold">
          Productos participantes <span className="text-red-500">*</span>
        </label>
        {/* Dropdown para seleccionar categorías, subcategorías, etc. */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <label htmlFor="categoria" className="font-normal">
              Categoría <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={categorias}
              value={selectedCategorias}
              onChange={(e) => setSelectedCategorias(e.value)}
              placeholder="Seleccione una o varias categorías"
              name="Categorías"
            />
          </div>
          <div>
            <label htmlFor="subcategoria" className="font-normal">
              Subcategoría <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={subcategorias}
              value={selectedSubcategorias}
              onChange={(e) => setSelectedSubcategorias(e.value)}
              placeholder="Seleccione una o varias subcategorías"
              name="Subcategorías"
            />
          </div>
          <div>
            <label htmlFor="producto" className="font-normal">
              Producto <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={productos}
              value={selectedProductos}
              onChange={(e) => setSelectedProductos(e.value)}
              placeholder="Seleccione una o varios productos"
              name="Productos"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default FormCuponPage;
