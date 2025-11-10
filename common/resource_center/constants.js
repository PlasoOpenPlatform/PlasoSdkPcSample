/**
 * 假设 Info 数组的格式这么约定
 * @typedef {['url', string]} DirectUrlInfo 直接使用 url 路径的资源
 * @typedef {['struct', { host: string, path: string, fileName: string }]} StructInfo 结构化路径的资源
 * @typedef {['parsed', { id: string }]} ParsedInfo 预解析的资源
 * @typedef {DirectUrlInfo | StructInfo | ParsedInfo} Info
 */

/**
 * 资源类型，可自行定义
 */
export const INFO_TYPE = {
    DIRECT_URL: 'url',
    STRUCT: 'struct',
    PARSED: 'parsed',
};

export const FILE_TYPE = {
    PPT: 1,
    IMAGE: 2,
    PDF: 3,
    WORD: 4,
    EXCEL: 5,
    AUDIO: 6,
    VIDEO: 7,
    YKD: 8,
    DOC: 14,
    XLS: 15,
    UPIME: 16,
    NPPT: 17,
    ISPRINGPPT: 21,
    PREPARE_LESSONS: 22,
};
