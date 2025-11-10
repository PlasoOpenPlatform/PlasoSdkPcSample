import { INFO_TYPE } from './constants.js';

export function getExtFileName(info) {
    const data = info[1];
    switch (info[0]) {
        case INFO_TYPE.DIRECT_URL:
            return Promise.resolve(data);
        case INFO_TYPE.STRUCT:
            return Promise.resolve(data.host + data.path + data.fileName);
    }
}
