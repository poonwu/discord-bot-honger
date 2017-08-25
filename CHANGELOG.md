# Changelog

## [1.2.1] -2017-8-25
## Added
- `parseData()` to polling object
- `htl` polling

## Changed
- Readjust min `!timeout` to 20 seconds

## Removed
- `render()`, now automatically title + url
- `check()`, now use universal checker

## [1.2.0] -2017-8-22
### Added
- `CHANGELOG.md`
- `!stats` to check current bot's status
- `!poll <on/off>` to turn on/off polling state
- `!check` alias naming
- `watch` option for NPM

### Changed
- Fix `!timeout <NEW_TIMER>` to use second instead of millisecond
- Fix `!check` to show all pollings by default
- Improve `!check` display message
- Improve `lnmtl` data efficiency
- Improve polling class structure

### Removed
- `!timeout` check command, please use `!stats` instead