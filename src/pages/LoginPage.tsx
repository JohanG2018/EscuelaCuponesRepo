import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const validarLogin = () => {
        localStorage.setItem("logueado", "true"); 
        if (usuario === "1234567890" && password === "123456") {
            navigate("/admin/cupon");
        } else {
            
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center relative flex items-center justify-center"
            style={{ backgroundImage: "url('public/fondo.jpg')" }} // cambia por tu imagen
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 z-0" />
            {/* Formulario centrado */}
            <div className="relative z-10 bg-white rounded shadow-lg w-[95%] max-w-lg">
                {/* Header verde con logo */}
                <div className="bg-green-800 text-white p-6 text-center rounded-t">
                    <img
                        src="public\delportal-logo.png"
                        alt="Logo Delportal"
                        className="mx-auto h-24 mb-2"
                    />
                </div>
                {/* Formulario */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        validarLogin();
                    }}
                    className="px-6 py-6 space-y-4"
                >
                    <h2 className="text-center text-sm font-bold text-green-800 mb-2">
                        Iniciar Sesión
                    </h2>
                    <InputText
                        className="w-full"
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                    <Password
                        className="w-full"
                        placeholder="Clave"
                        feedback={false}
                        toggleMask
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        label="Ingresar"
                        type="submit"
                        raised
                        className="w-full bg-green-600 hover:bg-green-700 p-2 border-green-700"
                    />

                </form>
            </div>


        </div>
    );
}
