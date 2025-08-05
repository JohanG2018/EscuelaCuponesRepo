import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
// import { ToggleButton } from "primereact/togglebutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import Dropdown from "../components/MultiselectComponent";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from "primereact/fileupload";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";


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
  const [legal, setLegal] = useState("");
  const [tipoAmbiente, setTipoAmbiente] = useState<string[]>([]);

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
    if (e.checked) {
      setTipoAplicacion([e.value]);
    } else {
      setTipoAplicacion([]);
    }
  };

  const onTipoAmbienteChange = (e: { value: string; checked: boolean }) => {
    if (e.checked) {
      setTipoAmbiente([e.value]);
    } else {
      setTipoAmbiente([]);
    }
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#9b0e0e] text-white p-4">
        Administrador de Promociones - Cupones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="categoria" className="font-normal">
              Categoría <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={categorias}
              value={selectedCategorias}
              onChange={(e) => setSelectedCategorias(e.value)}
              placeholder="Seleccione una o varias categorías"
              name="categorias"
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
              name="subcategorias"
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
              name="productos"
            />
          </div>
        </div>
        <label htmlFor="combinaciones" className="font-semibold">
          Tabla combinaciones
          <span></span>
        </label>
        <div className="card col-span-2 ">
          <DataTable value={productos} stripedRows paginator rows={3} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '75rem' }}>
            <Column field="name" header="Producto" style={{ width: '50%' }}></Column>
            <Column field="tipo" header="Tipo" style={{ width: '25%' }}></Column>
            <Column field="valor" header="Valor" style={{ width: '10%' }}></Column>
            <Column field="cantidad" header="Cantidad" style={{ width: '10%' }}></Column>
          </DataTable>
        </div>
        {/* <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Sube la imagen del logo.</p>} /> */}

        {/* Legal */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="legal" className="font-semibold">
            Legal <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            id="legal"
            value={legal}
            onChange={(e) => setLegal(e.target.value)}
            placeholder="Ingrese el texto legal"
            rows={2}
            autoResize
          />
        </div>
        <div >
          <p id="disclamer" className="text-sm text-gray-500 w-max">
            Nota: En el caso de no escoger un formato, el cupón se mostrará sin logo, pero con título información y legal.
          </p>
        </div>
        {/* Tipo de Ambiente */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="tipoAmbiente" className="font-semibold">
            Tipo de Ambiente <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="pruebas"
                value="Pruebas"
                onChange={onTipoAmbienteChange}
                checked={tipoAmbiente.includes("Pruebas")}
              />
              <label htmlFor="pruebas">Pruebas</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="produccion"
                value="Produccion"
                onChange={onTipoAmbienteChange}
                checked={tipoAmbiente.includes("Produccion")}
              />
              <label htmlFor="produccion">Producción</label>
            </div>
          </div>
        </div>
        {/* Guardar Formulario */}
        <div className="md:col-span-2 flex justify-center">
          <Button label="Guardar" icon="pi pi-check" className="p-button-success" />
        </div>
      </div>
    </div>
  );
};

export default FormCuponPage;
{/* <div className="md:col-span-2 flex justify-end">
          <Button
            label="Guardar"
            icon="pi pi-check"
            className="p-button-success"
            onClick={async () => {
              const payload = {
          titulo,
          descripcion,
          estadoActivo,
          fechaInicio,
          fechaFin,
          tipoAplicacion,
          locales: selectedLocales,
          categorias: selectedCategorias,
          subcategorias: selectedSubcategorias,
          productos: selectedProductos,
          legal,
          tipoAmbiente,
              };
              try {
          const response = await fetch('/api/cupones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('Error al guardar el cupón');
          alert('Cupón guardado correctamente');
              } catch (error) {
          alert('Hubo un error al guardar el cupón');
              }
            }}
          /> */}