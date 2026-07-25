const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, './views'))

app.use(cookieParser())
app.use(express.static(path.resolve(__dirname, './public')))
app.use(bodyParser.json())

const port = 3000

app.post('/config', (req, res) => {
    const data = req.body

    // 判断返回的对象是否为空
    if (JSON.stringify(data) === '{}') {
        return res.json({
            code: 400,
            msg: '提交失败',
            data: null
        })
    }

    // 写入cookie
    res.cookie('code', decodeURIComponent(data.code), { maxAge: 60 * 100 })

    res.json({
        code: 200,
        msg: '获取成功',
        data: data
    })
})

app.get('/', (req, res) => {
    const code = req.cookies['code'] ? decodeURIComponent(req.cookies['code']) : '<div id="xf-MusicPlayer" data-cdnName="https://player.xfyun.club/js"></div><script src="https://player.xfyun.club/js/xf-MusicPlayer/js/xf-MusicPlayer.min.js"></script>'
    res.render('index', { data: code })
})

app.listen(port, () => console.log(`服务启动中... ${port}!`))