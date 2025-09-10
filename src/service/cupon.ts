import type { Cupon } from "../interface/cuponInterface";
import type { Local } from "../interface/Local";
import type { Categoria, Producto, Subcategoria } from "../interface/Producto";
import type { Proveedor } from "../interface/Proveedor";
import { fileToBase64, origenToTipo, toBool01, toDate } from "../utils/Helper";

export const API_BASE = import.meta.env.VITE_API_BASE;
const cache = new Map<string, Producto[]>();

function mapCupon(raw: any): Cupon {
  const cab = raw.cabecera ?? {};
  const detalle: any[] = Array.isArray(raw.detalle) ? raw.detalle : [];

  const combinaciones = detalle.map((item: any, idx: number) => ({
    key: `${item.codigoItem ?? idx}`,                    // clave estable para DataTable
    itemId: String(item.codigoItem ?? ""),               // el id real del ítem
    nombre: String(item.nombreItem ?? ""),               // mostrado en “Nombre”
    tipo: origenToTipo(item.origen),                     // G | SG | P | I | M
    cantidad: Number(item.cantidad ?? 0),
    valor: Number(item.valor ?? 0),
    excluida: toBool01(item.esExcluido),                 // "1"/"0" → boolean
    combinada: toBool01(item.esCombinado),    // "1"/"0" → boolean
    esConsumidorFinal: toBool01(cab.esConsumidorFinal),
  }));

  return {
    id: Number(cab.id) || 0,
    titulo: cab.titulo ?? "",
    descripcion: cab.descripcion ?? "",
    descripcionTicket: cab.textoCupon ?? cab.descripcionTicket ?? "",
    textoLegal: cab.textoLegal ?? "",
    fechaInicio: toDate(cab.fechaInicio),
    fechaFin: toDate(cab.fechaFin),
    estado: cab.estado,                    // "Activo"/"Inactivo"
    tipoAplicacion: cab.tipoAplicacion ?? "",
    valorMinimo: Number(cab.montoMinimo ?? 0),
    esRecurrente: toBool01(cab.esRecurrente), // "Sí"/"No" → boolean
    idTipoFormato: cab.idTipoFormato ?? "",
    logo: cab.logo ?? "",
    nombreLogo: cab.nombreLogo ?? "",
    tipoAmbiente: cab.ambiente ?? "",
    esConsumidorFinal: toBool01(cab.esConsumidorFinal),
    aplicaLocales: cab.aplicaLocales ?? "No",
    combinarCondiciones: cab.combinarCondiciones ?? "No",
    cantidadProductos: cab.cantidadProductos ?? 0,
    formatoLogo: cab.formatoLogo ?? "",
    datosCliente: cab.incluirDatosCliente,

    // listas (si en el futuro el backend las envía)
    locales: normalizeLocalesFromCupon(raw.locales),
    categorias: raw.categorias ?? [],
    subcategorias: raw.subcategorias ?? [],
    productos: raw.productos ?? [],
    productosExcluidos: raw.productosExcluidos ?? [],
    proveedores: raw.proveedores ?? [],

    //ahora sí normalizada
    combinaciones,
  };
}

