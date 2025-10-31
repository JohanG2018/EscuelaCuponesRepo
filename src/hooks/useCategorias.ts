// src/hooks/useCategorias.ts
import { useEffect, useState } from "react";
import { getCachedData, setCachedData } from "../utils/cache";
import { fetchCategorias } from "../service/cupon";

const CACHE_KEY = "marketing_categorias";

export const useCategorias = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const cached = getCachedData<any[]>(CACHE_KEY);
            if (cached) {
                setData(cached);
                setLoading(false);
            }

            try {
                const fresh = await fetchCategorias();
                setData(fresh);
                setCachedData(CACHE_KEY, fresh);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { categorias: data, loadingCategorias: loading };
};