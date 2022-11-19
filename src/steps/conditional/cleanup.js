/**
 * @param {import("../../index").SequenceUnion} context
 * @param {import("discord-microhook").Message[]} messages
 */
export default async function cleanup(context, messages = context.cache) {
	context.log(`steps(cleanup): Removing ${messages.length} messages`);

	while (messages.length > 0) { // Array mutation, prevent duplicate method attempts
		const message = messages.shift();

		// Skip if this is the first message of a thread
		// Only the initial message in a forum post allows Header and List markup
		if (message.id === message.channelID) {
			continue;
		}

		const [target, targetID] = context.webhook.channelID === message.channelID
			? ['channel', context.webhook.channelID]
			: ['thread', message.channelID];

		try {
			context.log(`steps(cleanup): Deleting message '${message.id}' in ${target} (\`${targetID}\`)`);

			await message.delete();
		} catch (error) {
			context.log(`steps(cleanup): Failed to delete message: ${error}`);
		}
	}
}
