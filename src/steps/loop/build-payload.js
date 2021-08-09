import {parse} from 'node:path';
import yaml from 'yaml';
import {loadFile} from '../../util/common.js';

/**
 * @param {any} ctx
 * @param {string} filePath
 * @returns {import("discord.js").WebhookMessageOptions}
 */
export default async function buildPayload(ctx, filePath) {
	const {name, ext} = parse(filePath);
	let content = await loadFile(filePath);

	if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
		return {
			files: [{
				name,
				attachment: content,
			}],
		};
	}

	content = content.toString('utf8');

	switch (ext) {
		case '.txt':
		case '.md':
			return {content};

		case '.json':
			return JSON.parse(content);

		case '.yml':
		case '.yaml':
			return yaml.parse(content);

		default:
			ctx.log(`steps(build-payload): Unsupported file type: ${ext} (${filePath})`);
			return null;
	}
}
