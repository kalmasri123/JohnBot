import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });
interface Env {
    BOT_TOKEN: string;
    CLIENT_ID: string;
    PREFIX: string;
    YT_API_KEY: string;
    REDIS_URL: string;
    MONGOURI: string;
    HTTP_PROXY: string;
    COOKIES_PATH: string;
    TRANSCRIBE_LOCATION: string;
}
export const env: Env = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    PREFIX: process.env.PREFIX,
    YT_API_KEY: process.env.YT_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    MONGOURI: process.env.MONGOURI,
    HTTP_PROXY: process.env.HTTP_PROXY,
    COOKIES_PATH: process.env.COOKIES_PATH ?? "cookies.json",
    TRANSCRIBE_LOCATION: process.env.TRANSCRIBE_LOCATION
};
