import { getegid } from 'process';
import { createClient, createCluster } from 'redis';
import { promisify } from 'util';
import { env } from './env';
const client = createClient({ url: env.REDIS_URL, socket: { connectTimeout: 50000 } });

client.connect();
// client.flushAll();
export async function get(key: string): Promise<any> {
    return await client.get(key);
}
export async function set(key: string, value: any): Promise<any> {
    return await client.set(key, value);
}
export async function del(key: string): Promise<any> {
    return await client.del(key);
}
export async function hSet(category: string, key: string, obj: any): Promise<any> {
    return await client.hSet(category, key, obj);
}
export async function hGet(category: string, key: string): Promise<any> {
    return await client.hGet(category, key);
}
