import {join, relative} from 'node:path';
import {isGitIgnored, isDynamicPattern, globby} from 'globby';

/**
 * @param {import('../index').SequenceUnion} ctx
 */
export default async function discover(ctx) {
	const manifest = [];
	const isIgnored = await isGitIgnored({cwd: ctx.directory});

	for (const file of ctx.config.files) {
		const found = isDynamicPattern(file, {cwd: ctx.directory})
			? await globby(file, {cwd: ctx.directory})
			: [file];

		manifest.push(...found.map(path => relative(ctx.directory, path)));

		ctx.log(`steps(discover): Found ${found.length} files in ${file}`);
	}

	return manifest.filter(file => !isIgnored(file))
		.map(file => join(ctx.directory, file));
}
