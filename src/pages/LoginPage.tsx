import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";

export default function LoginPage() {
     const toast = useRef<Toast>(null);
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const validarLogin = () => {
  if (usuario === "admin" && password === "liris1234") {
    localStorage.setItem("logueado", "true");
    //navigate("/admin/cupon");
    window.location.href = "/admin/cupon"; // error corregido para el inicio de sesión

  } else {
    toast.current?.show({
        severity: "error",
        summary: "Error de credenciales",
        detail : "Se ingresaron mal las crendeciales",
        life: 5000
    })
}
};

    return (
        <div
            className="min-h-screen bg-slate-200 flex items-center justify-center"
        >
            <Toast ref={toast}></Toast>
            {/* Overlay */}
            <div className="" />
            {/* Formulario centrado */}
            <div className="relative z-10 bg-white rounded shadow-lg w-[95%] max-w-xl">
                {/* Header verde con logo */}
                <div className="bg-green-800 text-white p-6 text-center rounded-t">
                    <img
                        src="/delportal-logo.png"
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
                    <h2 className="text-center text-lg font-bold text-green-800 mb-2">
                        Iniciar Sesión
                    </h2>
                    <div className="pb-3">
                        <label htmlFor="">Usuario</label>
                        <InputText
                            className="w-full"
                            placeholder="Ingrese su usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>
                    <div className="">
                        <label htmlFor="">Constraseña</label>
                        <Password
                            className="w-full"
                            placeholder="Ingrese su constraseña"
                            feedback={false}
                            toggleMask
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

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
