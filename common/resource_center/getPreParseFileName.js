import resourceCenterApiService from './api.js';
import { INFO_TYPE } from './constants.js';

export async function getPreParseFileName(info, { suffix }) {
    const data = info[1];
    if (info[0] == INFO_TYPE.PARSED) {
        const res = await resourceCenterApiService.getParsedUrl(data.id, `_i${suffix}`);
        if (res.success) {
            return res.url;
        }
    }
}
