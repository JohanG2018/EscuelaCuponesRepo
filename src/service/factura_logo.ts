import type { Local } from "../interface/cuponInterface";

export const API_BASE = 'http://localhost:8080/wordpress/wp-json/delportal/v1';

export function buildXMLFactura(params: {
  nombreLogo: string;
  logoUrl?: string;
  locales: Local[];
}): string {
  const esc = (s: any) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const { nombreLogo, logoUrl = '', locales } = params;

  const cabecera = [
    '  <Cabecera>',
    `    <nombreLogo>${esc(nombreLogo)}</nombreLogo>`,
    `    <logoUrl>${esc(logoUrl)}</logoUrl>`,
    '  </Cabecera>',
  ].join('\n');

  const localesXML = [
    '  <Locales>',
    ...locales.map((l) => [
      '    <Local>',
      `      <establecimiento>${esc((l as any).establecimiento ?? '')}</establecimiento>`,
      `      <almacen>${esc((l as any).almacen ?? '')}</almacen>`,
      `      <activo>${esc((l as any).activo ?? 'S')}</activo>`,
      (l as any).nombre ? `      <nombre>${esc((l as any).nombre)}</nombre>` : '',
      '    </Local>',
    ].filter(Boolean).join('\n')),
    '  </Locales>',
  ].join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<req>',
    cabecera,
    localesXML,
    '</req>'
  ].join('\n').trimStart();
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
  fd.append('logoFactura', file, file.name);   // nombre EXACTO que espera el back
  fd.append('xml_data', xmlString);            // nombre EXACTO que espera el back


  const res = await fetch(`${API_BASE}/post_facturas_marketing`, {
    method: 'POST',
    body: fd,
    signal,
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${text || 'No se pudo procesar la solicitud'}`);
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text);
  }
  console.log('[XML A ENVIAR]');
console.log(xmlString);
  return { xml: text };
}
