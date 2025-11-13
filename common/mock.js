const SDK_VERSION = '1.60.116';

/* ---------------------------------- live ---------------------------------- */
export const mockLiveSdkUrl = () => {
    return `https://wwwr.plaso.cn/static/sdk/js/plaso_style_upime-${SDK_VERSION}.js`;
};

export const mockChangeEnv = () => {
    /** 内部调试用，请忽略 */
    return;
};

export const mockLiveElectronClassOptions = () => {
    /** 内部调试用，请忽略 */
    return {};
};

/* --------------------------- live - 生成 query 参数 --------------------------- */
export const mockLiveQuery = async (meetingId) => {
    /** 向服务端拿进课堂参数 */
    return '';
};

export const mockLiveElectronQuery = async (meetingId) => {
    /** 向服务端拿进课堂参数 */
    return '';
};

export const mockCloudRecorderQuery = async (meetingId) => {
    /** 向服务端拿进课堂参数 */
    return '';
};

export const mockMonitorQuery = async (meetingId) => {
    /** 向服务端拿进课堂参数 */
    return '';
};

export const mockLiveQueryComponents = () => {
    /** 内部调试用，请忽略 */
    return null;
};

/* --------------------------------- player --------------------------------- */
export const mockPlayerSdkJsUrl = () => {
    return `https://wwwr.plaso.cn/static/sdk/js/plaso_upime_player-${SDK_VERSION}.js`;
};

export const mockPlayerSdkCssUrl = () => {
    return `https://wwwr.plaso.cn/static/sdk/css/plaso_upime_player-${SDK_VERSION}.css`;
};

export const mockPlayerSdkHlsUrl = () => {
    return 'https://wwwr.plaso.cn/static/sdk/js/hls.js';
};

export const mockPlayerQuery = async (recordId) => {
    /** 向服务端拿签名后的播放器参数 */
    return '';
};
