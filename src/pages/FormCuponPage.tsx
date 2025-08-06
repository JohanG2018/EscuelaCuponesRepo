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
import type { CheckboxChangeEvent } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';


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
  const [value3, setValue3] = useState(0);
  const [formatoLogo, setFormatoLogo] = useState<string>('formato1');
  const [checked, setChecked] = useState(false);
  const [value1, setValue1] = useState<number>(0);
  const [criterio, setCriterio] = useState([]);

  const locales = [
    { name: "Moderna", establecimiento: "055" }, { name: "Alborada" }, { name: "Av. Francisco de Orellana" }, { name: "Gómez Rendón" }, { name: "Piazza Samborondón" }
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
    { id: 'formato1', imagen: '/img/formato1.png', label: 'Formato 1' },
    { id: 'formato2', imagen: '/img/formato2.png', label: 'Formato 2' },
    { id: 'formato3', imagen: '/img/formato3.png', label: 'Formato 3' },
    { id: 'sinformato',imagen: '/img/formato4.png', label: 'Sin Formato' },
  ];
  const onCriteriosChange = (e) => {
    let _ingredients = [...criterio];

    if (e.checked)
      _ingredients.push(e.value);
    else
      _ingredients.splice(_ingredients.indexOf(e.value), 1);

    setCriterio(_ingredients);
  }
  const onTipoAplicacionChange = (e: CheckboxChangeEvent) => {
    const value = e.value;
    const checked = e.checked ?? false;

    if (checked) {
      setTipoAplicacion([value]);
    } else {
      setTipoAplicacion([]);
    }
  };

  const onTipoAmbienteChange = (e: CheckboxChangeEvent) => {
    const value = e.value;
    const checked = e.checked ?? false;

    if (checked) {
      setTipoAmbiente([value]);
    } else {
      setTipoAmbiente([]);
    }
  };
  return (
    <div className="  mx-auto p-6 space-y-6">
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#9b0e0e] text-white p-4">
        Administrador de Promociones - Cupones
        </h1>

      <section>
        <h2 className="text-xl font-semibold border-b pb-1 mb-4">
        Información General  
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/*Titulo */}
          <div className="flex flex-col gap-2">
            <label htmlFor="titulo" className="font-semibold">Titulo del Cupón</label>  
            <InputText id="titulo" value={titulo} 
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ingrese el título" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {/*Ambiente */}
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="font-semibold">Tipo de Ambiente</label>
            <div className="flex gap-4">
              <Checkbox inputId="pruebas" value="Pruebas" onChange={onTipoAmbienteChange} checked={tipoAmbiente.includes("Pruebas")} />
              <label htmlFor="prueba">Pruebas</label>
              <Checkbox inputId="produccion" value="Produccion" onChange={onTipoAmbienteChange} checked={tipoAmbiente.includes("Produccion")} />
              <label htmlFor="produccion">Producción</label>
            </div>
          </div>
          {/* Descripción */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="font-semibold" htmlFor="descripcion"> Descripción del cupón</label>
            <InputTextarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} autoResize placeholder="Ingrese la descripción"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"  />
          </div>
          {/* Fechas */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fechaInicio" className="font-semibold">Desde</label>
            <Calendar id="fechaInicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.value as Date)} showIcon placeholder="Seleccione una fecha" />
          </div> 
           <div className="flex flex-col gap-2">
        <label htmlFor="fechaFin" className="font-semibold">Hasta:</label>
        <Calendar id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.value as Date)} showIcon placeholder="Seleccione una fecha" />
      </div> 
        </div>    
      </section> 
      <section>
        <h2 className="text-xl font-semibold border-b pb-1 mb-4">
        Condiciones de Aplicación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
          {/* Tipo de Aplicación */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tipoAplicacion" className="font-semibold">Tipo de Aplicación</label>
            <div className="flex gap-4">
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
          {/* Valor */}
          <div className="flex flex-col gap-2">
            <label htmlFor="valor" className="font-semibold">Valor</label>
            <InputNumber
        inputId="valorMinimo"
        value={value1}
        onValueChange={(e) => setValue1(e.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
      placeholder="Ej. 20.00"
       className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {/* Criterio de compra */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="Criterio de Compra" className="font-semibold">Criterio de Compra</label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
            value="1"
            onChange={onCriteriosChange}
            checked={criterio.includes("1")}
          />
          <label>Recurrente por cada valor</label>
            </div>
            <div className="flex items-center gap-2">
          <Checkbox
            value="2"
            onChange={onCriteriosChange}
            checked={criterio.includes("2")}
          />
          <label>Mínimo de valor de compra</label>
        </div>
          </div>  
        </div>
        {/* Selector de locales */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="locales" className="font-semibold">Locales</label>
          <MultiSelect
        inputId="locales"
        value={selectedLocales}
        onChange={(e) => setSelectedLocales(e.value)}
        options={locales}
        optionLabel="name"
        placeholder="Seleccione uno o varios locales"
        filter
        className="w-full"
        maxSelectedLabels={10}
      />  
        </div>  
        </div>  
      </section>
      <section>
        <h2 className="text-xl font-semibold border-b pb-1 mb-4">Productos y Categorias</h2>
        {/*Participantes */}
        <div className="grid grid-cols-1  gap-6 mb-4">
        {/*Categoria */}
        <div className="flex flex-col gap-2">
          <label htmlFor="categoria">Categoria</label>
          <Dropdown
        options={categorias}
        value={selectedCategorias}
        onChange={(e) => setSelectedCategorias(e.value)}
        placeholder="Seleccione una o varias categorías"
        name="categorias"
      />
        </div>
        {/*SubCategoria */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subCategoria" className="font-semibold">SubCategoria</label>
          <Dropdown
        options={subcategorias}
        value={selectedSubcategorias}
        onChange={(e) => setSelectedSubcategorias(e.value)}
        placeholder="Seleccione una o varias subcategorías"
        name="subcategorias"
      />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="producto" className="font-semibold">Producto</label>
          <Dropdown
        options={productos}
        value={selectedProductos}
        onChange={(e) => setSelectedProductos(e.value)}
        placeholder="Seleccione uno o varios productos"
        name="productos"
      />
        </div>
        </div>
        {/* Excluidos */}
        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="productosExcluidos" className="font-semibold">
      Productos excluidos
    </label>
    <Dropdown
      options={productos}
      value={[]}
      onChange={(e) => console.log("TODO: Guardar productos excluidos", e.value)}
      placeholder="Seleccione productos a excluir"
      name="productosExcluidos"
    />
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
       {/* Indicador de combinación */}
  <div className="mt-6 flex flex-col gap-2">
    <label htmlFor="" className="font-semibold">Combinación de mínimo de compra y productos/marcas</label>
    <div className="flex gap-4 items-center">
      <Checkbox inputId="combinada" onChange={(e) => setChecked(e.checked)} checked={checked} />
      <label htmlFor="combinada" className="">Combinada</label>
    </div>
  </div>

  {/* Cantidad mínima de productos */}
  <div className="mt-4 md:w-64">
    <label htmlFor="cantidad" className="font-semibold block mb-2">Cantidad de productos</label>
    <InputNumber
      inputId="cantidad"
      value={value3}
      onValueChange={(e) => setValue3(e.value)}
      showButtons
      min={0}
      max={100}
    />
  </div>

      </section>

      <section >
        <h2 className="text-xl font-semibold border-b pb-1 mb-4 mt-10">Configuración Visual</h2>
        <div className="flex flex-col  gap-4">
         <label className="font-semibold">Tipo de Logo</label>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {formatos.map((formato) => (
            <div
              key={formato.id}
              className={`border rounded-md p-3 text-center cursor-pointer transition-all duration-200
          ${formatoLogo === formato.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => setFormatoLogo(formato.id)}
            >
              <img
                 src={formato.imagen} // <-- Usa tu imagen real aquí o temporalmente una genérica
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
        <div className="mt-6">
    <p className="text-sm text-gray-500">
      Nota: Si no se selecciona un formato de logo, se imprimirá el cupón sin imagen, solo con texto.
    </p>
  </div>
  
          {/* Subir logo*/}
          <div className="mt-6">
    <label className="font-semibold block mb-2">Cargar Logo (.bmp, máx 600px ancho)</label>
    <FileUpload
      name="logo"
      url="/api/upload"
      accept=".bmp"
      maxFileSize={1000000}
      customUpload
      uploadHandler={(e) => console.log("Subido", e.files)}
      emptyTemplate={<p className="m-0">Arrastre el archivo aquí o haga clic para cargar.</p>}
    />
  </div>
   {/* Legal */}
  <div className="mt-6 flex flex-col gap-2 md:w-2/3">
    <label htmlFor="legal" className="font-semibold">
      Texto legal del cupón
    </label>
    <InputTextarea
      id="legal"
      value={legal}
      onChange={(e) => setLegal(e.target.value)}
      rows={2}
      autoResize
      placeholder="Ej: Promoción válida hasta agotar stock. Máximo 1 cupón por persona."
    />
  </div>
      </section>
    <div className="md:col-span-2 flex justify-end mt-6 space-x-4">
          <Button label="Guardar" raised icon="pi pi-check" className="p-button-success p-4" />
          <Button label="Cancelar" raised icon="pi pi-close" className="p-button-danger p-4" />
        </div>
    </div>

  );
};

export default FormCuponPage;
