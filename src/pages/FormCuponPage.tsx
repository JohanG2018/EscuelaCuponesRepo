import React, { useEffect, useRef, useState } from "react";
import { useNavigate , useSearchParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { FileUpload, type FileUploadHandlerEvent } from "primereact/fileupload";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import MultiSelect from "../components/MultiselectComponent";
import TableCombinacionesComponent, { type TipoCombinacion } from "../components/TableCombinacionesComponent";
import {
  buildCuponXML,
  postCuponXML,
  fetchCategorias,
  fetchLocales,
  fetchProveedores,
  fetchSubCategorias,
  searchProductos,
  updateCuponXML,
  fetchCuponById
} from "../service/cupon";
import {
  ArchivoBMP,
  ArchivoMenor,
  validarImagenMax,
  FechaInicio,
  fechaFin
} from "../utils/Validacion"

import type {
  Cupon,
  Categoria,
  Producto,
  Proveedor,
  Local,
  Combinacion,
} from "../interface/cuponInterface";

const FormCuponPage: React.FC = () => {
  const navigate = useNavigate(); 
  const [params] = useSearchParams();
  const id = params.get("id");
  const editingId = id && /^\d+$/.test(id) ? Number(id) : null;
  const toast = useRef<Toast>(null);


  const [loading, setLoading] = useState<boolean>(false);
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
  const [subcategoriaOpts, setSubcategoriaOpts] = useState<Categoria[]>([]);
  const [filteredProductosExcluidos, setFilteredProductosExcluidos] = useState<Producto[]>([]);

  const [formulario, setFormulario] = useState<Cupon>({
    id: editingId || 0,
    titulo: "",
    descripcion: "",
    descripcionTicket: "",
    textoLegal: "",
    fechaInicio: "",
    fechaFin: "",
    estado: true,
    tipoAplicacion: "",
    valorMinimo: 0,
    esRecurrente: false,
    idTipoFormato: 1,
    logo: "",
    nombreLogo: "formato1",
    tipoAmbiente: "Pruebas",
    esConsumidorFinal: true,
    aplicaLocales: false,
    combinarCondiciones: false,
    cantidadProductos: 0,
    locales: [],
    combinaciones: [],
    categorias: [],
    subcategorias: [],
    productos: [],
    productosExcluidos: [],
    proveedores: [],
    criterio: "",
    formatoLogo: "formato1",
    legal: "",
    factura: false,
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cats, subs, provs, locs, prods] = await Promise.all([
          fetchCategorias(),
          fetchSubCategorias(),
          fetchProveedores(),
          fetchLocales(),
          searchProductos("no hay resultados", 100),
        ]);
        setCategorias(cats);
        setSubcategorias(subs);
        setProveedores(provs);
        setLocales(locs);
        setProductos(prods);
        setSubcategoriaOpts(subs);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar datos",
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);
 useEffect(() => {
  if (!id) return;

  const ctrl = new AbortController();

  const cargarCupon = async () => {
    try {
      setLoading(true);
      const cupon = await fetchCuponById(Number(id));

      if (!cupon) throw new Error("Cupón no encontrado");

      // Si el cupon viene en formato { data: {...} }, extrae
      const data = cupon?.data || cupon;

      setFormulario((prev) => ({
        ...prev,
        ...data,
        id: Number(id),
      }));

      if (Array.isArray(data.combinaciones)) {
        setCombinaciones(data.combinaciones);
      }
    } catch (err) {
      console.error("Error cargando cupón:", err);
    } finally {
      setLoading(false);
    }
  };

  cargarCupon();

  return () => ctrl.abort();
}, [id]);

  const handleInputChange = <K extends keyof Cupon>(field: K, value: Cupon[K]) => {
    if (field === "fechaInicio") {
      if (value && FechaInicio(value as Date)) {
        toast.current?.show({
          severity: "warn",
          summary: "Fecha inválida",
          detail: "La fecha de inicio no puede ser anterior a hoy.",
          life: 3000,
        });
        return;
      }
    }

    if (field === "fechaFin" && formulario.fechaInicio) {
      const inicio = new Date(formulario.fechaInicio);
      const fin = new Date(value as Date);
      if (fechaFin(inicio, fin)) {
        toast.current?.show({
          severity: "warn",
          summary: "Fecha inválida",
          detail: "La fecha de fin no puede ser menor a la fecha de inicio.",
          life: 3000,
        });
        return;
      }
    }

    setFormulario((prev) => ({ ...prev, [field]: value }));
  };

  // DEDUP por (tipo + itemId)
  const mergeCombinaciones = (base: Combinacion[], nuevas: Combinacion[]): Combinacion[] => {
    const map = new Map(base.map((r) => [`${r.tipo}:${r.itemId}`, r]));
    for (const item of nuevas) {
      const k = `${item.tipo}:${item.itemId}`;
      if (!map.has(k)) map.set(k, item);
    }
    return Array.from(map.values());
  };

  // Helpers
  const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);

  const getName = (it: any) =>
    (typeof it === "string" ? it : undefined) ??
    it?.nombre ?? it?.name ?? it?.title ?? it?.label ??
    it?.local ?? it?.categoria ?? it?.subcategoria ?? it?.proveedor ??
    String(it);

  // ID real según tipo
  const getIdByTipo = (it: any, tipo: TipoCombinacion): string => {
    if (typeof it === "string") return it; // si vienen strings, úsalo como id
    switch (tipo) {
      case "I":  // Producto
        return (it.itemid ?? it.id ?? it.value ?? it.key ?? getName(it))?.toString();
      case "G":  // Categoría
        return (it.id ?? it.value ?? it.codigo ?? it.key ?? getName(it))?.toString();
      case "SG": // Subcategoría
        return (it.id ?? it.value ?? it.codigo ?? it.key ?? getName(it))?.toString();
      case "P":  // Proveedor
        return (it.id ?? it.value ?? it.codigo ?? it.key ?? getName(it))?.toString();
      default:
        return (it.id ?? it.value ?? it.key ?? getName(it))?.toString();
    }
  };

  const buildRows = (
    items: any[],
    tipo: TipoCombinacion,
    opts?: { excluida?: boolean }
  ): Combinacion[] =>
    toArray(items).map((it: any) => {
      const nombre = getName(it);
      const itemId = getIdByTipo(it, tipo);
      return {
        key: `${itemId}`,          // SOLO UI (estable y único)
        itemId,                            // <-- ESTE VA A BD/XML como ITEMID
        nombre,                            // para mostrar
        tipo,                              // 'I' | 'G' | 'SG' | 'P'
        cantidad: 1,
        valor: 0,
        combinada: false,
        excluida: opts?.excluida ?? false, // solo true para excluidos
      } as Combinacion;
    });

  const onAgregarSeleccionados = () => {
    const nuevas: Combinacion[] = [
      ...buildRows(formulario.categorias, "G"),
      ...buildRows(formulario.subcategorias, "SG"),
      ...buildRows(formulario.proveedores, "P"),
      ...buildRows(formulario.productos, "I"),
      ...buildRows(formulario.productosExcluidos, "I", { excluida: true }), // <-- corregido
    ];

    const merged = mergeCombinaciones(combinaciones, nuevas);
    setCombinaciones(merged);
    handleInputChange("combinaciones", merged);
    handleInputChange("cantidadProductos", merged.length);
    handleInputChange("combinarCondiciones", merged.length > 1);

    // Limpiar selects
    handleInputChange("categorias", []);
    handleInputChange("subcategorias", []);
    handleInputChange("proveedores", []);
    handleInputChange("productos", []);
    handleInputChange("productosExcluidos", []);
  };
  const buscarProductos = async (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = (productos || []).filter((p: any) =>
      p.nombre?.toLowerCase().includes(query)
    );
    setFilteredProductos(resultados);
  };
  const buscarProductosExcluidos = async (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = (productos || []).filter((p: Producto) =>
      p.nombre?.toLowerCase().includes(query)
    );
    setFilteredProductosExcluidos(resultados);
  }

  const buscarProveedores = (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = (proveedores || []).filter((p: any) =>
      p.name?.toLowerCase().includes(query)
    );
    setFilteredProveedores(resultados);
  }
const handleSubmit = async () => {
  try {
    // Construir el XML SOLO una vez.
    const xmlData = await buildCuponXML({
      ...formulario,
      id: editingId || 0,          // si estás editando, incluye el id para <idCupon>
      combinaciones,               // usa el estado real de la tabla
    });

    // Enviar (PUT si edita, POST si crea)
    const resp = editingId
      ? await updateCuponXML(xmlData)
      : await postCuponXML(xmlData);

    // Normalizar éxito (acepta JSON o XML con <listo>OK</listo>)
    const ok =
      resp?.ok === true ||
      resp?.status === "success" ||
      /<listo>\s*OK\s*<\/listo>/i.test(resp?.raw || "") ||
      (typeof resp === "string" && /<listo>\s*OK\s*<\/listo>/i.test(resp));

    if (!ok) {
      // Intenta extraer mensaje claro desde JSON o XML
      const raw = typeof resp === "string" ? resp : resp?.raw || "";
      const xmlMsgMatch = raw.match?.(/<mensaje>([\s\S]*?)<\/mensaje>/i);
      const msg =
        resp?.mensaje ||
        resp?.message ||
        (xmlMsgMatch ? xmlMsgMatch[1].trim() : "No se pudo guardar");
      throw new Error(msg);
    }

    // Éxito
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: editingId ? "Cupón actualizado" : "Cupón creado",
      life: 3000,
    });
    navigate("/admin/cupon");
  } catch (err: any) {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: err?.message || "Error al guardar el cupón",
      life: 4000,
    });
  }
};

  
  const handleUploadLogo = async (e: FileUploadHandlerEvent) => {
    const archivo = e.files?.[0];
    if (!archivo) return;

    if (!ArchivoBMP(archivo)) {
      toast.current?.show({
        severity: "error",
        summary: "Formato invalido",
        detail: "Solo se permiten archivo .bmp",
        life: 4000
      })
    }
    if (!ArchivoMenor(archivo, 5 * 1024 * 1024)) {
      toast.current?.show({
        severity: "error",
        summary: "Archivo demasiado grande",
        detail: "Máximo permitido: 5MB",
        life: 4000,
      });
      return;
    }

    const esvalido = validarImagenMax(archivo, 600);
    if (!esvalido) {
      toast.current?.show({
        severity: "warn",
        summary: "Imagen demasiado ancha",
        detail: "El ancho máximo permitido es 600px",
        life: 4000,
      });
      return;

    }
    handleInputChange("logo", archivo)
    e.options.clear();
  }



  const formatos = [
    { id: "formato1", imagen: "/img/formato1.png", label: "Formato 1" },
    { id: "formato2", imagen: "/img/formato2.png", label: "Formato 2" },
    { id: "formato3", imagen: "/img/formato3.png", label: "Formato 3" },
    { id: "sinformato", imagen: "/img/formato4.png", label: "Sin Formato" },
  ];

  function onRowDeleteFromSelectors(row: Combinacion): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="mx-auto">
      <Toast ref={toast} position="top-right" />
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#124f26] text-white p-4">
        Administrador de Cupones
      </h1>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 text-gray-600 gap-3">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
          <span className="text-sm font-medium">Cargando Información del cupón...</span>
        </div>
      ) : (
        <>
          <div className="px-5">
            <Button icon="pi pi-arrow-left" onClick={() => navigate("/")} />
          </div>

          {/* A partir de aquí inicia el render visual (secciones del formulario) */}
          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="titulo" className="font-semibold">Título</label>
                <InputText id="titulo" value={formulario.titulo} onChange={(e) => handleInputChange("titulo", e.target.value)} maxLength={50} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold">Ambiente</label>
                <div className="flex gap-4">
                  <RadioButton inputId="pruebas" name="tipoAmbiente" value="TEST" onChange={(e) => handleInputChange("tipoAmbiente", e.value)} checked={formulario.tipoAmbiente === "Pruebas"} />
                  <label htmlFor="pruebas">Pruebas</label>
                  <RadioButton inputId="produccion" name="tipoAmbiente" value="PROD" onChange={(e) => handleInputChange("tipoAmbiente", e.value)} checked={formulario.tipoAmbiente === "Produccion"} />
                  <label htmlFor="produccion">Producción</label>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="descripcion" className="font-semibold">Descripción</label>
                <InputTextarea id="descripcion" value={formulario.descripcion} onChange={(e) => handleInputChange("descripcion", e.target.value)} rows={3} autoResize maxLength={200} />
              </div>

              <div className="md:col-span-2">
                <Checkbox inputId="factura" checked={formulario.factura} onChange={(e) => handleInputChange("factura", e.checked ?? false)} />
                <label htmlFor="factura" className="ml-2">Permite Factura</label>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fechaInicio" className="font-semibold">Desde</label>
                <Calendar
                  id="fechaInicio"
                  value={
                    formulario.fechaInicio
                      ? typeof formulario.fechaInicio === "string"
                        ? new Date(formulario.fechaInicio)
                        : formulario.fechaInicio
                      : null
                  }
                  minDate={new Date()}
                  onChange={(e) => handleInputChange("fechaInicio", e.value as Date)}
                  showTime
                  hourFormat="24"
                  showIcon
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fechaFin" className="font-semibold">Hasta</label>
                <Calendar
                  id="fechaFin"
                  value={
                    formulario.fechaFin
                      ? typeof formulario.fechaFin === "string"
                        ? new Date(formulario.fechaFin)
                        : formulario.fechaFin
                      : null
                  }
                  minDate={
                    formulario.fechaInicio
                      ? new Date(formulario.fechaInicio)
                      : new Date()
                  }
                  onChange={(e) => handleInputChange("fechaFin", e.value as Date)}
                  showTime
                  hourFormat="24"
                  showIcon
                />
              </div>
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Condiciones de Aplicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Tipo de Aplicación</label>
                <div className="flex gap-4">
                  <RadioButton inputId="general" name="tipoAplicacion" value="General" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "General"} />
                  <label htmlFor="general">General</label>
                  <RadioButton inputId="mecanica" name="tipoAplicacion" value="Mecanica" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "Mecanica"} />
                  <label htmlFor="mecanica">Por mecánica</label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="valorMinimo" className="font-semibold">Valor mínimo</label>
                <InputNumber id="valorMinimo" min={0} value={formulario.valorMinimo} onValueChange={(e) => handleInputChange("valorMinimo", e.value ?? 0)} mode="currency" currency="USD" locale="en-US" />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="font-semibold">Criterio de Compra</label>
                <div className="flex gap-4">
                  <RadioButton inputId="criterio1" name="criterio" value="1" onChange={(e) => handleInputChange("criterio", e.value)} checked={formulario.criterio === "1"} />
                  <label htmlFor="criterio1">Recurrente por cada valor</label>
                  <RadioButton inputId="criterio2" name="criterio" value="0" onChange={(e) => handleInputChange("criterio", e.value)} checked={formulario.criterio === "0"} />
                  <label htmlFor="criterio2">Valor mínimo de compra</label>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label htmlFor="locales" className="font-semibold">Locales</label>
              <MultiSelect
                options={locales }
                optionLabel="local"
                value={formulario.locales}
                onChange={(e: any) => handleInputChange("locales", e.value)}
                placeholder="Seleccione uno o varios locales"
                name="locales"
              />
            </div>

          </section>
          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Productos y Categorías</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorías */}
              <div className="flex flex-col gap-2">
                <label htmlFor="categorias" className="font-semibold">Categorías</label>
                <MultiSelect
                  options={categorias}
                  optionLabel="name"
                  value={formulario.categorias}
                  onChange={(e) => handleInputChange("categorias", e.value)}
                  placeholder="Seleccione categorías"
                  filter
                />
              </div>

              {/* Subcategorías */}
              <div className="flex flex-col gap-2">
                <label htmlFor="subcategorias" className="font-semibold">Subcategorías</label>
                <MultiSelect
                  options={subcategorias}
                  optionLabel="name"
                  value={formulario.subcategorias}
                  onChange={(e) => handleInputChange("subcategorias", e.value)}
                  placeholder="Seleccione subcategorías"
                  filter
                />
              </div>

              {/* Proveedores */}
              <div className="flex flex-col gap-2">
                <label htmlFor="proveedores" className="font-semibold">Proveedores</label>
                <AutoComplete
                  multiple
                  field="name"
                  value={formulario.proveedores}
                  suggestions={filteredProveedores}
                  completeMethod={buscarProveedores}
                  onChange={(e) => handleInputChange("proveedores", e.value)}
                  placeholder="Seleccione proveedores"
                />
              </div>

              {/* Productos */}
              <div className="flex flex-col gap-2">
                <label htmlFor="productos" className="font-semibold">Productos</label>
                <AutoComplete
                  multiple
                  field="nombre"
                  value={formulario.productos}
                  suggestions={filteredProductos}
                  completeMethod={buscarProductos}
                  onChange={(e) => handleInputChange("productos", e.value)}
                  placeholder="Seleccione productos"
                />

              </div>
            </div>

            {/* Productos Excluidos */}
            <div className="mt-6 flex flex-col gap-2">
              <label htmlFor="productosExcluidos" className="font-semibold">Productos Excluidos</label>
              <AutoComplete
                multiple
                field="nombre"
                value={formulario.productosExcluidos}
                suggestions={filteredProductosExcluidos}
                completeMethod={buscarProductosExcluidos}
                onChange={(e) => handleInputChange("productosExcluidos", e.value)}
                placeholder="Seleccione productos"
              />
            </div>

            {/* Tabla de combinaciones */}
            <div className="pt-6">
              <label className="font-semibold block mb-2">Tabla de Combinaciones</label>
              <div className="flex justify-end mb-2">
                <Button
                  label="Agregar"
                  icon="pi pi-plus"
                  onClick={onAgregarSeleccionados}
                  raised
                  className="p-3 bg-green-500 hover:bg-green-600 text-white"
                />
              </div>
              <TableCombinacionesComponent
                combinaciones={combinaciones}
                setCombinaciones={(rowsOrUpdater) => {
                  setCombinaciones((prev) => {
                    const next =
                      typeof rowsOrUpdater === "function"
                        ? (rowsOrUpdater as unknown as (p: Combinacion[]) => Combinacion[])(prev)
                        : rowsOrUpdater;

                    // Mantén el formulario sincronizado con el array final, no con la función
                    handleInputChange("combinaciones", next as any);
                    return next;
                  });
                }}
                onRowDelete={onRowDeleteFromSelectors}
              />

            </div>
          </section>
          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4 mt-10">Configuración Visual</h2>

            {/* Formato de Logo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {formatos.map((formato) => (
                <div
                  key={formato.id}
                  className={`border rounded-md p-3 text-center cursor-pointer transition-all duration-200
                  ${formulario.nombreLogo === formato.id ? "ring-2 ring-green-600" : "hover:shadow-md"}`}
                  onClick={() => handleInputChange("nombreLogo", formato.id)}
                >
                  <img src={formato.imagen} alt={formato.label} className="w-full h-24 object-contain mb-2" />
                  <RadioButton
                    inputId={formato.id}
                    name="nombreLogo"
                    value={formato.id}
                    onChange={(e) => handleInputChange("nombreLogo", e.value)}
                    checked={formulario.nombreLogo === formato.id}
                  />
                  <label htmlFor={formato.id} className="ml-2">{formato.label}</label>
                </div>
              ))}
            </div>

            {/* Descripción del Ticket */}
            <div className="md:col-span-2 flex flex-col gap-2 pt-6">
              <label className="font-semibold" htmlFor="descripcionTicket">Descripción en el Ticket</label>
              <InputTextarea
                id="descripcionTicket"
                value={formulario.descripcionTicket}
                onChange={(e) => handleInputChange("descripcionTicket", e.target.value)}
                rows={3}
                autoResize
                placeholder="Ingrese el texto que aparecerá en el ticket"
              />
            </div>

            {/* Carga de Logo */}
            <div className="mt-6">
              <label className="font-semibold block mb-2">Cargar Logo (.bmp, máx 600px ancho)</label>
              <FileUpload
                name="logo"
                accept=".bmp"
                maxFileSize={5 * 1024 * 1024}
                customUpload
                uploadHandler={handleUploadLogo}
                emptyTemplate={<p className="m-0">Arrastre el archivo aquí o haga clic para cargar.</p>}
              />
            </div>

            {/* Texto Legal */}
            <div className="mt-6 flex flex-col gap-2 md:w-2/3">
              <label htmlFor="textoLegal" className="font-semibold">Texto legal del cupón</label>
              <InputTextarea
                id="textoLegal"
                value={formulario.textoLegal}
                onChange={(e) => handleInputChange("textoLegal", e.target.value)}
                rows={2}
                autoResize
                placeholder="Ej: Promoción válida hasta agotar stock. Máximo 1 cupón por persona."
                maxLength={30}
              />
            </div>
          </section>

          {/* Botones Guardar / Cancelar */}
          <div className="md:col-span-2 flex justify-end mt-6 space-x-4 p-5">
            <Button
              label={editingId ? "Actualizar" : "Guardar"}
              onClick={handleSubmit}
              raised
              loading={loading}
              icon={editingId ? "pi pi-save" : "pi pi-check"}
              className="p-button-success p-4 bg-green-500 hover:bg-green-600 text-white"
              
            />
            <Button
              label="Cancelar"
              type="button"
              onClick={() => navigate("/admin/cupon")}
              raised
              icon="pi pi-times"
              className="p-button-warning p-4 bg-red-500 hover:bg-red-600 text-white"
            
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FormCuponPage;
