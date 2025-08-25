//React
import { useEffect, useRef, useState } from "react";
//Prime React
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from 'primereact/inputtext';
import { Toast } from "primereact/toast";
//Interface
import type { Local } from "../interface/cuponInterface";
//service
import { fetchLocales } from "../service/cupon";
import { buildXMLFactura, postFacturasLogo } from "../service/factura_logo";
//Componentes
import MultiSelect from "../components/MultiselectComponent";
import Upload from "../components/Upload";


export default function FacturaLogoPage() {

  const toast = useRef<Toast>(null);

  const [localesSeleccionados, setLocalesSeleccionados] = useState<Local[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [nombreLogo, setNombreLogo] = useState<string>("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [registrosGuardados, setRegistrosGuardados] = useState<
    { nombre: string; logo: File; locales: Local[] }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [locs] = await Promise.all([fetchLocales()]);
        setLocales(locs);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar datos",
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onGuardar = async () => {
    if (!nombreLogo || !logoFile || localesSeleccionados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Faltan datos",
        detail: "Debes ingresar nombre, logo y al menos un local",
        life: 3000,
      });
      return;
    }

    try {
      setEnviado(true);

      // El back inyectará <logoUrl>, enviamos vacío aquí
      const xml = buildXMLFactura({
        nombreLogo,
        logoUrl: "",
        locales: localesSeleccionados,
      });

      const resp = await postFacturasLogo({
        file: logoFile,
        xmlString: xml,
      });

      if ((resp as any)?.status === "success") {
        toast.current?.show({
          severity: "success",
          summary: "Guardado",
          detail: "Logo asignado correctamente",
          life: 3000,
        });
      } else {
        toast.current?.show({
          severity: "info",
          summary: "Respuesta recibida",
          detail: "Solicitud procesada",
          life: 2500,
        });
      }

      // Actualiza la vista previa local (3 cards por fila)
      setRegistrosGuardados((prev) => [
        ...prev,
        { nombre: nombreLogo, logo: logoFile, locales: localesSeleccionados },
      ]);

      // Limpia form
      setNombreLogo("");
      setLogoFile(null);
      setLocalesSeleccionados([]);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.message || "No se pudo guardar",
        life: 4000,
      });
    } finally {
      setEnviado(false);
    }
  };

  return (
    <div className="mx-auto space-y-4  p-4">
      <Toast ref={toast} />
      <h1 className="text-2xl text-center font-semibold">Asignar Logo de Factura</h1>

      {/* Nombre del logo */}
      <div className="flex flex-col">
        <label className="font-semibold p-2">Nombre del logo</label>
        <InputText
          value={nombreLogo}
          onChange={(e) => setNombreLogo(e.target.value)}
          placeholder="Ingrese el nombre del logo de la factura"
          className="w-full"
          disabled={loading || enviado}
        />
      </div>

      {/* Subida de logo */}
      <div>
        <Upload
          value={logoFile}
          onChange={(file) => setLogoFile(file)}
          toastRef={toast}
          maxWidth={600}
          maxSizeMB={5}
          disabled={loading || enviado}
          label="Cargar nuevo logo (.bmp, máx 600px ancho)"
        />
      </div>

      {/* Selección de locales */}
      <div>
        <label className="font-semibold block mb-2">Locales a asignar</label>
        <MultiSelect
          value={localesSeleccionados}
          onChange={(e) => setLocalesSeleccionados(e.value)}
          options={locales}
          optionLabel="local"
          placeholder="Seleccione uno o varios locales"
          maxSelectedLabels={100}
          className="w-full md:w-20rem"
          disabled ={loading || enviado}
        />
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          label="Guardar"
          icon="pi pi-save"
          onClick={onGuardar}
          className="bg-green-600 text-white px-5 py-2"
        />
      </div>

      {/* Vista previa de registros guardados */}
      {registrosGuardados.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Logo(s) asignado(s):</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrosGuardados.map((registro, i) => (
              <Card
                key={i}
                className="p-4 shadow-md rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Imagen del logo */}
                  <div className="border rounded-md bg-white shadow p-2">
                    <img
                      src={URL.createObjectURL(registro.logo)}
                      alt={`Logo ${i}`}
                      className="h-24 w-auto object-contain"
                    />
                  </div>

                  {/* Nombre y Locales */}
                  <div className="text-center">
                    <h3 className="text-base font-semibold mb-1">{registro.nombre}</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-zinc-200">
                      {registro.locales.map((l) => (
                        <li key={l.id}>{l.local}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
