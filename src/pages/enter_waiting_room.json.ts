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


export async function POST(request: any ) {
    console.log("eee", request.request.headers.get('Content-Type'))
    const contentType = request.request.headers.get('Content-Type') || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.request.formData();


        const roomID = formData.get("game-pin");
        const playerName = formData.get('player-name');

        // check whether such room exists and whether user hasn't already joined it
        const roomMembersResponse: string | null = await client.get(roomID);
        if (roomMembersResponse == null) {
            return new Response(JSON.stringify({ 
                errorMessage: "The room you are trying to join does not exist."
            }), {
                status: 404,
                headers: { 'Content-Type': "application/json" }
            })
        } else {

            
            const roomMembers: Array<string> = JSON.parse(roomMembersResponse);

            console.log("roomMemers: ", roomMembers);
            if (roomMembers.includes(playerName)) {
                return new Response(JSON.stringify({
                    errorMessage: "A player by that name has already joined."
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                })
            }

            roomMembers.push(playerName);
            client.set(roomID, JSON.stringify(roomMembers));

            return new Response(null, {
                status: 302,
                headers: {
                    Location: `/vote?gameId=${encodeURIComponent(roomID)}&username=${encodeURIComponent(playerName)}`
                }
            })

        }
    }
}




// export async function POST() {
//     // get how many games are happening currently -- we don't want too many
//     console.log("posting...")


// }