import { FileUpload, type FileUploadHandlerEvent } from "primereact/fileupload";
import type { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useState } from "react"
import { ArchivoBMP, ArchivoMenor, validarImagenMax } from "../utils/Validacion";

type props = {
    value: File | string | null;
    onChange: (file: File | null) => void;
    toastRef?: React.RefObject<Toast>
    maxWidth: number;
    maxSizeMB: number;
    disabled?: boolean;
    label?: string;
}
const upload: React.FC<props> = ({
    value,
    onChange,
    toastRef,
    maxWidth = 600,
    maxSizeMB = 5,
    disabled,
    label = "Cargar Logo (.bmp, máx 600px ancho)"
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [upload, setUpload] = useState(false);

    useEffect(() => {
        if (value instanceof File) {
            setFile(value);
            setUpload(true);

        } else if (!value) {
            setFile(null);
            setUpload(false)
        }
        else {
            setFile(null);
            setUpload(!!value)
        }
    }, [value])


    const show = (severity: "success" | "warn" | "error", summary: string, detail: string, life = 3000) =>
        toastRef?.current?.show({ severity, summary, detail, life });

    const handleUpload = async (e: FileUploadHandlerEvent) => {
        const archivo = e.files?.[0];
        if (!archivo) return;
        if (!ArchivoBMP(archivo)) {
            show("error", "Formato invalido", "Solo se permite archivo .bmp")
            return;
        }
        if (!ArchivoMenor(archivo, maxSizeMB * 1024 * 1024)) {
            show("error", "Archivo demasiado grande", `Máximo permitido: ${maxSizeMB}MB`);
            return;
        }
        const esvalido = validarImagenMax(archivo, maxWidth);
        if (!esvalido) {
            show("warn", "Imagen demasiada ancha", "`El ancho máximo permitido es ${maxWidth}px`")
            return;
        }
        setFile(archivo);
        setUpload(true);
        onChange(archivo);
        show("success", "Logo cargado", archivo.name);

    };
    const onRemove = () => {
        setFile(null);
        setUpload(false);
        onChange(null);
    }
    const itemTemplate = (f: any) => {
        const previewSrc =
            f?.objectURL ||
            (f instanceof File ? URL.createObjectURL(f) : undefined);

        return (
            <div className="flex items-center gap-3 w-full">
                {previewSrc && (
                    <img src={previewSrc} alt={f?.name || "Logo"} className="w-10 h-10 object-contain border rounded bg-white" />

                )}
                <div className="flex-1">
                    <div className="font-medium">{f?.name || "logo.bmp"}</div>
                    {f?.size && <small>{(f.size / 1024).toFixed(1)} KB</small>}
                </div>
                <span
                    className={`px-2 py-1 text-xs rounded ${upload ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {upload ? "Complete" : "Pending"}
                </span>
            </div>
        );

    };
    const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (typeof value === "string") return value; // URL/base64 existente
    return null;
  }, [file, value]);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-semibold block">{label}</label>}

      <FileUpload
        name="logo"
        accept=".bmp"
        maxFileSize={maxSizeMB * 1024 * 1024}
        customUpload
        chooseLabel="Cargar archvio"
        uploadLabel="Subir archivo"
        cancelLabel="Cancelar"
        uploadHandler={handleUpload}
        itemTemplate={itemTemplate}

        disabled={disabled}
        onSelect={(e) => {
          // al seleccionar uno nuevo, vuelve a Pending hasta validar/subir
          setUpload(false);
          setFile(e.files?.[0] || null);
        }}
        onRemove={onRemove}
        emptyTemplate={<p className="m-0">Arrastre el archivo aquí o haga clic para cargar.</p>}
      />

      {/* Vista previa estable (se mantiene tras update) */}
      {preview && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 font-medium">Logo actual</p>
          <div className="border rounded p-2 w-fit bg-white">
            <img src={preview} alt="Logo actual" className="h-24 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

export default upload;
