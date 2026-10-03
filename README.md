# 小枫音乐播放器 / XF Music Player

小枫音乐播放器是一款基于 Lit Web Components、Howler 和 Zustand 开发的响应式、高性能 HTML5 音乐播放器插件。它支持云端与本地歌单、歌词同步、记忆播放、单曲循环与随机播放、自定义主题、国际化、移动端适配及完整实例 API，可通过 npm、ES Module 或原生 `<script>` 快速接入网页。

当前版本：`1.0.6`。

A responsive HTML5 music player built with Lit Web Components, Howler, and Zustand. It supports cloud and local playlists, synchronized lyrics, playback memory, multiple play modes, custom themes, internationalization, and a complete instance API.

- 官网 / Website: <https://musicplayer.xfyun.club>
- GitHub: <https://github.com/s33806/music-player>
- Gitee: <https://gitee.com/xfwlclub/xf-MusicPlayer/>

npm 安装 / npm install:

```bash
npm install xf-music-player
```

## 1.0.6：音频文件信息读取

- 新增 FLAC、WAV、AIFF / AIFF-C 的文件读取与元数据解析，MP3、M4A、Ogg 等已有音源仍沿用原播放链路。
- 使用统一解析入口获取 `format`（时长、采样率、声道、位深、码率等）、`common`（歌名、歌手、专辑、歌词、封面等）、`native` 原始标签及 `quality.warnings`；文件未携带的可选信息保持缺失，不编造数据。
- `readAudioMetadata` 按文件内容识别格式，接收 `File` / `Blob` / `ArrayBuffer` / `Uint8Array`；Blob 使用分片读取，不为解析标签复制整首音频。空/非音频输入、截断文件头或解析器报错时抛出包含 `cause` 的错误；可读取但不完整的标签通过 `quality.warnings` 返回。元数据解析不执行全轨解码或完整性校验。
- `readAudioFile` 将标签转换为可直接传入 `setPlaylist` 的歌曲，保留完整元数据并返回幂等 `dispose()`；使用结束后主动释放音频和封面 Blob URL。无标签时使用文件名作歌名；无时间戳歌词保留原文，不生成虚假同步时间。
- 文件解析与播放解码分开：FLAC/WAV/AIFF 标签读取不依赖浏览器音频解码器；实际播放取决于浏览器支持的编码。AIFF/AIF/AIFF-C 补充原生能力检测，支持时进入原 Howler 播放链路。未内置转码器。
- 歌词阴影统一为更紧凑的双层阴影：黑色 `.98` + 白色 `.35`、模糊半径 `1px`；保持现有字色、背景和歌词动效。

```ts
import { MusicPlayer, readAudioFile, readAudioMetadata } from 'xf-music-player'

// file 来自 <input type="file" accept="audio/*,.flac,.wav,.aif,.aiff,.aifc">
const loaded = await readAudioFile(file)
const player = new MusicPlayer({ attributes: { mode: 'local', playlist: [loaded.song] } })
console.log(loaded.metadata.format, loaded.metadata.common, loaded.metadata.quality.warnings)
// 只读元数据，不创建 URL：await readAudioMetadata(file)
// script 接入同样使用 XfMusicPlayer.readAudioFile / XfMusicPlayer.readAudioMetadata。

// 在页面卸载/业务销毁时执行；不要在音频仍被使用时 dispose。
await player.destroy()
loaded.dispose()
```

对于无后缀 URL 或业务自行创建的 Blob URL，可在歌曲上设置 `format: 'flac' | 'wav' | 'aiff'` 等格式提示。解析 API 只读取显式传入的文件；普通云端播放不额外下载整首音频来扫描标签。

## 中文

### npm 包内容

```text
package/
├── package.json                      # npm 包说明、入口与导出配置
├── README.md                         # 中文优先的使用介绍
├── index.d.ts                        # TypeScript 类型声明
├── music-player.min.js                # IIFE，适合 script/CDN
├── music-player.esm.js                # ESM，适合现代构建工具
├── old-music-player.min.js           # 旧版调用兼容入口
├── plugin/
│   ├── ie-out/index.js               # 旧浏览器检测插件
│   └── sakura/sakura.min.js          # 樱花漂浮效果插件
```

### CDN 引入

中国大陆推荐使用小枫音乐播放器静态 CDN：

```html
<script src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>

<xf-music-player
  language="zh"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  audio-visualizer="true"
  remember-playback="true"
/>
```

