// src/components/SideMenu.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "primereact/button";

type Props = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

const baseItem =
  "flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-green-300 ";
const activeItem =
  "bg-primary-50 text-primary-700 ";
const caretCls =
  "pi pi-chevron-down text-xs transition-transform duration-200 ml-auto";

export default function SideMenu({ collapsed, setCollapsed }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  

const handleLogout = () => {
  localStorage.removeItem("logueado"); // Borra estado de sesión
  navigate("/login"); // Redirige al login
};
  // controla submenús abiertos
  const [open, setOpen] = useState<{ [k: string]: boolean }>({
    adminLogo: true, // abierto por defecto (cámbialo si quieres)
  });

  const toggle = (key: string) =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className={`truncate ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
      {children}
    </span>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header + botón hamburguesa */}
      <div className="flex items-center gap-2 p-3 border-b border-green-300">
        <button
          aria-label="Toggle sidebar"
          className="p-2 rounded-lg hover:bg-green-300 "
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expandir" : "Contraer"}
        >
          <i className="pi pi-bars" />
        </button>
        {!collapsed && <div className="font-semibold">Administración</div>}
      </div>

      {/* Navegación */}
      <nav className="p-3 space-y-2 overflow-y-auto">
        {/* Admin Cupón (link directo) */}
        <NavLink
          to="/admin/cupon"
          title="Admin Cupón"
          className={({ isActive }) =>
            `${baseItem} ${isActive ? activeItem : ""}`
          }
        >
          <i className="pi pi-ticket" />
          <Label>Admin Cupón</Label>
        </NavLink>

        {/* Grupo: Admin Logo (desplegable) */}
        <div className="space-y-1">
          <button
            type="button"
            title="Admin Logo"
            onClick={() =>
              collapsed ? navigate("/admin/logo/factura") : toggle("adminLogo")
            }
            className={`${baseItem} w-full`}
          >
            <i className="pi pi-image" />
            <Label>Admin Logo</Label>

            {/* caret solo si no está colapsado */}
            {!collapsed && (
              <i
                className={caretCls}
                style={{ transform: open.adminLogo ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            )}
          </button>

          {/* Submenú */}
          <div
            className={`grid transition-[grid-template-rows] duration-200
              ${collapsed ? "grid-rows-[0fr]" : open.adminLogo ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden pl-9">
              <NavLink
                to="/admin/logo/factura"
                title="Factura Logo"
                className={({ isActive }) =>
                  `${baseItem} ${isActive ? activeItem : ""}`
                }
              >
                <i className="pi pi-file" />
                <Label>Factura Logo</Label>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>


      <div className="mt-auto p-3 opacity-70 text-xs">
        <Button
          label={collapsed ? "" : "Cerrar sesión"}
          icon="pi pi-sign-out"
          className="p-button-text text-red-500 mt-auto w-full justify-start"
          onClick={handleLogout}
        />
        {!collapsed ? "LIRIS" : null}
      </div>
    </div>
  );
}
