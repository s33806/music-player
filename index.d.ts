/** 播放器支持的界面语言。 */
export type LocaleType = 'zh' | 'en'

/** 播放器支持的数据源模式。 */
export type MusicPlayerMode = 'cloud' | 'local'

/** 播放器支持的运行环境。 */
export type MusicPlayerEnvironment = 'development' | 'production' | 'test'

/** 播放顺序：顺序播放、单曲循环或随机播放。 */
export type MusicPlayMode = 'order' | 'single' | 'random'

/** 已解析的单行歌词。 */
export interface LyricItem {
	text: string
	time: string
	timeValue?: number
	isColorful?: boolean
	color?: string
	isDynamic?: boolean
}

/** 播放器可识别的歌曲信息。 */
export interface SongInfo {
	id: string | number
	title: string
	artist?: string
	album?: string
	cover?: string
	/** blob URL 或不带后缀地址的格式提示。 */
	format?: string
	src?: string | null
	duration?: number
	lyrics?: string | LyricItem[]
	lyricsUrl?: string | null
	lyrics_url?: string | null
}

/** 自定义音频数据接口的调用上下文。 */
export interface MusicAudioProviderContext {
	environment: MusicPlayerEnvironment
	playerConfig: MusicPlayerAttributes
	signal?: AbortSignal
}

/** 统一云端接口响应结构。 */
export interface MusicApiResponse<T> {
	code: number
	msg?: string
	data: T | null
}

/** 自定义音频接口支持的歌单包装格式。 */
export type MusicSongListPayload =
	| SongInfo[]
	| { list: SongInfo[] }
	| { playlist: SongInfo[] }
	| { songs: SongInfo[] }

/** 自定义音频数据提供器，可同步或异步返回歌单。 */
export type MusicAudioProvider = (
	context: MusicAudioProviderContext
) =>
	| MusicSongListPayload
	| MusicApiResponse<MusicSongListPayload>
	| Promise<MusicSongListPayload | MusicApiResponse<MusicSongListPayload>>

/** 播放器可通过 JavaScript 设置的完整配置。 */
export interface MusicPlayerAttributes {
	theme?: string
	customThemeName?: string
	customThemeStyle?: string
	playerWidth?: string
	fontName?: string
	bottom?: string
	songListHeight?: string
	visibleSongListCount?: number
	isAutoPopup?: boolean
	isAutoPlaylist?: boolean
	colorfulLyric?: boolean
	audioVisualizer?: boolean
	lazyLoadTimer?: number
	lazyLoadAnimationUrl?: string
	mode?: MusicPlayerMode
	apiUrl?: string
	environment?: MusicPlayerEnvironment
	rememberPlayback?: boolean
	memoryKey?: string
	autoplay?: boolean
	playMode?: MusicPlayMode
	volume?: number
	playlist?: SongInfo[]
	audioProvider?: MusicAudioProvider
}

/**
 * 播放器自定义元素公开属性。
 * HTML 字符串属性会由 Lit 转换为对应的运行时配置；复杂的 playlist 和 audioProvider
 * 推荐通过 `new MusicPlayer({ attributes })` 传入。
 */
export interface MusicPlayerElement extends HTMLElement {
	/** 是否启用交互式 Canvas 音频波形进度条，默认关闭。 */
	audioVisualizer?: boolean | string
}

/** Lit 更新阶段传递的属性变更集合。 */
export type MusicPlayerPropertyChanges = ReadonlyMap<PropertyKey, unknown>

/** 播放器生命周期钩子。 */
export interface MusicPlayerHooks {
	beforeRender?: (element: HTMLElement) => void
	afterRender?: (element: HTMLElement) => void
	beforeUpdate?: (element: HTMLElement, changedProperties: MusicPlayerPropertyChanges) => void
	afterUpdate?: (element: HTMLElement, changedProperties: MusicPlayerPropertyChanges) => void
	beforeDestroy?: (element: HTMLElement) => void
	afterDestroy?: () => void
}

/** 创建播放器控制器时可传入的选项。 */
export interface CreateMusicPlayerOptions {
	tagName?: string
	language?: LocaleType
	isMonitoring?: boolean
	attributes?: MusicPlayerAttributes
	mountElement?: HTMLElement
	manualMount?: boolean
	hooks?: MusicPlayerHooks
}

/** 销毁播放器时可传入的选项。 */
export interface DestroyMusicPlayerOptions {
	tagName?: string
	timer?: number
	beforeDestroy?: (element: HTMLElement | null) => void | Promise<void>
	afterDestroy?: () => void
}

