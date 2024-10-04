import { createClient } from "redis";
import { env } from "techme/env";

export async function getCacheClient() {
  const client = createClient({
    url: env.REDIS_URL,
  });
  return await client
    .connect()
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.error("Failed to connect to Redis", err);
      if (env.NODE_ENV === "test") {
        return client;
      }
      throw err;
    });
}

export type RedisClient = ReturnType<typeof createClient>;

const globalForCache = globalThis as unknown as {
  cache: Promise<RedisClient>;
};

const cache = globalForCache.cache ?? getCacheClient();
if (env.NODE_ENV !== "production") globalForCache.cache = cache;

export { cache };
