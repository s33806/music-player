# 小枫音乐播放器

**简体中文** · [English](./README.en.md)

基于 Web Components 的 HTML5 音乐播放器。既能通过一个 `<script>` 接入普通网页，也能作为 ESM 模块用于 Vue、React 等项目；播放器样式通过 Shadow DOM 隔离。

当前版本：`1.0.7`。

[官网](https://musicplayer.xfyun.club) · [接入文档](https://musicplayer.xfyun.club/docs/) · [在线调试](https://musicplayer.xfyun.club/debug/) · [GitHub](https://github.com/s33806/music-player) · [Gitee](https://gitee.com/xfwlclub/xf-MusicPlayer/)

## 核心优势

| 功能 | 可以做什么 |
| --- | --- |
| 框架无关的接入方式 | 原生 HTML 标签、JavaScript 实例、npm / ESM；无需绑定特定前端框架。 |
| 灵活的数据源 | 云端 `apiUrl`、本地 `playlist`、自定义 `audioProvider`，接入现有音乐接口。 |
| 真实音频可视化 | 可选 Canvas 波形进度条与歌词柱状背景，读取实际音频分析数据，支持拖动进度。 |
| 歌词与主题 | 同步歌词、全屏歌词、点击歌词跳转、封面取色、多彩歌词及内置/自定义主题。 |
| 本地音频信息读取 | 统一读取 FLAC、WAV、AIFF / AIFF-C、MP3、M4A、Ogg 等文件的音频参数、标签、封面和歌词。 |
| 播放状态与生命周期 | 记忆当前歌曲和进度，支持顺序/单曲/随机播放、中英界面、公开控制 API 与异步销毁。 |

## 快速开始

以下 HTML 和 npm 示例是两种独立接入方式，选择一种即可。同一页面只保留一个活跃播放器。

### 方式一：HTML / CDN

将下面代码放入页面。自定义标签使用完整的结束标签。

```html
<xf-music-player
  language="zh"
  mode="cloud"
  api-url="https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678"
  theme="xf-original-theme"
  is-auto-popup="true"
  remember-playback="true"
></xf-music-player>
<script defer src="https://player.xfyun.club/js/music-player/music-player.min.js"></script>
```

也可将脚本地址替换为 npm CDN：

```html
<script defer src="https://cdn.jsdelivr.net/npm/xf-music-player@latest/music-player.min.js"></script>
```

只选择一个脚本地址，避免重复加载。示例未开启自动播放，由用户点击播放。

### 方式二：npm / ESM

```bash
npm install xf-music-player
```

在浏览器客户端执行；将 `/audio/example.mp3` 替换为项目中实际存在的音频地址。

```ts
import { MusicPlayer } from 'xf-music-player'

let player = new MusicPlayer({
  language: 'zh',
  attributes: {
    mode: 'local',
    isAutoPopup: true,
    rememberPlayback: true,
    playlist: [{
      "id": "demo-1",
      "title": "示例歌曲",
      "src": "/audio/example.mp3",
      "artist": "示例歌手",
      "album": "示例专辑",
      "cover": "/img/half.jpg",
      "duration": 28,
      "lyrics": "[00:00.00]第一行歌词\n[00:05.00]第二行歌词"
    }]
  }
})
```

`language` 属于构造参数；`theme`、`playlist`、`apiUrl` 等配置放在 `attributes` 中。Nuxt、Next.js 等 SSR 项目应在客户端生命周期中使用 `await import('xf-music-player')`，并在卸载时销毁实例。

## 功能示例

### 音频可视化与主题

以下配置和自定义接口示例沿用上面的 `player` 实例。

```ts
player.setConfig({
  audioVisualizer: true,
  colorfulLyric: true,
  theme: 'xf-sky-theme'
})
```

- `audioVisualizer` 默认关闭；启用后，波形可作为进度条使用，歌词区域同步展示音频柱状背景。
- 仅启用多彩歌词时，背景使用封面取色生成的半透明 RGBA；同时开启可视化时，歌词背景跟随主题。
- 跨域音源在可视化模式下需要允许当前站点的 CORS 响应头。音源未开放 CORS 时，可关闭可视化，使用普通播放链路。
- 跨域封面未开放像素读取权限时，取色背景回退为默认主题色。

### 接入自己的音乐接口

`audioProvider` 优先于内置云端接口。将 `/api/music/playlist` 替换为自己的地址，并传递 `signal`，让播放器销毁或数据源变化时可以取消过期请求。

```ts
player.setConfig({
  audioProvider: async ({ signal }) => {
    const response = await fetch('/api/music/playlist', { signal })
    if (!response.ok) throw new Error(`歌单请求失败：${response.status}`)
    return response.json()
  }
})
```

接口可返回歌曲数组，也可使用以下统一响应结构；`src` 指向可播放的音频资源。

```json
{
  "code": 200,
  "msg": "success",
  "data": [{
    "id": "demo-1",
    "title": "示例歌曲",
    "src": "/audio/example.mp3",
    "artist": "示例歌手",
    "album": "示例专辑",
    "cover": "/img/half.jpg",
    "duration": 28,
    "lyrics": "[00:00.00]第一行歌词\n[00:05.00]第二行歌词"
  }]
}
```

如果接口已经符合该结构，也可以直接使用 `attributes: { mode: 'cloud', apiUrl: '/api/music/playlist' }`，省去自定义函数。

### 读取本地音频、封面和歌词

这是另一种独立的创建方式，适合文件选择器传入的 `File`。先销毁页面上已有的播放器，再调用它。

```ts
import { MusicPlayer, readAudioFile } from 'xf-music-player'

export async function createFilePlayer(file: File) {
  const loaded = await readAudioFile(file)
  console.log(loaded.metadata.format, loaded.metadata.common)

  try {
    return new MusicPlayer({
      language: 'zh',
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

在文件选择事件中调用 `const filePlayer = await createFilePlayer(file)`；业务结束时执行 `await filePlayer.destroy()`。示例在销毁后释放音频和封面的临时 URL，并关闭不适合跨页面恢复的 Blob 歌曲记忆。

只需读取信息时，使用 `readAudioMetadata(file)`，无需创建临时 URL。解析支持与播放解码是两回事：尤其 AIFF 的实际播放取决于浏览器编码支持；播放器未内置转码器。普通云端播放不会额外下载整首音频扫描标签。

### 播放控制与页面卸载

| API | 用途 |
| --- | --- |
| `player.play()` / `player.pause()` | 播放 / 暂停，建议由用户点击触发。 |
| `player.prev()` / `player.next()` | 上一首 / 下一首。 |
| `player.seek(30)` | 跳转到第 30 秒。 |
| `player.setVolume(0.8)` | 设置音量，范围 `0–1`；iOS 使用系统音量。 |
| `player.setPlayMode('random')` | 随机播放；也支持 `order`、`single`。 |
| `player.setPlaylist(songs, 0)` | 替换歌单并选择第一首。 |
| `player.setConfig({ theme: 'xf-dark-theme' })` | 局部更新配置。 |
| `await player.destroy()` | 销毁当前实例，清理音频、订阅及交互任务。 |

页面切换需要重建时，先等待旧实例销毁完成，再保存新实例引用。下面的 `player` 沿用 npm 示例，接口地址需替换为自己的地址。

```ts
async function recreatePlayer() {
  await player.destroy()
  player = new MusicPlayer({
    language: 'zh',
    attributes: { mode: 'cloud', apiUrl: '/api/music/playlist' }
  })
}
```

销毁后的旧控制器应由新实例替代；`mount()` 用于挂载已有元素，不用于重建已销毁的播放器。SPA 路由接入还应取消已退出页面的异步初始化，避免快速切页时重复创建。

## 当前版本更新 · 1.0.7

- **生命周期修复**：清理销毁后的旧订阅、音频和交互任务，避免旧控制器及过期回调影响新实例，正常取消请求不再误报错误。
- **音频链路修复**：修复关闭可视化后复用已绑定 Web Audio 的媒体元素导致无声的问题。
- **渲染兼容改进**：IIFE/ESM 按 ES2020 构建，转换依赖中的逻辑赋值与类字段；云端歌单失败、超时或为空时仍显示播放器及错误提示，首次挂载不重复请求失败接口。
- **交互与资源优化**：减少歌单重复计算、暂停屏外加载动画、合并拖动更新，修复滚动空转与波形额外丢帧，使用 Howler core 精简未使用功能。
- **iOS 音量提示**：点击音量控件时提示使用设备音量键或控制中心，支持中英文并限制连续提示；其他播放操作保持原行为。

## 使用说明

- 运行环境需要 Web Components、Shadow DOM、HTML5 Audio、Promise、Symbol、BigInt 等现代浏览器能力。生产包的 ES2020 转换不等于为所有旧浏览器补齐运行时 API。
- 浏览器自动播放策略可能要求先进行用户交互。iOS / iPadOS 音量由系统控制。
- 记忆播放保存当前歌曲及其进度等状态，不为歌单中每首歌曲分别保存历史进度。
- 内置云端首屏请求等待超过 2 秒会提示加载中；超过 10 秒或请求失败时显示错误及空歌单播放器。之后可更换 `apiUrl` 或调用 `setPlaylist()` 恢复。
- 本文示例中的业务接口和音频路径需要由接入项目提供。更多配置及在线预览见[接入文档](https://musicplayer.xfyun.club/docs/)和[在线调试](https://musicplayer.xfyun.club/debug/)。

## 发布包与可选插件

| 文件 | 用途 |
| --- | --- |
| `README.md` / `README.en.md` | 默认中文文档 / 英文文档。 |
| `music-player.min.js` | 直接通过 `<script>` 加载的 IIFE 产物。 |
| `music-player.esm.js` / `index.d.ts` | ESM 入口 / TypeScript 声明。 |
| `old-music-player.min.js` | 旧版调用方式兼容入口。 |
| `plugin/ie-out/index.js` | 旧浏览器检测与升级引导；放在主播放器脚本之前。 |
| `plugin/sakura/sakura.min.js` | 可独立加载的樱花飘落效果。 |

[Read this document in English →](./README.en.md)
