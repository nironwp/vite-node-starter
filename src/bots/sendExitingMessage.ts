import { type Whatsapp } from 'mendes-bot';

export default async function sendExitingMessage(
    client: Whatsapp,
    groupId: string,
    messages: string
) {
    await client.sendText(groupId, messages);
}
