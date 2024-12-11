import { redisClient } from '..';

class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    return null;
  }

  public async set<T>(key: string, data: T, ttl: number = 6000): Promise<void> {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  }

  public async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  public async cacheRequest<T>(key: string, fetchData: () => Promise<T>, ttl: number = 60): Promise<T> {
    const cachedData = await this.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    const freshData = await fetchData();
    await this.set(key, freshData, ttl);
    return freshData;
  }

  public async invalidateQuery(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
}

export const cacheManager = CacheManager.getInstance();
