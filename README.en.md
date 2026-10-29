# XF Music Player

[简体中文](./README.md) · **English**

[Selective ESM imports: npm, Vue, browser and deployment (Chinese guide)](./ESM-GUIDE.md)

An HTML5 music player built with Web Components. Add it to a plain HTML page with one `<script>`, or import its ESM entry in a Vue, React, or other frontend project. Shadow DOM isolates the player's styles.

Current version: `1.0.8`.

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
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'
// import 'xf-music-player/modules/visualizer'

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

`language` is a constructor option; settings such as `theme`, `playlist`, and `apiUrl` belong inside `attributes`. Remove feature imports you do not need; importing modules alone creates no player. Vue SPA and SSR lifecycle guidance is provided separately below.

The npm / ESM root now contains the playback core only; explicit module imports enable lyrics, preset themes, and visualization. Root metadata named exports still load the parser on the first `readAudioMetadata` or `readAudioFile` call. Existing integrations must add imports and explicit construction as described in the migration section. The HTML / CDN `music-player.min.js` retains its original complete single-file bundle, API, and auto-mounting behavior.

If a root metadata API fails to import the parser or a format chunk, that call still rejects and retains the original error chain. After restoring the resources, explicitly call the same API again: it loads a separate, self-contained recovery module without reloading the page. Concurrent calls share loading and reuse success; ordinary input or parsing errors do not activate recovery, and there is no automatic retry loop. Deploy the complete `modules/chunks/` directory, including recovery; normal parsing and playback do not download it. If recovery itself fails, the application clears its rejected promise, but a browser-cached failed URL may still require a manual page reload. The static `modules/metadata` entry and IIFE retain their existing behavior; this recovery applies only to the root lazy APIs.

## Feature examples

### Audio visualization and themes

The configuration and custom-provider examples below reuse the `player` from the npm example. To use visualization, first enable `import 'xf-music-player/modules/visualizer'` before creating the instance above, then set `audioVisualizer: true`.

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
import MusicPlayer, { readAudioFile } from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'

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

The first parsing call through the root lazy API waits for its chunks to download; later calls reuse the loaded modules. Handle initial network or deployment errors, and, for direct static hosting, deploy the complete `modules/` directory (including `modules/chunks/`) alongside the ESM entry.

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

## Current release · 1.0.8

- **Modular ESM:** the default entry loads only the playback core. Select lyrics, preset themes, and visualization with static imports of `modules/lyrics`, `modules/themes`, and `modules/visualizer`.
- **Lazy metadata parsing:** the root `readAudioMetadata` / `readAudioFile` APIs load the parser on the first file-parsing call and reuse it afterward. Ordinary URL playlists do not load it. The independent static `modules/metadata` entry loads with its import instead.
- **Less initial loading:** unselected optional features stay out of the base dependency graph. Savings depend on the selected features and application build; no fixed percentage is implied.

Existing npm / ESM users must import the required features and explicitly create an instance. Visualization requires both its module and `audioVisualizer: true`. The ordinary `music-player.min.js` integration remains a complete single file. See the [production guide](./ESM-GUIDE.md) for examples and deployment of the complete `modules/chunks/` directory.

### Improvements carried forward from 1.0.7

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
| `music-player.min.js` | Complete single-file IIFE bundle for direct `<script>` loading. |
| `music-player.esm.js` / `index.d.ts` | Core ESM entry / TypeScript declarations (including the default export). |
| `modules/` | Optional feature entries and their type declarations. |
| `modules/chunks/` | Required ESM chunks inside `modules/`, including on-demand metadata parsing; deploy the whole directory. |
| `old-music-player.min.js` | Compatibility entry for legacy initialization patterns. |
| `plugin/ie-out/index.js` | Legacy-browser detection and upgrade redirect; load before the main player script. |
| `plugin/sakura/sakura.min.js` | An independently loadable falling-sakura effect. |

### Manually select ESM modules

The npm root and `music-player.esm.js` default-export the playback core, including essential controls, playlists, playback memory, and neutral base styles. Importing the entry alone does not scan existing tags, create an instance, mount, or play. Explicitly call `new MusicPlayer()`; mounting after construction still follows the existing instance API.

```js
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'
// import 'xf-music-player/modules/visualizer'

const player = new MusicPlayer({
  attributes: {
    mode: 'cloud',
    apiUrl: '/api/music/playlist', // Replace with your playlist endpoint
    theme: 'xf-original-theme',
    isAutoPopup: true,
    autoplay: false,
    audioVisualizer: false
  }
})
```