export async function buildCuponXML(formulario: Cupon): Promise<string> {
  const esc = (s: any) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatDateTimeToSQL = (date: Date | string): string => {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

 
  let logoStr = "";
  if (formulario.logo instanceof File) {
    const b64 = await fileToBase64(formulario.logo);
    logoStr = (b64.includes(",") ? b64.split(",")[1] : b64).trim();
  } else if (typeof formulario.logo === "string") {
    // puede venir ya en base64 o vacío
    logoStr = formulario.logo.includes(",") ? formulario.logo.split(",")[1].trim() : formulario.logo.trim();
  }

  const combos = Array.isArray(formulario.combinaciones) ? formulario.combinaciones : [];

  return `
<req>
  <Cabecera>
    ${formulario.id ? `<idCupon>${esc(formulario.id)}</idCupon>` : ""}
    <descripcion>${esc(formulario.descripcion)}</descripcion>
    <tituloCupon>${esc(formulario.titulo)}</tituloCupon>
    <textoCupon>${esc(formulario.descripcionTicket)}</textoCupon>
    <textoLegal>${esc(formulario.textoLegal)}</textoLegal>
    <fechaInicio>${formatDateTimeToSQL(formulario.fechaInicio!)}</fechaInicio>
    <fechaFin>${formatDateTimeToSQL(formulario.fechaFin!)}</fechaFin>
    <estado>${formulario.estado ? 1 : 0}</estado>
    <tipoAplicacion>${esc(formulario.tipoAplicacion)}</tipoAplicacion>
    <montoMinimo>${Number(formulario.valorMinimo || 0)}</montoMinimo>
    <esRecurrente>${formulario.esRecurrente ? 1 : 0}</esRecurrente>
    <idTipoFormato>${esc(formulario.idTipoFormato)}</idTipoFormato>
    <logo>${esc(logoStr)}</logo>
    <nombreLogo>${esc(formulario.nombreLogo)}</nombreLogo>
    <ambiente>${esc(formulario.tipoAmbiente)}</ambiente>
    <esConsumidorFinal>${formulario.esConsumidorFinal === true ? 1 : 0}</esConsumidorFinal>
    <aplicaLocales>${(formulario.locales?.length || 0) > 0 ? 1 : 0}</aplicaLocales>
    <combinarCondiciones>${formulario.combinarCondiciones ? 1 : 0}</combinarCondiciones>
    <cantidadProductos>${Number(formulario.cantidadProductos || combos.length || 0)}</cantidadProductos>
    <incluirDatosCliente>${Number(formulario.datosCliente)}</incluirDatosCliente>
  </Cabecera>
  <Detalle>
    ${combos.map(c => `
    <Item>
      <codigoItem>${esc(c.key ?? c.itemId)}</codigoItem>
      <nombreItem>${esc(c.nombre)}</nombreItem>
      <origen>${esc(c.tipo)}</origen>
      <esExcluido>${c.excluida ? 1 : 0}</esExcluido>
      <esCombinado>${c.combinada ? 1 : 0}</esCombinado>
      <cantidad>${Number(c.cantidad || 0)}</cantidad>
      <valor>${Number(c.valor || 0)}</valor>
    </Item>`).join("")}
  </Detalle>
  <Locales>
    ${(formulario.locales || []).map(l => `
    <Local>
      <establecimiento>${esc(l.establecimiento ?? "")}</establecimiento>
      <almacen>${esc(l.almacen ?? "")}</almacen>
      <nombre>${esc(l.nombre ?? "")}</nombre>
      <activo>1</activo>
    </Local>`).join("")}
  </Locales>
</req>`.trim();
}

function normalizeLocalesFromCupon(raw: any[]): Local[] {
  return (raw || []).map((l: any, i: number) => ({
    id: `${l.establecimiento ?? ""}-${l.almacen ?? ""}` || String(i),
    local: l.nombre || `${l.establecimiento ?? ""}-${l.almacen ?? ""}`, // <- lo que se ve en el chip
    establecimiento: l.establecimiento ?? "",
    almacen: l.almacen ?? "",
    nombre: l.nombre ?? undefined,
  }));
}

export async function fetchCupones(signal?: AbortSignal): Promise<Cupon[]> {
  const res = await fetch(`${API_BASE}/listado_cupones_marketing`, { signal });
  const json = await res.json();

  if (json.status !== "success") {
    throw new Error(json.message || "Error al cargar cupones");
  }

  return (json.data || []).map(mapCupon);
}

export async function postCuponXML(reqXML: string) {
  const res = await fetch(`${API_BASE}/procesar_xml_form`, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
    },
    body: reqXML,
  });

  const raw = await res.text();

  if (!res.ok) {
    console.error("[postCuponXML] ERROR:", raw);
    throw new Error(raw || "Error al procesar el cupón");
  }

  if (!raw || !raw.trim()) {
    throw new Error("Respuesta vacía del servidor");
  }

  let payload: any = raw;
  try {
    payload = JSON.parse(raw);
  } catch {
    // continúa con raw como string
  }

  const listo =
    payload?.data?.Root?.listo === "OK" ||
    payload?.Root?.listo === "OK" ||
    (typeof raw === "string" && /<listo>\s*OK\s*<\/listo>/i.test(raw));

  if (!listo) {
    const mensaje =
      payload?.data?.Root?.mensaje ||
      payload?.Root?.mensaje ||
      (typeof raw === "string" && raw) ||
      "El SP no devolvió OK";
    return { ok: false, payload, raw, mensaje };
  }

  return { ok: true, payload, raw };
}

