
/**
 * @param {import("../index").SequenceUnion} ctx
 * @param {import("discord-microhook").BaseMessageOptions} payload
 * @returns {import("discord-microhook").BaseMessageOptions}
 */
export default function authorResolver(ctx, payload) {
	const {authors} = ctx.config;

	if (!authors)	{
		return payload;
	}

	if (payload.username && !payload.avatarURL && authors[payload.username]) {
		payload.avatarURL = authors[payload.username];
	}

	if (payload.embeds) {
		// eslint-disable-next-line guard-for-in
		for (const index in payload.embeds) {
			const embed = payload.embeds[index];

			if (embed.author && embed.author.name && !embed.author.iconURL && authors[embed.author.name]) {
				embed.author.iconURL = authors[embed.author.name];
			}

			payload.embeds[index] = embed;
		}
	}

	return payload;
}
