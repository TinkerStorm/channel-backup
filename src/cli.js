#!/usr/bin/env node
import {writeFile} from 'node:fs/promises';
import path from 'node:path';

import meow from 'meow';

import {loadFile} from './util/common.js';
import {sequence} from './index.js';

const cli = meow(`
	Usage
		$ channel-backup [options]

	Options
		-h, --help       Show this help.
		-v, --version    Show version.
		-c, --config     Specify config file (defaults to '{directory}/config.json').
		-m, --mode       Specify mode (replace, =update)
			* replace: replace all messages in the channel.
			* =update: update all messages in the channel (default).
		-d, --directory  Specify directory to backup (defaults to current working directory).
		-s, --silent     Don't output anything.

	Examples
		$ channel-backup -c config.json -m replace

	Notes
		* --help and --version will terminate the program.
		* '--mode update' will remove excess content after it has finished.
		* '--mode replace' will remove all content it is aware of before it starts.
`, {
	importMeta: import.meta,
	flags: {
		config: {type: 'string', alias: 'c', default: './config.json'},
		mode: {type: 'string', alias: 'm', default: 'update', choices: ['remove', 'update']},
		directory: {type: 'string', alias: 'd', default: process.cwd()}, // eslint-disable-line node/prefer-global/process
		silent: {type: 'boolean', alias: 's'},
		help: {type: 'boolean', alias: 'h'},
		version: {type: 'boolean', alias: 'v'},
	},
});

(async () => {
	let hadThreadID = false;

	// #region Read config
	/** @type {import('./index.js').ConfigOptions} */
	const config = await loadFile(cli.flags.directory, cli.flags.config)
		.then(file => JSON.parse(file.toString()))
		.catch(error => {
			console.error(error);
			console.error(`${cli.flags.config} may have been tampered with.`);
			// eslint-disable-next-line node/prefer-global/process
			process.exit(1);
		});

	if (config.threadID) {
		hadThreadID = true;
	}

	const cache = await loadFile(cli.flags.directory, 'cache.json')
		.then(file => JSON.parse(file.toString()))
		.catch(() => ({})); // Allow file read to fail if it does not exist
	// #endregion

	if (!config.webhook) {
		// eslint-disable-next-line node/prefer-global/process
		config.webhook = process.env.WEBHOOK_URL;
	}

	if (typeof config.webhook === 'string') {
		const url = new URL(config.webhook);
		if (!url.hostname.endsWith('discord.com')) {
			throw new Error('Invalid webhook URL.');
		}

		if (!/^\/api\/(?:v10\/)?webhooks/.test(url.pathname)) {
			throw new Error('Webhook URL does not start with the correct path.');
		}

		const [token, id] = url.pathname.split('/').filter(Boolean).reverse();
		config.threadID ??= url.searchParams.get('thread_id');
		config.webhook = {id, token};
	}

	// Join webhook.id, and threadID if it exists - which will overwrite any threadID in message payloads
	let cacheKey = `${config.webhook.id}${'threadID' in config ? `-${config.threadID}` : ''}`;

	const result = await sequence({
		config,
		cache: cache[cacheKey] || [],
		directory: cli.flags.directory,
		verbose: !cli.flags.silent,
		mode: cli.flags.mode,
	});

	if (!hadThreadID && result.config.threadID) {
		// Obtain unpolluted config file and add threadID
		// - webhooks have no way of determining threadID without it to begin with
		// - also can't determine if the target channel is a forum channel
		const fileConfig = await loadFile(cli.flags.directory, cli.flags.config)
			.then(file => JSON.parse(file.toString()));

		fileConfig.threadID = result.config.threadID;

		await writeFile(
			path.resolve(cli.flags.directory, cli.flags.config),
			JSON.stringify(fileConfig, null, 2),
		);

		cacheKey = `${config.webhook.id}-${result.config.threadID}`;

		console.log(`! Added threadID to ${cli.flags.config}, please commit this change.`);
	}

	// Export new cache
	cache[cacheKey] = result.messages.map(message => message.id);

	await writeFile(path.join(cli.flags.directory, 'cache.json'), JSON.stringify(cache));
	result.log(`steps(cleanup:${cli.flags.mode}): ${result.messages.length} messages.`);
})().catch(error => {
	console.error(error);
	// eslint-disable-next-line node/prefer-global/process
	process.exit(1);
});