export async function fetchLocales(like?: string): Promise<Local[]> {
  const url = new URL(`${API_BASE}/listado_locales_marketing`);
  if (like && like.trim()) url.searchParams.set("like", like.trim());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar locales (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  return normalizeLocalesFromCupon(raw);
}

export async function searchProductos(q = "", limit = 20, signal?: AbortSignal): Promise<Producto[]> {
  const key = `${q}|${limit}`;
  if (cache.has(key)) return cache.get(key)!;

  const url = new URL(`${API_BASE}/listado_items_marketing`);
  if (q) url.searchParams.set("q", q);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { method: "GET",signal });
  if (!res.ok) throw new Error(`Error buscando productos: ${res.status} ${res.statusText}`);

  const json = await res.json().catch(() => null);
  if (!json || (json.status !== "success" && !Array.isArray(json))) {
    throw new Error("Respuesta inesperada del servidor.");
  }

  const arr = (Array.isArray(json) ? json : json.data) as any[];

  const productos: Producto[] = arr.map((p: any) => ({
    itemid: String(p.itemid ?? ""),
    nombre: String(p.nombre ?? ""),
    categoria: p.categoria ?? undefined,
    subcategoria: p.subcategoria ?? undefined,
    proveedor: p.proveedor ?? undefined,
  }));

  cache.set(key, productos);
  return productos;
}

export async function fetchProveedores(): Promise<Proveedor[]> {
  const res = await fetch(`${API_BASE}/listado_proveedores_marketing`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar proveedores (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  return raw.map((p: any) => ({
    id: String(p.idProveedor ?? p.id ?? ""),
    name: String(p.nombreProveedor ?? p.nombre ?? p.alias ?? "Proveedor"),
    grupo: p.grupoProveedor ?? p.grupo,
    alias: p.nameAlias ?? p.alias,
  }));
}

export async function fetchCategorias(like?: string): Promise<Categoria[]> {
  const url = new URL(`${API_BASE}/listado_categorias_marketing`);
  if (like && like.trim()) url.searchParams.set("like", like.trim());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar categorías (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  return raw.map((item: any) => ({
    id: item.codigo || "",
    name: item.nombre || "",
  }));
}

export async function fetchSubCategorias(like?: string): Promise<Subcategoria[]> {
  const url = new URL(`${API_BASE}/listado_subcategorias_marketing`);
  if (like && like.trim()) url.searchParams.set("like", like.trim());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar subcategorías (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  return raw.map((item: any) => ({
    id: item.codigo || "",
    name: item.nombre || "",
  }));
}
export async function fetchCuponById(id: number, signal?: AbortSignal): Promise<Cupon | null> {
  const res = await fetch(`${API_BASE}/listado_cupones_marketing?id=${id}`, { signal });
  const json = await res.json();

  if (json.status !== "success") {
    return null;
  }

  return mapCupon(json.data);
}

export async function updateCuponXML(xml: string, signal?: AbortSignal) {
  const url = `${API_BASE}/editar_xml_form`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      // WP/PHP suelen tolerar mejor text/xml
      "Content-Type": "text/xml; charset=utf-8",
      "Accept": "application/json, text/xml, application/xml, */*",
    },
    body: xml,
    signal,
  });

  const text = await res.text();

  // 1) Si falló HTTP, intenta sacar mensaje de XML
  if (!res.ok) {
    let msg = text || res.statusText;
    try {
      const m = text.match(/<mensaje>([\s\S]*?)<\/mensaje>/i);
      if (m) msg = m[1].trim();
    } catch { /* noop */ }
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  // 2) Si vino JSON, devuélvelo
  try {
    return JSON.parse(text);
  } catch {
    // 3) Si vino XML, detecta éxito tipo <Root><listo>OK</listo></Root>
    const ok = /<listo>\s*OK\s*<\/listo>/i.test(text);
    if (ok) return { status: "success", raw: text };

    // Intenta extraer mensaje de error si vino en XML
    const m = text.match(/<mensaje>([\s\S]*?)<\/mensaje>/i);
    if (m) return { status: "error", message: m[1].trim(), raw: text };

    // Desconocido pero exitoso HTTP
    return { status: "unknown", raw: text };
  }
}

export async function cambiarEstadoCupon(id: number | string, activo: boolean) {
  const nuevoEstado = activo ? 1 : 0;

  const xml = `
    <req>
      <id_cupon>${id}</id_cupon>
      <nuevo_estado>${nuevoEstado}</nuevo_estado>
    </req>
  `.trim();

  const res = await fetch(`${API_BASE}/cambiar_estado_cupon`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,

  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Error al cambiar estado: ${res.status} ${text}`);
  }

  try {
    console.log(text)
    return JSON.parse(text);
  } catch {
    return text;
  }
}
