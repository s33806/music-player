---
name: xf-music-player-integration
description: 使用已打包的 XF Music Player 进行 IIFE/ESM 按需接入、资源路径核对、歌单与播放控制、歌词主题可视化、本地音频读取和生命周期排查。
---

# XF Music Player 发布包使用 Skills

## 1. 用途与适用场景

本指南面向已经取得播放器发布包的使用者和代码助手，适用于普通 HTML 页面、前端应用及 SPA 的接入。所有操作围绕已打包的 JavaScript、公开 API 和业务页面完成，不需要播放器开发工程。

- 当前对应版本：`1.0.8`，以同目录 `package.json` 为准。
- 使用 Web Components、Shadow DOM 和 HTML5 Audio；界面及音频管理依赖已包含在 JavaScript 产物中，普通 script 接入无需单独加载 Lit、Zustand 或 Howler。
- 同一页面只保留一个活跃播放器。HTML 标签自动接入和 JavaScript 实例接入选择一种，不重复加载主脚本或创建实例。
- 参数与完整用法见[中文 README](./README.md)、[英文 README](./README.en.md)、[按需加载指南](./ESM-GUIDE.md)和[公开类型声明](./index.d.ts)。本文描述的是发布包功能，不是播放器源码开发流程。

### 技能与功能速查

先按业务目标选择功能，再选择第 3 节的**一种**接入方式；不要将多个独立示例同时挂载。

| 想完成的任务 | 使用方式 | 可验证结果 |
| --- | --- | --- |
| 在网页加入播放器 | IIFE 标签自动接入，或 ESM 显式创建实例 | 页面出现一个播放器，用户点击后播放。 |
| 播放自己的歌单或接口 | `playlist` / `apiUrl` / `audioProvider`，见第 4 节 | 歌曲信息来自指定数据源，失败状态可识别。 |
| 播放、切歌、调节进度 | `play()`、`pause()`、`next()`、`seek()` 等，见第 5 节 | 状态与时间随操作变化，实际声音符合预期。 |
| 展示同步、多彩与全屏歌词 | 歌曲的 `lyrics` / `lyricsUrl`；ESM 先引入歌词模块 | 有时间戳时按进度定位，支持的歌词界面正常展示。 |
| 切换主题或使用自定义样式 | `theme` / `customThemeName` / `customThemeStyle` | ESM 预设主题先引入主题模块，再检查实际配色。 |
| 显示实时音频可视化 | ESM 引入可视化模块并开启 `audioVisualizer` | 波形随有效音频变化；歌词背景还需歌词模块。 |
| 读取设备上的音频文件 | `readAudioMetadata()` / `readAudioFile()`，见第 6 节 | 读取已有标签；文件歌单资源在销毁后释放。 |
| 处理 SPA 页面切换 | 单宿主持有实例，`await destroy()` 后重建 | 只有一个活跃宿主，旧请求不影响新实例。 |
| 排查接入问题 | Network、公开 Store 和第 7、8 节清单 | 分清资源路径、配置、加载、播放及设备限制。 |

以上均为已提供的功能或公开 API；示例接口、资源与目标设备的实际可用性仍需接入方验证。

## 2. 发布包文件

| 文件 | 用途 |
| --- | --- |
| `music-player.min.js` | IIFE 主包，适合普通网页 script 引入；公开命名空间为 `XfMusicPlayer`。 |
| `music-player.esm.js` | ESM 根入口：默认导出播放核心 `MusicPlayer`，并保留同名导出及惰性的 `readAudioMetadata`、`readAudioFile`。 |
| `modules/` | 播放核心、歌词、预设主题、可视化、元数据的独立入口与类型声明。 |
| `modules/chunks/` | 同次构建的 ESM 配套分块，包括 `metadata-recovery-*.js`；完整保留目录和文件名。 |
| `ESM-GUIDE.md` | npm、Vue、浏览器 ESM、按需加载与部署说明。 |
| `index.d.ts` | 公开配置、歌曲、生命周期与实例 API 的 TypeScript 声明。 |
| `package.json` | 发布版本、ESM 入口、类型入口及依赖信息。 |
| `README.md`、`README.en.md`、`skills.md` | 中文说明、英文说明和本使用指南。 |
| `demo.html`、`images/`、`logo.svg` | 随包演示页面与图片；演示歌单依赖远程接口，不是离线音频包。 |
| `old-music-player.min.js` | 旧版调用方式兼容入口，新接入优先使用主包。 |
| `plugin/ie-out/index.js` | 可选的旧浏览器升级引导，不是现代浏览器能力补丁。 |
| `plugin/sakura/sakura.min.js` | 可选的独立樱花效果。 |

