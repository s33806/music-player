# 小枫音乐播放器 · 按需加载生产接入指南

适用于通过 npm 或静态资源接入的 ESM 播放器。默认引入播放核心，歌词、主题和可视化按需选择，最后由业务显式创建实例。

- **静态选择模块**：导入的功能随页面或应用分块加载；不需要某项功能时删除对应 `import`。
- **延迟加载元数据**：根入口的文件解析函数在首次调用时加载解析模块；普通云端播放和 URL 歌单不触发解析。

普通脚本 `music-player.min.js` 仍为完整单文件，保留原有接入方式；不要在同一页面混用 IIFE 和 ESM。

### 选择接入方式

| 使用场景 | 接入方式 | 生产部署内容 |
| --- | --- | --- |
| Vite 等构建工具管理的应用 | npm 安装，静态导入需要的模块 | 业务应用构建生成的完整产物 |
| Vue 3 SPA | npm 安装，在 `App.vue` 中创建和销毁实例 | Vue 应用构建生成的完整产物 |
| 普通 HTML、静态站点 | `<script type="module">` 中使用相对 URL | 同一发布目录中的 ESM 入口和完整 `modules/` |

下方示例相互独立，选择适合的一组使用，不要同时运行多个实例示例。示例接口、音频及封面路径由业务提供；仅导入根入口不会扫描页面标签、创建实例或播放。

## 1. npm 安装

将 `VERSION` 替换为已发布且包含下列模块入口的固定版本：

```sh
pnpm add --save-exact xf-music-player@VERSION
```

提交依赖清单与锁文件，生产安装使用锁定版本。应用继续沿用自身的生产打包与部署流程。

## 2. JavaScript 接入

### 2.1 只使用播放核心

仅导入根入口即可使用播放控件、歌单、进度条和中性基础样式。下面使用业务音频 URL，不触发文件元数据解析：

```js
import MusicPlayer from 'xf-music-player'

const player = new MusicPlayer({
  language: 'zh',
  isMonitoring: false,
  attributes: {
    environment: 'production',
    mode: 'local',
    playlist: [{
      id: 'track-1',
      title: '示例歌曲',
      artist: '示例歌手',
      src: '/audio/track-1.mp3'
    }],
    isAutoPopup: true,
    autoplay: false
  }
})
```

将 `/audio/track-1.mp3` 替换为实际可访问的音频。这里的 `mode: 'local'` 表示直接传入歌单，不表示必须选择设备文件；业务结束时按第 6 节销毁实例。

### 2.2 云端歌单、歌词与主题

在浏览器客户端入口静态导入所需模块，随后显式创建实例：

```js
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'
// import 'xf-music-player/modules/visualizer'

const player = new MusicPlayer({
  language: 'zh',
  isMonitoring: false,
  attributes: {
    environment: 'production',
    mode: 'cloud',
    apiUrl: '/api/music/playlist',
    theme: 'xf-original-theme',
    isAutoPopup: true,
    autoplay: false,
    audioVisualizer: false
  }
})
```

将 `/api/music/playlist` 换成业务真实歌单接口，并使用播放器支持的响应结构。`language`、`isMonitoring` 位于构造参数顶层，歌单、主题及播放选项放在 `attributes` 中。

### 2.3 选择功能

| 入口 | 用途 | 接入要求 |
| --- | --- | --- |
| `xf-music-player` | 播放核心、控件、歌单及中性基础样式 | 默认导出 `MusicPlayer`，导入后显式创建实例 |
| `xf-music-player/modules/lyrics` | 同步歌词与歌词界面 | 在实例创建前导入 |
| `xf-music-player/modules/themes` | 内置主题 | 导入后使用原有 `theme` 选项 |
| `xf-music-player/modules/visualizer` | 音频波形与可视化 | 导入模块，且设置 `audioVisualizer: true` |
| `xf-music-player/modules/metadata` | 独立文件元数据解析 | 详见文件解析一节，不创建播放器 |

静态 `import` 选择的是应用需要打包和加载的功能，不是点击播放后再下载这些模块。所需模块在创建实例前导入；删除不需要的功能导入即可。无需添加 `/core` 或 `/auto` 入口，也无需调用额外的注册函数。

