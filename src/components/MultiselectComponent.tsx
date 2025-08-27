import React from "react";
import { MultiSelect } from "primereact/multiselect";
import type { MultiSelectChangeEvent } from "primereact/multiselect";
import "../App.css";

interface MultiselectComponentProps {
  options: any[] | undefined | null;
  value: any[] | undefined | null;
  onChange: (e: MultiSelectChangeEvent) => void;
  placeholder?: string;
  optionLabel?: string;
  maxSelectedLabels?: number;
  filter?: boolean;
  inputId?: string;
  className?: string;
  name?: string;
  optionValue?: string; // por si luego quieres manejar solo IDs
  disabled?:boolean
  loading?:boolean
}

const MultiselectComponent: React.FC<MultiselectComponentProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccione...",
  optionLabel = "name",
  maxSelectedLabels = 3,
  filter = true,
  inputId,
  className,
  name,
  optionValue, // opcional
  disabled=false,
  loading=false
}) => {
  // Parachoques: siempre arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value) ? value : [];

  return (
    <MultiSelect
      inputId={inputId}
      value={safeValue}
      onChange={onChange}
      options={safeOptions}
      optionLabel={optionLabel}
      optionValue={optionValue}
      placeholder={placeholder}
      filter={filter}
      className={className}
      maxSelectedLabels={maxSelectedLabels}
      display="chip"
      name={name}
      emptyMessage="Sin resultados"
      // (opcional) evita que falle si el valor ya no existe en options
      showSelectAll={safeOptions.length > 0}
      disabled={disabled}
      loading={loading}
    />
  );
};

export default MultiselectComponent;
