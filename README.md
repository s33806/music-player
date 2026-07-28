# 小枫音乐播放器 / XF Music Player

小枫音乐播放器是一款基于 Lit Web Components、Howler 和 Zustand 开发的响应式、高性能 HTML5 音乐播放器插件。它支持云端与本地歌单、歌词同步、记忆播放、单曲循环与随机播放、自定义主题、国际化、移动端适配及完整实例 API，可通过 npm、ES Module 或原生 `<script>` 快速接入网页。

A responsive HTML5 music player built with Lit Web Components, Howler, and Zustand. It supports cloud and local playlists, synchronized lyrics, playback memory, multiple play modes, custom themes, internationalization, and a complete instance API.

- 官网 / Website: <https://musicplayer.xfyun.club>
- GitHub: <https://github.com/s33806/music-player>
- Gitee: <https://gitee.com/xfwlclub/xf-MusicPlayer/>

npm 安装 / npm install:

```bash
npm install xf-music-player
```

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

`audio-visualizer` 默认关闭。设置为 `true` 后，Canvas 波形本身就是歌曲进度条，会以不同透明度区分已播放和未播放区域；仅当 PC 鼠标直接经过进度轨道，或移动端触碰、点击、拖动进度条时，才临时显示普通细线进度条。底部歌词条会同步显示底部对齐的柱状音频背景；开启多彩歌词后，每个柱状线会使用稳定分色。波形读取同一分析节点的时间域与频域数据，在高频能量增强时平滑放大波幅，不使用镜像、随机数或模拟动画。若跨域音频响应未返回允许当前站点访问的 `Access-Control-Allow-Origin`，播放器会保留静态进度条且不影响播放。普通细线进度条展示期间会暂停波形采样和 Canvas 动画，降低资源消耗。

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