没有歌词模块时，不请求外链歌词或渲染歌词界面。没有主题模块时使用中性基础配色，自定义样式覆盖仍可使用。没有可视化模块时，即使开启配置，也保留普通播放和进度条。

普通波形可独立启用；歌词区域的可视化还需导入歌词模块。跨域音源开启可视化时，音源服务应提供匹配的 CORS 响应。

**保留包的副作用声明。** 歌词、主题与可视化入口在导入时完成注册，消费端不要将这些注册代码当作无副作用代码裁剪。

### 2.4 启用可视化

模块导入和配置开关缺一不可。以下示例只选用核心与可视化，不附带歌词或预设主题：

```js
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/visualizer'

const player = new MusicPlayer({
  isMonitoring: false,
  attributes: {
    environment: 'production',
    mode: 'cloud',
    apiUrl: '/api/music/playlist',
    audioVisualizer: true,
    autoplay: false,
    isAutoPopup: true
  }
})
```

## 3. Vue 3 接入

建议固定放在 `App.vue`，避免每个路由重复创建播放器：

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import MusicPlayer from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'

let player: MusicPlayer | undefined

onMounted(() => {
  player = new MusicPlayer({
    language: 'zh',
    isMonitoring: false,
    attributes: {
      environment: 'production',
      mode: 'cloud',
      apiUrl: '/api/music/playlist',
      theme: 'xf-original-theme',
      isAutoPopup: true,
      autoplay: false
    }
  })
})

onBeforeUnmount(() => {
  player?.destroy().catch(error => {
    console.error('播放器销毁失败', error)
  })
})
</script>
```

Vue 不会等待卸载钩子中的异步销毁完成。需要替换实例时，由业务先 `await oldPlayer.destroy()`，完成后再创建新实例。

### SSR 应用

上述静态示例用于客户端 SPA。SSR 应用将播放器放在客户端专用组件中，避免服务端执行浏览器组件代码；必要时在客户端生命周期中动态导入根入口和所需模块，全部加载完成且组件仍挂载时再创建实例。组件卸载时仍需处理销毁错误。

## 4. 普通 HTML 接入

直接使用生产 ESM 资源包，保持入口、模块与分块的目录关系。以下示例将整套资源放在 `index.html` 同目录下的 `player/` 中：

```text
站点目录/
├── index.html
└── player/
    ├── music-player.esm.js
    └── modules/
        ├── player.js
        ├── lyrics.js
        ├── themes.js
        ├── visualizer.js
        ├── metadata.js
        └── chunks/          # 保留同次发布的全部分块及原文件名
```

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>音乐播放器</title>
</head>
<body>
  <script type="module">
    import MusicPlayer from './player/music-player.esm.js'
    import './player/modules/lyrics.js'
    import './player/modules/themes.js'

    const player = new MusicPlayer({
      language: 'zh',
      isMonitoring: false,
      attributes: {
        environment: 'production',
        mode: 'cloud',
        apiUrl: '/api/music/playlist',
        theme: 'xf-original-theme',
        isAutoPopup: true,
        autoplay: false
      }
    })
  </script>
</body>
</html>
```

通过 HTTPS 提供页面和模块。模块文件需返回 JavaScript MIME；跨域托管模块时配置 CORS。不要把缺失的 `.js` 请求重写成应用的 HTML 首页。

内联模块中的相对 URL 以页面的 base URL 为准（含 `<base>` 的影响）；将代码移入独立 `.js` 文件后，相对导入改为以该模块文件的 URL 为准，需同步调整路径。

这里使用资源 URL，而不是 npm 裸包名。普通 HTML 直接写 `import ... from 'xf-music-player'` 需要另行配置 import map；上面的相对 URL 示例无需 import map，也无需另外添加播放器标签。

## 5. 文件元数据按需解析

### 5.1 首次调用才加载解析器

仅在用户选择本地音频后解析时，从根入口引入：

```js
import { readAudioFile, readAudioMetadata } from 'xf-music-player'
```

首次调用其中任一函数时加载解析模块，并发调用共享加载过程；后续调用复用。正常加载方式和 API 用法保持不变，普通播放不下载元数据解析模块或备用模块。

### 5.2 将设备文件加入播放器

