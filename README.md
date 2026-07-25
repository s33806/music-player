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
└── xf-MusicPlayer-master/             # 旧版播放器归档
```

`package.json` 的 `main`、`module`、`exports` 和 `types` 会在构建时自动生成。运行文件使用固定名称，npm 包版本仍由 `VITE_VERSION` 控制；生产环境建议锁定 npm 版本，避免 CDN 自动升级造成行为变化。

### CDN 引入

中国大陆推荐使用小枫音乐播放器静态 CDN：

```html
<script src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>

<xf-music-player
  language="zh"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  remember-playback="true"
></xf-music-player>
```

jsDelivr 可作为 npm CDN 备用线路：

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/music-player.min.js"></script>
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
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/plugin/ie-out/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/music-player.min.js"></script>
```

樱花效果插件可独立使用：

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/plugin/sakura/sakura.min.js"></script>
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
- `xf-MusicPlayer-master/`: archived legacy player source and examples.

Pin an exact package version in production so CDN updates cannot unexpectedly change runtime behavior.

### CDN usage

Use the Xiao Feng Music Player static CDN in mainland China:

```html
<script src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>

<xf-music-player
  language="en"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  remember-playback="true"
></xf-music-player>
```

Use jsDelivr as an npm CDN alternative:

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/music-player.min.js"></script>
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
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/plugin/ie-out/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/music-player.min.js"></script>
```

The sakura effect can be loaded independently:

```html
<script src="https://cdn.jsdelivr.net/npm/xf-music-player@1.0.0/plugin/sakura/sakura.min.js"></script>
```

### Browser requirements

The player requires Web Components, Shadow DOM, Promise, Symbol, and HTML5 Audio. Internet Explorer, Edge Legacy, and older WebViews or Safari versions without these capabilities are not supported. Use `plugin/ie-out/index.js` when an early compatibility redirect is required.
