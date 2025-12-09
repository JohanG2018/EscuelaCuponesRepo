import { FileUpload, type FileUploadHandlerEvent } from "primereact/fileupload";
import type { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { ArchivoBMP, ArchivoMenor, validarImagenMax } from "../utils/Validacion";

type Props = {
  value: File | string | null;            // File nuevo ó URL/base64 existente
  onChange: (file: File | null) => void;  // Notifica solo cuando subes o limpias (sin URL previo)
  toastRef?: React.RefObject<Toast>;
  maxWidth?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: string;
};

const Upload: React.FC<Props> = ({
  value,
  onChange,
  toastRef,
  maxWidth = 600,
  maxSizeMB = 5,
  disabled,
  label = "Cargar Logo (.bmp, maximo tamaño 5MB)",
}) => {
  // archivo seleccionado en esta sesión (no el URL previo)
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);

  // recordamos el último URL/base64 conocido para modo edición
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof value === "string" && value) {
      lastUrlRef.current = value;
      setFile(null);
      setUploaded(true);
    } else if (value instanceof File) {
      setFile(value);
      setUploaded(true);
    } else {
      setFile(null);
      setUploaded(false);
    }
  }, [value]);

  const show = (
    severity: "success" | "warn" | "error",
    summary: string,
    detail: string,
    life = 3000
  ) => toastRef?.current?.show({ severity, summary, detail, life });

  const handleUpload = (e: FileUploadHandlerEvent) => {
    const archivo = e.files?.[0];
    if (!archivo) return;

    if (!ArchivoBMP(archivo)) {
      show("error", "Formato inválido", "Solo se permite archivo .bmp");
      return;
    }
    if (!ArchivoMenor(archivo, maxSizeMB * 1024 * 1024)) {
      show("error", "Archivo demasiado grande", `Máximo permitido: ${maxSizeMB}MB`);
      return;
    }
    if (!validarImagenMax(archivo, maxWidth)) {
      show("warn", "Imagen demasiado ancha", `El ancho máximo permitido es ${maxWidth}px`);
      return;
    }

    setFile(archivo);
    setUploaded(true);
    onChange(archivo);
    show("success", "Logo cargado", archivo.name);
  };

  const onRemove = () => {
    setFile(null);
    // Si hay URL previo (edición), no notificamos al padre para que conserve ese valor.
    setUploaded(Boolean(lastUrlRef.current));
    if (!lastUrlRef.current) {
      onChange(null);
    }
  };

  const itemTemplate = (f: any) => {
    // PrimeReact adjunta f.objectURL; si no, generamos uno temporal
    const previewSrc =
      f?.objectURL || (f instanceof File ? URL.createObjectURL(f) : undefined);

    return (
      <div className="flex items-center gap-3 w-full">
        {previewSrc && (
          <img
            src={previewSrc}
            alt={f?.name || "Logo"}
            className="w-10 h-10 object-contain border rounded bg-white"
          />
        )}
        <div className="flex-1">
          <div className="font-medium">{f?.name || "logo.bmp"}</div>
          {f?.size && <small>{(f.size / 1024).toFixed(1)} KB</small>}
        </div>
        <span
          className={`px-2 py-1 text-xs rounded ${
            uploaded ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {uploaded ? "Completo" : "Pendiente"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-semibold block">{label}</label>}

      <FileUpload
        name="logo"
        accept=".bmp,image/bmp"
        maxFileSize={maxSizeMB * 1024 * 1024}
        customUpload
        chooseLabel="Elegir archivo"
        uploadLabel="Subir archivo"
        cancelLabel="Cancelar"
        uploadHandler={handleUpload}
        itemTemplate={itemTemplate}
        disabled={disabled}
        onSelect={(e) => {
          // Al seleccionar, se marca "Pendiente" hasta dar a "Subir archivo"
          setUploaded(false);
          setFile(e.files?.[0] || null);
        }}
        onRemove={onRemove}
        emptyTemplate={
          // Si vienes con un URL/base64 desde fuera, muéstralo aquí
          typeof value === "string" && value ? (
            <div className="flex items-center gap-3">
              <img
                src={value}
                alt="Logo actual"
                className="h-20 w-auto object-contain border rounded bg-white p-2"
              />
              <div className="text-sm text-gray-600">Logo actual</div>
            </div>
          ) : (
            <p className="m-0">Arrastre el archivo aquí o haga clic para cargar.</p>
          )
        }
      />
    </div>
  );
};

export default Upload;
