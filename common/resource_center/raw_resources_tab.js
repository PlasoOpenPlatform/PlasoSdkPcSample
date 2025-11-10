import { html } from '../utils.js';
import { FILE_TYPE, INFO_TYPE } from './constants.js';

export const RawResourcesTab = ({ onSelect }) => {
    const rawResourceList = [
        // PPT仅支持url插入
        {
            type: FILE_TYPE.PPT,
            title: 'PPT解析第一版.pptx',
            url: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.pptx',
        },
        {
            type: FILE_TYPE.NPPT,
            title: 'PPT解析第二版.pptx',
            info: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.pptx',
        },
        // PDF可以通过url或info插入
        {
            type: FILE_TYPE.PDF,
            title: 'PDF.pdf',
            info: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.pdf',
        },
        // WORD/EXCEL仅支持url插入
        {
            type: FILE_TYPE.DOC,
            title: 'WORD.docx',
            url: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.docx',
        },
        {
            type: FILE_TYPE.XLS,
            title: 'EXCEL.xlsx',
            url: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.xlsx',
        },
        // 图片可以通过url或info插入，当插入gif时，title需要带上.gif后缀
        {
            type: FILE_TYPE.IMAGE,
            title: '图片.jpg',
            url: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.jpg',
        },
        {
            type: FILE_TYPE.IMAGE,
            title: 'GIF.gif',
            url: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.gif',
        },
        // 音视频可以通过url或info插入
        {
            type: FILE_TYPE.AUDIO,
            title: '音频.mp3',
            info: 'https://wwwr.plaso.cn/static/cdn/sdk-drive-test/test.mp3',
            duration: 272000,
        },
        {
            type: FILE_TYPE.VIDEO,
            title: '视频.mp4',
            info: [
                INFO_TYPE.STRUCT,
                {
                    host: 'https://wwwr.plaso.cn/',
                    path: 'static/cdn/sdk-drive-test/',
                    fileName: 'test.mp4',
                },
            ],
            duration: 16000,
        },
    ];

    const renderItem = (item) => {
        return html`
            <div data-dataType="fileData" class="rc__item" onClick=${() => onSelect(item)}>
                <div class="rc__item-name">${item.title}</div>
            </div>
        `;
    };

    return html`
        <div class="rc__tab-content">
            <div class="rc__list">${rawResourceList.map(renderItem)}</div>
        </div>
    `;
};
