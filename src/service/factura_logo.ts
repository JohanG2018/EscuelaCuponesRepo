import type { LogoFactura } from "../interface/LogoFactura";
import type { Local } from "../interface/Local";
import { fileToBase64 } from "../utils/Helper";

export const API_BASE = import.meta.env.VITE_API_BASE;

/** Escapador simple de XML (mismo patrón que usas) */
const esc = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Normaliza locales del API (usa nombre → local para que tu UI los muestre) */
function normalizeLocales(raw: any[]): Local[] {
  return (raw || []).map((l: any, i: number) => ({
    id: `${l.establecimiento ?? ""}-${l.almacen ?? ""}` || String(i),
    local: l.nombre || `${l.establecimiento ?? ""}-${l.almacen ?? ""}`, // etiqueta visible
    establecimiento: l.establecimiento ?? "",
    almacen: l.almacen ?? "",
    nombre: l.nombre ?? undefined,
    // si tu interfaz Local tiene otros campos, agrégalos aquí
  }));
}

/** Mapea { cabecera, locales } → LogoFactura plano (sin cambiar tu interfaz) */
function mapLogo(raw: any): LogoFactura {
  const cab = raw?.cabecera ?? {};
  const id = String(cab.id ?? cab.idLogoFactura ?? "");
  return {
    id: id,
    nombreLogo: String(cab.nombreLogo ?? ""),
    logoUrl: String(cab.logoUrl ?? ""),
    locales: normalizeLocales(raw?.locales ?? []),
    idLogoFactura: id,
  };
}

/** Tolerante a {status,data} o array directo */
function unwrapData(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (json?.data && !Array.isArray(json.data)) return [json.data];
  return [];
}

/** GET: lista o por id (según query param) */
export async function fetchLogosFactura(): Promise<LogoFactura[]> {
  const res = await fetch(`${API_BASE}/get_logo_facturas_db`);
  // Puede venir JSON o XML si cambiaste formato; intenta JSON primero
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Si viniera XML, aquí podrías parsearlo, pero tu back actual devuelve JSON
    json = null;
  }

  if (!res.ok) {
    const msg = json?.message || text || res.statusText;
    throw new Error(`Error al cargar logos (${res.status}): ${msg}`);
  }

  const list = unwrapData(json);
  return list.map(mapLogo);
}

/** GET: un logo por id */
export async function fetchLogoFacturaById(id: string): Promise<LogoFactura | null> {
  const res = await fetch(`${API_BASE}/get_logo_facturas_db?id=${id}`);
  const text = await res.text();

  let json: any = null;
  try { json = JSON.parse(text); } catch { json = null; }

  if (!res.ok) {
    const msg = json?.message || text || res.statusText;
    throw new Error(`Error al cargar logo (${res.status}): ${msg}`);
  }

  const list = unwrapData(json);
  if (!list.length) return null;
  return mapLogo(list[0]);
}

export function buildXMLFactura(input: {
  nombreLogo: string;
  logoUrl?: string;
  locales: Local[];
}): string {
  return `
<req>
  <Cabecera>
    <nombreLogo>${esc(input.nombreLogo)}</nombreLogo>
    <logoUrl>${esc(input.logoUrl ?? "")}</logoUrl>
  </Cabecera>
  <Locales>
    ${(input.locales || []).map(l => `
    <Local>
      <establecimiento>${esc(l.establecimiento ?? "")}</establecimiento>
      <almacen>${esc(l.almacen ?? "")}</almacen>
      <nombre>${esc(l.nombre ?? l.local ?? "")}</nombre>
      <activo>1</activo>
    </Local>`).join("")}
  </Locales>
</req>`.trim();
}
// === PUT: UPDATE LOGO FACTURA ===

/** Construye el XML EXACTO que espera el SP sprTblUpdateLogoFacturas */
export function buildXMLFacturaUpdate(input: {
  idLogoFactura: string | number;
  nombreLogo: string;
  logoUrl: string;            // URL pública del .bmp
  locales: Local[];
  wrapWithRoot?: boolean;     // default true
}): string {
  const localesXml = (input.locales || [])
    .map(l => `
    <Local>
      <establecimiento>${esc(l.establecimiento ?? "")}</establecimiento>
      <almacen>${esc(l.almacen ?? "")}</almacen>
      <nombre>${esc(l.nombre ?? l.local ?? "")}</nombre>
      <activo>1</activo>
    </Local>`)
    .join("");

  const req = `
<req>
  <Cabecera>
    <idLogoFactura>${esc(input.idLogoFactura)}</idLogoFactura>
    <nombreLogo>${esc(input.nombreLogo)}</nombreLogo>
    <logoUrl>${esc(input.logoUrl)}</logoUrl>
  </Cabecera>
  <Locales>${localesXml}
  </Locales>
</req>`.trim();

  // Tu IntegrationBus suele usar ProgId="CLF" para Logos de Factura (ajústalo si corresponde)
  return req;
}

