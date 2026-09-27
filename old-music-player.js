/**
 * 兼容旧版音乐播放器
 * 作者: 小枫
 * 邮箱: 1809185784@qq.com
 */
window.addEventListener('DOMContentLoaded', function () {
	var els = document.querySelectorAll('#xf-MusicPlayer')

	if (els.length === 0) {
		els = document.querySelectorAll('.xf-MusicPlayer')
	}

	if (els.length === 0) {
		console.warn('未找到音乐播放器标签元素/No music player found tab element')
		return
	}

	// 获取播放器元素
	var player = els[0]

	// 接口地址
	var base_api_url = 'https://music.api.xfyun.club/api/v1/music'
	// 脚本地址
	var scriptUrl = 'https://player.xfyun.club/js/music-player/music-player.min.js'
	// var scriptUrl = 'music-player.min.js'

	var existScript = document.querySelector('script[src="' + scriptUrl + '"]')

	if (existScript) {
		// 脚本已存在，直接执行初始化
		initPlayer()
	} else {
		var script = document.createElement('script')
		script.src = scriptUrl
		script.async = true

		script.onload = function () {
			initPlayer()
		}

		script.onerror = function () {
			console.error('播放器脚本加载失败，请检查路径：', scriptUrl)
		}

		document.body.appendChild(script)
	}

	// 初始化播放器
	function initPlayer () {
		// 旧版播放器属性
		var old_attr = {
			// 接口地址
			apiUrl: function () {
				var songChart = player.getAttribute('data-songChart')
				var userSongList = player.getAttribute('data-songList')

				if (userSongList) {
					return base_api_url + '/playlist-songs?platform=netease&playlistId=' + userSongList
				} else {
					var sortMap = {
						'热歌榜': '3778678',
						'飙升榜': '19723756',
						'原创榜': '2884035',
						'新歌榜': '3779629'
					}

					var topId = sortMap[songChart] || '3778678'
					return base_api_url + '/top?platform=netease&topId=' + topId
				}
			},
			// 是否自动淡出播放器
			isAutoPopup: player.hasAttribute('data-fadeOutAutoplay'),
			// 主题名称
			themeName: function () {
				var theme = player.getAttribute('data-themeColor')

				if (!theme) {
					return 'xf-original-theme'
				}

				switch (theme.trim()) {
					case 'xf-original': return 'xf-original-theme'
					case 'xf-sky': return 'xf-sky-theme'
					case 'xf-orange': return 'xf-orange-theme'
					case 'xf-darkGreen': return 'xf-dark-green-theme'
					case 'xf-wineRed': return 'xf-wine-theme'
					case 'xf-girlPink': return 'xf-pink-theme'
					case 'xf-dark': return 'xf-dark-theme'
					default: return 'xf-original-theme'
				}
			},
			// 是否随机播放
			random: player.hasAttribute('data-random'),
			// 距离底部距离
			bottomHeight: function () {
				var bottomHeight = player.getAttribute('data-bottomHeight')
				return bottomHeight || '2em'
			},
			// 记忆播放
			memory: function () {
				var memory = player.getAttribute('data-memory')

				if (!memory) {
					return true
				}

				return memory === 'true' || memory === '1'
			}
		}

		// 新版播放器属性
		var new_attr = {
			// 云端音乐
			'mode': 'cloud',
			'apiUrl': old_attr.apiUrl(),
			'isAutoPopup': old_attr.isAutoPopup,
			'autoplay': old_attr.isAutoPopup,
			'theme': old_attr.themeName(),
			'playMode': old_attr.random ? 'random' : 'order',
			'bottom': old_attr.bottomHeight(),
			// 记忆 key
			'memoryKey': 'xf-music-player',
			'rememberPlayback': old_attr.memory(),
		}

		new window.XfMusicPlayer.MusicPlayer({
			// 判断用户浏览器语言
			language: function () {
				var lang = navigator.language || navigator.userLanguage
				if (lang.indexOf('zh') !== -1) {
					return 'zh'
				}
				return 'en'
			}(),
			attributes: new_attr,
			hooks: {
				beforeRender () {
					console.log(
						'%c旧版播放器提示%c\n请尽快升级到新版播放器，获取更稳定的使用体验\n升级地址: https://musicplayer.xfyun.club',
						'color: #ffd500; font-size: 14px; font-weight: 700; text-shadow: 0 0 8px rgba(229, 255, 0, .5);',
						'color: #c9be85; font-size: 13px; line-height: 1.6;'
					)
				}
			}
		})

		player.remove()
	}
})
