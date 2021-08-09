
/**
 * @param {any} ctx
 * @param {import("discord.js".WebhookMessageOptions} payload
 * @returns {import("discord.js".WebhookMessageOptions}
 */
export default function authorResolver(ctx, payload) {
	const {authors} = ctx.config;

	if (!authors) {
		// ctx.log('plugin(author-resolver): No authors found.');
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
