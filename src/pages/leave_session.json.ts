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
                errorMessage: "The room you are trying to leave does not exist."
            }), {
                status: 404,
                headers: { 'Content-Type': "application/json" }
            })
        } else {

            const roomMembersData = JSON.parse(roomMembersResponse);
            if (roomMembersData.includes(userID)) {
                roomMembersData.splice(roomMembersData.indexOf(userID), 1)

                if (roomMembersData.length > 0) {
                    // there are other members in the room
                    await client.set(roomID, JSON.stringify(roomMembersData));
                } else {
                    // this was the last person in the room -- remove it now
                    await client.del(roomID);
                }

                // user has already joined
                return new Response("{}", {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            } else {
                // user already isn't in the room
                await client.set(roomID, JSON.stringify(roomMembersData));

                // return success
                return new Response(JSON.stringify({
                    errorMessage: "The user is not part of this room."
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

        }
    }
}