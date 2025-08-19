import type { Cupon, Local, Producto, Proveedor, Categoria } from "../interface/cuponInterface";

export const API_BASE = "http://localhost:8080/wordpress/wp-json/delportal/v1";

const cache = new Map<string, Producto[]>();

export function fileToBase64(file: File | null): Promise<string> {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => {
      const res = (reader.result as string) || "";
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.substring(comma + 1) : res);
    };
    reader.readAsDataURL(file);
  });
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
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
  const logoBase64 = await fileToBase64(formulario.logo);

  return `
<req>
  <Cabecera>
    <descripcion>${esc(formulario.descripcion)}</descripcion>
    <tituloCupon>${esc(formulario.titulo)}</tituloCupon>
    <textoCupon>${esc(formulario.descripcionTicket)}</textoCupon>
    <textoLegal>${esc(formulario.textoLegal)}</textoLegal>
    <fechaInicio>${formatDateTimeToSQL(formulario.fechaInicio!)}</fechaInicio>
    <fechaFin>${formatDateTimeToSQL(formulario.fechaFin!)}</fechaFin>
    <estado>${formulario.estado ? 1 : 0}</estado>
    <tipoAplicacion>${esc(formulario.tipoAplicacion)}</tipoAplicacion>
    <montoMinimo>${formulario.valorMinimo || 0}</montoMinimo>
    <esRecurrente>${formulario.esRecurrente ? 1 : 0}</esRecurrente>
    <idTipoFormato>${esc(formulario.idTipoFormato)}</idTipoFormato>
    <logo>${esc(logoBase64)}</logo>
    <nombreLogo>${esc(formulario.nombreLogo)}</nombreLogo>
    <ambiente>${esc(formulario.tipoAmbiente)}</ambiente>
    <esConsumidorFinal>${formulario.esConsumidorFinal ? 1 : 0}</esConsumidorFinal>
    <aplicaLocales>${formulario.locales?.length ? 1 : 0}</aplicaLocales>
    <combinarCondiciones>${formulario.combinarCondiciones ? 1 : 0}</combinarCondiciones>
    <cantidadProductos>${formulario.cantidadProductos || 0}</cantidadProductos>
  </Cabecera>
  <Detalle>
    ${Array.isArray(formulario.combinaciones) ? formulario.combinaciones.map((c) => `
    <Item>
      <codigoItem>${esc(c.key)}</codigoItem>
      <nombreItem>${esc(c.nombre)}</nombreItem>
      <origen>${esc(c.tipo)}</origen>
      <esExcluido>${formulario.combinarCondiciones ? 1 : 0}</esExcluido>
      <esCombinado>${formulario.combinarCondiciones ? 1 : 0}</esCombinado>
      <cantidad>${c.cantidad || 0}</cantidad>
      <valor>${c.valor || 0}</valor>
    </Item>`).join(""):""}
  </Detalle>
  <Locales>
    ${(formulario.locales || []).map((l) => `
    <Local>
      <establecimiento>${esc(l.establecimiento)}</establecimiento>
      <almacen>${esc(l.almacen)}</almacen>
      <activo>1</activo>
    </Local>`).join("")}
  </Locales>
</req>
`.trim();
}

function normalizeLocales(raw: any[]): Local[] {
  return raw.map((it: any) => ({
    id: it.id ?? it.almacen ?? it.establecimiento ?? it.nombre ?? it.local ?? `${Date.now()}-${Math.random()}`,
    local: it.local ?? it.nombre ?? String(it.almacen ?? it.establecimiento ?? "Local"),
    establecimiento: it.establecimiento,
    almacen: it.almacen,
    nombre: it.nombre,
  }));
}
export async function fetchCupones(opts?: { signal?: AbortSignal }): Promise<Cupon[]> {
  const res = await fetch(`${API_BASE}/listado_cupones_marketing`, {
    method: "GET",
    signal: opts?.signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar cupones (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);

  return raw.map((c: any) => ({
    id: String(c.id ?? ""),
    titulo: String(c.titulo ?? ""),
    tipoAplicacion: String(c.tipoAplicacion ?? ""),
    fechaInicio: String(c.fechaInicio ?? ""),
    fechaFin: String(c.fechaFin ?? ""),
    estado: String(c.estado ?? ""),
  }));
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
  return normalizeLocales(raw);
}




export async function searchProductos(q = "", limit = 20): Promise<Producto[]> {
  const key = `${q}|${limit}`;
  if (cache.has(key)) return cache.get(key)!;

  const url = new URL(`${API_BASE}/listado_items_marketing`);
  if (q) url.searchParams.set("q", q);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { method: "GET" });
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

export async function fetchSubCategorias(like?: string): Promise<Categoria[]> {
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
export async function fetchCuponById(id: number): Promise<Cupon> {
  const res = await fetch(`${API_BASE}/listado_cupones_marketing?id=${id}`, {
    method: "GET",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar cupón (${res.status}): ${txt || res.statusText}`);
  }
  const json = await res.json().catch(() => null);
  return json ?? null;
}

export async function updateCuponXML(xml: string, signal?: AbortSignal) {
  const url = "http://localhost:8080/wordpress/wp-json/delportal/v1/editar_xml_form";

  const res = await fetch(url, {
    method: "PUT",   // 👈 EDITABLE → soporta PUT
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Accept: "application/json, application/xml, text/plain, */*",
    },
    body: xml,
    signal,
  });

  const text = await res.text();
  try {
    // intenta parsear JSON
    return JSON.parse(text);
  } catch {
    return { status: "error", message: text || "Respuesta inesperada" };
  }
}


