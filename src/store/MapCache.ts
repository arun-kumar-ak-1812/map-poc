
class MapCache {
    public scale = 0;

    public transformX = 0

    public transformY = 0;

    public isScaleChanged = true;

    public pointCacheMap: Map<string, { x: number, y: number }> = new Map();

    public pointCacheArr: { x: number, y: number }[] = [];
}

export const mapCache = new MapCache();