# channel-backup

![GitHub branch checks state](https://img.shields.io/github/checks-status/TinkerStorm/channel-backup/main)
![GitHub repo size](https://img.shields.io/github/repo-size/TinkerStorm/channel-backup)
![GitHub Repo stars](https://img.shields.io/github/stars/TinkerStorm/channel-backup?style=social)
![npm](https://img.shields.io/npm/v/channel-backup)
![node-current](https://img.shields.io/node/v/channel-backup)

A command line tool to help Community Managers keep their information channels updated.

Notes on progress can be found on the [project board](https://github.com/TinkerStorm/channel-backup/projects/1).

I am aware this program does not follow the regular conventions of an interface, but I have done my best to ensure that it is *accessable* with regular scripts like you would use the terminal. *That said, I discourage it with upmost concern.* In theory, this can be applied to monorepo setups where multiple channels are setup with webhooks to keep their information up to date, all that would need to be done is run the command across all packages.

## Usage

The `cache.json` file that contains message IDs of all messages sent in the previous sequence (local updated). For any data structure files (including `yml` and `json`) are following the structural pattern of [WebhookMessageOptions (discord.js)](https://discord.js.org/#/docs/main/stable/typedef/WebhookMessageOptions). `cache.json` is both fetched and dumped wherever the `{directory}` was set to.

```
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
```

## Config specifications

```json
{
  "$schema": "https://github.com/TinkerStorm/channel-backup/raw/main/schemas/config.json",
  "webhook": "https://discord.com/api/webhooks/:id/:token",
  "files": [
    "./path/to/file.md",
    "./path/to/*.md"
  ],
  "authors": {
    "sudojunior": "https://github.com/sudojunior.png"
  }
}
```

- `$schema` - uses the schema stored at the primary branch to help build the configuration
  > Some properties may not exist here if they are added in plugins.
- `webhook` - either a webhook uri as string or an object `{ id, token }`
  > Alternatively, this can be omitted in favor of using an environment variable.
  > At present, `dotenv` is not used to load the environment variables from a `.env`.
- `files` - An array of files which are sent through the webhook (can either be direct files or globs)
- `authors` (optional, plugin) - A map of authors to avatars.
  > When using 'username' or 'embeds.*.author.name' in full payloads (yml, json), this map will be used if the related avatar or icon slot is not filled.
- `threadID` - The ID of the thread to send the message to.
- `thread_name` - (Forums only) The name of the thread to send the message to. Only used if `threadID` is not provided.
  > This program will overwrite the config file when the new `threadID` is returned from it's first request.

## [Sequence Flow](./src/index.js)

- [Delete old messages](./src/steps/conditional/cleanup.js) *if `--mode replace`*.
- [Discover files](./src/steps/discover.js) as manifest
- Iterate over discovered files
  - [Build message payload](./src/steps/build.js)
    > If payload is found to not exist, continue to next file.
  - (Internal) *if embeds exist*, convert all to [MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed)]
  - plugin(post-render): [Resolve authors](./src/plugins/resolve-authors.js)
  - [Send or Edit message](./src/steps/loop/handle-message.js)
- [Cleanup excess messages](./src/steps/conditional/cleanup.js) *if `--mode update` and 'remainingMessages'*.

## File Support

| Extensions | Description |
| --- | --- |
| `.md` / `.txt` | Markdown `{ content }` |
| `.json` / `.yml` / `.yaml` | Raw payload |
| `.png` / `.jpg` / `.jpeg` / `.gif` / `.webp` | Image `{ attachment, name: "{name}.{ext}" }` |

Raw files are expected to use a file option that may look like `{ path: "./path/to/file.go", raw: true }`, using payload structure of *Image*. While `raw` is not supported yet, it is planned to be added in the future.
  
> While there is no support for template engines like nunjucks, ejs or liquid - with the intention to move to plugins, these could become plugins themselves. The theorised event hooks / listeners will reinforce the design by having them listen for certain files (native file handlers will be included as standard but follow the same internal design as plugins).

---

## Future Advancements

- Custom webhook wrapper
- Plugin support (templates, payload 'injection')
- GitHub Actions ([#1](https://github.com/TinkerStorm/channel-backup/issues/1))
- CLI refactor for standardized keywords (create, run, purge, etc.)
- Multi language support? (python, go, rust)
- Move to TypeScript
- Demos, Templates, Show & Tell, etc.

## License

This package uses the [MIT](LICENSE) license.

---

## Support & Share

- If you use this package, we'd love to hear about how you use it.
- If you need help or have a suggestion, open an issue or contact us on [Discord](https://discord.gg/7k6uS7kw5k).