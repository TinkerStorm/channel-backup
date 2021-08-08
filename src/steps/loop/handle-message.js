import {Util} from 'discord.js';
import {getWebhook} from '../../util/common';
/**
 * @param {any} ctx
 * @param {WebhookMessageOptions} payload
 * @param {string} path
 * @param {string} index
 */
export default async function handleMessage(ctx, payload, path, index) {
	const mergedPayload = Util.mergeDefault(ctx.config.defaultPayload, payload);
	const cacheID = ctx.cache[index];
	const webhook = getWebhook(ctx);

	if (ctx.config.mode === 'update' && cacheID) {
		// Deep equal check is currently not supported
		const message = await webhook.editMessage(cacheID, mergedPayload);
		ctx.messages.push(cacheID); // Since we already have it, there's no need to fetch it again
		ctx.log(`steps(handle-message) Payload for '${path}' has been updated at '${message.id}'`);
	} else {
		const message = await webhook.send(mergedPayload);
		ctx.messages.push(message.id);
		ctx.log(`steps(handle-message) Payload for '${path}' has been sent as '${message.id}'`);
	}
}
