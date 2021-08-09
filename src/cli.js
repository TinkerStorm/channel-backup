#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
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
    $ channel-backup -c config.json -m append

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
	// #region Read config
	const config = await loadFile(cli.flags.directory, cli.flags.config)
		.then(file => JSON.parse(file.toString()))
		.catch(error => {
			console.error(error);
			console.error(`${cli.flags.config} may have been tampered with.`);
			// eslint-disable-next-line node/prefer-global/process
			process.exit(1);
		});

	const cache = await readFile(cli.flags.directory, 'cache.json')
		.then(file => JSON.parse(file.toJSON()))
		.catch(() => ({}));
	// #endregion

	if (typeof config.webhook === 'string') {
		const [, id, token] = config.webhook
			.match(/https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([A-Za-z\d.-]+)/);
		config.webhook = {id, token};
	}

	// #region Parse config
	const result = await sequence({
		config,
		cache: cache[config.webhook.id] || [],
		directory: cli.flags.directory,
		verbose: !cli.flags.silent,
		mode: cli.flags.mode,
	});

	// Export new cache
	cache[config.webhook.id] = result.messages;

	await writeFile(path.join(cli.flags.directory, 'cache.json'), JSON.stringify(result.messages));
	result.log(`step(cleanup:${cli.flags.mode}) ${result.messages.length} messages.`);
})();
