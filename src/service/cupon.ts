export const API_BASE = "http://localhost:8080/wordpress/wp-json/delportal/v1";
export interface Local {
  id: string | number;
  local: string;          
  establecimiento?: string;
  almacen?: string;
  nombre?: string;
}

export interface Producto{
  id : string | number;
  title: string;
  sku?:string;
}
export interface Proveedor {
  id: string;
  name: string;
  grupo?: string;
  alias?: string;
}
export interface Cupon {
  id: string;
  titulo: string;
  tipoAplicacion: string;
  fechaInicio: string; // ISO/SQL string
  fechaFin: string;    // ISO/SQL string
  estado: string;      // "1" / "0" o texto
}
export function toSqlDateTime(d:Date | null):string{
  if(!d) return ""
  const pad = (n:number) =>String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

}

export function fileToBase64(file: File | null): Promise<string> {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => {
      const res = (reader.result as string) || "";
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.substring(comma + 1) : res); // solo el payload
    };
    reader.readAsDataURL(file);
  });
}
export async function buildCuponXML(form: {
  titulo: string;
  descripcion: string;
  descripcionTicket: string; // textoCupon
  textoLegal: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: boolean | number | string;
  tipoAplicacion: string;
  valorMinimo: number;
  esRecurrente: boolean | number | string;
  idTipoFormato: number | string;
  logo: File | null;
  nombreLogo: string;
  tipoAmbiente: string;
  esConsumidorFinal: boolean | number | string;
  aplicaLocales: boolean | number | string;
  combinarCondiciones: boolean | number | string;
  cantidadProductos: number | string;
}) {
  // defaults seguros
  const start = form.fechaInicio ?? new Date();
  const end = form.fechaFin ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const ambiente = (form.tipoAmbiente && String(form.tipoAmbiente).trim()) || "Pruebas";
  const tipoAplicacion = (form.tipoAplicacion && String(form.tipoAplicacion).trim()) || "General";

  const toSql = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const b2 = (v: any) => (v ? "1" : "0"); // a "0"/"1"
  const esc = (s: any) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // logo a base64 “payload” (vacío si no hay)
  const logoBase64 = await fileToBase64(form.logo);

  // ==== IMPORTANTE: formato por NODOS (no atributos) ====
  return `
<req>
  <descripcion>${esc(form.descripcion)}</descripcion>
  <tituloCupon>${esc(form.titulo)}</tituloCupon>
  <textoCupon>${esc(form.descripcionTicket)}</textoCupon>
  <textoLegal>${esc(form.textoLegal)}</textoLegal>
  <fechaInicio>${esc(toSql(start))}</fechaInicio>
  <fechaFin>${esc(toSql(end))}</fechaFin>
  <estado>${b2(form.estado)}</estado>
  <tipoAplicacion>${esc(tipoAplicacion)}</tipoAplicacion>
  <montoMinimo>${esc(form.valorMinimo ?? 0)}</montoMinimo>
  <esRecurrente>${b2(form.esRecurrente)}</esRecurrente>
  <idTipoFormato>${esc(form.idTipoFormato ?? "")}</idTipoFormato>
  <logo>${esc(logoBase64)}</logo>
  <nombreLogo>${esc(form.nombreLogo)}</nombreLogo>
  <ambiente>${esc(ambiente)}</ambiente>
  <esConsumidorFinal>${b2(form.esConsumidorFinal)}</esConsumidorFinal>
  <aplicaLocales>${b2(form.aplicaLocales)}</aplicaLocales>
  <combinarCondiciones>${b2(form.combinarCondiciones)}</combinarCondiciones>
  <cantidadProductos>${esc(form.cantidadProductos ?? 0)}</cantidadProductos>
</req>`.trim();
}
function normalizeLocales(raw: any[]): Local[] {
  return raw.map((it: any) => ({
    id:
      it.id ??
      it.almacen ??
      it.establecimiento ??
      it.nombre ??
      it.local ??
      `${Date.now()}-${Math.random()}`, // fallback estable suficiente para front
    local: it.local ?? it.nombre ?? String(it.almacen ?? it.establecimiento ?? "Local"),
    establecimiento: it.establecimiento,
    almacen: it.almacen,
    nombre: it.nombre,
  }));
}

export async function postCuponXML(reqXML: string) {
  const res = await fetch(`${API_BASE}/procesar_xml_form`, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml", // enviamos XML
      // opcional: "Accept": "application/json"
    },
    body: reqXML,
    // NO credentials aquí a menos que configures CORS con credenciales
  });

  // Lee el body una sola vez
  const raw = await res.text();

  // Si viene error, lanza con el texto crudo (útil para ver el detalle del back)
 if (!res.ok) {
  console.error("[postCuponXML] ERROR:", raw);
  throw new Error(raw || "Error al procesar el cupón");
}

if (!raw || !raw.trim()) {
  // defensa: servidor respondió 200 sin cuerpo
  throw new Error("Respuesta vacía del servidor");
}

  // Intenta parsear JSON; si no es JSON, deja el texto
  let payload: any = raw;
  try {
    payload = JSON.parse(raw);
  } catch {
    // payload queda como string (p.ej. XML del SP)
  }

  // Validar OK del SP si quieres confirmar explícitamente
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

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al cargar locales (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);

  // Acepta array directo o {data: []}
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  if (!Array.isArray(raw)) return [];

  return normalizeLocales(raw);
}
export async function searchProductos(q: string, limit = 20): Promise<Producto[]> {
  const url = new URL(`${API_BASE}/listado_items_marketing`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error buscando productos: ${res.statusText}`);
  const json = await res.json();

  const arr = Array.isArray(json) ? json : [];
  return arr.map((p: any) => ({
    id: p.id,
    title: p.title ?? '',
    sku: p.sku ?? '',
  }));
}
export async function fetchProveedores(): Promise<Proveedor[]> {
  const url = `${API_BASE}/listado_proveedores_marketing`;
  const res = await fetch(url, { method: "GET" });

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


export async function fetchCupones(opts?: { signal?: AbortSignal }): Promise<Cupon[]> {
  const res = await fetch(`${API_BASE}/listado_cupones_marketing`, {
    method: "GET",
    signal: opts?.signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error listando cupones (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  const raw = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
  if (!Array.isArray(raw)) return [];

  // Normaliza por si acaso
  return raw.map((c: any) => ({
    id: String(c.id ?? ""),
    titulo: String(c.titulo ?? ""),
    tipoAplicacion: String(c.tipoAplicacion ?? ""),
    fechaInicio: String(c.fechaInicio ?? ""),
    fechaFin: String(c.fechaFin ?? ""),
    estado: String(c.estado ?? ""),
  }));
}