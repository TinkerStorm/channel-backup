import { getMessageTarget } from "../../util/common.js";

/**
 * @param {import("../../index").SequenceUnion} context
 * @param {string[]} messages
 */
export default async function cleanup(context, messages = context.cache) {
	context.log(`steps(cleanup): Removing ${messages.length} messages`);

	while (messages.length > 0) { // Array mutation, prevent duplicate method attempts
		const { channelID, threadID, messageID } = getMessageTarget(context, 0);
		messages.shift();

		// Skip if this is the first message of a thread
		// Only the initial message in a forum post allows Header and List markup
		if (threadID === messageID) {
			context.log(`steps(cleanup): Skipping first message of thread ${threadID}`);
			continue;
		}

		const [target, parentID] = threadID
			? ['thread', threadID]
			: ['channel', channelID];

		const reference = context.history ? context.history[`${parentID}-${messageID}`] : null;
		if (!reference) {
			context.log(`steps(cleanup): Reference not found for ${parentID}-${messageID}`);
			continue;
		}

		try {
			context.log(`steps(cleanup): Deleting message '${messageID}' in ${target} (\`${parentID}\`)`);

			await reference.delete();
		} catch (error) {
			context.log(`steps(cleanup): Failed to delete message: ${error}`);
		}
	}
}