可选插件按需加载，说明见[插件文档](./plugin/README.md)。播放器没有附带本文使用的 `/audio/example.mp3`、`/img/half.jpg` 或 `/api/music/playlist`；接入方须提供真实资源与接口。

## 3. 选择一种接入方式

### 路径约定：先匹配实际部署位置

**发布包不包含 `vendor` 目录，也不要求创建该目录。** 以下 HTML 示例以“业务页面与发布包入口在同一目录”为前提，使用 `./music-player.min.js` 或 `./music-player.esm.js`，适合解压后通过 HTTP 直接验证。

```text
发布包根目录/
├── player-example.html       # 接入方新建，粘贴下方一种 HTML 示例
├── music-player.min.js
├── music-player.esm.js
├── skills.md
├── package.json
└── modules/
    ├── player.js
    ├── lyrics.js
    ├── themes.js
    ├── visualizer.js
    ├── metadata.js
    └── chunks/              # 同次发布的全部配套分块
```

- 如果业务页面和发布包分开存放，调整脚本 URL 与模块入口 URL，让它们对应真实的托管位置；不要把本地磁盘路径直接写进浏览器 `src`。
- HTML 中的相对脚本 URL、内联模块的相对导入以页面 base URL 为准，受 `<base href>` 影响；独立 `.js` 文件中的相对导入以该模块文件的 URL 为准。
- `/audio/example.mp3`、`/img/half.jpg`、`/api/music/playlist` 是站点根路径的业务资源占位，不是随包文件。若站点部署在子路径，按实际业务资源位置同步修改。
- ESM 入口与完整 `modules/` 来自同一版本；不要只移动入口、手工修改哈希文件名，或混用不同版本。

### 3.1 HTML 标签：适合直接使用歌单接口

将以下片段放到同目录业务 HTML 的 `body` 中：

```html
<xf-music-player
  language="zh"
  mode="cloud"
  api-url="/api/music/playlist"
  is-auto-popup="true"
  autoplay="false"
></xf-music-player>
<script defer src="./music-player.min.js"></script>
```

预期：脚本和接口加载成功后出现播放器，由用户点击播放。自定义标签使用成对结束标签；此方式已经自动接入，不再额外执行 `new MusicPlayer()`。

### 3.2 JavaScript 实例：适合自定义歌单和控制

以下是独立接入方式，页面中不预先放置 `<xf-music-player>`。将代码放在 `body` 中，主包先加载，随后创建实例：

```html
<script src="./music-player.min.js"></script>
<script>
  const { MusicPlayer } = XfMusicPlayer
  const songs = [{
    "id": "demo-1",
    "title": "示例歌曲",
    "src": "/audio/example.mp3",
    "artist": "示例歌手",
    "album": "示例专辑",
    "cover": "/img/half.jpg",
    "duration": 28,
    "lyrics": "[00:00.00]第一行歌词\n[00:05.00]第二行歌词"
  }]

  let player
  function mountPlayer() {
    player = new MusicPlayer({
      language: 'zh',
      isMonitoring: false,
      attributes: {
        environment: 'production',
        mode: 'local',
        playlist: songs,
        isAutoPopup: true,
        autoplay: false,
        rememberPlayback: true
      }
    })
  }
  // 主包先完成默认标签检查，再手动创建实例。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPlayer, { once: true })
  } else {
    mountPlayer()
  }
</script>
```

预期：出现一首歌曲，显示名称、歌手和歌词。替换真实音源及封面后检查播放；`duration` 以秒为单位。`mode: 'local'` 表示使用传入歌单，不代表音频自动缓存或离线可用。

后文使用 `player`、`songs` 的片段均沿用此例，在页面就绪、实例创建完成后按需要选择执行。

### 3.3 npm / ESM：适合有构建工具的前端应用

在**业务项目目录**安装已经取得的发布包。先将变量替换为包含发布 `package.json` 的真实绝对目录；这不是安装播放器开发工程，也不依赖名为 `vendor` 的文件夹：

