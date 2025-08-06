import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import Dropdown from "../components/MultiselectComponent";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { RadioButton } from 'primereact/radiobutton';

const FormCuponPage: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoAplicacion, setTipoAplicacion] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<any[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedSubcategorias, setSelectedSubcategorias] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [legal, setLegal] = useState("");
  const [tipoAmbiente, setTipoAmbiente] = useState<string[]>([]);
  const [value3, setValue3] = useState(25);
  const [formatoLogo, setFormatoLogo] = useState<string>('formato1');

  const locales = [
    { name: "Moderna" }, { name: "Alborada" }, { name: "Av. Francisco de Orellana" }, { name: "Gómez Rendón" }, { name: "Piazza Samborondón" }
  ];
  const categorias = [
    { name: "Abarrotes" }, { name: "Cárnicos" }, { name: "Congelados" }, { name: "Mascotas" }, { name: "Panadería" }
  ];
  const subcategorias = [
    { name: "Bebidas" }, { name: "Lácteos" }, { name: "Frutas y Verduras" }, { name: "Cereales" }, { name: "Snacks" }
  ];
  const productos = [
    { name: "Pollo Horneado" }, { name: "Cerveza Artesanal" }, { name: "Pan Integral" }, { name: "Galletas de Avena" }, { name: "Leche Deslactosada" }
  ];
  const formatos = [
    { id: 'formato1', label: 'Formato 1' },
    { id: 'formato2', label: 'Formato 2' },
    { id: 'formato3', label: 'Formato 3' },
    { id: 'sinformato', label: 'Sin Formato' },
  ];

  const onTipoAplicacionChange = (e: { value: string; checked: boolean }) => {
    setTipoAplicacion(e.checked ? [e.value] : []);
  };

  const onTipoAmbienteChange = (e: { value: string; checked: boolean }) => {
    setTipoAmbiente(e.checked ? [e.value] : []);
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#9b0e0e] text-white p-4">
        Administrador de Promociones - Cupones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-2">
          <label htmlFor="titulo" className="font-semibold">
            Título del cupón <span className="text-red-500">*</span>
          </label>
          <InputText
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ingrese el título"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full  border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      </div>

      <div className="md:col-span-2">
        <label htmlFor="combinaciones" className="font-semibold">
          Tabla combinaciones
        </label>
        <div className="card col-span-2">
          <DataTable
            value={productos}
            stripedRows
            paginator
            rows={3}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '75rem' }}
          >
            <Column field="name" header="Producto" style={{ width: '50%' }}></Column>
            <Column field="tipo" header="Tipo" style={{ width: '25%' }}></Column>
            <Column field="valor" header="Valor" style={{ width: '10%' }}></Column>
            <Column field="cantidad" header="Cantidad" style={{ width: '10%' }}></Column>
          </DataTable>
        </div>
      </div>
      {/*Productos excluidos*/}
      <div >
        <label htmlFor="producto" className="font-normal">
          Productos excluidos
        </label>
        <Dropdown
          options={productos}
          value={selectedProductos}
          onChange={(e) => setSelectedProductos(e.value)}
          placeholder="Seleccione una o varios productos excluidos"
          name="Productos"
        />
      </div>
      {/* Tipo de Logo */}
      <div className="md:col-span-2 flex flex-col gap-4 mt-6">
        <label className="font-semibold">Tipo de Logo</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {formatos.map((formato) => (
            <div
              key={formato.id}
              className={`border rounded-md p-3 text-center cursor-pointer transition-all duration-200
          ${formatoLogo === formato.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => setFormatoLogo(formato.id)}
            >
              <img
                src="/logo-placeholder.png" // <-- Usa tu imagen real aquí o temporalmente una genérica
                alt={formato.label}
                className="w-full h-24 object-contain mb-2"
              />
              <RadioButton
                inputId={formato.id}
                name="formatoLogo"
                value={formato.id}
                onChange={(e) => setFormatoLogo(e.value)}
                checked={formatoLogo === formato.id}
              />
              <label htmlFor={formato.id} className="ml-2">{formato.label}</label>
            </div>
          ))}
        </div>
        <div className="card">
          <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
        </div>
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
