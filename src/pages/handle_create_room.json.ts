import { createClient } from 'redis';

const client = createClient();
await client.connect();

export async function POST() {
    
}