/** 播放器运行时状态。 */
export interface MusicPlaybackState {
	playlist: SongInfo[]
	currentIndex: number
	currentTime: number
	duration: number
	buffered: number
	volume: number
	muted: boolean
	isPlaying: boolean
	isLoading: boolean
	error?: string
	playMode: MusicPlayMode
	showLyrics: boolean
	lyricsManuallyHidden: boolean
	activeLyricIndex: number
}

/** 对外提供的 Store 快照。 */
export interface MusicPlayerStoreState {
	tagName: string
	language: LocaleType
	playerConfig: MusicPlayerAttributes
	playback: MusicPlaybackState
}

/** 对外提供的播放器 Store 读取与订阅接口。 */
export interface MusicPlayerStoreApi {
	getState(): MusicPlayerStoreState
	subscribe(listener: (state: MusicPlayerStoreState, previousState: MusicPlayerStoreState) => void): () => void
}

/**
 * 小枫音乐播放器控制器。
 *
 * 构造后默认在微任务中挂载播放器；设置 manualMount 后可调用 mount() 手动挂载。
 */
export declare class MusicPlayer {
	/** 内置主题名称列表。 */
	ThemeArray: string[]
	/** 播放器 Store，可读取状态或订阅变化。 */
	configState: MusicPlayerStoreApi

	constructor(options?: CreateMusicPlayerOptions)

	/** 当前播放器使用的自定义元素标签名。 */
	get TagName(): string
	/** 当前已挂载的播放器宿主元素。 */
	get PlayerElement(): HTMLElement | null
	/** 当前播放器配置快照。 */
	get playerConfig(): MusicPlayerAttributes

	/** 注册首次渲染前钩子。 */
	beforeRender(callback: NonNullable<MusicPlayerHooks['beforeRender']>): this
	/** 注册首次渲染完成钩子。 */
	afterRender(callback: NonNullable<MusicPlayerHooks['afterRender']>): this
	/** 注册每次更新前钩子。 */
	beforeUpdate(callback: NonNullable<MusicPlayerHooks['beforeUpdate']>): this
	/** 注册每次更新完成钩子。 */
	afterUpdate(callback: NonNullable<MusicPlayerHooks['afterUpdate']>): this
	/** 注册销毁前钩子。 */
	beforeDestroy(callback: NonNullable<MusicPlayerHooks['beforeDestroy']>): this
	/** 注册销毁完成钩子。 */
	afterDestroy(callback: NonNullable<MusicPlayerHooks['afterDestroy']>): this

	/** 将播放器挂载到指定容器。 */
	mount(mountElement?: HTMLElement): this
	/** 主动请求播放器重新渲染。 */
	update(): this
	/** 播放当前歌曲。 */
	play(): this
	/** 暂停当前歌曲。 */
	pause(): this
	/** 切换播放与暂停状态。 */
	toggle(): this
	/** 停止播放并重置当前进度。 */
	stop(): this
	/** 切换到上一首歌曲。 */
	prev(): this
	/** 切换到下一首歌曲。 */
	next(): this
	/** 选择指定索引的歌曲。 */
	select(index: number): this
	/** 跳转到指定播放秒数。 */
	seek(seconds: number): this
	/** 设置 0 至 1 之间的播放音量。 */
	setVolume(volume: number): this
	/** 设置或取消静音。 */
	mute(muted?: boolean): this
	/** 设置播放模式。 */
	setPlayMode(mode: MusicPlayMode): this
	/** 替换歌单并选择指定歌曲。 */
	setPlaylist(playlist: SongInfo[], currentIndex?: number): this
	/** 局部更新播放器配置。 */
	setConfig(config: Partial<MusicPlayerAttributes>): this
	/** 销毁播放器并释放监听器和音频资源。 */
	destroy(options?: DestroyMusicPlayerOptions): Promise<void>
}

declare global {
	interface HTMLElementTagNameMap {
		'xf-music-player': MusicPlayerElement
	}
}

/** 音频基础信息、统一标签、原始标签、封面字节及解析警告。 */
export type AudioMetadata = import('music-metadata').IAudioMetadata
export interface AudioFileResult {
	song: SongInfo
	metadata: AudioMetadata
	/** 停止使用歌曲并卸载播放器后调用，幂等释放音频和封面 URL。 */
	dispose(): void
}
export function readAudioMetadata(input: Blob | Uint8Array | ArrayBuffer): Promise<AudioMetadata>
export function readAudioFile(file: File): Promise<AudioFileResult>
