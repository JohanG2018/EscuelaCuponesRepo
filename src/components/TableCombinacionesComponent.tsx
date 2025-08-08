import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
export interface Combinacion {
    name: string;
    tipo: string;
    valor: number;
    cantidad: number;
}
interface Props {
    combinaciones: Combinacion[];
    onEdit: (combinacion: Combinacion, index: number) => void;
    onDelete: (index: number) => void;
    setCombinaciones: (combinaciones: Combinacion[]) => void;
}

const TableCombinacionesComponent: React.FC<Props> = ({ combinaciones, setCombinaciones, onDelete }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false); // Saber si es edición o creación
    const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);

const actionTemplate = (rowData: Combinacion, { rowIndex }: { rowIndex: number }) => {
  return (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-text"
        style={{ color: 'green' }}
        onClick={() => abrirModalEdicion(rowData, rowIndex)}
      />
      <Button
        icon="pi pi-times"
        className="p-button-sm p-button-text"
        style={{ color: 'red' }}
        onClick={() => onDelete(rowIndex)}
      />
    </div>
  );
};

    const [nuevaCombinacion, setNuevaCombinacion] = useState<Combinacion>({
        name: '',
        tipo: '',
        valor: 0,
        cantidad: 1,
    });

    const [errores, setErrores] = useState<{ [key: string]: boolean }>({});
    const productos = [
        { name: 'Producto 1', code: 'P1' },
        { name: 'Producto 2', code: 'P2' },
        { name: 'Producto 3', code: 'P3' },
        { name: 'Producto 4', code: 'P4' },
    ]
    const tipos = [
        { name: 'Categoria', code: 'categoria' },
        { name: 'SubCategoria', code: 'subcategoria' },
        { name: 'Producto', code: 'producto' },
        { name: 'Proveedores', code: 'proveedores' },
    ]
    const abrirModal = () => {
        setNuevaCombinacion({ name: '', tipo: '', valor: 0, cantidad: 1 });
        setErrores({});
        setModoEdicion(false);
        setModalVisible(true);
    };

    const abrirModalEdicion = (combinacion: Combinacion, index: number) => {
        setNuevaCombinacion(combinacion);
        setIndiceEdicion(index);
        setModoEdicion(true);
        setErrores({});
        setModalVisible(true);
    };

    const guardarCombinacion = () => {
        const nuevosErrores: any = {};
        if (!nuevaCombinacion.name) nuevosErrores.name = true;
        if (!nuevaCombinacion.tipo) nuevosErrores.tipo = true;
        if (nuevaCombinacion.valor < 0) nuevosErrores.valor = true;
        if (nuevaCombinacion.cantidad < 1) nuevosErrores.cantidad = true;

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        if (modoEdicion && indiceEdicion !== null) {
            const actualizadas = [...combinaciones];
            actualizadas[indiceEdicion] = nuevaCombinacion;
            setCombinaciones(actualizadas);
        } else {
            setCombinaciones([...combinaciones, nuevaCombinacion]);
        }

        setModalVisible(false);
    };

    return (
        <div className="mt-6">
            <div className="flex justify-end mb-3">
                <Button label="Agregar" raised icon="pi pi-plus" className='p-2' onClick={abrirModal} />
            </div>
            <DataTable
                value={combinaciones}
                stripedRows
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                tableStyle={{ minWidth: '75rem' }}
            >
                <Column field="name" header="Producto" style={{ width: '40%' }} />
                <Column field="tipo" header="Tipo" style={{ width: '20%' }} />
                <Column field="valor" header="Valor" style={{ width: '20%' }} />
                <Column field="cantidad" header="Cantidad" style={{ width: '20%' }} />
                <Column header='Acciones' body={actionTemplate} style={{ width: '150px' }} />
            </DataTable>

            <Dialog
                header="Agregar Combinación"
                visible={modalVisible}
                onHide={() => setModalVisible(false)}
                style={{ width: '30rem' }}
                modal
            >
                <div className="flex flex-col gap-4 mt-2 ">
                    <div>
                        <label className="font-semibold">Producto</label>
                        <Dropdown
                            value={nuevaCombinacion.name}
                            onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, name: e.value })}
                            options={productos}
                            optionLabel="name"
                            optionValue='name'
                            placeholder="Seleccione un producto"
                            filter
                            className={`w-full ${errores.name ? 'p-invalid' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Tipo</label>
                        <Dropdown
                            value={nuevaCombinacion.tipo}
                            onChange={(e) => setNuevaCombinacion({ ...nuevaCombinacion, tipo: e.value })}
                            options={tipos}
                            optionLabel="name"
                            optionValue='name'
                            placeholder="Seleccione un producto"
                            filter
                            className={`w-full ${errores.name ? 'p-invalid' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Valor</label>
                        <InputNumber
                            className={`w-full ${errores.valor ? 'p-invalid' : ''}`}
                            value={nuevaCombinacion.valor}
                            onValueChange={(e) =>
                                setNuevaCombinacion({ ...nuevaCombinacion, valor: e.value || 0 })
                            }
                            mode="decimal"
                            min={0}
                            placeholder="Ej. 10"
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Cantidad</label>
                        <InputNumber
                            className={`w-full ${errores.cantidad ? 'p-invalid' : ''}`}
                            value={nuevaCombinacion.cantidad}
                            onValueChange={(e) =>
                                setNuevaCombinacion({ ...nuevaCombinacion, cantidad: e.value || 1 })
                            }
                            min={1}
                            placeholder="Ej. 1"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <Button label="Cancelar" severity="secondary" onClick={() => setModalVisible(false)} />
                    <Button label="Guardar" icon="pi pi-check" onClick={guardarCombinacion} />
                </div>
            </Dialog>
        </div>
    );
};
export default TableCombinacionesComponent;
