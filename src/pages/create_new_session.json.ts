import { createClient } from 'redis';
import type { APIRoute } from 'astro';

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

// a function for encoding an id to a string
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
const BASE = ALPHABET.length;

const MAX_ENTRIES = 100; 

function encode(num: number) {
    let str = '';
    while (num > 0) {
        const rem = num % BASE;
        str = ALPHABET[rem] + str;
        num = Math.floor(num/BASE);
    }
    return str || ALPHABET[0];
}

function decode(str: string) {
    let num = 0;
    for (let char of str) {
        num = num * BASE + ALPHABET.indexOf(char);
    }
    return num;
}

export async function POST() {
    // get how many games are happening currently -- we don't want too many
    console.log("posting...")
    const roomNameResponse: string | null = await client.get('next_game_id');
    if (roomNameResponse == null) {
        return new Response(JSON.stringify({
            errorMessage: "The internal database is missing the next_game_id parameter."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    } 
    const roomName = roomNameResponse;

    const numberEntries = await client.dbSize();
    if (numberEntries >= MAX_ENTRIES) {
        return new Response(JSON.stringify({
            errorMessage: "Too many rooms have been created. Can't create any more."
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        })
    } else {
        // generate and store next ID
        
        const roomID: number = decode(roomName)
        const nextID = roomID + 100;
        const nextGameName = encode(nextID);

        await client.set("next_game_id", nextGameName);


        await client.set(roomName, JSON.stringify([]))

        return new Response(JSON.stringify({
            roomID: roomName
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}