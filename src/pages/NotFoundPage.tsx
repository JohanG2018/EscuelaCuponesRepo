import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage(){
    const navigate  = useNavigate();

    return(
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                    
            <h1 className="text-4xl font-bold text-green-800 mb-4">404 Página no encontrada</h1>
            <p className="text-gray-600 mb-6 ">La ruta a la que accediste no existe</p>
            <Button type="button" label="Volver al inicio" icon="pi pi-home" onClick={()=>navigate("/admin/cupon")}/>
        </div>
    )
}