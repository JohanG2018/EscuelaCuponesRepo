// src/utils/cache.ts

const CACHE_TTL = 1440 * 60 * 1000; // 24 horas

interface CachedData<T> {
    data: T;
    timestamp: number;
}

export const getCachedData = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
        const parsed = JSON.parse(item) as CachedData<T>;
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
            return parsed.data;
        } else {
            localStorage.removeItem(key);
        }
    } catch {
        localStorage.removeItem(key);
    }
    return null;
};

export const setCachedData = <T>(key: string, data: T): void => {
    const payload: CachedData<T> = { data, timestamp: Date.now() };
    try {
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.warn("No se pudo guardar en localStorage:", key);
    }
};