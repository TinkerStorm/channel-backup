import path from 'node:path';
import fs from 'node:fs/promises';

// {threadID}-{messageID} / {messageID}
export const THREAD_SPLIT = '-';

/**
 * @param {...string} pathSegments can either be absolute or relative path
 */
export function loadFile(...pathSegments) {
	return fs.readFile(path.resolve(...pathSegments));
}

// Delay for {ms} milliseconds
export function delay(ms) {
	// eslint-disable-next-line no-promise-executor-return
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {import('../index').SequenceUnion} ctx
 * @param {number} cacheIndex
 */
export function getMessageTarget(ctx, cacheIndex) {
	const {channelID} = ctx.webhook;

	const messageID = ctx.cache[cacheIndex];
	const {threadID} = ctx.config;

	return {threadID, messageID, channelID};
}

/**
 *
 * @param {import('../index').SequenceUnion} ctx
 * @param {import('discord-microhook').Message} message
 */
export function buildMessageTarget(ctx, message) {
	return ctx.config.threadID // Determine if threadID is shared for this sequence
		// if not, use the threadID from the message channel
		? `${message.channelID}${THREAD_SPLIT}${message.id}`
		: message.id;
}

/**
 * Check
 * @param {any} source
 * @param {any} external
 * @returns {boolean}
 */
export function isPayloadEqual(source, external) {
	for (const key of Object.keys(source)) {
		if (['files', 'threadID', 'thread_name'].includes(key)) {
			continue;
		}

		if (Array.isArray(source[key])) {
			if (source[key].length !== external[key].length) {
				return false;
			}

			for (const [index, value] of source[key].entries()) {
				if (!isPayloadEqual(value, external[key][index])) {
					return false;
				}
			}
		} else if (typeof source[key] === 'object') {
			if (!isPayloadEqual(source[key], external[key])) {
				return false;
			}
		} else if (source.length > 0 && source[key] !== external[key]) {
			return false;
		}
	}

	return true;
}
