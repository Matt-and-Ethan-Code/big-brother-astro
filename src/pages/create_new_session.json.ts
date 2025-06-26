import { createClient } from 'redis';

const client = createClient();
await client.connect();

// a function for encoding an id to a string
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
const BASE = ALPHABET.length;

const UPPERBOUND = 'KTFXW'
const UPPERBOUND_ID = 10000052

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

    const roomID: number = decode(roomName)
    if (roomID > UPPERBOUND_ID) {
        return new Response(JSON.stringify({
            errorMessage: "Too many rooms have been created. Can't create any more."
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        })
    } else {
        // generate and store next ID
        const nextID = roomID + 1;
        const nextGameName = encode(nextID);

        await client.set("next_game_id", nextGameName);

        return new Response(JSON.stringify({
            roomID: roomName
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}