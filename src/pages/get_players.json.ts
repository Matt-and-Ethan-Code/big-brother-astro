import { createClient } from 'redis';

const client = createClient();
await client.connect();

export async function GET( request: any ) {
    if (request.headers.get('Content-Type') === 'application/json') {
        const body = await request.json();
        const roomID = body.roomID;

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

            const roomMembersData = JSON.parse(roomMembersResponse);

            return new Response(JSON.stringify({
                players: roomMembersResponse
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    }
}