import type { Local } from "../interface/Local";

export const API_BASE = import.meta.env.VITE_API_BASE;
function esc(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildXMLFactura(params: {
  nombreLogo: string;
  logoUrl?: string;     // el back la rellenará si subes file
  locales: Local[];
}): string {
  const { nombreLogo, logoUrl, locales } = params;

  const cabecera = [
    "  <Cabecera>",
    `    <nombreLogo>${esc(nombreLogo)}</nombreLogo>`,
    `    <logoUrl>${esc(logoUrl ?? "")}</logoUrl>`,
    "  </Cabecera>",
  ].join("\n");

  const localesXML = [
    "  <Locales>",
    ...locales.map((l) => {
      const establecimiento = esc(String((l as any).establecimiento ?? "").trim());
      const almacen = esc(String((l as any).almacen ?? "").trim());
      const activoValue = ((l as any).activo);
      const nombre = (l as any).nombre ? ` <nombre>${esc(String((l as any).nombre).trim())}</nombre>` : "";

      return [
        "    <Local>",
        `      <establecimiento>${establecimiento}</establecimiento>`,
        `      <almacen>${almacen}</almacen>`,
        `      <activo>${activoValue}</activo>`,
        nombre,
        "    </Local>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
    "  </Locales>",
  ].join("\n");
  return ["<req>", cabecera, localesXML, "</req>"].join("\n").trimStart();
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
  fd.append("logoFactura", file, file.name); // nombre EXACTO que espera el back
  fd.append("xml_data", xmlString);         // nombre EXACTO que espera el back

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
      // back pudo mandar application/json pero no es JSON válido
      return { raw: text };
    }
  }
  return { xml: text };
}
