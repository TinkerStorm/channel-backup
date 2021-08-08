import {MessageEmbed} from 'discord.js';
import {delay} from './util/common';
// #region Steps
import cleanup from './steps/conditional/cleanup';
import discover from './steps/discover';
import buildPayload from './steps/loop/build-payload';
import authorResolver from './plugins/author-resolver';
import handleMessage from './steps/loop/handle-message';
// #endregion

/**
 * @param {SequenceOptions} options
 * @returns {Promise<any>}
 */
export async function sequence(options) {
	const context = {
		...options,
		messages: [],
		log: (...args) => {
			if (options.config.verbose) {
				console.log(...args);
			}
		},
	};
	if (context.config.mode !== 'replace') {
		await cleanup(context);
	}

	const manifest = await discover(context);
	let skippedFiles = 0;

	// eslint-disable-next-line guard-for-in
	for (const index in manifest) {
		const file = manifest[index];
		const filePath = `${context.config.directory}/${file}`;

		/** @type {import("discord.js").WebhookMessageOptions} */
		let payload = await buildPayload(context, filePath);
		if (!payload) {
			skippedFiles++;
			continue; // Unknown file type catch
		}

		if (payload.embeds) {
			payload.embeds = payload.embeds.map(embed => new MessageEmbed(embed));
		}

		// Event hook: render (plugin)
		payload = authorResolver(context, payload);

		await handleMessage(context, payload, filePath, index - skippedFiles);
		await delay(1000);
	}

	const remainingMessages = context.cache.slice(manifest.length - skippedFiles);
	await cleanup(remainingMessages);
	return context;
}

export default sequence;
