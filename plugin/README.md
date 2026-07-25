# 小枫音乐播放器扩展插件

`public/plugin` 下的文件会在构建时复制到 `dist/plugin`，可按需通过 `<script>` 标签独立引入。

## 兼容模式插件

用于在 IE、Edge Legacy 或缺少 Web Components / HTML5 Audio 等关键能力的浏览器中提示升级。建议放在播放器主包之前：

```html
<script src="/plugin/ie-out/index.js"></script>
<script src="/music-player.min.js"></script>
```

触发兼容检测后会直接跳转到浏览器升级页。

## 樱花漂浮插件

用于给页面增加樱花漂浮效果。该插件独立于播放器运行：

```html
<script src="/plugin/sakura/sakura.min.js"></script>
```

如果页面同时使用播放器，推荐在播放器主包之后引入：

```html
<script src="/music-player.min.js"></script>
<script src="/plugin/sakura/sakura.min.js"></script>
```
