# channel-backup

![GitHub branch checks state](https://img.shields.io/github/checks-status/TinkerStorm/channel-backup/main)
![GitHub repo size](https://img.shields.io/github/repo-size/TinkerStorm/channel-backup)
![GitHub Repo stars](https://img.shields.io/github/stars/TinkerStorm/channel-backup?style=social)
![npm](https://img.shields.io/npm/v/channel-backup)
![node-current](https://img.shields.io/node/v/channel-backup)

A command line tool to help Community Managers keep their information channels updated.

Notes on progress can be found on the [project board](https://github.com/TinkerStorm/channel-backup/projects/1) or on the [Discord channel](https://discord.gg/7k6uS7kw5k).

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
  > At present, `dotenv` is not used to load the environment variables on .
- `files` - An array of files which are sent through the webhook (can either be direct files or globs)
- `authors` (optional, plugin) - A map of authors to avatars.
  > When using 'username' or 'embeds.*.author.name' in full payloads (yml, json), this map will be used if the related avatar or icon slot is not filled.

## Sequence Flow

```ini
# * Loop through items
# ~ Catch case
# & Relative index

[INIT] Begin
[REPLACE] Deleted {id}
[RESOLVE] {fileOrGlob}
* [(SENT,EDIT)/{&index}] (Edit,Sent) content for {path}
  ~ [SCAN] Unknown file type {ext} on {path}
[POST-RUN] Removing excess messages and cached IDs.
* [ClEANUP/{&index+i}] Removed {message}
[POST-RUN] Attempting to export message cache
[COMPLETE] Sequence complete
```

## File Support

- Images are attached as `{ attachment, name: "{name}.{ext}" }`
  - PNG
  - GIF
  - JPG / JPEG
- Structured files are sent as is
  - JSON
  - YAML / YML
  - TXT / MD *both treated as markdown*
- Templates
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