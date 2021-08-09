import {delay, getWebhook} from '../../util/common.js';

export default async function cleanup(context, messages = context.cache) {
	const webhook = getWebhook(context);

	context.log(`steps(cleanup) Removing ${messages.length} messages`);

	while (messages.length > 0) { // array mutation, prevent duplicate method attempts
		const message = messages.shift();

		await delay(1000);
		try {
			await webhook.deleteMessage(message);
		} catch (err) {
			context.log(`fail:steps(cleanup) Failed to delete message: ${err}`,{force:true});
		}
	}
}
