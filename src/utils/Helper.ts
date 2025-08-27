import type { Combinacion, Cupon, TipoCombinacion } from "../interface/cuponInterface";

const isText = (value: any) => typeof value !== "string" || value.trim() === "";
const isDate = (value: any): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : value
}

type validateResult = { ok: true } | { ok: false; missing: string[] }

export function validateForm(form: Cupon): validateResult {
  const falt: string[] = [];

  if (isText(form.titulo)) falt.push("Titulo");
  if (isText(form.descripcion)) falt.push("descripcion");

  const startDate = isDate(form.fechaInicio);
  const endDate = isDate(form.fechaFin);
  if (!startDate) falt.push("Fecha inicio");
  if (!endDate) falt.push("Fecha fin");
  if (startDate && endDate && startDate > endDate) falt.push("Rango de fechas (inicio debe ser ≤ fin)");

  if (!Array.isArray(form.locales) || form.locales.length === 0) {
    falt.push("Locales (al menos uno)")
  }
 
  return falt.length ? { ok: false, missing: falt } : { ok: true }
}

// Helpers recomendados (fuera del componente o memoizados)
export const keyLocal = (l: any) => String(l?.id ?? `${l?.codigo}-${l?.nombre}`);

// Compara arrays por clave estable (sin importar la referencia del objeto)
export const sameLocalesByKey = (a: any[] = [], b: any[] = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (keyLocal(a[i]) !== keyLocal(b[i])) return false;
  }
  return true;
};
export const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);

export const getName = (it: any) =>
  (typeof it === "string" ? it : undefined) ??
  it?.nombre ?? it?.name ?? it?.title ?? it?.label ??
  it?.local ?? it?.categoria ?? it?.subcategoria ?? it?.proveedor ??
  String(it);

// ID real según tipo
export const getIdByTipo = (it: any, tipo: TipoCombinacion): string => {
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

export const mergeCombinaciones = (base: Combinacion[], nuevas: Combinacion[]): Combinacion[] => {
  const map = new Map(base.map((r) => [`${r.tipo}:${r.itemId}`, r]));
  for (const item of nuevas) {
    const k = `${item.tipo}:${item.itemId}`;
    if (!map.has(k)) map.set(k, item);
  }
  return Array.from(map.values());
};

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = (r.result as string) || "";
      resolve(s.indexOf(",") >= 0 ? s.substring(s.indexOf(",") + 1) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
export function toDate(value: any): string {
  if (!value) return "";
  return new Date(value).toISOString();
}
export function origenToTipo(origen: TipoCombinacion) {
  const s = String(origen ?? "").trim().toUpperCase();
  // si el backend ya manda G/SG/P/I, esto lo deja igual
  if (s === "G" || s === "SG" || s === "P" || s === "I" || s === "M") return s as any;

  // por si llega texto descriptivo
  if (s.includes("CATEGORIA")) return "G";
  if (s.includes("SUB")) return "SG";
  if (s.includes("PROV")) return "P";
  if (s.includes("PROD") || s.includes("ITEM")) return "I";
  return "M"; // mixto / fallback
}

export function toBool01(v: any): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  return v === true || v === 1 || v === "1" || s === "1" || s === "true" || s === "sí" || s === "si";
}
