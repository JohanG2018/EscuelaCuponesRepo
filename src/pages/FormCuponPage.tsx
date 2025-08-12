import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import Dropdown from "../components/MultiselectComponent";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import TableCombinacionesComponent, { type TipoCombinacion } from "../components/TableCombinacionesComponent";

const FormCuponPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [descripcionTicket, setDescripcionTicket] = useState("");
  const [checkedDatosCliente, setCheckedDatosCliente] = useState(false);
  interface Combinacion {
    key: string; // único (formato recomendado: `${tipo}:${nombre}`)
    nombre: string;
    tipo: string;
    valor: number;
    cantidad: number;
  }
  interface FormularioCupon {
    titulo: string;
    descripcion: string;
    factura: boolean;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    tipoAplicacion: string;
    tipoAmbiente: string;
    valorMinimo: number;
    criterio: string;
    locales: any[];
    categorias: any[];
    subcategorias: any[];
    proveedores: any[];
    productos: any[];
    productosExcluidos: any[];
    combinaciones: Combinacion[];

    cantidadProductos: number;
    legal: string;
    formatoLogo: string;
    logo: File | null;
  }

  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);

  const [formulario, setFormulario] = useState<FormularioCupon>({
    titulo: "",
    descripcion: "",
    factura: false,
    fechaInicio: null,
    fechaFin: null,
    tipoAplicacion: "",
    tipoAmbiente: "",
    valorMinimo: 0,
    criterio: "",
    locales: [],
    categorias: [],
    subcategorias: [],
    proveedores: [],
    productos: [],
    productosExcluidos: [],
    combinaciones: [],
    cantidadProductos: 0,
    legal: "",
    formatoLogo: 'formato1',
    logo: null
  });
  const subcatDisabled =
    !Array.isArray(formulario.categorias) || formulario.categorias.length === 0;

  useEffect(() => {
    // si no hay categorías, limpia subcategorías para evitar basura
    if (subcatDisabled && Array.isArray(formulario.subcategorias) && formulario.subcategorias.length) {
      handleInputChange("subcategorias", []);
    }
  }, [subcatDisabled]);

  const handleInputChange = <K extends keyof FormularioCupon>(
    field: K,
    value: FormularioCupon[K]
  ) => {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  };
  /*const handleCheckboxArrayChange = <K extends keyof FormularioCupon>(
    field: K,
    value: string,
    checked: boolean
  ) => {
    const current = new Set(formulario[field] as string[]);
    checked ? current.add(value) : current.delete(value);
    setFormulario((prev) => ({ ...prev, [field]: Array.from(current) as FormularioCupon[K] }));
  };*/
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!formulario.titulo.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Campo obligatorio",
        detail: "El título del cupón es obligatorio.",
        life: 3000
      });
      return;
    }
    console.log("Formulario a enviar:", formulario);
  };
  // Convierte cualquier valor a array (para soportar selección simple o múltiple)
  const toArray = (v: any) => Array.isArray(v) ? v : (v ? [v] : []);

  // Obtiene el nombre correcto del item (si es string o si es objeto con "name")
  const getName = (item: any) => typeof item === "string" ? item : (item?.name ?? String(item));

  // Construye las filas para la tabla
  const buildRows = (items: any[], tipo: TipoCombinacion): Combinacion[] =>
    toArray(items).map((it: any) => {
      const nombre = getName(it);
      return {
        key: `${tipo}:${nombre}`, // clave única
        nombre,
        tipo,
        cantidad: 1,
        valor: 0,
      };
    });
  const removeByName = (arr: any[], nombre: string) =>
    (arr || []).filter((item) => {
      if (typeof item === "string") return item !== nombre;
      if (item?.name) return item.name !== nombre;
      if (item?.label) return item.label !== nombre;
      return true;
    });

  const onRowDeleteFromSelectors = (row: Combinacion) => {
    switch (row.tipo) {
      case "Categoria":
        handleInputChange("categorias", removeByName(formulario.categorias, row.nombre));
        // (opcional) si tu lógica lo requiere, limpia subcategorías dependientes:
        // handleInputChange("subcategorias", []);
        break;
      case "Subcategoria":
        handleInputChange("subcategorias", removeByName(formulario.subcategorias, row.nombre));
        break;
      case "Proveedor":
        handleInputChange("proveedores", removeByName(formulario.proveedores, row.nombre));
        break;
      case "Producto":
        handleInputChange("productos", removeByName(formulario.productos, row.nombre));
        break;
    }
  };
  const onAgregarSeleccionados = () => {
    const nuevas = [
      ...buildRows(formulario.categorias, "Categoria"),
      ...buildRows(formulario.subcategorias, "Subcategoria"),
      ...buildRows(formulario.proveedores, "Proveedor"),
      ...buildRows(formulario.productos, "Producto"),
    ];

    const map = new Map(combinaciones.map(c => [c.key, c])); // evitar duplicados
    for (const f of nuevas) {
      if (!map.has(f.key)) {
        map.set(f.key, f);
      }
    }

    const merged = Array.from(map.values());
    setCombinaciones(merged);
    handleInputChange("combinaciones", merged as any); // para guardar en el formulario
  };
  const locales = [
    { name: "Moderna", establecimiento: "055" }, { name: "Alborada" }, { name: "Av. Francisco de Orellana" }, { name: "Gómez Rendón" }, { name: "Piazza Samborondón" }
  ];
  const categorias = [
    { name: "Abarrotes" }, { name: "Cárnicos" }, { name: "Congelados" }, { name: "Mascotas" }, { name: "Panadería" }
  ];
  const subcategorias = [
    { name: "Bebidas" }, { name: "Lácteos" }, { name: "Frutas y Verduras" }, { name: "Cereales" }, { name: "Snacks" }
  ];
  const proveedores = [
    { name: "Proveedor A" }, { name: "Proveedor B" }, { name: "Proveedor C" }, { name: "Proveedor D" }, { name: "Proveedor E" }
  ]
  const productos = [
    { name: "Pollo Horneado" }, { name: "Cerveza Artesanal" }, { name: "Pan Integral" }, { name: "Galletas de Avena" }, { name: "Leche Deslactosada" }
  ];

  const formatos = [
    { id: 'formato1', imagen: '/img/formato1.png', label: 'Formato 1' },
    { id: 'formato2', imagen: '/img/formato2.png', label: 'Formato 2' },
    { id: 'formato3', imagen: '/img/formato3.png', label: 'Formato 3' },
    { id: 'sinformato', imagen: '/img/formato4.png', label: 'Sin Formato' },
  ];


  return (
    <div className="  mx-auto p-6 space-y-6">
      <Toast ref={toast} position="top-right" />
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
            <InputText id="titulo" value={formulario.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              placeholder="Ingrese el título"
            />
          </div>
          {/*Ambiente */}
          <div className="flex flex-col gap-2 ">
            <label htmlFor="" className="font-semibold">Tipo de Ambiente</label>
            <div className="flex gap-3 items-center">
              <RadioButton
                inputId="ambiente-pruebas"
                name="tipoAmbiente"
                value="Pruebas"
                onChange={(e) => handleInputChange("tipoAmbiente", e.value)}
                checked={formulario.tipoAmbiente === "Pruebas"}
              />
              <label htmlFor="ambiente-pruebas">Pruebas</label>
              <RadioButton
                inputId="ambiente-produccion"
                name="tipoAmbiente"
                value="Produccion"
                onChange={(e) => handleInputChange("tipoAmbiente", e.value)}
                checked={formulario.tipoAmbiente === "Produccion"}
              />
              <label htmlFor="ambiente-produccion">Producción</label>
            </div>
          </div>
          {/* Descripción General*/}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="font-semibold" htmlFor="descripcion"> Descripción del cupón</label>
            <InputTextarea
              id="descripcion"
              value={formulario.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              rows={3} autoResize placeholder="Ingrese la descripción"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 ">
            <label htmlFor="" className="font-semibold">Con Datos</label>
            <div className="flex gap-3">
              <Checkbox
                inputId="factura"
                value="permiteFactura"
                onChange={(e) => handleInputChange('factura', e.checked ?? false)}
                checked={formulario.factura} />
              <label htmlFor="prueba">Permite factura</label>
            </div>
          </div>
          {/* Fechas */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fechaInicio" className="font-semibold">Desde</label>
            <Calendar
              id="fechaInicio"
              value={formulario.fechaInicio}
              onChange={(e) => handleInputChange('fechaInicio', e.value as Date)}
              hourFormat="24"
              showTime
              showIcon
              placeholder="Seleccione una fecha y una hora"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="fechaFin" className="font-semibold">Hasta:</label>
            <Calendar
              id="fechaFin"
              value={formulario.fechaFin}
              onChange={(e) => handleInputChange('fechaFin', e.value as Date)}
              showTime
              hourFormat="24"
              showIcon
              placeholder="Seleccione una fecha y una hora"
              className=" border border-gray-300 rounded-md px-3 py-2"
            />
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
            <div className="flex gap-3">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioButton
                    inputId="apli-general"
                    name="tipoAplicacion"
                    value="General"
                    onChange={(e) => handleInputChange("tipoAplicacion", e.value)}
                    checked={formulario.tipoAplicacion === "General"}
                  />
                  <label htmlFor="apli-general">General</label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RadioButton
                  inputId="apli-mecanica"
                  name="tipoAplicacion"
                  value="Por mecánica"
                  onChange={(e) => handleInputChange("tipoAplicacion", e.value)}
                  checked={formulario.tipoAplicacion === "Por mecánica"}
                />
                <label htmlFor="apli-mecanica">Por mecánica</label>
              </div>
            </div>
          </div>
          {/* Valor */}
          <div className="flex flex-col gap-2">
            <label htmlFor="valor" className="font-semibold">Valor</label>
            <InputNumber
              inputId="valorMinimo"
              value={formulario.valorMinimo}
              onValueChange={(e) => handleInputChange("valorMinimo", e.value || 0)}
              mode="currency"
              currency="USD"
              locale="en-US"
              min={0}
              placeholder="Ej. 20.00"
              className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {/* Criterio de compra */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label htmlFor="Criterio de Compra" className="font-semibold">Criterio de Compra</label>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioButton
                  inputId="criterio-1"
                  name="criterio" // el mismo name para que sean parte del mismo grupo
                  value="1"
                  onChange={(e) => handleInputChange("criterio", e.value)}
                  checked={formulario.criterio === "1"}
                />
                <label htmlFor="criterio-1">Recurrente por cada valor</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioButton
                  inputId="criterio-2"
                  name="criterio"
                  value="2"
                  onChange={(e) => handleInputChange("criterio", e.value)}
                  checked={formulario.criterio === "2"}
                />
                <label htmlFor="criterio-2">Mínimo de valor de compra</label>
              </div>
            </div>
          </div>
          {/* Selector de locales */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label htmlFor="locales" className="font-semibold">Locales</label>
            <MultiSelect
              inputId="locales"
              value={formulario.locales}
              onChange={(e) => handleInputChange("locales", e.value)}
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
            <label htmlFor="categoria" className="font-semibold text-gray-700">Categoria</label>
            <Dropdown
              options={categorias}
              value={formulario.categorias}
              onChange={(e) => handleInputChange("categorias", e.value)}
              placeholder="Seleccione una o varias categorías"
              name="categorias"
            />
          </div>
          {/*SubCategoria */}
          <div className="flex flex-col gap-2">
            <label htmlFor="subCategoria" className="font-semibold text-gray-700">SubCategoria</label>
            <Dropdown
              options={subcategorias}
              value={formulario.subcategorias}
              onChange={(e) => handleInputChange("subcategorias", e.value)}
              placeholder="Seleccione una o varias subcategorías"
              name="subcategorias"

            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="proveedores" className="font-semibold text-gray-700">Proveedor</label>
            <Dropdown
              options={proveedores}
              value={formulario.proveedores}
              onChange={(e) => handleInputChange("proveedores", e.value)}
              placeholder="Seleccione uno o varios proveedores"
              name="proveedores"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="producto" className="font-semibold text-gray-700">Producto</label>
            <Dropdown
              options={productos}
              value={formulario.productos}
              onChange={(e) => handleInputChange("productos", e.value)}
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
            value={formulario.productosExcluidos}
            onChange={(e) => handleInputChange("productosExcluidos", e.value)}
            placeholder="Seleccione productos a excluir"
            name="productosExcluidos"
          />
        </div>
        <div className="md:col-span-2 pt-5">
          <label htmlFor="combinaciones" className="font-semibold">
            Tabla combinaciones
          </label>
          <div className="flex justify-end">
            <Button
              label="Agregar"
              icon="pi pi-plus"
              className="p-button-success p-2 bg-green-600 text-white hover:bg-green-700"
              raised
              onClick={onAgregarSeleccionados}
            />
          </div>
          <TableCombinacionesComponent
            combinaciones={combinaciones}
            setCombinaciones={(rows) => {
              setCombinaciones(rows);
              handleInputChange("combinaciones", rows as any);
            }}
            onRowDelete={onRowDeleteFromSelectors}  
          />

          <div className="card col-span-2">

          </div>
        </div>
        {/* Indicador de combinación */}

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
          ${formulario.formatoLogo === formato.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => { handleInputChange('formatoLogo', formato.id); setCheckedDatosCliente(false); }}
            >
              <img
                src={formato.imagen}
                alt={formato.label}
                className="w-full h-24 object-contain mb-2"
              />
              <RadioButton
                inputId={formato.id}
                name="formatoLogo"
                value={formato.id}
                onChange={(e) => handleInputChange("formatoLogo", e.value)}
                checked={formulario.formatoLogo === formato.id}
              />
              <label htmlFor={formato.id} className="ml-2">{formato.label}</label>

              {formulario.formatoLogo === formato.id && (
                <div className="mt-4 flex flex-col gap-2 text-left">
                  {/* <label className="font-semibold mb-1">Mostrar datos del cliente en el ticket:</label> */}
                  <div className="flex flex-col gap-1">
                    <div>
                      <Checkbox
                        inputId="datos-cliente"
                        value="datos"
                        onChange={(e) => setCheckedDatosCliente(!!e.checked)}
                        checked={checkedDatosCliente}
                      />
                      <label htmlFor="datos-cliente" className="ml-2">Incluir Datos Cliente</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Descripción del ticket */}
        <div className="md:col-span-2 flex flex-col gap-2 pt-4">
          <label className="font-semibold" htmlFor="descripcion"> Descripción del ticket</label>
          <InputTextarea id="descripcion" value={descripcionTicket} onChange={(e) => setDescripcionTicket(e.target.value)} rows={3} autoResize placeholder="Ingrese el texto que aparecerá en el ticket"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            uploadHandler={(e) => {
              const archivo = e.files?.[0] || null;
              handleInputChange("logo", archivo);
              console.log("Archivo cargado localmente:", archivo);
            }}
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
            value={formulario.legal}
            onChange={(e) => handleInputChange("legal", e.target.value)}
            rows={2}
            autoResize
            placeholder="Ej: Promoción válida hasta agotar stock. Máximo 1 cupón por persona."
          />
        </div>
      </section>
      <div className="md:col-span-2 flex justify-end mt-6 space-x-4">
        <Button label="Guardar" onClick={handleSubmit} raised icon="pi pi-check" className="p-button-success p-4 bg-green-600 text-white" />
        <Button label="Cancelar" raised icon="pi pi-save" className="p-button-warning p-4 bg-red-600 text-white" />
      </div>
    </div>
  );
};

export default FormCuponPage;
