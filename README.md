# channel-backup

A command line tool to help Community Managers keep their information channels updated.

Notes on progress can be found on the [project board](https://github.com/TinkerStorm/channel-backup/projects/1) or on the [Discord channel](https://discord.gg/7k6uS7kw5k).

I am aware this program does not follow the regular conventions of an interface, but I have done my best to ensure that it is *accessable* with regular scripts like you would use the terminal. *That said, I discourage it with upmost concern.* In theory, this can be applied to monorepo setups where multiple channels are setup with webhooks to keep their information up to date, all that would need to be done is run the command across all packages.

## Usage

The `cache.json` file that contains message IDs of all messages sent in the previous sequence (local updated). For any data structure files (including `yml` and `json`) are following the structural pattern of [WebhookMessageOptions (discord.js)][https://discord.js.org/#/docs/main/stable/typedef/WebhookMessageOptions].

```
Usage
  $ channel-backup [options]
  $ npx channel-backup [options]

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
  "$schema": "https://github.com/TinkerStorm/channel-backup/blob/main/schema.json",
  "webhook": "https://discord.com/api/webhooks/:id/:token", // either a webhook uri or an object
  "files": [
    "./path/to/file.md",
    "./path/to/*.md"
  ]
}
```

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
  - !PNG
  - !GIF
  - !JPG / !JPEG
- Structured files are sent as is
  - !JSON
  - !YAML / !YML
  - !TXT / !MD *both treated as markdown*
- Templates
  > While there is no support for template engines like nunjucks, ejs or liquid - with the intention to move to plugins, these could become plugins themselves. The theorised event hooks / listeners will reinforce the design by having them listen for certain files (native file handlers will be included as standard but follow the same internal design as plugins - marked with `!`).

---

## Future Advancements

- Custom webhook wrapper.
- Plugin support (templates, payload 'injection')
- GitHub Actions
- CLI refactor for standardized keywords (create, run, purge, etc.)
- Multi language support (python, go, rust)
- Move to TypeScript
- 