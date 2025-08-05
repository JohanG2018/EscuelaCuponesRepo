import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";

const FormCuponPage: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estadoActivo, setEstadoActivo] = useState(true);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoAplicacion, setTipoAplicacion] = useState<string[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<any[]>([]);

  const locales = [
    { name: "Moderna" },
    { name: "Rome" },
    { name: "London" },
    { name: "Istanbul" },
    { name: "Paris" },
  ];

  const onTipoAplicacionChange = (e: { value: string; checked: boolean }) => {
    const selected = [...tipoAplicacion];
    if (e.checked) selected.push(e.value);
    else selected.splice(selected.indexOf(e.value), 1);
    setTipoAplicacion(selected);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-center text-2xl font-bold mb-6  ">
        Administrador de Promociones - Cupones
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="flex flex-col gap-2">
          <label htmlFor="titulo" className="font-semibold">
            Título del cupón <span className="text-red-500">*</span>
          </label>
          <InputText
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ingrese el título"
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-2">
          <label htmlFor="estado" className="font-semibold invisible">
            Estado
          </label>
          <ToggleButton
            onLabel="Activo"
            offLabel="Inactivo"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={estadoActivo}
            onChange={(e) => setEstadoActivo(e.value)}
            className="w-36"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="descripcion" className="font-semibold">
            Descripción del cupón <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            autoResize
            placeholder="Ingrese la descripción"
          />
        </div>

        {/* Fechas */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fechaInicio" className="font-semibold">
            Desde:
          </label>
          <Calendar
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value as Date)}
            showIcon
            placeholder="Seleccione una fecha"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="fechaFin" className="font-semibold">
            Hasta:
          </label>
          <Calendar
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value as Date)}
            showIcon
            placeholder="Seleccione una fecha"
          />
        </div>

        {/* Tipo de Aplicación */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="tipoAplicacion" className="font-semibold">
            Tipo de Aplicación <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="general"
                value="General"
                onChange={onTipoAplicacionChange}
                checked={tipoAplicacion.includes("General")}
              />
              <label htmlFor="general">General</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="mecanica"
                value="Por mecánica"
                onChange={onTipoAplicacionChange}
                checked={tipoAplicacion.includes("Por mecánica")}
              />
              <label htmlFor="mecanica">Por mecánica</label>
            </div>
          </div>
        </div>

        {/* Selector de locales */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label htmlFor="locales" className="font-semibold">
            Locales <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            inputId="locales"
            value={selectedLocales}
            onChange={(e) => setSelectedLocales(e.value)}
            options={locales}
            optionLabel="name"
            placeholder="Seleccione uno o varios locales"
            filter
            className="w-full md:w-80"
            maxSelectedLabels={20}
          />
        </div>
      </div>
    </div>
  );
};

export default FormCuponPage;
