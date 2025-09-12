import { createClient } from 'redis';

export const prerender = false;

const path_name = `rediss://default:${import.meta.env.UPSTASH_TOKEN}@${import.meta.env.UPSTASH_ENDPOINT}:${import.meta.env.UPSTASH_PORT}`
console.log("PATH NAME: ", path_name)

const client = createClient({
    url: path_name
}).on("error", console.error)
try {
    await client.connect();
} catch(e) {
    console.log("ERROR! ", e);
}

export async function POST({params, request} : { request: Request, params: unknown}) {
    const body = JSON.parse(await request.text()) as unknown;
    if (!(typeof body == 'object') || body == null) throw new Error('not object!');
    if (!('username' in body) || typeof body.username != 'string') throw new Error('no username');
    if (!('game_id' in body) || typeof body.game_id != 'string') throw new Error('no game id');
    if (!('rankings' in body) || !Array.isArray(body.rankings)) throw new Error('no rankings');

    const {username, game_id, rankings} = body;
    const key = `${username}:${game_id}`
    
    await client.set(key, JSON.stringify(rankings))
    
    return new Response(null, {status:302, headers: {Location: `/`}})
}