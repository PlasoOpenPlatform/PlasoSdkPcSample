const BASE_URL = 'https://dev.plaso.cn/docdemoapi/api';
// http://120.55.3.51:3000/

class ResourceCenterApiService {
    constructor() {
        this.baseURL = BASE_URL;
    }

    async _request(url, options = {}) {
        return fetch(
            `${this.baseURL}${url}`, //
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                ...options,
            },
        ).then((res) => res.json());
    }

    /** 文件列表 */
    async getFileList(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/files/list?${queryString}` : '/files/list';
        return this._request(url);
    }

    /** 单个文件信息 */
    async getFileInfo(fileId) {
        return this._request(`/files/${fileId}`);
    }

    /** 获取统计信息 */
    async getStats() {
        return this._request('/files/stats');
    }

    /** 获取任务状态 */
    async getTaskStatus(taskId, sync = false) {
        const params = new URLSearchParams({ sync: sync.toString() });
        return this._request(`/status/task/${taskId}?${params}`);
    }

    /** 获取文件状态 */
    async getFileStatus(fileId) {
        return this._request(`/status/file/${fileId}`);
    }

    /** 批量获取状态 */
    async getBatchStatus(fileIds = [], taskIds = []) {
        return this._request('/status/batch', {
            method: 'POST',
            body: JSON.stringify({ fileIds, taskIds }),
        });
    }

    async getParsedUrl(fileId, suffix) {
        return this._request(`/files/${fileId}/parsed-url?suffix=${suffix}`);
    }

    /** 上传文件 */
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    onProgress?.(percent);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        reject(new Error('响应解析失败'));
                    }
                } else {
                    reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
                }
            });
            xhr.addEventListener('error', () => {
                reject(new Error('网络错误'));
            });
            xhr.open('POST', `${this.baseURL}/files/upload`);
            xhr.send(formData);
        });
    }
}

export default new ResourceCenterApiService();
