# sakura 樱花漂浮插件

`sakura` 是一个独立页面特效插件，会在页面上创建固定定位的 canvas 并渲染樱花漂浮效果。

## 引入方式

生产环境推荐使用压缩版：

```html
<script src="/plugin/sakura/sakura.min.js"></script>
```

如果部署在官网静态目录中，对应路径为：

```html
<script src="/player/plugin/sakura/sakura.min.js"></script>
```

## 与播放器一起使用

樱花插件不依赖播放器，可以单独使用；如果同页加载播放器，建议放在播放器主包之后：

```html
<script src="/music-player.min.js"></script>
<script src="/plugin/sakura/sakura.min.js"></script>

<xf-music-player
  language="zh"
  theme="xf-original-theme"
  mode="cloud"
  api-url="/api/v1/music/top?platform=netease&topId=3778678"
></xf-music-player>
```

## 注意事项

- 插件会创建 `#canvas_sakura` 元素，避免业务页面复用同名 ID。
- canvas 使用 `pointer-events: none`，不会拦截播放器或页面点击。
- 监听 `resize` 事件，不覆盖页面已有的 `window.onresize`。
- 如果页面性能预算较紧，建议只在活动页、节日主题或装饰性页面开启。
