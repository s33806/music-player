# XF Music Player

[简体中文](./README.md) · **English**

An HTML5 music player built with Web Components. Add it to a plain HTML page with one `<script>`, or import its ESM entry in a Vue, React, or other frontend project. Shadow DOM isolates the player's styles.

Current version: `1.0.7`.

[Website](https://musicplayer.xfyun.club) · [Documentation](https://musicplayer.xfyun.club/en/docs/) · [Live debugger](https://musicplayer.xfyun.club/en/debug/) · [GitHub](https://github.com/s33806/music-player) · [Gitee](https://gitee.com/xfwlclub/xf-MusicPlayer/)

## Highlights

| Feature | What it enables |
| --- | --- |
| Framework-independent integration | Native HTML elements, JavaScript instances, and npm / ESM, without coupling your page to a particular UI framework. |
| Flexible data sources | Use a cloud `apiUrl`, a local `playlist`, or an `audioProvider` backed by your existing music API. |
| Real audio visualization | Optional Canvas waveform seeking and lyric-area frequency bars driven by actual audio analysis. |
| Lyrics and themes | Synchronized lyrics, fullscreen lyrics, click-to-seek, cover-derived colors, colorful lyrics, and built-in/custom themes. |
| Local audio metadata | A unified reader for audio properties, tags, artwork, and lyrics in FLAC, WAV, AIFF / AIFF-C, MP3, M4A, Ogg, and other formats. |
| Playback state and lifecycle | Remember the current track and position; use ordered/repeat-one/shuffle playback, Chinese/English UI, public controls, and asynchronous teardown. |

## Quick start

The HTML and npm examples are separate integration options. Choose one; keep only one active player on a page.

### Option 1: HTML / CDN

Add this code to your page. Use an explicit closing tag for the custom element.

```html
<xf-music-player
  language="en"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  is-auto-popup="true"
  remember-playback="true"
></xf-music-player>
<script defer src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>
```

You can replace the script URL with the npm CDN:

```html
<script defer src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

Load only one of these script URLs. Autoplay is not enabled in this example; playback starts when the user clicks play.

### Option 2: npm / ESM

```bash
npm install xf-music-player
```

Run this on the browser client. Replace `/audio/example.mp3` with an audio resource provided by your project.

```ts
import { MusicPlayer } from 'xf-music-player'

let player = new MusicPlayer({
  language: 'en',
  attributes: {
    mode: 'local',
    isAutoPopup: true,
    rememberPlayback: true,
    playlist: [{
      "id": "demo-1",
      "title": "Example track",
      "src": "/audio/example.mp3",
      "artist": "Example artist",
      "album": "Example album",
      "cover": "/img/half.jpg",
      "duration": 28,
      "lyrics": "[00:00.00]First lyric line\n[00:05.00]Second lyric line"
    }]
  }
})
```

`language` is a constructor option; settings such as `theme`, `playlist`, and `apiUrl` belong inside `attributes`. For SSR frameworks such as Nuxt or Next.js, use `await import('xf-music-player')` in the client lifecycle and destroy the instance during teardown.

## Feature examples

### Audio visualization and themes

The configuration and custom-provider examples below reuse the `player` from the npm example.

```ts
player.setConfig({
  audioVisualizer: true,
  colorfulLyric: true,
  theme: 'xf-sky-theme'
})
```

- `audioVisualizer` is off by default. When enabled, the waveform acts as a seek bar and the lyric area also displays audio-frequency bars.
- With colorful lyrics alone, the background uses a translucent RGBA color sampled from the cover. When visualization is also enabled, the lyric background follows the theme.
- Cross-origin audio needs CORS headers permitting the host page when visualization is enabled. If the audio server does not allow CORS, turn visualization off to use the ordinary playback path.
- If cross-origin artwork does not permit pixel access, cover-color sampling falls back to the default theme background.

### Connect your own music API

`audioProvider` takes precedence over the built-in cloud endpoint. Replace `/api/music/playlist` with your own URL and pass through `signal` so obsolete requests can be cancelled on teardown or a data-source change.

```ts
player.setConfig({
  audioProvider: async ({ signal }) => {
    const response = await fetch('/api/music/playlist', { signal })
    if (!response.ok) throw new Error(`Playlist request failed: ${response.status}`)
    return response.json()
  }
})
```

Your endpoint can return a song array or the response envelope below. Each `src` points to a playable audio resource.

```json
{
  "code": 200,
  "msg": "success",
  "data": [{
    "id": "demo-1",
    "title": "Example track",
    "src": "/audio/example.mp3",
    "artist": "Example artist",
    "album": "Example album",
    "cover": "/img/half.jpg",
    "duration": 28,
    "lyrics": "[00:00.00]First lyric line\n[00:05.00]Second lyric line"
  }]
}
```

If your endpoint already uses this envelope, use `attributes: { mode: 'cloud', apiUrl: '/api/music/playlist' }` directly instead of writing a provider function.

### Read local audio, artwork, and lyrics

This is a separate creation example for a `File` supplied by a file picker. Destroy any existing player before calling it.

```ts
import { MusicPlayer, readAudioFile } from 'xf-music-player'

export async function createFilePlayer(file: File) {
  const loaded = await readAudioFile(file)
  console.log(loaded.metadata.format, loaded.metadata.common)

  try {
    return new MusicPlayer({
      language: 'en',
      attributes: {
        mode: 'local',
        rememberPlayback: false,
        playlist: [loaded.song]
      },
      hooks: { afterDestroy: () => loaded.dispose() }
    })
  } catch (error) {
    loaded.dispose()
    throw error
  }
}
```

In your file-selection handler, call `const filePlayer = await createFilePlayer(file)`. When finished, call `await filePlayer.destroy()`. The example releases audio and artwork object URLs after teardown and disables playback persistence for temporary Blob resources.

For metadata only, call `readAudioMetadata(file)` without creating object URLs. Parsing support is separate from playback decoding: AIFF playback in particular depends on the browser's codecs. No transcoder is bundled. Ordinary cloud playback does not download whole tracks just to scan their tags.

### Playback controls and page teardown

| API | Purpose |
| --- | --- |
| `player.play()` / `player.pause()` | Play / pause, preferably triggered by a user gesture. |
| `player.prev()` / `player.next()` | Previous / next track. |
| `player.seek(30)` | Seek to 30 seconds. |
| `player.setVolume(0.8)` | Set volume in the range `0–1`; iOS uses system volume. |
| `player.setPlayMode('random')` | Shuffle; `order` and `single` are also available. |
| `player.setPlaylist(songs, 0)` | Replace the playlist and select its first track. |
| `player.setConfig({ theme: 'xf-dark-theme' })` | Update selected settings. |
| `await player.destroy()` | Destroy this instance and clean up audio, subscriptions, and interaction tasks. |

If navigation requires a replacement, await teardown first and save the new controller. This example reuses `player` from the npm example; replace the endpoint with your own.

```ts
async function recreatePlayer() {
  await player.destroy()
  player = new MusicPlayer({
    language: 'en',
    attributes: { mode: 'cloud', apiUrl: '/api/music/playlist' }
  })
}
```

Replace the destroyed controller with a new instance. `mount()` attaches an existing element; it does not recreate a destroyed player. SPA integrations should also invalidate initialization tasks belonging to departed routes so rapid navigation does not create duplicate players.

## Current release · 1.0.7

- **Lifecycle fixes:** clean up old subscriptions, audio, and interaction tasks; prevent stale controllers and callbacks from affecting replacement instances; stop reporting normal request cancellation as an error.
- **Audio routing fix:** prevent silent playback caused by reusing a media element that remains bound to Web Audio after visualization is disabled.
- **Rendering compatibility:** build IIFE/ESM for ES2020, transforming dependency class fields and logical assignment. Failed, timed-out, or empty initial cloud playlists leave a visible player and an error notice, without repeating the failed request on first mount.
- **Interaction and resource improvements:** reduce repeated playlist calculations, pause offscreen loading animations, coalesce drag updates, fix idle scrolling loops and extra waveform frame drops, and use Howler core to omit unused features.
- **iOS volume notice:** tapping the volume control explains device volume buttons or Control Center in Chinese/English, with repeated notices rate-limited. Other playback controls keep their existing behavior.

## Usage notes

- The runtime needs modern browser features including Web Components, Shadow DOM, HTML5 Audio, Promise, Symbol, and BigInt. ES2020 syntax transformation does not polyfill every older browser's runtime APIs.
- Browser autoplay policies may require a user gesture. Volume on iOS / iPadOS is controlled by the system.
- Playback memory stores the current track and its position, not an independent playback history for every track in the playlist.
- The built-in initial cloud request displays a loading notice after 2 seconds. After 10 seconds or a request failure, it shows an error and an empty player. Change `apiUrl` or call `setPlaylist()` to recover.
- Supply the example API endpoints and audio paths from your own application. See the [documentation](https://musicplayer.xfyun.club/en/docs/) and [live debugger](https://musicplayer.xfyun.club/en/debug/) for more settings and previews.

## Distribution and optional plugins

| File | Purpose |
| --- | --- |
| `README.md` / `README.en.md` | Default Chinese documentation / English documentation. |
| `music-player.min.js` | IIFE bundle for direct `<script>` loading. |
| `music-player.esm.js` / `index.d.ts` | ESM entry / TypeScript declarations. |
| `old-music-player.min.js` | Compatibility entry for legacy initialization patterns. |
| `plugin/ie-out/index.js` | Legacy-browser detection and upgrade redirect; load before the main player script. |
| `plugin/sakura/sakura.min.js` | An independently loadable falling-sakura effect. |

[返回简体中文文档 →](./README.md)