复用根入口的惰性解析 API；解析成功后创建本地歌单，销毁后释放音频与封面的临时 URL：

```ts
import MusicPlayer, { readAudioFile } from 'xf-music-player'
import 'xf-music-player/modules/lyrics'
import 'xf-music-player/modules/themes'

export async function createFilePlayer(file: File): Promise<MusicPlayer> {
  const loaded = await readAudioFile(file)

  try {
    return new MusicPlayer({
      language: 'zh',
      isMonitoring: false,
      attributes: {
        environment: 'production',
        mode: 'local',
        theme: 'xf-original-theme',
        playlist: [loaded.song],
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

在文件选择事件中取得 `input.files?.[0]`，确认有文件后，在 `try/catch` 中调用 `const player = await createFilePlayer(file)`，将错误交给业务界面提示。业务结束时执行 `await player.destroy()` 并处理错误，成功销毁会触发上面的资源释放。

如果已有播放器，先等待旧实例销毁，再调用本例；处理选文件期间禁用重复提交。建议固定在 `App.vue` 等稳定宿主使用。放在可卸载组件中时，应在上例 `await readAudioFile(file)` 之后、创建实例之前检查组件是否已经退出；退出时调用 `loaded.dispose()` 并结束处理。此示例只用于创建独立的文件播放器，不应与前面的云端示例同时运行。

### 5.3 独立静态解析入口

文件导入是页面主要功能、希望随页面加载解析入口时，选择独立静态入口：

```js
import {
  readAudioFile,
  readAudioMetadata
} from 'xf-music-player/modules/metadata'
```

两种方式选择一种即可。静态导入独立入口会将解析实现加入初始依赖图，具体格式解析器仍沿用内部的分块加载方式。这个独立入口保留原行为，不使用下述根入口的备用恢复。

| 方法 | 输入 | 返回值与资源处理 |
| --- | --- | --- |
| `readAudioMetadata(input)` | `File`、`Blob`、`ArrayBuffer` 或 `Uint8Array` | 返回 `format`、`common`、`native`、`quality`，不创建音频/封面 Blob URL |
| `readAudioFile(file)` | `File` | 返回 `{ song, metadata, dispose }`；`song` 可用于本地歌单 |

调用方需要捕获输入、网络和解析错误。使用 `readAudioFile` 返回的歌曲时，在播放器停止使用该资源后调用 `dispose()`；重复调用有效。不要刚设置歌单就释放 URL，也不要持久化 Blob URL 供下次打开页面使用。仅使用 Blob 歌单的实例建议设置 `rememberPlayback: false`。

解析成功不代表浏览器支持播放对应音频编码，分块加载失败不影响普通播放。通过根入口调用 `readAudioFile` / `readAudioMetadata` 时，如果解析模块或格式解析分块导入失败，本次调用仍返回拒绝的 Promise，并保留错误的 `cause`；业务应捕获并提示错误。

网络或资源恢复后，再显式调用同一 API，即可在当前页面尝试加载备用解析模块，无需先刷新页面。并发重试共享加载，成功后复用；播放器不会自动循环重试。无效文件和普通解析错误不触发备用模块下载，应先处理文件或解析错误。

如果备用模块本身也加载失败，调用仍返回错误。Chrome 可能缓存备用模块 URL 的失败，资源修复后同页重试仍失败时需手动刷新；不要依赖无限次同页恢复。普通脚本 IIFE 的原有行为不变。

## 6. 实例管理

同一份包共享功能注册状态和单个活跃播放器宿主，建议一个应用持有一个实例：

- 所需模块在实例创建前导入；不依赖运行中补挂、卸载或按实例隔离功能。
- 保留对实例的引用，在应用不再使用时调用 `destroy()` 并处理返回 Promise 的错误。
- 替换播放器时串行销毁、创建，避免多个路由争用同一宿主。
- 同页使用同一版本、同一份包，不重复引入 ESM 与普通脚本。
- 保持 `autoplay: false`，由用户点击播放；自动播放选项仍受浏览器策略影响。

## 7. 生产部署与更新

### npm 应用

保留完整 npm 发布包，让业务构建工具处理模块和动态导入，无需手工搬运播放器分块。部署业务构建工具生成的完整生产产物，而非仅上传应用入口 JS。保留应用输出的异步分块、资源相对路径和正确的部署 base 路径；不要人为裁剪播放器模块注册代码。

### 直接托管 ESM

将 `music-player.esm.js` 与完整 `modules/`（含 `modules/chunks/`）作为同一套资源发布，包括带哈希文件名的 `metadata-recovery-*.js` 备用解析模块。只复制入口文件会造成依赖或首次文件解析失败；不要根据首次打开页面的网络记录删除暂未请求的分块。

完整部署分块不等于浏览器一次下载全部分块，实际请求仍由导入关系和功能调用决定。分块归并到 `modules/chunks/` 仅调整产物路径，不改变按需加载行为，也不代表加载提速。

- **固定版本目录**：例如 `/assets/player/RELEASE/`，将 `RELEASE` 替换为实际发布标识。更新示例中的导入 URL 时，所有功能入口都指向同一发布目录。
- **先传资源，再切引用**：上传完整新版本，确认文件可访问后，再让页面引用该版本。
- **缓存策略**：发布目录若保证内容不再变化，可对其中资源使用长缓存；引用入口的 HTML 使用短缓存或重新验证。重复覆盖同一 URL 时不要使用永久缓存。
- **保留旧版本**：旧页面和旧应用分块仍可能请求原来的资源。保留旧版本整套目录，而不只是旧哈希分块；`modules/*.js` 本身是固定文件名。历史部署的 `esm-chunks/` 留给仍引用它的旧页面，新包不携带该旧目录。
- **回滚**：页面切回上一版本的整套资源引用；npm 应用切回上一版完整业务产物。避免旧入口、新模块和旧分块混用。

静态资源服务需配置正确的 MIME、CORS 和路径。配置 CSP 时，根据实际托管方式放行脚本、样式、音源、封面和歌单接口；本地文件播放与封面使用的 `blob:` URL 也需符合对应策略。

### 上线检查清单

- [ ] 使用确认包含上述入口的固定包版本或不可变发布目录；所有模块来自同次发布。
- [ ] npm 应用部署完整业务构建产物；直接托管 ESM 时保留完整 `modules/`，包括所有 `modules/chunks/` 文件。
- [ ] 在实际部署路径打开页面，入口和分块返回成功状态与 JavaScript MIME，没有被重写为 HTML。
- [ ] 普通播放、切歌、歌词及所选主题正常；可视化启用时检查音源 CORS。
- [ ] 如使用文件导入，实测首次解析及后续解析；捕获失败，并在停止使用后释放 Blob URL。
- [ ] SPA 路由切换后只有一个活跃播放器，卸载与重建顺序正确。
- [ ] 在实际 CSP 和缓存配置下验证；新资源先就绪，再切换页面引用。
- [ ] 保留上一版完整资源与历史分块，确认旧页面仍可使用，并准备整套版本回滚。

## 8. 旧接入迁移与常见问题

旧 ESM 接入若依赖默认标签自动挂载，迁移后应显式引入所需功能并调用 `new MusicPlayer()`。原来的 `MusicPlayer` 命名导出仍保留；实例 API 和模块子入口继续使用原有调用方式。普通脚本接入无需为此迁移。

| 现象 | 检查项 |
| --- | --- |
| 默认导出或模块子路径不存在 | 安装版本是否实际包含这些导出；页面及业务资源是否仍使用旧缓存 |
| 标签存在但播放器未显示 | ESM 页面是否显式创建实例，是否误以为导入就会自动挂载 |
| 歌词、主题或可视化未生效 | 是否导入对应模块；可视化是否同时开启配置；注册代码是否被裁剪 |
| 首次文件解析报分块加载错误 | 部署是否包含全部分块；资源是否返回正确 MIME；CORS、CSP及发布路径是否匹配 |
| 播放无声或被拦截 | 用户是否已点击播放；音源是否可访问、编码是否受支持；开启可视化时检查音源 CORS |
| 刷新后本地歌曲失效 | Blob URL 属于当前页面资源，重新选择本地文件后再生成 |
| 切换路由后出现重复创建或销毁冲突 | 是否固定在应用根组件持有实例；替换时是否等待销毁完成 |

更多配置与歌曲数据结构见[播放器接入说明](./README.md)。
