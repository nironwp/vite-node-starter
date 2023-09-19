import { type Whatsapp } from 'mendes-bot';

export default async function sendWelcomeMessage(
    client: Whatsapp,
    groupId: string,
    messages: string
) {
    await client.sendText(groupId, messages);
}
