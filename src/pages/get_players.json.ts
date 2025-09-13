import { createClient } from 'redis';

export const prerender = false;

const path_name = `rediss://default:${import.meta.env.UPSTASH_TOKEN}@${import.meta.env.UPSTASH_ENDPOINT}:${import.meta.env.UPSTASH_PORT}`

const client = createClient({
    url: path_name
}).on("error", console.error)
try {
    await client.connect();
} catch(e) {
    console.log("ERROR! ", e);
}

async function findKeysByPattern(pattern: string) {
    const keys: string[] = [];
    let cursor = "0";
    console.log("pattern: ", pattern);

    do {
        const reply = await client.scan(cursor, {
            MATCH: pattern,
            COUNT: 100
        });

        console.log("reply: ", reply);
        const nextCursor = reply.cursor;
        const newKeys = reply.keys;
        cursor = nextCursor;

        keys.push(...newKeys);
    } while (cursor !== "0");

    return keys;
}

export async function GET( request: any ) {
    const url = new URL(request.url);
    const roomID = url.searchParams.get('roomCode');

    if (!roomID) {
        return new Response(JSON.stringify({ 
            errorMessage: `Invalid room code. ${url.searchParams}`
        }), {
            status: 404,
            headers: { 'Content-Type': "application/json" }
        })
    }

    // check whether such room exists and whether user hasn't already joined it
    const roomMembersResponse: string | null = await client.get(roomID);
    if (roomMembersResponse == null) {
        return new Response(JSON.stringify({ 
            errorMessage: "The room you are trying to look up does not exist."
        }), {
            status: 404,
            headers: { 'Content-Type': "application/json" }
        })
    } else {

        const allRoomMembersData = JSON.parse(roomMembersResponse);

        // now get all members who submitted
        // keys of those members will be in sequence USERNAME|roomID
        const keys = await findKeysByPattern(`*:${roomID}`);//await client.keys(`*|${roomID}`);
        const usernames = keys.map(key => key.split(':')[0]);



        return new Response(JSON.stringify({
            players: allRoomMembersData,
            completedPlayers: usernames
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}