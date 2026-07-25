// 检测用户是否是ie浏览器
function isIEBrowser() {
    var ua = window.navigator.userAgent

    var msie = ua.indexOf('MSIE ')
    if (msie > 0) {
        return true
    }

    var trident = ua.indexOf('Trident/')
    if (trident > 0) {
        return true
    }

    var edge = ua.indexOf('Edge/')
    if (edge > 0) {
        return false
    }

    return false
}

// 检测用户的浏览器是否支持箭头函数
function isArrowFunctionSupported() {
    try {
        var arrowFunction = function () { }
        return typeof arrowFunction === 'function'
    } catch (error) {
        return false
    }
}

function downloadNewBrowser() {
    alert('您的浏览器版本过低, 请升级您的浏览器版本!')
    window.location.href = 'https://support.dmeng.net/upgrade-your-browser.html?referrer=' + encodeURIComponent(window.location.href)
}

isIEBrowser() ? downloadNewBrowser() : !isArrowFunctionSupported() ? downloadNewBrowser() : ''