```bash
PLAYER_PACKAGE_DIR="/绝对路径/播放器发布包"
test -f "$PLAYER_PACKAGE_DIR/package.json" && npm install --install-links "$PLAYER_PACKAGE_DIR"
```

`--install-links` 将该目录打包后作为普通依赖安装，避免只建立指向外部目录的软链接；使用支持该选项的 npm，见 [npm 本地目录安装说明](https://docs.npmjs.com/cli/v11/commands/npm-install/)。

预期：业务依赖能解析 `xf-music-player` 及其模块子路径。已安装时沿用当前安装方式；若从 npm 仓库安装，先确认目标版本已发布，再固定版本和锁文件。本指南不把本地版本号视为远程已发布证明。

在浏览器客户端入口中使用：静态 `import` 放在模块顶层，SPA 将实例创建放在挂载生命周期中；`songs` 使用第 3.2 节的完整歌单。下面展示普通客户端模块的结构，Vue 完整示例见按需加载指南：

```js
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'
// 需要可视化时，在创建实例前加上：
// import 'xf-music-player/modules/visualizer'

let player = new MusicPlayer({
  language: 'zh',
  isMonitoring: false,
  attributes: {
    environment: 'production',
    mode: 'local',
    playlist: songs,
    theme: 'xf-original-theme',
    isAutoPopup: true,
    autoplay: false,
    audioVisualizer: false
  }
})
```

这里的 `MusicPlayer`、`songs`、`player` 与后文控制片段放在同一模块作用域；不要再加载 IIFE 或另建第二个实例。默认导出与 `{ MusicPlayer }` 命名导出是同一个构造器。只需基础控件时，删除歌词、主题等可选导入；不依赖预设主题配色。

### 3.4 浏览器 ESM：不使用 npm 的静态页面

本节与第 3.1、3.2 节的示例各自独立，选择一种即可。将以下内容保存为发布包根目录的 `player-example.html`。它显式导入歌词和预设主题，再创建播放器：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>XF Music Player</title>
</head>
<body>
  <script type="module">
    import MusicPlayer from './music-player.esm.js'
    import './modules/lyrics.js'
    import './modules/themes.js'
    // 需要可视化时，在创建实例前加上：
    // import './modules/visualizer.js'

    const songs = [{
      "id": "demo-1",
      "title": "示例歌曲",
      "src": "/audio/example.mp3",
      "artist": "示例歌手",
      "album": "示例专辑",
      "cover": "/img/half.jpg",
      "duration": 28,
      "lyrics": "[00:00.00]第一行歌词\n[00:05.00]第二行歌词"
    }]
    let player = new MusicPlayer({
      language: 'zh',
      isMonitoring: false,
      attributes: {
        environment: 'production',
        mode: 'local',
        playlist: songs,
        theme: 'xf-original-theme',
        isAutoPopup: true,
        autoplay: false,
        audioVisualizer: false
      }
    })
    // 后续控制代码放在同一模块作用域；结束使用时 await player.destroy()。
  </script>
</body>
</html>
```

预期：模块均加载成功，出现单个播放器和歌词；替换真实业务资源后再验证发声。普通浏览器模块直接使用上述相对 URL，不使用需要构建工具或 import map 才能解析的裸包名。

### 3.5 按需加载规则

| 功能 | npm 导入路径 | 同目录浏览器导入路径 | 启用条件 |
| --- | --- | --- | --- |
| 基础播放、歌单、进度、记忆播放 | `xf-music-player` | `./music-player.esm.js` | 显式创建实例；只有中性基础样式。 |
| 歌词与歌词界面 | `xf-music-player/modules/lyrics` | `./modules/lyrics.js` | 创建实例前导入，歌曲提供歌词。 |
| 内置主题样式 | `xf-music-player/modules/themes` | `./modules/themes.js` | 创建实例前导入，再设置 `theme`。 |
| 音频可视化 | `xf-music-player/modules/visualizer` | `./modules/visualizer.js` | 创建实例前导入，同时开启 `audioVisualizer`。 |
| 独立元数据解析 | `xf-music-player/modules/metadata` | `./modules/metadata.js` | 静态解析入口；与根入口的延迟加载方式区别见第 6 节。 |

- **ESM 不自动挂载。** 仅导入根入口或放一个 HTML 标签，不会自动创建播放器；IIFE 的标签自动接入方式保持不变。
- 歌词、主题、可视化是静态选择的功能，不是点击播放时才下载。`setConfig()` 不会补充导入缺失模块；所需模块在 `new MusicPlayer()` 前就绪。
- 未导入歌词模块时不加载外链歌词或显示歌词界面；未导入可视化模块时保留普通播放和进度条。歌词背景可视化还需歌词模块。
- 模块注册在同一份包内共享，不按每个实例独立开关或卸载。保留发布清单的 `sideEffects: true`，不要由业务构建配置裁掉注册代码。
- 完整部署所有配套分块不等于浏览器一次下载全部分块；实际加载由导入关系和解析调用决定。
- 发布包按 ESM 使用，不以 CommonJS `require()` 调用。SSR 只在客户端导入根入口及所需模块，全部完成且页面仍挂载时才创建实例；不要让服务端执行依赖浏览器的组件代码。

Vue SPA、SSR 和生产缓存更新细节见[按需加载指南](./ESM-GUIDE.md)。

## 4. 配置数据源、歌词与主题

### 4.1 参数规则

- 构造参数顶层：`language`（`zh` / `en`）、`tagName`、`mountElement`、`manualMount`、`hooks`、`isMonitoring` 等。
- `attributes`：`mode`、`apiUrl`、`playlist`、`audioProvider`、`theme`、`volume`、`playMode`、`autoplay`、`rememberPlayback`、`audioVisualizer`、`colorfulLyric` 等。
- 后续使用 `setConfig()` 更新支持的 `attributes` 配置；`language` 不属于该方法参数。
- 数组和函数通过 JavaScript 参数传递，不把函数塞进 HTML 字符串属性。
- `volume` 范围为 `0–1`；`playMode` 支持 `order`、`single`、`random`。
- 记忆播放记录当前歌曲及进度等状态，不保存每首歌曲的独立历史进度。

### 4.2 云端接口和自定义 provider

云端模式使用 `apiUrl`；显式配置的 `audioProvider` 优先于内置云端接口和本地 `playlist`。例如：

```js
player.setConfig({
  audioProvider: async ({ signal }) => {
    const response = await fetch('/api/music/playlist', { signal })
    if (!response.ok) throw new Error(`歌单请求失败：${response.status}`)
    return response.json()
  }
})
```

接口可以返回歌曲数组，也支持 `list` / `playlist` / `songs` 包装，或统一响应 `{ code: 200, msg: 'success', data: 歌曲数组 }`。歌曲字段按第 3.2 节示例提供，`src` 必须指向有效音频资源。

将 `signal` 传给自己的请求，配合销毁和切换数据源取消过期响应。`setConfig()` 忽略 `undefined`，因此 `audioProvider: undefined` 不用于清除 provider；需要彻底更换配置时，先销毁旧实例，再用新的构造参数创建。

### 4.3 歌词、主题与可视化

以下片段沿用已有实例。**ESM 接入先按第 3.5 节导入 `lyrics`、`themes`、`visualizer` 三个模块，再创建实例**；IIFE 已包含这些功能。

```js
player.setConfig({
  theme: 'xf-sky-theme',
  colorfulLyric: true,
  audioVisualizer: true
})
```

- 歌词支持 LRC 字符串，也支持声明中的 `LyricItem[]`；底部歌词、全屏歌词和点选歌词跳转按当前播放状态工作。
- 内置主题名称可通过 `player.ThemeArray` 查看；能读到名称不表示 ESM 主题样式已经导入。自定义样式使用公开的 `customThemeName`、`customThemeStyle` 参数，不用修改压缩包。
- 多彩歌词单独开启时，背景采用封面取色生成的半透明颜色；同时开启可视化时，背景跟随主题。
- `audioVisualizer` 默认关闭，相关模块已导入并开启配置后显示实际音频波形及歌词音频背景。跨域音源需要允许当前站点的 CORS 响应；跨域封面取色也需要相应权限，否则回退主题背景。
- iOS / iPadOS 音量由系统控制，操作音量控件会显示中英文提示；使用设备音量键或控制中心调节。

## 5. 播放控制与实例生命周期

| 调用 | 用途 |
| --- | --- |
| `player.play()` / `player.pause()` / `player.toggle()` | 播放、暂停或切换状态。 |
| `player.stop()` | 停止并重置进度。 |
| `player.prev()` / `player.next()` / `player.select(0)` | 切歌或按从零开始的索引选曲。 |
| `player.seek(10)` | 跳转到第 10 秒。 |
| `player.setVolume(0.8)` / `player.mute(true)` | 音量和静音，受浏览器平台能力影响。 |
| `player.setPlayMode('random')` | 改变播放顺序。 |
| `player.setPlaylist(songs, 0)` | 替换歌单并指定当前索引。 |
| `player.setConfig({ theme: 'xf-dark-theme' })` | 局部更新配置。 |
| `await player.destroy()` | 异步销毁自身播放器并清理资源。 |

播放控制返回 `this`，不表示浏览器已经成功发声。需要播放时绑定用户点击，并结合实际声音、时间推进和错误状态验证。以下示例由业务页面提供 `play-button` 按钮，在已有 `player` 的同一作用域执行：

```js
const playButton = document.getElementById('play-button')
const handlePlay = () => player.play()
playButton?.addEventListener('click', handlePlay)
// 页面退出时，同时移除业务绑定：
// playButton?.removeEventListener('click', handlePlay)
```

音频地址与服务器会影响跳转行为；部分浏览器的远程音频跳转依赖 Range/206 支持，进度数值变化不代替实际媒体位置和声音验证。

单次重建示例：

```js
async function recreatePlayer() {
  await player.destroy()
  player = new MusicPlayer({
    language: 'zh',
    attributes: { mode: 'local', playlist: songs, autoplay: false }
  })
}
```

业务方应串行处理重建，避免并发调用；SPA 切页后取消过期初始化，并始终保存新实例引用。`mount()` 用于挂载已有元素，不用于复活已销毁的实例。页面卸载时同时释放业务侧订阅、定时器和引用。

## 6. 本地音频文件读取

公开 API 支持 FLAC、WAV、AIFF / AIFF-C、MP3、M4A、Ogg 等格式的信息解析。**元数据解析支持与浏览器音频解码支持是两回事**，播放器没有内置转码器。

- `readAudioMetadata(input)` 接收 `File`（属于 `Blob`）、`Blob`、`Uint8Array` 或 `ArrayBuffer`，返回基础音频信息、标签、封面字节、歌词及解析警告等。
- `readAudioFile(file)` 接收文件选择器得到的 `File`，返回 `{ song, metadata, dispose }`。
- 将返回的 `song` 放入 `playlist`；停止使用且播放器销毁后调用 `dispose()`，释放临时音频与封面 URL。创建实例失败时也要释放。
- Blob URL 不适合跨页面恢复，文件歌单设置 `rememberPlayback: false`。完整文件接入示例见同目录 README。

IIFE 调用入口示例（函数由文件选择事件传入 `File`）：

```js
async function inspectAudioFile(file) {
  const metadata = await XfMusicPlayer.readAudioMetadata(file)
  console.log(metadata.format, metadata.common)
  return metadata
}
```

预期：有效音频返回文件中存在的信息；无效或不可解析输入拒绝 Promise，可解析但不完整的信息应检查 `metadata.quality.warnings`。解析不等于全轨解码或文件完整性检查。调用方应捕获错误并展示适合业务界面的提示，不把解析失败当成空白成功结果。

### 6.1 ESM 的两种解析入口

通常选根入口，让解析器在**首次调用**时才加载：

```js
import { readAudioMetadata, readAudioFile } from 'xf-music-player'
```

仅导入函数不会下载解析器；普通 URL 歌单播放也不读取全曲元数据。首次调用等待解析分块，并发调用共享加载，后续调用复用。该规则针对 ESM 根入口，IIFE 仍是完整单文件。

若页面以文件解析为主要功能，选择独立静态入口：

```js
import { readAudioFile } from 'xf-music-player/modules/metadata'
```

两种入口选其一。独立入口将解析实现放入初始依赖图，不创建播放器；具体格式解析器仍沿用内部的分块加载。仅需解析时，无需导入播放器或歌词、主题、可视化。

### 6.2 文件歌单及资源释放

这是独立的 npm 客户端示例：先销毁已有播放器，再由文件选择事件传入 `File`，使用期间保留函数返回的新实例。

```js
import MusicPlayer, { readAudioFile } from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'

async function createFilePlayer(file) {
  const loaded = await readAudioFile(file)
  try {
    return new MusicPlayer({
      language: 'zh',
      isMonitoring: false,
      attributes: {
        environment: 'production',
        mode: 'local',
        playlist: [loaded.song],
        theme: 'xf-original-theme',
        rememberPlayback: false,
        isAutoPopup: true,
        autoplay: false
      },
      hooks: { afterDestroy: () => loaded.dispose() }
    })
  } catch (error) {
    loaded.dispose()
    throw error
  }
}
```

调用方通过 `try/catch` 处理 `await createFilePlayer(file)` 的读取和创建失败；结束使用时 `await filePlayer.destroy()`，成功销毁后释放资源。解析期间禁用重复提交；若组件可卸载，在 `await readAudioFile(file)` 后检查页面是否仍挂载，已退出则 `loaded.dispose()` 并结束，不创建过期实例。

### 6.3 分块加载失败与显式重试

通过 ESM 根入口解析时，解析模块或内部格式分块加载失败会让**本次调用拒绝**并保留错误 `cause`。资源恢复后，业务下一次显式调用同一 API 会尝试加载随包的 `metadata-recovery-*.js` 备用模块；并发重试共享加载，不自动循环重试。无效文件或普通解析错误不触发备用下载。

备用模块也可能失败，浏览器还可能缓存失败 URL；修复资源后同页重试仍失败时手动刷新。独立静态 `modules/metadata` 入口不使用根入口的备用恢复。部署时保留全部 `modules/chunks/`，不要只复制首次请求过的文件。

## 7. 接入调试与验收

### 本地预览已取得的发布包

在发布包所在目录执行（已安装 Python 3 时）：

```bash
python3 -m http.server 5100 --bind 127.0.0.1
```

将第 3.4 节保存为同目录的 `player-example.html` 后，访问 `http://127.0.0.1:5100/player-example.html` 验证自己的接入。也可访问 `http://127.0.0.1:5100/demo.html` 查看随包演示；通过 HTTP 服务访问，不直接双击本地 HTML。该演示依赖远程歌单，浏览器可能要求先点击播放。终端按 `Ctrl+C` 停止服务，端口占用时使用空闲端口。

对业务接入页则按第 3 节部署路径检查 Network：主包、音频、封面和歌单接口应返回预期内容。静态文件服务器不实现 `/api/music/playlist`；接口由业务服务提供，或使用 `mode: 'local'` 和有效歌单。

### 核对路径与响应内容

在采用第 3 节同目录布局的 HTML 页面控制台检查实际 URL：

```js
console.log(new URL('./music-player.min.js', document.baseURI).href)
console.log(new URL('./music-player.esm.js', document.baseURI).href)
console.log(new URL('./modules/lyrics.js', document.baseURI).href)
```

预期：URL 对应实际部署目录，而不是不存在的固定前缀。独立 `.js` 模块中的导入路径应改用该模块的 `import.meta.url` 判断，不套用页面路径。

在发布包根目录启动上述服务后，可另开终端检查静态文件；示例固定端口为 `5100`，换端口时同步修改：

```bash
curl -I http://127.0.0.1:5100/music-player.min.js
curl -I http://127.0.0.1:5100/music-player.esm.js
curl -I http://127.0.0.1:5100/modules/player.js
curl -I http://127.0.0.1:5100/modules/lyrics.js
```

预期：所选入口和依赖返回 `200`，JavaScript 的 `Content-Type` 为 `text/javascript` 或 `application/javascript`，不是应用首页 HTML。Network 中继续检查实际请求的 `modules/chunks/`；静态路由回退导致的“200 + HTML”同样是错误。不要为排查另一种入口而在同一页面同时执行 IIFE 与 ESM。

生产环境使用同次构建的完整、版本化发布目录，资源准备完毕后再切换引用；保留旧版本整套资源以供旧页面和回滚使用，避免在在线目录逐个覆盖。

### 使用公开状态诊断

以下片段沿用 JavaScript 实例：

```js
console.log(player.configState.getState().playback)
const unsubscribe = player.configState.subscribe(state => {
  console.log(state.playback.currentTime, state.playback.error)
})
// 调试结束或业务页面卸载时执行：
unsubscribe()
```

诊断只通过公开 API，不依赖压缩变量名或组件内部结构。查看错误时避免输出包含凭据的业务配置或完整请求地址。

### 验收清单

1. 主包只加载一次，页面只有一个活跃播放器；未出现重复实例报错。ESM 显式创建实例，使用的可选模块在创建前导入。
2. 歌单、歌曲名、作者、封面与歌词正确；示例资源已替换为真实资源。
3. 用户点击后实际有声，播放时间推进；暂停、切歌、拖动进度行为正常。
4. 切换主题、多彩歌词和可视化后，歌词可读且播放仍有声。
5. 播放中或请求中销毁，再创建实例后正常显示和播放；旧请求不污染新实例。
6. 接口失败或空歌单时有可识别状态，控制台没有未处理的 Promise 错误。
7. 使用 ESM 根入口的惰性解析、且未静态导入 `modules/metadata` 时：未调用解析 API 不下载元数据解析器，首次读取文件后才出现相关分块请求，后续复用；独立静态解析入口按第 6.1 节检查。
8. 完整部署同版本入口和 `modules/`；全部实际请求返回正确内容，文件解析失败可识别，Blob URL 在停止使用后释放。
9. 按目标 Windows、Android、iOS 设备分别记录浏览器版本与结果；窄屏模拟不等于真机验证。

## 8. 常见问题与待确认事项

| 问题 | 从发布包接入侧检查 |
| --- | --- |
| 页面没有播放器 | 主包 URL、脚本顺序、控制台语法错误、标签结束方式、挂载容器及歌单请求；ESM 是否显式创建实例；确认浏览器支持 Web Components、Shadow DOM、BigInt 等能力。 |
| 示例脚本路径 404 | 对照第 3 节布局和第 7 节 URL 输出，修正实际托管前缀、页面 base URL 或外部模块相对位置。 |
| ESM 报模块 MIME / import 错误 | 主入口与完整 `modules/` 是否一起部署、响应是否被重写为 HTML；同时检查 MIME、CORS 和 CSP。 |
| 歌词、主题或可视化不显示 | ESM 是否在创建前导入对应模块；可视化是否同时启用配置；注册代码是否被构建工具裁剪。 |
| 首次音频解析失败 | 区分文件解析错误与分块下载失败，检查包括备用模块在内的完整分块；按第 6.3 节处理显式重试。 |
| 切页提示已有播放器 | 等待旧实例销毁，再创建新实例；拦截已退出页面的异步初始化，不用不同标签制造并行实例。 |
| 有进度但没有声音 | 检查系统音量、静音、用户播放手势、音源有效性及 CORS；分别对比开启与关闭可视化的结果。 |
| iOS 页面调音量无效 | 使用系统音量键或控制中心，检查提示语言是否正确。 |
| 读取音频信息成功但播放失败 | 核对实际编码、MIME 和浏览器解码支持；尤其 AIFF / AIFF-C。 |
| 页面在 localhost，却请求远程音频 | 页面地址不决定资源地址；检查传入的 `apiUrl`、provider 和歌曲 `src`。 |
| 歌词取色不生效 | 检查 `colorfulLyric`、是否同时开启可视化、封面可访问性与 CORS。 |
| 传入 `audioProvider: undefined` 后仍调用旧接口 | 该值会被忽略；销毁并以目标配置重新创建，避免继续复用旧 provider。 |

**待确认：** 接入方实际部署路径、音源与接口、CORS 配置、目标设备浏览器版本和具体编码的播放能力，应在部署环境逐项验证。本文不将任意远程 CDN / npm 版本的可下载状态或全平台兼容性视为已验证结果。

## 9. 可复用接入任务说明

```text
请使用已经打包的 XF Music Player 接入当前业务页面。
先阅读发布包的 skills.md、README.md、ESM-GUIDE.md 和 index.d.ts，核对 package.json 版本。
先确认页面 URL、发布包实际托管位置与模块相对路径，再选择一种 IIFE 或 ESM 接入方式。
ESM 只导入业务需要的歌词、主题、可视化模块，在模块就绪后显式创建实例。
只使用发布包文件和公开 API，提供真实歌单或明确标记待替换的资源地址。
保持单活跃实例，处理请求失败、页面销毁、Blob URL 与业务订阅清理。
交付接入代码、实际使用路径、首屏与首次文件解析的网络验证结果及待确认事项。
```
