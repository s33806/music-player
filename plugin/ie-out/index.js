(function (window, document) {
  'use strict';

  var UPGRADE_URL = 'https://support.dmeng.net/upgrade-your-browser.html?referrer=';
  var userAgent = window.navigator && window.navigator.userAgent ? window.navigator.userAgent : '';

  /**
   * 判断当前地址是否已经是升级提示页，避免旧浏览器进入无限跳转。
   *
   * @returns {boolean} 已经位于升级提示页时返回 true。
   */
  function isUpgradePage() {
    var href = '';

    try {
      href = window.location && window.location.href ? String(window.location.href) : '';
    } catch (error) {
      href = '';
    }

    return href.indexOf('support.dmeng.net/upgrade-your-browser.html') !== -1;
  }

  /**
   * 安全创建测试元素。部分极旧环境可能不支持 createElement，统一兜底为 null。
   *
   * @returns {HTMLElement|null} 测试元素。
   */
  function createProbeElement() {
    try {
      return document && document.createElement ? document.createElement('div') : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 判断是否为明确不支持的旧浏览器。
   *
   * @returns {boolean} 当前浏览器属于 IE 或旧 Edge Legacy 时返回 true。
   */
  function isLegacyBrowser() {
    return Boolean(
      document.documentMode ||
      /MSIE\s|Trident\//.test(userAgent) ||
      /Edge\/\d+/i.test(userAgent)
    );
  }

  /**
   * 检测播放器运行所需的现代 Web 能力。
   *
   * @returns {boolean} 缺失任一关键能力时返回 true。
   */
  function isMissingRequiredFeature() {
    var probeElement = createProbeElement();

    return Boolean(
      !window.customElements ||
      !window.HTMLElement ||
      !window.Promise ||
      !window.Symbol ||
      !window.Object ||
      typeof window.Object.assign !== 'function' ||
      !window.HTMLAudioElement ||
      !probeElement ||
      typeof probeElement.attachShadow !== 'function'
    );
  }

  /**
   * 跳转到浏览器升级提示页。
   */
  function redirectToUpgradePage() {
    var currentUrl = '';
    var targetUrl = '';

    if (isUpgradePage()) return;

    try {
      currentUrl = window.location && window.location.href ? String(window.location.href) : '';
    } catch (error) {
      currentUrl = '';
    }

    targetUrl = UPGRADE_URL + encodeURIComponent(currentUrl);

    try {
      if (window.location && typeof window.location.replace === 'function') {
        window.location.replace(targetUrl);
      } else if (window.location) {
        window.location.href = targetUrl;
      }
    } catch (error) {
      try {
        window.location = targetUrl;
      } catch (ignoredError) {}
    }
  }

  if (isLegacyBrowser() || isMissingRequiredFeature()) {
    redirectToUpgradePage();
  }
})(window, document);
