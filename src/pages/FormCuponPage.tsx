import React from "react";
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';
import { useState } from "react";


const FormCuponPage: React.FC = () => {
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(false);
    return (
        <>
            <div >
                <h1 className="text-center p-5">Administrador de Promociones - Cupones</h1>
                <div className="flex flex-col gap-2">
                    <label htmlFor="titulo">Titulo del Cupón</label>
                    <InputText value={value} onChange={(e) => setValue(e.target.value)} />
                    <div className="card flex justify-content-center">
                        <ToggleButton onLabel="Activado" offLabel="Desactivado" onIcon="pi pi-check" offIcon="pi pi-times"
                            checked={checked} onChange={(e) => setChecked(e.value)} className="w-9rem" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default FormCuponPage;