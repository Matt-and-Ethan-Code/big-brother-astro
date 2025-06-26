import { createClient } from 'redis';

const client = createClient();
await client.connect();

export async function POST( request: any ) {
    if (request.headers.get('Content-Type') === 'application/json') {
        const body = await request.json();
        const userID = body.userID;
        const roomID = body.roomID;

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

            const roomMembersData = JSON.parse(roomMembersResponse);
            if (roomMembersData.includes(userID)) {
                // user has already joined
                return new Response(JSON.stringify({
                    errorMessage: "You have already joined this room."
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                })
            } else {
                roomMembersData.push(userID);
                
                // update the players data
                await client.set(roomID, JSON.stringify(roomMembersData));

                // return success
                return new Response("{}", {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

        }
    }
}