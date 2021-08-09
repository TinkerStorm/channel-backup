import path from 'node:path';
import fs from 'node:fs/promises';
import {WebhookClient} from 'discord.js';

/**
 * @param {...string[]} pathSegements can either be absolute or relative path
 */
export function loadFile(...pathSegements) {
	return fs.readFile(path.resolve(...pathSegements));
}

// Delay for {ms} milliseconds
export function delay(ms) {
	// eslint-disable-next-line no-promise-executor-return
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function getWebhook(context) {
	return new WebhookClient(context.config.webhook);
}
