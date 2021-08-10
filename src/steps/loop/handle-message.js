// !import {Util} from 'discord.js';
import {delay, getWebhook} from '../../util/common.js';
/**
 * @param {any} ctx
 * @param {WebhookMessageOptions} payload
 * @param {string} path
 * @param {string} index
 */
export default async function handleMessage(ctx, payload, path, index) {
	// MergedPayload = Util.mergeDefault(ctx.config.defaultPayload || {}, payload);
	const cacheID = ctx.cache[index];
	const webhook = getWebhook(ctx);

	const message = await (ctx.mode === 'update' && cacheID
		? webhook.editMessage(cacheID, payload)
		: webhook.send(payload));

	ctx.messages.push(message.id);
	ctx.log(`steps(handle-message) '${path}' -> '${message.id}'`);

	await delay(1000);
}