- Remove an optional import to exclude that feature. Import selected modules **before** `new MusicPlayer()`; visualization also needs `audioVisualizer: true`. Runtime attachment, removal, and per-instance feature isolation are not supported in this phase.
- The default export, the existing root `MusicPlayer` named export, and the named export from `xf-music-player/modules/player` reference the same constructor. Modules share one Store, SoundManager, and feature-registration state; keep one active host per page.
- Without `lyrics`, the lyric parser, layout, and main CSS are excluded; lyric URL requests, cover-color extraction for lyrics, and lyric display remain off. Without `visualizer`, the Canvas implementation is excluded and analyser/visualization CORS routing stays off even if `audioVisualizer` is true; ordinary playback and seeking remain available.
- Without `themes`, neutral base colors remain usable. With it, use the existing `theme` option; custom CSS still overrides presets. Small lifecycle and audio-analysis bridges remain in the shared core rather than duplicating the player.
- **Static selection is different from delayed downloading:** these imports join the application's initial dependency graph, rather than waiting for a click. Removing an import excludes that feature. Root `readAudioFile` / `readAudioMetadata` named exports still forward lazily, loading the parser on the first call.

For an independent metadata API, use its static subpath. This includes the parser entry in the initial dependency graph; per-format internal loading remains unchanged:

```js
import { readAudioFile, readAudioMetadata } from 'xf-music-player/modules/metadata'

const loaded = await readAudioFile(file) // file comes from a file picker
player.setPlaylist([loaded.song])
// Tags only: await readAudioMetadata(file)
// After releasing the audio: await player.destroy(); loaded.dispose();
```

### Migrating existing npm / ESM integrations

This deliberately changes root-entry behavior: the previous root registered all UI features and auto-mounted the default tag. Now explicitly import the lyrics, themes, and visualization modules you need, and call `new MusicPlayer()`. Existing named exports, instance APIs, and `/modules/*` paths remain available. ESM consumers relying only on a page's `<xf-music-player>` tag must also create an instance, or keep using the original ordinary-script integration.

The single-file `music-player.min.js` IIFE retains its integration, global API, complete features, and default-tag auto-mounting. No `/core` or `/auto` entry has been added.

### Vue 3 SPA

Prefer one persistent `App.vue` integration so the shared player is not recreated on every route. Use static imports at the top of `<script setup>` and create the instance on client mount:

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'

let player: MusicPlayer | undefined

onMounted(() => {
  player = new MusicPlayer({
    language: 'en',
    attributes: {
      mode: 'cloud',
      apiUrl: '/api/music/playlist',
      theme: 'xf-original-theme',
      isAutoPopup: true,
      autoplay: false
    }
  })
})

onBeforeUnmount(() => {
  player?.destroy().catch(error => console.error('Player teardown failed', error))
})
</script>
```

Vue does not wait for asynchronous teardown. If replacement is necessary, serialize `await oldPlayer.destroy()` before constructing the next instance in your own lifecycle code. SSR is a separate case: dynamically import the root and chosen modules inside a client-only lifecycle, await all required imports before construction, and check that the component has not already left. Do not execute these browser modules on the server. Ordinary SPA examples should keep the static imports above.

### Direct browser ESM

Plain HTML uses actual file URLs, not npm bare specifiers without a bundler or import map. For an HTML file beside the built entry:

```html
<script type="module">
  import MusicPlayer from './music-player.esm.js';
  import './modules/lyrics.js';
  import './modules/themes.js';

  const player = new MusicPlayer({
    attributes: { mode: 'cloud', apiUrl: '/api/music/playlist', autoplay: false }
  });
</script>
```

The repository's `examples/esm-lazy.html` uses relative `../dist/` URLs. Run it over HTTP(S), retaining the entry, the complete `modules/` directory (including `modules/chunks/`), and declarations from the same build; do not open it as `file://`.

### Deploying the ESM build

Moving chunks into `modules/chunks/` only changes artifact paths; it does not change on-demand loading or imply faster loading.

The manual modules have stable entry names. Use a complete pinned version directory and switch the directory atomically; do not overwrite an online directory file by file. Keeping old hashed chunks alone does not protect cached entries that import stable `modules/*.js` paths. The build script merges local artifacts, not a live atomic release.

- Keep the complete npm distribution, let the application's Vite, Webpack, or Rollup build handle modules and dynamic imports, and deploy its complete output. For direct HTML hosting, upload `music-player.esm.js` and the complete `modules/` directory (including `modules/chunks/`) with their relative paths intact; uploading the entry alone causes loading failures. Deploying all chunks does not make the browser download them all at once; imports and feature calls still determine which files are requested.
- Pin the npm version or use versioned static directories. Upload and verify the complete new directory before switching to it; retain previously deployed `esm-chunks/` with the complete old release until its cached entries have expired. New packages do not include that legacy directory.
- Roll back the ESM entry and all matching chunks together. Do not mix files from different builds. Cross-origin static hosting requires the correct JavaScript MIME type, CORS headers, and CSP configuration.
- In the source repository, `pnpm build` creates the complete distribution. With an existing complete `dist/`, `pnpm build:esm` updates only ESM and its chunks, preserving the IIFE file. Builds do not automatically publish to npm or production hosting.

[返回简体中文文档 →](./README.md)
