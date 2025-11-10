import { useEffect, useState } from 'preact/hooks';
import { html } from '../utils.js';
import resourceCenterApiService from './api.js';
import { FILE_TYPE, INFO_TYPE } from './constants.js';

export const ParsedResourcesTab = ({ onSelect }) => {
    /* ---------------------------------- list ---------------------------------- */
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchList = async () => {
        try {
            setLoading(true);
            const res = await resourceCenterApiService.getFileList({ limit: 50 });
            if (res.success) {
                setList(res.data.files || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const onRefreshClick = () => {
        fetchList();
    };

    /* --------------------------------- upload --------------------------------- */
    const onUploadSuccess = (result) => {
        alert(`文件 "${result.fileName}" 上传成功，正在解析中...`);
        fetchList();
    };

    const onUploadError = (error) => {
        alert(`文件上传失败: ${error.message || error}`);
    };

    /* --------------------------------- render --------------------------------- */
    const renderListItem = (item) => {
        const statusColor =
            {
                uploaded: '#1890ff',
                parsing: '#fa8c16',
                completed: '#52c41a',
                failed: '#ff4d4f',
            }[item.status] || '#666';

        const statusText =
            {
                uploaded: '已上传',
                parsing: '解析中',
                completed: '已完成',
                failed: '失败',
            }[item.status] || item.status;

        const onClick = () => {
            if (item.status !== 'completed') {
                return;
            }
            const fileExtName = item.originalName.split('.').pop().toLowerCase();
            switch (fileExtName) {
                case 'ppt':
                case 'pptx':
                    onSelect({
                        type: FILE_TYPE.ISPRINGPPT,
                        title: item.originalName,
                        info: [INFO_TYPE.PARSED, { id: item.id }],
                    });
                    break;
                case 'doc':
                case 'docx':
                    onSelect({
                        type: FILE_TYPE.DOC,
                        title: item.originalName,
                        info: [INFO_TYPE.PARSED, { id: item.id }],
                        totalPages: item.convertPages,
                    });
                    break;
                case 'xls':
                case 'xlsx':
                    onSelect({
                        type: FILE_TYPE.XLS,
                        title: item.originalName,
                        info: [INFO_TYPE.PARSED, { id: item.id }],
                        totalPages: item.convertPages,
                    });
                    break;
                case 'pdf':
                    onSelect({
                        type: FILE_TYPE.PDF,
                        title: item.originalName,
                        info: [INFO_TYPE.PARSED, { id: item.id }],
                        totalPages: item.convertPages,
                    });
                    break;
            }
        };

        const description = item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : '';

        return html`
            <div data-dataType="fileData" class="rc__item rc__item--parsed" onClick=${onClick}>
                <div class="rc__item-name">${item.originalName}</div>
                <div class="rc__item-status" style=${{ color: statusColor }}>${statusText}</div>
                <div class="rc__item-description">${description}</div>
            </div>
        `;
    };

    return html`
        <div class="rc__tab-content">
            <div class="rc__upload-section">
                <${FileUploader} onUploadSuccess=${onUploadSuccess} onUploadError=${onUploadError} />
                <div class="rc__refresh-section">
                    <button class="rc__refresh-btn" onClick=${onRefreshClick} disabled=${loading}>
                        ${loading ? '刷新中...' : '🔄 刷新列表'}
                    </button>
                </div>
            </div>
            <div class="rc__list">${list.map(renderListItem)}</div>
        </div>
    `;
};

/**
 * @param {Object} props
 * @param {(result: any) => void} props.onUploadSuccess
 * @param {(error: { message: string }) => void} props.onUploadError
 */
function FileUploader({ onUploadSuccess, onUploadError }) {
    const SUPPORTED_FILE_TYPES = ['.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.pdf'];
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    async function onFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        event.target.value = '';

        if (!SUPPORTED_FILE_TYPES.includes('.' + file.name.split('.').pop().toLowerCase())) {
            onUploadError?.({ message: `不支持的文件类型。支持的类型: ${SUPPORTED_FILE_TYPES.join(', ')}` });
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            onUploadError?.({ message: `文件大小不能超过 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB` });
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const result = await resourceCenterApiService.uploadFile(file, (percent) => {
                setProgress(percent);
            });
            if (result.success) {
                onUploadSuccess?.(result.data);
            } else {
                onUploadError?.({ message: result.message || '上传失败' });
            }
        } catch (error) {
            onUploadError?.(error);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }

    return html`
        <div class="rc__upload-area ${uploading ? 'rc__upload-area--uploading' : ''}">
            ${uploading
                ? html`
                      <div class="rc__upload-progress">
                          <div class="rc__upload-progress-text">上传中... ${progress}%</div>
                          <div class="rc__upload-progress-bar">
                              <div class="rc__upload-progress-fill" style=${{ width: `${progress}%` }}></div>
                          </div>
                      </div>
                  `
                : html`
                      <div class="rc__upload-content">
                          <div class="rc__upload-icon">📁</div>
                          <div class="rc__upload-text">点击上传</div>
                          <div class="rc__upload-hint">
                              支持文件类型: ${SUPPORTED_FILE_TYPES.join(', ')}
                              <br />
                              最大文件大小: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
                          </div>
                          <input
                              type="file"
                              class="rc__upload-input"
                              onChange=${onFileSelect}
                              accept=${SUPPORTED_FILE_TYPES.join(',')}
                          />
                      </div>
                  `}
        </div>
    `;
}
