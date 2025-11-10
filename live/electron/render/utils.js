/**
 * boolean: 'true' -> true
 * number: '1' -> 1
 * string: '1.1' -> '1.1'
 * string: 'hello' -> 'hello'
 */
function parseBooleanNumberString(strInUri) {
    let decodedValue = decodeURIComponent(strInUri || '');
    // boolean
    if (decodedValue === 'true' || decodedValue === 'false') {
        return decodedValue === 'true';
    }
    // number (整数才算)
    if (
        typeof decodedValue === 'string' &&
        !isNaN(Number(decodedValue)) &&
        Number(decodedValue) !== undefined &&
        !decodedValue?.includes?.('.')
    ) {
        return Number(decodedValue);
    }
    // string
    return decodedValue;
}

/**
 * "a=%26&b=1" ——> { a: '&', b: 1 }
 */
export function paramsStringToObject(urlParamsStr) {
    if (!urlParamsStr) {
        return {};
    }

    const result = {};
    if (urlParamsStr.includes('&')) {
        urlParamsStr.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            result[key] = parseBooleanNumberString(value);
        });
    } else {
        const [key, value] = urlParamsStr.split('=');
        result[key] = parseBooleanNumberString(value);
    }
    return result;
}

/**
 * { a: '&', b: 1 } ——> "a=%26&b=1"
 */
export function paramsObjectToString(params, encode) {
    var keys = Object.keys(params).sort();
    var res = [];
    for (var key of keys) {
        res.push(key + '=' + (encode ? encodeURIComponent(params[key]) : params[key]));
    }
    var query = res.join('&');
    return query;
}

/**
 * ('text', 'key') --> '809368806F4F660809368806F4F6608'
 */
export function hmacSHA1(encryptText, encryptKey) {
    return CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA1(encryptText, encryptKey)).toUpperCase();
}

/**
 * @template {Record<string, any>} T - 源对象的类型
 * @template {keyof T} K - 要选取的属性键的联合类型
 * @param {T} obj - 源对象
 * @param {K[]} keys - 要选取的属性键数组
 * @returns {Pick<T, K>} 包含指定属性的新对象
 */
export function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * @template {Record<string, any>} T - 源对象的类型
 * @template {keyof T} K - 要排除的属性键的联合类型
 * @param {T} obj - 源对象
 * @param {K[]} keys - 要排除的属性键数组
 * @returns {Omit<T, K>} 排除指定属性后的新对象
 */
export function omit(obj, keys) {
    const result = {};
    const keysSet = new Set(keys);
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !keysSet.has(key)) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * 1759053600 --> '2025/09/28 18:00:00'
 */
export function formatTimestamp(timestamp) {
    if (!timestamp || timestamp <= 0) {
        return '无效时间';
    }
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

export function getElectronRemote() {
    let _remote = undefined;
    try {
        _remote = window.require('electron').remote;
        if (!_remote) {
            _remote = window.require('@electron/remote');
        }
    } catch (e) {
        console.error(e);
    }
    return _remote;
}
