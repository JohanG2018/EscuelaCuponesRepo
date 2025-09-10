import { Carousel } from "primereact/carousel";
import type { LogoFactura } from "../interface/LogoFactura";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Button } from "primereact/button";

type Props ={
    logos:LogoFactura[];
    onEdit?:(logo:LogoFactura)=>void;
}

export default function CarosuelComponent({logos,onEdit}:Props) {
    const responsive =[
        {
            breakpoint: '1024px', numVisible:3, numScroll:3
        },
        {
            breakpoint: '768px', numVisible:2, numScroll:2
        },
        {
            breakpoint: '560px', numVisible:1, numScroll:1
        }
    ]

    const logoTemplate = (logo: LogoFactura) => (
  <div className=" flex w-full max-w-xs mx-auto box-border">
    <Card className="p-3 text-center rounded-lg shadow-md">
      <Image
        src={`data:image/bmp;base64,${logo.logoUrl}`}
        
        className="w-full max-w-[200px] mx-auto"
        preview
      />
      <h4 className="mt-2 font-semibold">{logo.nombreLogo}</h4>
      <p className="text-sm text-gray-600">{logo.locales?.map((l) => l.nombre).join(", ")}</p>
      {onEdit && (
        <Button
          icon="pi pi-pencil"
          label="Editar"
          className="mt-2"
          onClick={() => onEdit(logo)}
        />
      )}
    </Card>
  </div>
);

    return(
        <div className="">
            <Carousel
                value={logos}
                itemTemplate={logoTemplate}
                numVisible={3}
                numScroll={1}
                responsiveOptions={responsive}
                circular
                autoplayInterval={6000}
                pt={{ itemsContent: { className: 'overflow-hidden' } }}
            />
        </div>
    )
}