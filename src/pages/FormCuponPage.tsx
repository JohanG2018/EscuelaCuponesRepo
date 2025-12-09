import React, { cache, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import MultiSelect from "../components/MultiselectComponent";
import TableCombinacionesComponent from "../components/TableCombinacionesComponent";
import PreviewTicket from "../components/PreviewTicket";
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
  FechaInicio,
  fechaFin
} from "../utils/Validacion"
import type {
  Cupon,
  Combinacion,
  TipoCombinacion
} from "../interface/cuponInterface";
import type { Local } from "../interface/Local"
import type { Categoria, Producto, Subcategoria } from "../interface/Producto"
import type { Proveedor } from "../interface/Proveedor"
import { Dialog } from "primereact/dialog";
import { ScrollTop } from "primereact/scrolltop";
import Upload from "../components/Upload";
import { getIdByTipo, getName, keyLocal, mergeCombinaciones, sameLocalesByKey, toArray, validateForm } from "../utils/Helper";
import { getCachedData, setCachedData } from "../utils/cache";

const FormCuponPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get("id");
  const editingId = id && /^\d+$/.test(id) ? Number(id) : null;
  const toast = useRef<Toast>(null);

  //use state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEdicion, setLoadingEdicion] = useState<boolean>(false);
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);
  const [combinarCondiciones, setCombinarCondiciones] = useState<boolean>(false);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
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
    esConsumidorFinal: false,
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
    criterio: false,
    formatoLogo: "formato1",
    datosCliente: false,
  });

  const [titulo, setTitulo] = useState(formulario.titulo);
  const [descripcion, setDescripcion] = useState(formulario.descripcion);
  const [descripcionTicket, setDescripcionTicket] = useState(formulario.descripcionTicket);
  const [textoLegal, setTextoLegal] = useState(formulario.textoLegal);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendigValue, setPendingValue] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const esGeneral = formulario.tipoAplicacion === "General";
  const isProduccion = formulario.tipoAmbiente === "Produccion";
  const submitLabel = isProduccion ? "Enviar a producción" : "Enviar a pruebas";
  const submitIcon = isProduccion ? "pi pi-cloud-upload" : "pi pi-send";
  const submitClass = isProduccion ? "bg-green-500 hover:bg-green-600" : "bg-green-500 hover:bg-green-600";
  const esMecanica = formulario.tipoAplicacion === "Mecanica";

  // Sincroniza con el estado principal al cargar (edición)
  useEffect(() => {
    if (formulario.titulo) setTitulo(formulario.titulo);
    if (formulario.descripcion) setDescripcion(formulario.descripcion);
    if (formulario.descripcionTicket) setDescripcionTicket(formulario.descripcionTicket);
    if (formulario.textoLegal) setTextoLegal(formulario.textoLegal);
  }, [formulario.id]); // Solo al cargar/editar

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const getOrFetch = async <T = any>(key: string, fetchFn: () => Promise<T>) => {
          const cache = getCachedData<T>(key);
          if (cache) return cache;
          const data = await fetchFn();
          setCachedData(key, data);
          return data;
        };


        const [cats, subs, provs, locs, prods] = await Promise.all([
          getOrFetch("categorias", fetchCategorias),
          getOrFetch("subcategorias", fetchSubCategorias),
          getOrFetch("proveedores", fetchProveedores),
          getOrFetch("locales", fetchLocales),
          getOrFetch("productos", () => searchProductos("no hay resultados", 100)),
        ]);

        setCategorias(cats);
        setSubcategorias(subs);
        setProveedores(provs);
        setLocales(locs);
        setProductos(prods);
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
        setLoadingEdicion(true);

        const cupon = await fetchCuponById(Number(id));

        if (!cupon || !cupon) {
          navigate("/no-encontado", { replace: true });
          return;
        }

        const data = cupon as Cupon;

        // Normalizar valores booleanos
        const normalizeBoolean = (value: any): boolean => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value === 1;
          if (typeof value === 'string') {
            const lower = value.trim().toLowerCase();
            return lower === '1' || lower === 'true' || lower === 'si';
          }
          return false;
        };

        const normalizedData = {
          ...data,
          esRecurrente: normalizeBoolean(data.esRecurrente),
          combinarCondiciones: normalizeBoolean(data.combinarCondiciones),
          esConsumidorFinal: normalizeBoolean(data.esConsumidorFinal),
          datosCliente: normalizeBoolean(data.datosCliente),
          //estado: normalizeBoolean(data.estado),
        };

        setFormulario((prev) => ({
          ...prev,
          ...normalizedData,
          logo: typeof data.logo === "string"
            ? (data.logo.includes("base64") ? data.logo : `data:image/png;base64,${data.logo}`)
            : data.logo,
          id: Number(id),
        }));

        if (Array.isArray(data.combinaciones)) {
          setCombinaciones(data.combinaciones);
        }
      } catch (err) {
        console.error("Error cargando cupón:", err);
      } finally {
        setLoadingEdicion(false);
      }
    };
    cargarCupon();
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => {
    // Ejecuta solo cuando ambos están cargados
    if (!locales.length || !formulario.locales?.length) return;
    const catalogByKey = new Map(locales.map(o => [keyLocal(o), o]));
    const seen = new Set<string>();
    const deduped = [];
    for (const sel of formulario.locales) {
      const k = keyLocal(sel);
      if (!seen.has(k)) {
        seen.add(k);
        deduped.push(sel);
      }
    }
    // 2) Reconciliar: reemplazar por el objeto oficial del catálogo si existe
    const reconciled = deduped.map(sel => catalogByKey.get(keyLocal(sel)) ?? sel);
    // 3) Evitar setState si no cambia nada (compara por claves)
    if (!sameLocalesByKey(formulario.locales, reconciled)) {
      setFormulario(prev => ({ ...prev, locales: reconciled }));
    }
  }, [locales, formulario.locales]);

  const AmbienteChange = (value: string) => {
    if (value === "Produccion") {
      setPendingValue(value)
      setShowConfirm(true);
    } else {
      handleInputChange("tipoAmbiente", value)
    }
  }
  const confirmacionChange = () => {
    if (pendigValue) {
      handleInputChange("tipoAmbiente", pendigValue)
    }
    setPendingValue(null);
    setShowConfirm(false);

  }
  const cancelarChange = () => {
    setPendingValue(null);
    setShowConfirm(false);
  }
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
    const excluidos = formulario.combinarCondiciones ? formulario.productosExcluidos : [];
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
  const buscarProductos = (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = productos.filter((p) =>
      p.nombre?.toLowerCase().includes(query) ||
      p.itemid?.toLowerCase().includes(query)
    );
    setFilteredProductos(resultados);
  };
  const buscarProductosExcluidos = (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = productos.filter((p) =>
      p.nombre?.toLowerCase().includes(query) ||
      p.itemid?.toLowerCase().includes(query)
    );
    setFilteredProductosExcluidos(resultados);
  };

  const buscarProveedores = (e: { query: string }) => {
    const query = e.query.toLowerCase();
    const resultados = proveedores.filter((p) =>
      p.name?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query)
    );
    setFilteredProveedores(resultados);
  };

  const handleSubmit = async () => {
    const res = validateForm(formulario);
    if (res.ok === false) {
      toast.current?.show({
        severity: "warn",
        summary: "Faltan campos por llenar",
        detail: `Completa: ${res.missing.join(", ")}`,
        life: 5000
      })
      return
    }
    setSaving(true)

    try {
      const esGeneral = formulario.tipoAplicacion === "General";

      const xmlData = await buildCuponXML({
        ...formulario,
        id: editingId || 0,
        // Estos se excluyen si es "General"
        combinaciones: esGeneral ? [] : formulario.combinaciones,
        categorias: esGeneral ? [] : formulario.categorias,
        subcategorias: esGeneral ? [] : formulario.subcategorias,
        proveedores: esGeneral ? [] : formulario.proveedores,
        productos: esGeneral ? [] : formulario.productos,
        productosExcluidos: esGeneral ? [] : formulario.productosExcluidos,
        valorMinimo: esGeneral ? 0 : formulario.valorMinimo,
        esRecurrente: esGeneral ? false : formulario.esRecurrente,
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
      navigate("/admin/cupon", {
        state: {
          success: editingId ? "Cupón actualizado" : "Cupón creado"
        }
      })
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.message || "Error al guardar el cupón",
        life: 4000,
      });
    } finally {
      setSaving(false)
    }
  };

  const modoEditar = !!formulario.id; // o como tú determines si es edición

  const formatos = [
    { id: "formato1", imagen: "/img/formato1.png", label: "Formato 1", idTipoFormato: 1 },
    { id: "formato2", imagen: "/img/formato2.png", label: "Formato 2", idTipoFormato: 2 },
    { id: "formato3", imagen: "/img/formato3.png", label: "Formato 3", idTipoFormato: 3 },
    { id: "sinformato", imagen: "/img/formato4.png", label: "Sin Formato", idTipoFormato: 4 },
  ];
  function onRowDeleteFromSelectors(_row: Combinacion): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="mx-auto">
      <Toast ref={toast} position="top-right" />
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#124f26] text-white p-4">
        Administrador de Cupones
      </h1>

      {loadingEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center">
          <ProgressSpinner style={{ width: 'full', height: '50px' }} strokeWidth="10" />
          <span className="text-lg font-semibold mt-4 text-white">Cargando el cupon...</span>
        </div>
      )}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="10" />
          <span className="text-lg font-semibold mt-4 text-white">Guardando...</span>
        </div>

      )}
      <>
        <div className="flex flex-col ">
          <Button icon="pi pi-arrow-left" onClick={() => navigate("/")} />

          <div className="flex justify-center md:justify-end  mt-6 space-x-4">
            <Button
              label={submitLabel}
              onClick={handleSubmit}
              raised
              icon={submitIcon}
              className={`p-4 text-white ${submitClass}`}
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

        </div>
        {/* A partir de aquí inicia el render visual (secciones del formulario) */}
        <div className={loadingEdicion ? "opacity-50 pointer-events-none" : ""}>
          <section className="p-5">
            <h2 className="text-xl font-semibold border-b-4 pb-2 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="titulo" className="text-lg font-semibold">Título <span className="text-sm">(Maximo 50 caracteres)</span></label>
                <InputText id="titulo"
                  value={formulario.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  maxLength={50}
                  className={formulario.titulo.trim() === "" ? "p-invalid" : ""}
                />
                {formulario.titulo.trim() === "" && (
                  <small className="p-error">El título es obligatorio.</small>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Ambiente</label>
                <div className="flex gap-4">
                  {!modoEditar && (
                    <>
                      <RadioButton
                        inputId="pruebas"
                        name="tipoAmbiente"
                        value="Pruebas"
                        onChange={(e) => AmbienteChange(e.value)}
                        checked={formulario.tipoAmbiente === "Pruebas"}
                      />
                      <label htmlFor="pruebas">Pruebas</label>
                    </>
                  )}

                  {modoEditar && (
                    <>
                      <RadioButton
                        inputId="pruebas"
                        name="tipoAmbiente"
                        value="Pruebas"
                        onChange={(e) => AmbienteChange(e.value)}
                        checked={formulario.tipoAmbiente === "Pruebas"}
                      />
                      <label htmlFor="pruebas">Pruebas</label>
                      <RadioButton
                        inputId="produccion"
                        name="tipoAmbiente"
                        value="Produccion"
                        onChange={(e) => AmbienteChange(e.value)}
                        checked={formulario.tipoAmbiente === "Produccion"}
                      />
                      <label htmlFor="produccion">Producción</label>
                    </>
                  )}
                  <Dialog
                    header="Confirmacion de cambio de Ambiente"
                    visible={showConfirm}
                    style={{ width: "30vw" }}
                    onHide={cancelarChange}
                  >
                    <p className="m-0  font-semibold">
                      Advertencia: Está a punto de cambiar el ambiente a <b>Producción</b>.
                      ¿Está seguro que desea continuar?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button label="Confirmar" icon="pi pi-check" onClick={confirmacionChange} className="p-button-text p-4 bg-green-500 xbg-red-500 text-white" raised />
                      <Button label="Cancelar" icon="pi pi-times" onClick={cancelarChange} className="p-button-text p-4 bg-red-500  text-white" raised />
                    </div>
                  </Dialog>
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="descripcion" className="text-lg font-semibold">Descripción <span className="text-sm">(Maximo 200 caracteres)</span></label>
                <InputTextarea

                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  rows={3}
                  autoResize
                  maxLength={200}
                  className={formulario.descripcion.trim() === "" ? "p-invalid" : ""}

                />
                {formulario.descripcion.trim() === "" && (
                  <small className="p-error">La descripcion es obligatoria.</small>
                )}
              </div>

              <div className="md:col-span-2">
                <Checkbox inputId="factura" checked={formulario.esConsumidorFinal}
                  onChange={(e) => handleInputChange("esConsumidorFinal", e.checked!!)} />
                <label htmlFor="factura" className="ml-2">Consumidor final</label>
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
                      : null}
                  minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                  onChange={(e) => handleInputChange("fechaInicio", e.value as Date)}
                  showIcon
                  hideOnDateTimeSelect
                  className={formulario.fechaInicio === "" ? "p-invalid" : ""}
                />
                {formulario.fechaInicio === "" && (
                  <small className="p-error">La fecha inico es obligatoria.</small>
                )}
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
                  showIcon
                  hideOnDateTimeSelect
                  className={formulario.fechaFin === "" ? "p-invalid" : ""}
                />
                {formulario.fechaFin === "" && (
                  <small className="p-error">La fecha fin es obligatoria.</small>
                )}

              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="locales" className="font-semibold">Locales</label>
                <MultiSelect
                  options={locales}
                  optionLabel="local"
                  value={formulario.locales}
                  onChange={(e: any) => handleInputChange("locales", e.value)}
                  loading={loading}
                  placeholder={locales.length === 0 ? "Cargando locales" : "Seleccione uno o varios locales"}
                  name="locales"
                  className={formulario.locales.toString() === "" ? "p-invalid" : ""}
                  disabled={locales.length == 0}
                />
                {formulario.locales.toString() === "" && (
                  <small className="p-error">Debe ingresar al menos un local.</small>
                )}
              </div>
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b-4 pb-2 mb-4">Condiciones de Aplicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Tipo de Aplicación</label>
                <div className="flex gap-4">
                  <RadioButton inputId="general" name="tipoAplicacion" value="General" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "General"} /> {/*Aqui es donde voy a validar que tipo de promocion es la que esta selecionadondo JCHID*/}
                  <label htmlFor="general">General</label>
                  <RadioButton inputId="mecanica" name="tipoAplicacion" value="Mecanica" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "Mecanica"} />
                  <label htmlFor="mecanica">Por mecánica</label>
                </div>
                {/* --- validacion de campo vacio de tipo Aplicacion JCHID --- */}
                {formulario.tipoAplicacion === "" && (
                  <small className="p-error">Debe seleccionar un tipo de aplicación.</small>
                )}
                {/* --- FIN validacion de campo vacio de tipo Aplicacion JCHID --- */}
              </div>



              <div className="flex flex-col gap-2">
                <label htmlFor="valorMinimo" className="font-semibold">Valor minimo de compra</label>
                <InputNumber
                  id="valorMinimo"
                  min={0}
                  value={formulario.valorMinimo}
                  onValueChange={(e) => handleInputChange("valorMinimo", e.value ?? 0)}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  disabled={esGeneral}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="checkRecurrente"
                  name="esRecurrente"
                  checked={formulario.esRecurrente === true}
                  onChange={(e) => handleInputChange("esRecurrente", e.checked!!)}
                  disabled={esGeneral}
                />
                <label htmlFor="checkRecurrente" className="ml-2">Compra recurrente</label>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center">
                  <Checkbox
                    checked={!!formulario.combinarCondiciones}
                    onChange={(e) => handleInputChange("combinarCondiciones", e.checked!!)}
                    disabled={esGeneral}
                  />
                  <span>Combinar condiciones</span>
                </label>
              </div>
            </div>
          </section>

          {/* Inicio de la sección Productos y Categorías con validacion JCHID */}
          {esMecanica && (
            <section className="p-5">
              <h2 className="text-xl font-semibold border-b-4 pb-2 mb-4">Productos y Categorías</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categorías */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="categorias" className="font-semibold">Categorías</label>
                  <MultiSelect
                    options={categorias}
                    optionLabel="name"
                    value={formulario.categorias}
                    onChange={(e) => handleInputChange("categorias", e.value)}
                    loading={loading}
                    placeholder={categorias.length === 0 ? "Cargando las categorias..." : "Seleccione categorías"}
                    filter
                    disabled={esGeneral || categorias.length === 0}
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
                    placeholder={categorias.length === 0 ? "Cargando subcategorias..." : "Seleccione subcategorías"}
                    filter
                    disabled={esGeneral || subcategorias.length === 0}
                    loading={loading}
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
                    placeholder={proveedores.length === 0 ? "Cargando proovedores..." : "Escriba el proveedores"}
                    disabled={esGeneral || proveedores.length == 0}

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
                    placeholder={productos.length === 0 ? "Cargando productos..." : "Escriba los productos"}
                    disabled={esGeneral || productos.length == 0}
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
                  placeholder={productos.length === 0 ? "Cargando productos excluidos" : "Escriba productos excluidos"}
                  disabled={esGeneral || productos.length === 0 || !formulario.combinarCondiciones}
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
                    disabled={esGeneral}
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
          )}
          {/* Fin de la sección Productos y Categorías con validacion JCHID */}

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b-4 pb-1 mb-4 mt-10">Configuración Visual</h2>
            <div className="flex justify-end pb-3">
              <Button
                type="button"
                label="Previsualizar"
                icon="pi pi-eye"
                raised
                className="bg-green-500 hover:bg-green-600 focus-visible:bg-green-600 p-4 text-white "
                onClick={() => { setShowPreview(true) }}
              />
            </div>
            <PreviewTicket
              visible={showPreview}
              onHide={() => setShowPreview(false)}
              titulo={formulario.titulo}
              descripcion={formulario.descripcionTicket}
              legal={formulario.textoLegal}
              logoBase64={typeof formulario.logo === "string" ? formulario.logo : undefined}
              idFormato={Number(formulario.idTipoFormato)}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {formatos.map((formato) => (
                <div
                  key={formato.id}
                  className={`border rounded-md p-3 text-center cursor-pointer transition-all duration-200
      ${formulario.nombreLogo === formato.id ? "ring-2 ring-green-600" : "hover:shadow-md"}`}
                  onClick={() => {
                    handleInputChange("nombreLogo", formato.id)
                    handleInputChange("idTipoFormato", formato.idTipoFormato)
                  }}
                >
                  <img
                    src={formato.imagen}
                    alt={formato.label}
                    className="w-full h-24 object-contain mb-2"
                  />
                  <div className="flex items-center justify-center">
                    <RadioButton
                      inputId={formato.id}
                      name="nombreLogo"
                      value={formato.id}
                      onChange={(e) => {
                        console.log("Seleccionado:", formato.id, formato.idTipoFormato); // <--- AGREGA ESTO
                        handleInputChange("nombreLogo", e.value)
                        handleInputChange("idTipoFormato", formato.idTipoFormato)
                      }}
                      checked={formulario.nombreLogo === formato.id}
                    />
                    <label htmlFor={formato.id} className="ml-2">{formato.label}</label>
                  </div>

                  {/* Mostrar checkbox SIEMPRE que el formato esté seleccionado */}
                  {formulario.nombreLogo === formato.id && (
                    <div className="mt-3 flex items-center justify-center">
                      <Checkbox
                        inputId={`datosCliente-${formato.id}`}
                        checked={!!formulario.datosCliente}
                        onChange={(e) => handleInputChange("datosCliente", e.checked?? false )}
                      />
                      <label htmlFor={`datosCliente-${formato.id}`} className="ml-2">
                        Datos del cliente
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Descripción del Ticket */}
            <div className="md:col-span-2 flex flex-col gap-2 pt-6">
              <label className=" text-lg font-semibold" htmlFor="descripcionTicket">Información <span className="text-sm">(Máximo 100 caracteres)</span></label>
              <InputTextarea
                id="descripcionTicket"
                value={formulario.descripcionTicket}
                onChange={(e) => {
                  const valor = e.target.value;
                  // Expresión Regular (Regex):
                  // Permite: a-z, A-Z, 0-9, ñ, Ñ, vocales con tilde, diéresis, espacios, puntos y comas.
                  const regex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ .,\n¿?¡!:;"'()\-]*$/;

                  if (regex.test(valor)) {
                    // Si pasa la prueba, actualizamos el estado
                    handleInputChange("descripcionTicket", valor);
                  } else {
                    // Si NO pasa (ej: emojis, @, #, $), mostramos la alerta y NO actualizamos el estado
                    toast.current?.show({
                      severity: "warn",
                      summary: "Carácter no permitido",
                      detail: "No se permiten emojis ni caracteres especiales.",
                      life: 2000 // Dura 2 segundos para no ser molesto
                    });
                  }
                }}
                rows={3}
                maxLength={100}
                autoResize
                placeholder="Ingrese el texto que aparecerá en el ticket"
              />
            </div>

            {/* Carga de Logo */}
            <div className="mt-6">
              <Upload
                value={formulario.logo as any}
                onChange={(f) => handleInputChange("logo", f as any)}
                toastRef={toast as React.RefObject<Toast>}
                maxWidth={600}
                maxSizeMB={5}
              />
            </div>

            {/* Sección Texto Legal */}
            <div className="mt-6 flex flex-col gap-2 md:w-2/3">
              <label htmlFor="textoLegal" className="text-lg font-semibold">Legales <span className="text-sm">(Máximo 80 caracteres)</span></label>
              <InputTextarea
                id="textoLegal"
                value={formulario.textoLegal}
                onChange={(e) => {
                  const valor = e.target.value;
                  // 🛑 NUEVA EXPRESIÓN REGULAR: EXCLUYE explícitamente el salto de línea (\n)
                  // La Regex original del otro campo permitía \n. Esta versión no lo permite.
                  const regexSinSalto = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ .,¿?¡!:;"'()\-]*$/;

                  if (regexSinSalto.test(valor) || valor === "") {
                    // Si pasa la prueba o si el campo está vacío, actualizamos el estado
                    handleInputChange("textoLegal", valor);
                  } else {
                    // Si NO pasa (ej: por salto de línea o caracter especial)
                    toast.current?.show({
                      severity: "warn",
                      summary: "Carácter no permitido",
                      detail: "No se permiten saltos de línea (Enter) ni otros caracteres especiales.",
                      life: 2000
                    });
                  }
                }}
                rows={2}
                autoResize
                placeholder="Ej: Promoción válida hasta agotar stock. Máximo 1 cupón por persona."
                maxLength={80}
                className={formulario.textoLegal.trim() === "" ? "p-invalid" : ""}
              />
              {formulario.textoLegal.trim() === "" && (
                <small className="p-error">El texto legal no puede estar vacío o contener solo espacios.</small>
              )}
            </div>
          </section>
        </div>
        <ScrollTop
          threshold={200}
          className="w-3rem h-3rem border-round bg-green-600 hover:bg-green-700 shadow-lg"
          icon="pi pi-arrow-up text-white text-lg"
        />
      </>
    </div>
  );
};
export default FormCuponPage;
