// src/components/Layout.tsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import { Button } from "primereact/button";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  
  return (
    <div className="min-h-screen ">
      <div className="flex">
        <aside
          className={`h-screen sticky top-0 border-r border-gray-200 dark:border-zinc-800
            transition-[width] duration-200 ease-out
            ${collapsed ? "w-16" : "w-64"}`}
        >
          
          <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
        </aside>
            
        <main className="flex-1 p-4">
          
          <Outlet />
        </main>
      </div>
    </div>
  );
}