`audio-visualizer` 默认关闭。设置为 `true` 后，Canvas 波形本身就是歌曲进度条，会以不同透明度区分已播放和未播放区域；仅当 PC 鼠标直接经过进度轨道，或移动端触碰、点击、拖动进度条时，才临时显示普通细线进度条。底部歌词条会同步显示底部对齐的柱状音频背景，并使用半透明主题色而非封面背景；活动歌词通过加粗和文字阴影提高清晰度，不增加实底遮罩。仅开启多彩歌词时，底部背景使用封面取色生成的半透明 RGBA；跨域封面未开放 CORS 时回退默认主题背景，不直接显示封面图片；同时开启可视化时，每个柱状线仍使用稳定分色。波形读取同一分析节点的时间域与频域数据，在高频能量增强时平滑放大波幅，不使用镜像、随机数或模拟动画。开启可视化时，跨域音源需返回允许当前站点访问的 `Access-Control-Allow-Origin`；关闭可视化时普通播放不额外要求该响应头。普通细线进度条展示期间会暂停波形采样和 Canvas 动画，降低资源消耗。

jsDelivr 可作为 npm CDN 备用线路：

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

### npm / ESM

```bash
npm install xf-music-player
```

```ts
import { MusicPlayer } from 'xf-music-player'

const player = new MusicPlayer({
  language: 'zh',
  attributes: {
    mode: 'cloud',
    apiUrl: 'https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678',
    theme: 'xf-original-theme',
    rememberPlayback: true
  }
})

player.setVolume(0.8)
```

播放器运行时依赖 `window`、`document`、Web Components 和 HTML5 Audio，应在浏览器客户端加载。Nuxt、Next.js 等 SSR 项目请在客户端生命周期中动态导入：

```ts
if (typeof window !== 'undefined') {
  const { MusicPlayer } = await import('xf-music-player')
  const player = new MusicPlayer()
}
```

### 可选插件

兼容检测插件应放在播放器之前：

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/plugin/ie-out/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

樱花效果插件可独立使用：

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/plugin/sakura/sakura.min.js"></script>
```

### 浏览器要求

播放器依赖 Web Components、Shadow DOM、Promise、Symbol、HTML5 Audio 等现代浏览器能力。不支持 Internet Explorer、Edge Legacy，以及缺少上述能力的旧版 WebView、UC、QQ 浏览器和旧版 iOS Safari。可在播放器之前引入 `plugin/ie-out/index.js` 进行兼容检测。

## English

### Distribution files

- `music-player.min.js`: IIFE bundle for direct `<script>` or CDN usage.
- `music-player.esm.js`: ESM bundle for Vite, Webpack, Rollup, and other modern build tools.
- `old-music-player.min.js`: compatibility entry for legacy player initialization.
- `plugin/ie-out/index.js`: legacy-browser detection and upgrade redirect.
- `plugin/sakura/sakura.min.js`: optional falling-sakura page effect.

### CDN usage

Use the Xiao Feng Music Player static CDN in mainland China:

```html
<script src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>

<xf-music-player
  language="en"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  audio-visualizer="true"
  remember-playback="true"
/>
```

`audio-visualizer` is disabled by default. Set it to `true` to make the Canvas waveform act as the progress bar itself, using opacity to distinguish played and unplayed regions. The thin regular progress bar appears only while a desktop pointer is directly over the seek track, or while a touch user taps or drags it. The bottom lyric bar also renders bottom-aligned animated audio bars; when colorful lyrics are enabled, each bar uses a stable distinct color. The player reads time-domain and frequency-domain data from the same analyser and smoothly increases amplitude when treble energy rises. It does not use mirroring, random values, or simulated animation. Cross-origin audio must return an `Access-Control-Allow-Origin` header that permits the host page; otherwise the regular progress bar remains available without affecting playback. Sampling and animation stop while the thin regular progress bar is shown, paused, outside the viewport, in a background tab, or under reduced-motion preferences. Active rendering is capped at 30 FPS on desktop and 24 FPS on touch devices.

Use jsDelivr as an npm CDN alternative:

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

### npm / ESM

```bash
npm install xf-music-player
```

```ts
import { MusicPlayer } from 'xf-music-player'

const player = new MusicPlayer({
  language: 'en',
  attributes: {
    mode: 'cloud',
    apiUrl: 'https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678',
    theme: 'xf-original-theme',
    rememberPlayback: true
  }
})
```

The runtime requires browser APIs such as `window`, `document`, Web Components, and HTML5 Audio. Load it dynamically on the client when using an SSR framework.

### Optional plugins

Load the compatibility detector before the player bundle:

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/plugin/ie-out/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

The sakura effect can be loaded independently:

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/plugin/sakura/sakura.min.js"></script>
```

### Browser requirements

The player requires Web Components, Shadow DOM, Promise, Symbol, and HTML5 Audio. Internet Explorer, Edge Legacy, and older WebViews or Safari versions without these capabilities are not supported. Use `plugin/ie-out/index.js` when an early compatibility redirect is required.
