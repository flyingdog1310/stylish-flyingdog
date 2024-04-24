import Redis from "ioredis";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });
let redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  tls: {},
  retryStrategy(times) {
    console.log(`***Retrying redis connection: attempt ${times}***`);
    console.log(`***redis.status: ${redis.status}***`);
    if (times < 4) {
      return 1000 * 1;
    }
    return 1000 * 5;
  },
};
if (process.env.REDIS_TLS_ENABLE == "false") {
  redisConfig.tls = undefined;
}

export const redis = new Redis(redisConfig);
