import {delay, getWebhook} from '../../util/common';

export default async function cleanup(context) {
	const webhook = getWebhook(context);

	for (const message of context.cache) {
		await webhook.deleteMessage(message);
		await delay(1000);
	}

	context.log(`steps(cleanup): Deleted ${context.cache.length} messages`);
}
