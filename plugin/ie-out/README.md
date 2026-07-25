# ie-out 兼容模式插件

`ie-out` 用于在不支持播放器运行环境的浏览器中提前拦截访问。它使用 ES5 语法实现，适合在新版和旧版浏览器中直接执行。

## 支持检测

插件会检测以下情况：

- Internet Explorer 全部版本。
- Edge Legacy。
- 缺少 `customElements`、`HTMLElement`、Shadow DOM。
- 缺少 `Promise`、`Symbol`、`Object.assign`。
- 缺少 `HTMLAudioElement`。

如果检测不通过，会直接跳转到：

```txt
https://support.dmeng.net/upgrade-your-browser.html?referrer=当前页面地址
```

## 引入方式

建议放在播放器主包之前，避免旧浏览器继续加载播放器文件：

```html
<script src="/plugin/ie-out/index.js"></script>
<script src="/music-player.min.js"></script>
```

如果部署在官网静态目录中，对应路径为：

```html
<script src="/player/plugin/ie-out/index.js"></script>
<script src="/player/music-player.min.js"></script>
```

## 注意事项

- 该插件只负责兼容检测和跳转，不会为旧浏览器注入 polyfill。
- 新版播放器依赖 Lit、Web Components 和 HTML5 Audio，不建议尝试兼容 IE。
- 如果业务需要继续使用旧版播放器，请使用旧版源码目录 `xf-MusicPlayer-master` 或兼容产物 `old-music-player.min.js`。
