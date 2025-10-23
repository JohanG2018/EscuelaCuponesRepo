// PreviewCupon.tsx
import React from "react";
import { Dialog } from "primereact/dialog";

interface ElementoFormato {
  elemento: "TITULO" | "LOGO" | "INFORMACION" | "LEGALES";
  posicion?: "FULL" | "LEFT" | "RIGHT" | "FULL_GRANDE";
  ancho?: number;
  alto?: number;
  tamanoTexto?: "small" | "medium" | "large";
  alineacion?: "left" | "center" | "right";
}

interface Props {
  titulo: string;
  descripcion: string;
  legal: string;
  logoBase64?: string;
  idFormato: number;
  visible: boolean;
  onHide: () => void;
}

const FORMATO_LAYOUTS: Record<number, ElementoFormato[]> = {
  1: [
    { elemento: "TITULO", posicion: "FULL", ancho: 40, tamanoTexto: "large", alineacion: "center" },
    { elemento: "LOGO", posicion: "LEFT", ancho: 20, alto: 100 },
    { elemento: "INFORMACION", posicion: "RIGHT", ancho: 20, tamanoTexto: "medium" },
    { elemento: "LEGALES", posicion: "FULL", ancho: 40, tamanoTexto: "small" },
  ],
  2: [
    { elemento: "LOGO", posicion: "FULL", ancho: 40, alto: 120 },
    { elemento: "INFORMACION", posicion: "FULL", ancho: 40, tamanoTexto: "medium" },
    { elemento: "LEGALES", posicion: "FULL", ancho: 40, tamanoTexto: "small" },
  ],
  3: [
    { elemento: "LOGO", posicion: "FULL_GRANDE", ancho: 40, alto: 200 },
    { elemento: "LEGALES", posicion: "FULL", ancho: 40, tamanoTexto: "small" },
  ],
  4: [
    { elemento: "LOGO", posicion: "FULL_GRANDE", ancho: 40, alto: 200 },
  ],
};

const getTextSize = (size?: string) => {
  if (size === "large") return "text-lg font-bold";
  if (size === "medium") return "text-sm";
  if (size === "small") return "text-xs text-gray-600";
  return "text-sm";
};

const PreviewTicket: React.FC<Props> = ({ titulo, descripcion, legal, logoBase64, idFormato, visible, onHide }) => {
  const layout = FORMATO_LAYOUTS[idFormato] || [];

  const content = (
    <div className="bg-white border shadow rounded p-2 mx-auto" style={{ width: 310 }}> {/* 80mm aprox */}
      {layout.map((item, index) => {
        const classText = getTextSize(item.tamanoTexto);

        if (item.elemento === "TITULO") {
          return (
            <div key={index} className={`w-full text-center my-1 ${classText}`}>
              {titulo || "(Sin título)"}
            </div>
          );
        }

        if (item.elemento === "LOGO") {
          const imgClass = item.alto ? `max-h-[${item.alto}px]` : "max-h-24";
          const align = item.posicion === "LEFT" ? "flex justify-start" : item.posicion === "RIGHT" ? "flex justify-end" : "flex justify-center";
          return (
            <div key={index} className={`my-2 ${align}`}>
              {logoBase64 ? (
                <img src={`data:image/bmp;base64,${logoBase64}`} alt="Logo" className={`object-contain ${imgClass}`} />
              ) : (
                <span className="text-xs text-gray-400">(Sin logo)</span>
              )}
            </div>
          );
        }

        if (item.elemento === "INFORMACION") {
          return (
            <div
              key={index} className={`w-full my-1 ${classText} break-words overflow-hidden`}
              style={{ wordBreak: 'break-word' }}
            >
              {descripcion || "(Sin información)"}
            </div>
          );
        }

        if (item.elemento === "LEGALES") {
          return (
            <div key={index} className={`w-full mt-2 pt-2 border-t border-dashed ${classText} break-words overflow-hidden`}
              style={{ wordBreak: 'break-word' }}>
              {legal || "(Sin legales)"}
            </div>
          );
        }

        return null;
      })}
    </div>
  );

  return (
    <Dialog header="Previsualización del cupón" visible={visible} onHide={onHide} style={{ width: "600px" }}>
      {content}
    </Dialog>
  );
};

export default PreviewTicket;
