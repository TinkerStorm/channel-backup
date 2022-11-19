import { Webhook } from 'discord-microhook';
// #region Steps
import cleanup from './steps/conditional/cleanup.js';
import discover from './steps/discover.js';
import buildPayload from './steps/loop/build-payload.js';
import authorResolver from './plugins/author-resolver.js';
import handleMessage from './steps/loop/handle-message.js';
import fetchAll from './steps/fetch-all.js';
// #endregion

/**
 * @typedef {Object} SequenceOptions
 * @property {ConfigOptions} config
 * @property {string} [mode='update']
 * @property {string} [directory=process.cwd()]
 * @property {boolean} [verbose=true]
 * @property {string[]} [cache={}]
 */

/**
 * @typedef {Object} ConfigOptions
 * @property {{id:string,token:string}|string} [webhook]
 * @property {string[]} files
 * @property {string} [directory]
 * @property {string} mode
 * @property {boolean} [verbose]
 * @property {string?} [threadID]
 * @property {string?} [thread_name]
 */

/**
 * @typedef {Object} SequenceContext
 * @property {import("discord-microhook").Message[]} messages
 * @property {Record<string, import("discord-microhook").Message>} history
 * @property {import("discord-microhook").Webhook} webhook - Webhook instance (discord-microhook)
 * @property {(msg:string,{force}:{force:boolean})=>void} log - Log function
 */

/** @typedef {SequenceOptions & SequenceContext} SequenceUnion */

/**
 * @param {SequenceOptions} options
 * @returns {Promise<SequenceUnion>}
 */
export async function sequence(options) {

	/** @type {SequenceUnion} */
	const context = {
		...options,
		messages: [],
		log: (message, { force = false } = {}) => {
			if (options.verbose || force) {
				console.log(message);
			}
		},
		webhook: new Webhook(options.config.webhook)
	};

	try {
		await context.webhook.fetch();
	} catch (error) {
		context.log(`fail:sequence() Failed to fetch webhook: ${error}`, { force: true });
		return;
	}

	if (context.cache.length) {
		context.history = await fetchAll(context);
	} else {
		context.log(`warn:sequence() No messages to process`, { force: true });
	}

	if (context.mode === 'replace') {
		await cleanup(context);
	}

	const manifest = await discover(context);
	let skippedFiles = 0;

	// eslint-disable-next-line guard-for-in
	for (const [index, filePath] of manifest.entries()) {
		let payload = await buildPayload(context, filePath);
		if (!payload) {
			skippedFiles++;
			context.log(`steps(build-payload): Skipping '${filePath}', content missing`);
			continue; // Unknown file type catch
		}

		// Event hook: render (plugin)
		payload = authorResolver(context, payload);

		await handleMessage(context, payload, filePath, index - skippedFiles);
	}

	const remainingMessages = context.cache.slice(context.messages.length);
	if (remainingMessages.length > 0) {
		await cleanup(context, remainingMessages);
	}

	return context;
}

export default sequence;
