import {isGitIgnored, isDynamicPattern, globby} from 'globby';

export default async function discover(ctx) {
	const manifest = [];
	const isIgnored = await isGitIgnored({cwd: ctx.directory});

	for (const file of ctx.config.files) {
		const found = isDynamicPattern(file, {cwd: ctx.directory})
			? await globby(file, {cwd: ctx.directory})
			: [file];

		manifest.push(...found);

		ctx.log(`Found ${found.length} files in ${file}`);
	}

	return manifest.filter(file => !isIgnored(file));
}
