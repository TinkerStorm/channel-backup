import {join} from 'node:path';
import {isGitIgnored, isDynamicPattern, globby} from 'globby';

export default async function discover(ctx) {
	const manifest = [];
	const isIgnored = await isGitIgnored({cwd: ctx.directory});

	for (const file of ctx.config.files) {
		const {path, reverse = false} = typeof file === 'string'
			? {path: file} : file;

		const found = isDynamicPattern(path, {cwd: ctx.directory})
			? await globby(path, {cwd: ctx.directory})
			: [path];

		if (reverse) found.reverse();

		manifest.push(...found);

		ctx.log(`Found ${found.length} files in ${path}`);
	}

	return manifest.filter(file => !isIgnored(file))
		.map(file => join(ctx.directory, file));
}
