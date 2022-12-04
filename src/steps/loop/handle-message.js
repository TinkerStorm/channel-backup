import {getMessageTarget, isPayloadEqual} from '../../util/common.js';

/**
 * @param {import('../../index.js').SequenceUnion} ctx
 * @param {import('discord-microhook').BaseMessageOptions} payload
 * @param {string} path
 * @param {number} index
 */
export default async function handleMessage(ctx, payload, path, index) {
	// MergedPayload = Util.mergeDefault(ctx.config.defaultPayload || {}, payload);
	const {messageID, threadID} = getMessageTarget(ctx, index);

	// Ensure destruction of prior message data related to threads, sequence should not split between messages
	if (payload.threadID) {
		delete payload.threadID;
	}

	if (payload.thread_name) {
		delete payload.thread_name;
	}

	if (threadID) {
		payload.threadID = threadID;
	}

	const targetID = threadID ?? ctx.webhook.channelID;
	const reference = ctx.history ? ctx.history[`${targetID}-${messageID}`] : null;

	// If thread_name exists, create a new thread - assumed as forum channel
	// threadID is used from the response to set the new threadID
	if (!payload.threadID && index === 0 && ctx.config.thread_name) {
		// eslint-disable-next-line camelcase
		payload.thread_name = ctx.config.thread_name;
	}

	if (messageID && isPayloadEqual(payload, reference)) {
		ctx.log(`steps(handle-message) Main payload unchanged, skipping message ${messageID} - ${index}`);
		ctx.messages.push(reference);
		return;
	}

	const message = await (ctx.mode === 'update' && messageID
		? ctx.webhook.editMessage(messageID, payload)
		: ctx.webhook.sendMessage(payload));

	// Only allow updating context target for the first message
	if (index === 0 && payload.thread_name && !threadID) {
		ctx.config.threadID = message.channelID;
		ctx.log(`steps(handle-message): Created thread "${payload.thread_name}" (${threadID})`);
	}

	ctx.messages.push(message);
	ctx.log(`steps(handle-message) '${path}' -> '${message.id}'`);
}
