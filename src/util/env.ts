import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });
interface Env {
    BOT_TOKEN: string;
    PREFIX: string;
    YT_API_KEY: string;
    REDIS_URL:string;
}
export const env: Env = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    PREFIX: process.env.PREFIX,
    YT_API_KEY: process.env.YT_API_KEY,
    REDIS_URL:process.env.REDIS_URL

};
