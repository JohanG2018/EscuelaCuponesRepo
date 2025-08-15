import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import MultiSelect from "../components/MultiselectComponent";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import TableCombinacionesComponent, { type TipoCombinacion } from "../components/TableCombinacionesComponent";
import { ProgressSpinner } from "primereact/progressspinner";
import { buildCuponXML, fetchLocales, fetchProveedores, postCuponXML, searchProductos, type Producto, type Proveedor } from "../service/cupon";
import { AutoComplete } from "primereact/autocomplete";


interface Combinacion {
  key: string;
  nombre: string;
  tipo: TipoCombinacion;
  cantidad: number;
  valor: number;
  combinada: boolean;
  excluida: boolean;
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
  criterio: string; // '1' | '2'
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
interface ItemMarketing {
  id: number;
  title: string;
  sku: string;
}
interface Locales {
  id: number,
  local: string,
  establecimiento: number
}
const FormCuponPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const editingId = id && /^\d+$/.test(id) ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // ======= State =======
  const [loading, setLoading] = useState(false);
  const [descripcionTicket, setDescripcionTicket] = useState("");
  const [checkedDatosCliente, setCheckedDatosCliente] = useState(false);
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);
  const [proveedorOpts, setProveedorOpts] = useState<Proveedor[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

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
    formatoLogo: "formato1",
    logo: null,
  });

  const [producto, setProductos] = useState<ItemMarketing[]>([]);
  const [locales, setLocales] = useState<Locales[]>([]);
  const [loadingLocales, setLoadingLocales] = useState(false);
  const [prodSugs, setProdSugs] = useState<Producto[]>([]);
  const debounceRef = useRef<number | undefined>(undefined);
  const [categorias, setCategorias] = useState<{ id: number; categoria: string; cantidad_items: number }[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<any[]>([]);

const buscarProveedores = (event: { query: string }) => {
  const query = event.query.toLowerCase();
  const resultados = (proveedorOpts || []).filter((p: any) =>
    p.name.toLowerCase().includes(query)
  );
  setFilteredProveedores(resultados);
};
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:8080/wordpress/wp-json/delportal/v1/listado_categorias_marketing");
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("http://localhost:8080/wordpress/wp-json/delportal/v1/listado_items_marketing");
        const data = await res.json();
        setProductos(data);

      }
      catch (error) {
        console.log("Error al cargar el producto" + error)
      }
    }
    fetchProductos();
  }, [])
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingLocales(true);
        const data = await fetchLocales();
        if (alive) setLocales(data.map((l: any) => ({
          ...l,
          id: typeof l.id === "string" ? parseInt(l.id, 10) : l.id
        })));
      } catch (e) {
        console.error("Error al cargar locales:", e);
        if (alive) setLocales([]);
      } finally {
        if (alive) setLoadingLocales(false);
      }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingProveedores(true);
        const data = await fetchProveedores();
        if (alive) setProveedorOpts(data);
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
        if (alive) setProveedorOpts([]);
      } finally {
        if (alive) setLoadingProveedores(false);
      }
    })();
    return () => { alive = false; };
  }, []);
  const subcategorias = [{ name: "Bebidas" }, { name: "Lácteos" }, { name: "Frutas y Verduras" }, { name: "Cereales" }, { name: "Snacks" }];
  const proveedores = [{ name: "Proveedor A" }, { name: "Proveedor B" }, { name: "Proveedor C" }, { name: "Proveedor D" }, { name: "Proveedor E" }];
  const formatos = [
    { id: "formato1", imagen: "/img/formato1.png", label: "Formato 1" },
    { id: "formato2", imagen: "/img/formato2.png", label: "Formato 2" },
    { id: "formato3", imagen: "/img/formato3.png", label: "Formato 3" },
    { id: "sinformato", imagen: "/img/formato4.png", label: "Sin Formato" },
  ];
  const completeProductos = (e: { query: string }) => {
    const q = e.query?.trim() ?? "";
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    // solo desde 3 letras
    if (q.length < 3) {
      setProdSugs([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const found = await searchProductos(q, 20);
        setProdSugs(found);
      } catch (err) {
        console.error("searchProductos error:", err);
        setProdSugs([]);
      }
    }, 300); // debounce 300ms
  };
  // ======= UI helpers =======
  const subcatDisabled = !Array.isArray(formulario.categorias) || formulario.categorias.length === 0;
  useEffect(() => {
    if (subcatDisabled && Array.isArray(formulario.subcategorias) && formulario.subcategorias.length) {
      handleInputChange("subcategorias", []);
    }
  }, [subcatDisabled]);

  const handleInputChange = <K extends keyof FormularioCupon>(field: K, value: FormularioCupon[K]) => {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  };

  const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);
  const getName = (item: any) =>
    typeof item === "string"
      ? item
      : item?.name
      ?? item?.local
      ?? item?.categoria
      ?? item?.title
      ?? item?.label
      ?? String(item);

  const buildRows = (items: any[], tipo: TipoCombinacion, opts?: { excluida?: boolean }): Combinacion[] =>
    toArray(items).map((it: any) => {
      const nombre = getName(it);
      return {
        key: `${tipo}:${nombre}`,
        nombre,
        tipo,
        cantidad: 1,
        valor: 0,
        combinada: false,
        excluida: !!opts?.excluida, // productos excluidos llegan con true
      };
    });
  const mergeCombinaciones = (base: Combinacion[], nuevas: Combinacion[]) => {
    const map = new Map(base.map((r) => [r.key, r]));
    for (const f of nuevas) {
      const prev = map.get(f.key);
      if (!prev) {
        map.set(f.key, f);
      } else {
        // si alguna fuente lo marca excluido, prevalece excluido = true
        const excluida = prev.excluida || f.excluida;
        map.set(f.key, { ...prev, excluida });
      }
    }
    return Array.from(map.values());
  };


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
        break;
      case "Subcategoria":
        handleInputChange("subcategorias", removeByName(formulario.subcategorias, row.nombre));
        break;
      case "Proveedor":
        handleInputChange("proveedores", removeByName(formulario.proveedores, row.nombre));
        break;
      case "Producto":
        if (row.excluida) {
          handleInputChange("productosExcluidos", removeByName(formulario.productosExcluidos, row.nombre));
        } else {
          handleInputChange("productos", removeByName(formulario.productos, row.nombre));
        }
        break;
    }
  };

  const onAgregarSeleccionados = () => {
    // Construye filas para cada grupo
    const filasCategorias = buildRows(formulario.categorias, "Categoria");
    const filasSubcategorias = buildRows(formulario.subcategorias, "Subcategoria");
    const filasProveedores = buildRows(formulario.proveedores, "Proveedor");
    const filasProductos = buildRows(formulario.productos, "Producto");
    const filasExcluidos = buildRows(formulario.productosExcluidos, "Producto", { excluida: true });

    // Une todas las filas nuevas
    const nuevas = [
      ...filasCategorias,
      ...filasSubcategorias,
      ...filasProveedores,
      ...filasProductos,
      ...filasExcluidos,
    ];

    // Merge con lo que ya había (sin duplicar, y prevalece excluida=true si aplica)
    const merged = mergeCombinaciones(combinaciones, nuevas);

    // Actualiza tabla y form
    setCombinaciones(merged);
    handleInputChange("combinaciones", merged as any);

    // Limpia los multiselect
    handleInputChange("categorias", []);
    handleInputChange("subcategorias", []);
    handleInputChange("proveedores", []);
    handleInputChange("productos", []);
    handleInputChange("productosExcluidos", []);
  };


  async function createCoupon() {
    // 1) Construir XML (log para ver qué mandamos)
    const reqXML = await buildCuponXML({
      titulo: formulario.titulo,
      descripcion: formulario.descripcion,
      descripcionTicket,
      textoLegal: formulario.legal,
      fechaInicio: formulario.fechaInicio,
      fechaFin: formulario.fechaFin,
      estado: true,
      tipoAplicacion: formulario.tipoAplicacion,
      valorMinimo: formulario.valorMinimo,
      esRecurrente: formulario.criterio === "1",
      idTipoFormato: 1,
      logo: formulario.logo,
      nombreLogo: formulario.formatoLogo,
      tipoAmbiente: formulario.tipoAmbiente,
      esConsumidorFinal: !formulario.factura,                // factura? => no CF (ajústalo si aplica)
      aplicaLocales: formulario.locales.length > 0,
      combinarCondiciones: combinaciones.length > 1,         // usa la tabla
      cantidadProductos: combinaciones.length                // usa la tabla
    });

    console.log("[createCoupon] Enviando XML:\n", reqXML);   // 👈 útil para depurar

    // 2) Enviar al backend
    const resp = await postCuponXML(reqXML);
    console.log("[createCoupon] Respuesta:", resp);          // 👈 ver qué devuelve
    return resp;
  }




  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        // aquí mantienes tu lógica de update si aún no migras a buildCuponXML
        await updateCouponXMLReq(editingId);
        toast.current?.show({ severity: "success", summary: "Actualizado", detail: `Cupón #${editingId} guardado`, life: 2500 });
      } else {
        const { ok, mensaje } = await createCoupon();
        if (ok) {
          toast.current?.show({ severity: "success", summary: "Creado", detail: "Cupón creado correctamente", life: 2500 });
        } else {
          toast.current?.show({ severity: "warn", summary: "Atención", detail: mensaje || "El SP no devolvió OK", life: 3500 });
        }
      }
      navigate("/");
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Operación fallida", life: 3500 });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto ">
      <Toast ref={toast} position="top-right" />
      <h1 className="text-center text-2xl font-bold mb-6 bg-[#9b0e0e] text-white p-4">
        Administrador de Cupones
      </h1>
      {loading && (
        <div className="flex flex-col justify-center items-center py-12 text-gray-600 gap-3">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
          <span className="text-sm font-medium">Cargando Información del cupón...</span>

        </div>
      )}
      {!loading && (
        <>
          <div className="px-5">
            <Button icon="pi pi-arrow-left" onClick={() => navigate("/")} />
          </div>
          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/*Titulo */}
              <div className="flex flex-col gap-2">
                <label htmlFor="titulo" className="font-semibold">Titulo del Cupón</label>
                <InputText id="titulo" value={formulario.titulo} onChange={(e) => handleInputChange("titulo", e.target.value)} placeholder="Ingrese el título" />
              </div>

              {/*Ambiente */}
              <div className="flex flex-col gap-2 ">
                <label className="font-semibold">Tipo de Ambiente</label>
                <div className="flex gap-3 items-center">
                  <RadioButton inputId="ambiente-pruebas" name="tipoAmbiente" value="Pruebas" onChange={(e) => handleInputChange("tipoAmbiente", e.value)} checked={formulario.tipoAmbiente === "Pruebas"} />
                  <label htmlFor="ambiente-pruebas">Pruebas</label>
                  <RadioButton inputId="ambiente-produccion" name="tipoAmbiente" value="Produccion" onChange={(e) => handleInputChange("tipoAmbiente", e.value)} checked={formulario.tipoAmbiente === "Produccion"} />
                  <label htmlFor="ambiente-produccion">Producción</label>
                </div>
              </div>

              {/* Descripción General*/}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="font-semibold" htmlFor="descripcion"> Descripción del cupón</label>
                <InputTextarea id="descripcion" value={formulario.descripcion} onChange={(e) => handleInputChange("descripcion", e.target.value)} rows={3} autoResize placeholder="Ingrese la descripción" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Con Datos */}
              <div className="md:col-span-2 flex flex-col gap-2 ">
                <label className="font-semibold">Con Datos</label>
                <div className="flex gap-3">
                  <Checkbox inputId="factura" value="permiteFactura" onChange={(e) => handleInputChange("factura", e.checked ?? false)} checked={formulario.factura} />
                  <label htmlFor="prueba">Permite factura</label>
                </div>
              </div>

              {/* Fechas */}
              <div className="flex flex-col gap-2">
                <label htmlFor="fechaInicio" className="font-semibold">Desde</label>
                <Calendar id="fechaInicio" value={formulario.fechaInicio} onChange={(e) => handleInputChange("fechaInicio", e.value as Date)} hourFormat="24" showTime showIcon placeholder="Seleccione una fecha y una hora" className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="fechaFin" className="font-semibold">Hasta:</label>
                <Calendar id="fechaFin" value={formulario.fechaFin} onChange={(e) => handleInputChange("fechaFin", e.value as Date)} showTime hourFormat="24" showIcon placeholder="Seleccione una fecha y una hora" className=" border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Condiciones de Aplicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Aplicación */}
              <div className="flex flex-col gap-2">
                <label htmlFor="tipoAplicacion" className="font-semibold">Tipo de Aplicación</label>
                <div className="flex gap-3">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioButton inputId="apli-general" name="tipoAplicacion" value="General" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "General"} />
                      <label htmlFor="apli-general">General</label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioButton inputId="apli-mecanica" name="tipoAplicacion" value="Por mecánica" onChange={(e) => handleInputChange("tipoAplicacion", e.value)} checked={formulario.tipoAplicacion === "Por mecánica"} />
                    <label htmlFor="apli-mecanica">Por mecánica</label>
                  </div>
                </div>
              </div>

              {/* Valor */}
              <div className="flex flex-col gap-2">
                <label htmlFor="valor" className="font-semibold">Valor</label>
                <InputNumber inputId="valorMinimo" value={formulario.valorMinimo} onValueChange={(e) => handleInputChange("valorMinimo", e.value || 0)} mode="currency" currency="USD" locale="en-US" min={0} placeholder="Ej. 20.00" className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Criterio de compra */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="font-semibold">Criterio de Compra</label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioButton inputId="criterio-1" name="criterio" value="1" onChange={(e) => handleInputChange("criterio", e.value)} checked={formulario.criterio === "1"} />
                    <label htmlFor="criterio-1">Recurrente por cada valor</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioButton inputId="criterio-2" name="criterio" value="2" onChange={(e) => handleInputChange("criterio", e.value)} checked={formulario.criterio === "2"} />
                    <label htmlFor="criterio-2">Mínimo de valor de compra</label>
                  </div>
                </div>
              </div>

              {/* Selector de locales */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="locales" className="font-semibold">Locales</label>
                <MultiSelect
                  options={locales || []}
                  optionLabel="local"
                  value={formulario.locales}
                  onChange={(e: any) => handleInputChange("locales", e.value)}
                  placeholder="Seleccione uno o varios locales"
                  name="locales"
                />
              </div>
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4">Productos y Categorias</h2>

            <div className="grid grid-cols-1 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="categoria" className="font-semibold text-gray-700">Categoria</label>
                <MultiSelect
                  inputId="categoria"
                  options={categorias || []}
                  optionLabel="categoria"
                  value={formulario.categorias}
                  onChange={(e: any) => handleInputChange("categorias", e.value)}
                  placeholder="Seleccione una o varias categorías"
                  name="categorias"
                  filter
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="subCategoria" className="font-semibold text-gray-700">SubCategoria</label>
                <MultiSelect
                  options={subcategorias || []}
                  optionLabel="name"
                  value={formulario.subcategorias}
                  onChange={(e: any) => handleInputChange("subcategorias", e.value)}
                  placeholder="Seleccione una o varias subcategorías"
                  name="subcategorias"
                  filter
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="proveedores" className="font-semibold text-gray-700">Proveedor</label>
                <AutoComplete
                  multiple
                  value={formulario.proveedores}
                  suggestions={filteredProveedores}
                  completeMethod={buscarProveedores}
                  field="name"
                  onChange={(e) => handleInputChange("proveedores", e.value)}
                  placeholder="Seleccione uno o varios proveedores"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="producto" className="font-semibold text-gray-700">Producto</label>
                <AutoComplete
                  multiple
                  value={formulario.productos}
                  onChange={(e) => handleInputChange("productos", e.value)}
                  suggestions={prodSugs}
                  completeMethod={completeProductos}
                  field="title"
                  placeholder="Escribe al menos 3 letras..."
                  dropdown={false}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  itemTemplate={(item) => (
                    <div className="flex items-center justify-between w-full">
                      <span>{item.title}</span>
                      {item.sku ? <small className="text-gray-500 ml-2">SKU: {item.sku}</small> : null}
                    </div>
                  )}
                  selectedItemTemplate={(item) => (
                    <div className="px-2">{item.title}</div>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <label htmlFor="productosExcluidos" className="font-semibold">Productos excluidos</label>
              <MultiSelect
                options={producto || []}
                optionLabel="title"
                filter
                value={formulario.productosExcluidos}
                onChange={(e: any) => handleInputChange("productosExcluidos", e.value)} placeholder="Seleccione productos a excluir" name="productosExcluidos" />
            </div>

            <div className="md:col-span-2 pt-5">
              <label htmlFor="combinaciones" className="font-semibold">Tabla combinaciones</label>
              <div className="flex justify-end">
                <Button label="Agregar" icon="pi pi-plus" className="p-button-success p-2 bg-green-600 text-white hover:bg-green-700" raised onClick={onAgregarSeleccionados} />
              </div>

              <TableCombinacionesComponent
                combinaciones={combinaciones}
                setCombinaciones={(rows) => {
                  setCombinaciones(rows);
                  handleInputChange("combinaciones", rows as any);
                }}
                onRowDelete={onRowDeleteFromSelectors}
              />
            </div>
          </section>

          <section className="p-5">
            <h2 className="text-xl font-semibold border-b pb-1 mb-4 mt-10">Configuración Visual</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {formatos.map((formato) => (
                <div
                  key={formato.id}
                  className={`border rounded-md p-3 text-center cursor-pointer transition-all duration-200
              ${formulario.formatoLogo === formato.id ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}
                  onClick={() => {
                    handleInputChange("formatoLogo", formato.id);
                    setCheckedDatosCliente(false);
                  }}
                >
                  <img src={formato.imagen} alt={formato.label} className="w-full h-24 object-contain mb-2" />
                  <RadioButton inputId={formato.id} name="formatoLogo" value={formato.id} onChange={(e) => handleInputChange("formatoLogo", e.value)} checked={formulario.formatoLogo === formato.id} />
                  <label htmlFor={formato.id} className="ml-2">{formato.label}</label>

                  {formulario.formatoLogo === formato.id && (
                    <div className="mt-4 flex flex-col gap-2 text-left">
                      <div className="flex flex-col gap-1">
                        <div>
                          <Checkbox inputId="datos-cliente" value="datos" onChange={(e) => setCheckedDatosCliente(!!e.checked)} checked={checkedDatosCliente} />
                          <label htmlFor="datos-cliente" className="ml-2">Incluir Datos Cliente</label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="md:col-span-2 flex flex-col gap-2 pt-4">
              <label className="font-semibold" htmlFor="descripcion_ticket"> Descripción del ticket</label>
              <InputTextarea id="descripcion_ticket" value={descripcionTicket} onChange={(e) => setDescripcionTicket(e.target.value)} rows={3} autoResize placeholder="Ingrese el texto que aparecerá en el ticket" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Nota: Si no se selecciona un formato de logo, se imprimirá el cupón sin imagen, solo con texto.</p>
            </div>

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

            <div className="mt-6 flex flex-col gap-2 md:w-2/3">
              <label htmlFor="legal" className="font-semibold">Texto legal del cupón</label>
              <InputTextarea id="legal" value={formulario.legal} onChange={(e) => handleInputChange("legal", e.target.value)} rows={2} autoResize placeholder="Ej: Promoción válida hasta agotar stock. Máximo 1 cupón por persona." />
            </div>
          </section>

          <div className="md:col-span-2 flex justify-end mt-6 space-x-4 p-5">
            <Button
              label={editingId ? "Actualizar" : "Guardar"}
              onClick={handleSubmit}
              raised
              loading={loading}
              icon={editingId ? "pi pi-save" : "pi pi-check"}
              className="p-button-success p-4 bg-green-600 text-white"
            />
            <Button
              label="Cancelar"
              type="button"
              onClick={() => navigate(-1)}
              raised
              icon="pi pi-times"
              className="p-button-warning p-4 bg-red-600 text-white"
            />
          </div>
        </>
      )}

    </div>

  );
};

export default FormCuponPage;
