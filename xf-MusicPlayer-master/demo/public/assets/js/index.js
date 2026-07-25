new Vue({
    el: '#app',
    data() {
        return {
            sponsor: [],
            allSet: {
                themes: [
                    { msg: '默认主题', attr: 'xf-original' },
                    { msg: '天空', attr: 'xf-sky' },
                    { msg: '橙子', attr: 'xf-orange' },
                    { msg: '墨绿', attr: 'xf-darkGreen' },
                    { msg: '酒红', attr: 'xf-wineRed' },
                    { msg: '少女粉', attr: 'xf-girlPink' }
                ],
                ck: [
                    { id: 1, title: '自动弹出', msg: '开启后播放器自动淡出', checked: false, data: 'data-fadeOutAutoplay' },
                    { id: 2, title: '记忆播放', msg: '开启后将实现记忆播放功能，请勿和随机歌榜, 随机音乐使用', checked: false, data: 'data-memory="1"' },
                    { id: 3, title: '随机播放', msg: '开启后播放器会随机播放一首歌', checked: false, data: 'data-random="true"' },
                    { id: 4, title: '樱花代码', msg: '开启后网页会添加段樱花代码', checked: false, data: '<script src="https://player.xfyun.club/js/yinghua.js"></script>' }
                ],
            },
            wy: {
                songList: [
                    { msg: '热歌榜' },
                    { msg: '新歌榜' },
                    { msg: '飙升榜' },
                    { msg: '原创榜' }
                ],
                wySet: [
                    { id: 1, title: '歌词显示', msg: '开启后播放器会显示歌曲的歌词', checked: true, data: '1' },
                    { id: 2, title: '随机歌榜音乐', msg: '开启后播放器会随机切换歌榜的音乐', checked: false, data: 'data-randomSongList="1"' }
                ]
            },
            Info: {
                theme: '',
                playerHeight: '',
                songList: '',
                songId: ''
            },
            config: '<div id="xf-MusicPlayer" data-cdnName="https://player.xfyun.club/js"></div>\n<script src="https://player.xfyun.club/js/xf-MusicPlayer/js/xf-MusicPlayer.min.js"></script>',
        }
    },
    computed: {
        year() {
            const currentYear = new Date().getFullYear()
            return currentYear < 2023 ? '2023' : currentYear
        }
    },
    methods: {
        async copyCode() {
            try {
                await navigator.clipboard.writeText(this.config)
                swal('复制成功', '', 'success')
            } catch (err) {
                swal({
                    title: '复制失败',
                    icon: 'error',
                    dangerMode: true,
                })
            }
        },
        form() {
            // 主题 高度 歌榜 id
            const { theme, playerHeight, songList, songId } = this.Info

            // 切换
            const handover = (attr, val) => {
                if (val) {
                    return `${attr}="${val}"`
                }
                return ''
            }

            // 全局
            let arr1 = []
            let cherry = ''
            this.allSet.ck.forEach(item => {
                const { id, checked, data } = item
                console.log(data)
                if (id !== 4 && checked) {
                    arr1.push(data)
                } else if (id === 4 && checked) {
                    cherry = data
                } else {
                    return 
                }
            })

            // 网易
            let arr2 = []
            this.wy.wySet.forEach(item => {
                let { id, checked, data } = item

                // 检测是否显示歌词
                if (id === 1 && !checked) {
                    data = 'data-lyrics="0"'
                    arr2.push(data)
                }

                if (checked) {
                    if (id === 1) {
                        data = ''
                    }
                    arr2.push(data)
                }
                return
            })

            const res = handover('data-themeColor', theme) + handover(' data-bottomHeight', playerHeight) + handover(' data-songChart', songList) + handover(' data-songList', songId) + arr1.join(' ') + arr2.join(' ')

            this.config = `<div id="xf-MusicPlayer" data-cdnName="https://player.xfyun.club/js"  ${res}></div>\n<script src="https://player.xfyun.club/js/xf-MusicPlayer/js/xf-MusicPlayer.min.js"></script>\n${cherry}`
        },
        postUrl() {
            fetch('/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: this.config })
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP错误: ${res.status}`)
                    }
                    return res.json()
                })
                .then(data => location.reload())
                .catch(err => console.error(`请求失败: ${err}`))
        },
        run() {
            swal({
                title: '确定要测试代码么?',
                text: '那样可能会导致你刚才的配置失效, 建议复制代码后再测试效果!',
                icon: 'warning',
                buttons: ['取消', '确定']
            })
                .then(result => {
                    if (result) {
                        this.postUrl()
                        location.reload()
                    } else {
                        return
                    }
                })
                .catch(err => console.error(`请求失败: ${err}`))
        },
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]
            }
            return array
        }
    },
    mounted() {
        // 初始化bs工具提示
        const tooltip = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipTriggerList = [].slice.call(tooltip)
        tooltipTriggerList.map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })

        const arr = [
            { link: 'http://idc.tax/', text: '稳定云服务器', bg: 'primary' },
            { link: 'http://idc.52xk.top', text: '星空云', bg: 'success' },
            { link: 'https://copilot.maojiucloud.cn', text: 'Github Copilot激活工具', bg: 'info' },
            { link: 'https://login.xiaoying.love', text: '小樱云端', bg: 'warning' },
            { link: 'https://g.9o3.cn', text: '源官网', bg: 'danger' }
        ]
        
        this.sponsor = this.shuffleArray(arr)
    }
})