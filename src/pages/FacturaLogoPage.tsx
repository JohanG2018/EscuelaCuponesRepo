// React
import { useEffect, useRef, useState } from "react";
// Prime React
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from 'primereact/inputtext';
import { Toast } from "primereact/toast";
// Interface
import type { Local } from "../interface/Local";
import type { LogoFactura } from "../interface/LogoFactura";
// service
import { fetchLocales } from "../service/cupon";
import { buildXMLFactura, fetchLogosFactura, postFacturasLogo, putLogoFacturaUpdate } from "../service/factura_logo";
// Componentes
import MultiSelect from "../components/MultiselectComponent";
import Upload from "../components/Upload";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

export default function FacturaLogoPage() {
  const toast = useRef<Toast>(null);

  const [localesSeleccionados, setLocalesSeleccionados] = useState<Local[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [nombreLogo, setNombreLogo] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logosGuardados, setLogosGuardados] = useState<LogoFactura[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [editOpen, setEditOpen]= useState<boolean>(false);
  const [editoriginal, setEditOriginal] = useState<LogoFactura | null>(null);
  const [editnombreLogo, setEditLogoNombre] = useState<string>("");
  const [editLocales, setEditLocales] = useState<Local[]>([]);
  const [editLogoFile, setEditLogoFile] = useState<File |string| null>(null);

  // Normalizador seguro para lo que devuelva fetchLogosFactura
  const toLogoArray = (resp: any): LogoFactura[] => {
    if (Array.isArray(resp)) return resp as LogoFactura[];
    if (Array.isArray(resp?.data)) return resp.data as LogoFactura[];
    if (Array.isArray(resp?.logos)) return resp.logos as LogoFactura[];
    return []; // fallback
  };   

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [locs, logosResp] = await Promise.all([
          fetchLocales(),
          fetchLogosFactura()
        ]);
        setLocales(locs ?? []);
        const logos = toLogoArray(logosResp);
        setLogosGuardados(logos);
        // Debug útil:
        console.log("[DEBUG] locales:", locs);
        console.log("[DEBUG] logosResp bruto:", logosResp);
        console.log("[DEBUG] logos normalizados:", logos);
      } catch (err: any) {
        console.error("[ERROR] Carga inicial:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err?.message || "Error al cargar datos",
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
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

    const xml = buildXMLFactura({
      nombreLogo,
      logoUrl: "", // el back lo inyecta
      locales: localesSeleccionados,
    });

    // Validación extra antes de llamar
    if (!logoFile || !(logoFile instanceof File)) {
      throw new Error("Archivo de logo inválido o ausente.");
    }

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
        detail: (resp as any)?.message || "Solicitud procesada",
        life: 2500,
      });
    }

    // Refrescar lista de logos guardados
    const refresco = await fetchLogosFactura();
    const nuevos = toLogoArray(refresco);
    setLogosGuardados(nuevos);

    // Limpiar form
    setNombreLogo("");
    setLogoFile(null);
    setLocalesSeleccionados([]);
  } catch (err: any) {
    console.error("[ERROR] onGuardar:", err);
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

const onEditar = (registro: LogoFactura) => {
  setEditOriginal(registro);
  setEditLogoNombre(registro.nombreLogo || "");
  setEditLogoFile(registro.logoUrl || null);

  const local = ( registro.locales||[]).map((l:any)=> 
    locales.find( loc => loc.id === l.id || loc.local === l.local || loc.local === l.nombre) || l
  ) ||[];
  setEditLocales(local);
  setEditOpen(true);

};

const onCancelarEdicion = ()=>{
  setEditOpen(false);
  setEditOriginal(null)
  setEditLogoNombre("")
  setEditLogoFile(null)

  setEditLocales([]);
}

const onActualizar = async()=>{
  if(!editoriginal) return;

  if(!editoriginal || editLocales.length===0){
    toast.current?.show({
      severity:"warn",
      summary:"Faltan datos",
      detail: "Debes ingresar nombre y al menos un local",
      life:4000
    });
    return;
  }
  try{
    setEnviado(true);
    const xmlUpdate = buildXMLFactura({
      nombreLogo: editnombreLogo,
      logoUrl: "",
      locales: editLocales
    });
    const resp = await putLogoFacturaUpdate({
      idLogoFactura: editoriginal.idLogoFactura,
      nombreLogo: editnombreLogo,
      logoUrl: typeof editLogoFile === "string" ? editLogoFile : "",
      locales: editLocales
    })
    if((resp as any)?.status === "success"){
      toast.current?.show({
        severity:"success",
        summary:"Actualizado",
        detail: "Logo actualizado correctamente",
        life: 4000
      })
    }else{
      toast.current?.show({
        severity:"info",
        summary: "Respuesta recibida",
        detail: (resp as any)?.message || "Solicitud procesada",
        life: 3000
      })
    }
    const refresco = await fetchLogosFactura();
    setLogosGuardados(toLogoArray(refresco));
    onCancelarEdicion();
  }catch(err:any){
    toast.current?.show({
      severity:"error",
      summary:"Error",
      detail: err?.message || "No se pudo actualizar",
      life: 4000
    });
  } finally{
    setEnviado(false);
  }
}

  return (
    <div className="mx-auto space-y-4 p-4">
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
          onChange={(file) => {
            setLogoFile(file); 
          }
            }
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
          disabled={loading || enviado}
        />
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          label={enviado ? "Guardando..." : "Guardar"}
          icon="pi pi-save"
          onClick={onGuardar}
          className="bg-green-600 text-white px-5 py-2"
          disabled={loading || enviado}
        />
      </div>

      {/* Vista previa de registros guardados */}
     {logosGuardados?.length > 0 ? (
  <>
    <h3 className="font-semibold mb-2">Logo(s) asignado(s):</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {logosGuardados
        .slice(0, mostrarTodos ? logosGuardados.length : 5) // 👈 mostrar 5 o todos
        .map((registro, i) => (
          <Card
            key={i}
            className="p-4 shadow-md rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Imagen del logo */}
              <div className="border rounded-md bg-white shadow p-2">
                {!!registro?.logoUrl ? (
                  <img
                    src={registro.logoUrl}
                    alt={`Logo ${i}`}
                    className="h-24 w-auto object-contain"
                  />
                ) : (
                  <div className="h-24 w-40 flex items-center justify-center text-xs text-gray-500">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Nombre y Locales */}
              <div className="text-center">
                <h3 className="text-base font-semibold mb-1">
                  {registro?.nombreLogo || "—"}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-zinc-200">
                  {registro?.locales?.map((l, idx) => (
                    <li key={l?.id ?? `${l?.local}-${idx}`}>{l?.local}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-4 ">
              <Button
                label="Editar"
                type="button"
                onClick={() => onEditar(registro)}
                raised
                icon="pi pi-pencil"
                className="p-2 bg-green-500 text-white"
              />
            </div>
          </Card>
        ))}
    </div>

    {/* Botón Ver más / Ver menos */}
    {logosGuardados.length > 5 && (
      <div className="flex justify-center mt-6">
        <Button
          label={mostrarTodos ? "Ver menos" : "Ver más"}
          onClick={() => setMostrarTodos((prev) => !prev)}
          icon={mostrarTodos ? "pi pi-chevron-up" : "pi pi-chevron-down"}
          className="px-5 py-2 bg-blue-500 text-white"
        />
      </div>
    )}
  </>
) : (
  !loading && (
    <p className="text-sm text-gray-500 text-center">
      No hay logos asignados aún.
    </p>
  )
)}
<Dialog
  header="Editar Logo de Factura"
  visible={editOpen}
  style={{width: "46rem",maxWidth:"95vw"}}
  modal
  onHide={()=> ! enviado && onCancelarEdicion()}>
    <div className="space-y-4">
      <div className="flex flex-col">
        <label className="font-semibold p-2" htmlFor="">Nombre del logo</label>
        <InputText
          value={editnombreLogo}
          onChange={(e)=> setEditLogoNombre(e.target.value)}
          placeholder="Ingrese el nombre del logo"
          className="w-full"
          disabled={enviado}
        />
      </div>
      <Divider/>
      <div className=" flex flex-col gap-2">
        <Upload
          value={editLogoFile}
          onChange={(file)=>{
            setEditLogoFile(file)
            if(file){
              const objUrl = URL.createObjectURL(file);
              setEditLogoFile(objUrl);
            }else{
              setEditLogoFile(editoriginal?.logoUrl || null);
            }
          }}
          maxWidth={700}
          maxSizeMB={5}
          disabled={enviado}
          label="Cargar nuevo logo (.bmp, máx 600px ancho)"
        />
        
      </div>
      
    </div>      
      <Divider/>
      <div>
        <label className="font-semibold block mb-2" htmlFor="">Locales asignados</label>
        <MultiSelect 
        value={editLocales}
        onChange={(e)=> setEditLocales(e.value)}
        options={locales}
        optionLabel="local"
        placeholder="Seleccione uno o varios locales"
        maxSelectedLabels={100}
        className="w-full md:w-20rem"
        disabled={enviado}
        />
      </div>
       <div className="flex justify-end gap-3 pt-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="bg-red-600 text-white px-5 py-2"
        onClick={onCancelarEdicion}
        disabled={enviado}
        raised
      />
      <Button
        label={enviado ? "Actualizando..." : "Actualizar"}
        icon="pi pi-save"
        onClick={onActualizar}
        className="bg-green-600 text-white px-5 py-2"
        disabled={enviado}
        raised
      />
    </div>
  
  </Dialog>
    </div>
   
  );  
}