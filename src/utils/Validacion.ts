export function ArchivoBMP(file:File):boolean{
    return file.type === "image/bmp" || file.name.toLowerCase().endsWith(".bmp");
}
export function ArchivoMenor(file:File, maxBytes:number):boolean{
    return file.size <= maxBytes;
}

export function validarImagenMax(file:File, maxWidth:number):Promise<boolean>{
    return new Promise((resolve)=>{
        const reader = new FileReader();
        reader.onload= ()=>{
            const img = new Image();
            img.onload = ()=>{
                const img = new Image();
                img.onload= () =>resolve(img.width <= maxWidth);
                img.onerror = () => resolve(false);
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file)
        }
    })
}

export function FechaInicio(fecha:Date): boolean{
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const comparada = new Date(fecha);
    comparada.setHours(0,0,0,0);
    return comparada < hoy;
}
export function fechaFin(inicio: Date, fin : Date): boolean{
    return new Date(fin) < new Date(inicio);
}