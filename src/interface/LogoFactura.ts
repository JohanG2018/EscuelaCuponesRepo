import type { Local } from "./Local";

export interface LogoFactura {
    idLogoFactura: string | number;
    id:string;
    nombreLogo:string;
    logoUrl:string;
    locales:Local[];
}