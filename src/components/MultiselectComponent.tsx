import React from "react";
import { MultiSelect } from "primereact/multiselect";
import type { MultiSelectChangeEvent } from "primereact/multiselect";
import "../App.css"

interface MultiselectComponentProps {
    options: any[];
    value: any[];
    onChange: (e: MultiSelectChangeEvent) => void;
    placeholder?: string;
    optionLabel?: string;
    maxSelectedLabels?: number;
    filter?: boolean;
    inputId?: string;
    className?: string;
    name?: string;
}

const MultiselectComponent: React.FC<MultiselectComponentProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccione...",
    optionLabel = "name",
    maxSelectedLabels = 20,
    filter = true,
    inputId,
    className,
    name,
}) => {
    return (
        <MultiSelect
            inputId={inputId}
            value={value}
            onChange={onChange}
            options={options}
            optionLabel={optionLabel}
            placeholder={placeholder}
            filter={filter}
            className={className}
            maxSelectedLabels={maxSelectedLabels}
            display="chip"
            name={name}
        />
    );
};

export default MultiselectComponent;