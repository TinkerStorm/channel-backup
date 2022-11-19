import { getMessageTarget } from '../util/common.js';

/**
 * @typedef {Record<`${number}`, import("discord-microhook").Message>} MessageCache
 * @description Cache of messages
 */

/**
 * @param {import("../index").SequenceUnion} context
 * @returns {Promise<MessageCache>}
 */
export default async function fetchAll(context) {
  if (context.cache.length === 0) {
    return;
  }

  /** @type {MessageCache} */
  const history = {};

  context.log(`steps(fetch-all): Fetching all messages from ${context.webhook.channelID}`, { force: true });

  for (const index in context.cache) {
    const { threadID, messageID } = getMessageTarget(context, index);

    try {
      const fetched = await context.webhook.fetchMessage(messageID, threadID);

      history[`${threadID ?? context.webhook.channelID}-${messageID}`] = fetched;

      context.log(`steps(fetch-all): Fetched message ${index} (\`${fetched.id}\`)`);
    } catch (error) {
      context.log(`steps(fetch-all): Failed to fetch message: ${error}`);
    }
  }

  console.log(`steps(fetch-all): Found ${Object.keys(history).length} messages`);

  return history;
}