/** Parser tolerante: maneja JSON normalizado o XML del bus (incluido DataSet con XML dentro de <resultado>) */
function parseUpdateResponse(rawText: string, contentType: string | null) {
  // 1) Si vino JSON (porque tu backend lo normalizó)
  if ((contentType || "").includes("application/json")) {
    try {
      const j = JSON.parse(rawText);
      if (j?.status === "ok") return { ok: true, message: j.message || "Actualizado." };
      if (j?.status === "error") return { ok: false, message: j.message || "Error en actualización." };
      // JSON desconocido
      return { ok: true, message: "OK", raw: j };
    } catch {
      // cae a intentar XML
    }
  }

  // 2) Intentar interpretar como XML directo del SP/bus
  try {
    const doc = new DOMParser().parseFromString(rawText, "application/xml");
    const isParserError = doc.getElementsByTagName("parsererror").length > 0;

    if (!isParserError) {
      const root = doc.documentElement?.nodeName?.toLowerCase();

      // Caso A: XML final del SP: <Root><listo>OK</listo></Root>
      if (root === "root") {
        const listo = doc.getElementsByTagName("listo")?.[0]?.textContent || "";
        const resultado = doc.getElementsByTagName("resultado")?.[0]?.textContent || "";
        const mensaje = doc.getElementsByTagName("mensaje")?.[0]?.textContent || "";

        if (listo === "OK") return { ok: true, message: "Actualizado." };
        if (resultado === "ERROR") return { ok: false, message: mensaje || "Error en actualización." };

        // XML válido pero distinto
        return { ok: true, message: "OK", raw: rawText };
      }

      // Caso B: DataSet/tabla con <resultado> que contiene XML escapado
      // Ej: <NewDataSet><Table><resultado>&lt;Root&gt;...&lt;/Root&gt;</resultado></Table></NewDataSet>
      const resultNodes = doc.getElementsByTagName("resultado");
      if (resultNodes && resultNodes.length) {
        const inner = resultNodes[0].textContent || "";
        if (inner) {
          const innerDoc = new DOMParser().parseFromString(inner, "application/xml");
          const innerErr = innerDoc.getElementsByTagName("parsererror").length > 0;
          if (!innerErr && innerDoc.documentElement?.nodeName?.toLowerCase() === "root") {
            const listo2 = innerDoc.getElementsByTagName("listo")?.[0]?.textContent || "";
            const res2 = innerDoc.getElementsByTagName("resultado")?.[0]?.textContent || "";
            const msg2 = innerDoc.getElementsByTagName("mensaje")?.[0]?.textContent || "";
            if (listo2 === "OK") return { ok: true, message: "Actualizado." };
            if (res2 === "ERROR") return { ok: false, message: msg2 || "Error en actualización." };
            return { ok: true, message: "OK", raw: inner };
          }
        }
      }
    }
  } catch {
    // ignorar y caer al fallback
  }

  // 3) Fallback
  return { ok: true, message: "OK", raw: rawText };
}

/** PUT al endpoint de edición (XML plano). Ajusta ruta si usas otra. */
export async function putLogoFacturaUpdate(params: {
  idLogoFactura: string | number;
  nombreLogo: string;
  logoUrl: string;         // URL pública del .bmp
  locales: Local[];
  signal?: AbortSignal;
}) {
  const xml = buildXMLFacturaUpdate({
    idLogoFactura: params.idLogoFactura,
    nombreLogo: params.nombreLogo,
    logoUrl: params.logoUrl,
    locales: params.locales,
    wrapWithRoot: true,
  });

  // DEBUG opcional
  console.log("[putLogoFacturaUpdate] XML enviado:\n", xml);

  const res = await fetch(`${API_BASE}/editar_logo_factura`, {
    method: "PUT",
    headers: { "Content-Type": "text/xml" },
    body: xml,
    signal: params.signal,
  });

  const contentType = res.headers.get("content-type");
  const text = await res.text();

  if (!res.ok) {
    // Puede venir texto/HTML/XML del servidor ante errores
    throw new Error(`Error ${res.status}: ${text || "No se pudo actualizar"}`);
  }

  const parsed = parseUpdateResponse(text, contentType);
  if (!parsed.ok) {
    throw new Error(parsed.message || "Error en actualización");
  }

  return { status: "ok", message: parsed.message || "Actualizado." };
}

export async function postFacturasLogo({
  file,
  xmlString,
  signal,
}: {
  file: File;
  xmlString: string;
  signal?: AbortSignal;
}) {
  const fd = new FormData();
  fd.append("logoFactura", file, file.name);
  fd.append("xml_data", xmlString);

  // DEBUG ÚTIL (puedes comentar esto en prod)
  console.log("[postFacturasLogo] Enviando XML:");
  console.log(xmlString);
  console.log("[postFacturasLogo] Archivo:", file?.name, file?.size, file?.type);

  const res = await fetch(`${API_BASE}/post_facturas_marketing`, {
    method: "POST",
    body: fd,
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${text || "No se pudo procesar la solicitud"}`);
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
  return { xml: text };
}
export async function buildXMLFacturaInlineBMP(input: {
  nombreLogo: string;
  locales: Local[];
  file: File; // .bmp
}): Promise<string> {
  const b64 = await fileToBase64(input.file);
  const clean = (b64.includes(",") ? b64.split(",")[1] : b64).trim();
  return `
<req>
  <Cabecera>
    <nombreLogo>${esc(input.nombreLogo)}</nombreLogo>
    <logo>${esc(clean)}</logo>
  </Cabecera>
  <Locales>
    ${(input.locales || []).map(l => `
    <Local>
      <establecimiento>${esc(l.establecimiento ?? "")}</establecimiento>
      <almacen>${esc(l.almacen ?? "")}</almacen>
      <nombre>${esc(l.nombre ?? l.local ?? "")}</nombre>
      <activo>1</activo>
    </Local>`).join("")}
  </Locales>
</req>`.trim();
}
