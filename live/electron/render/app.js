import { useCallback, useEffect, useState } from 'preact/hooks';
import { getExtFileName } from '../../../common/resource_center/getExtFileName.js';
import { getPreParseFileName } from '../../../common/resource_center/getPreParseFileName.js';
import { html } from './index.js';
import { onSaveBoardFn } from './on_save_board_fn.js';
import { getElectronRemote } from './utils.js';
import { mockLiveElectronClassOptions, mockLiveElectronQuery, mockLiveQueryComponents } from '../../../common/mock.js';

export default function App() {
    /* ---------------------------------- state --------------------------------- */
    const STORAGE_KEY = 'live_electron_demo_state';

    const [state, setState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const saveState = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    useEffect(() => {
        window.addEventListener('beforeunload', saveState);
        return () => window.removeEventListener('beforeunload', saveState);
    }, [saveState]);

    /* ---------------------------------- 资料中心 ---------------------------------- */
    // step 1 - 用户操作后，sdk 请求打开资料中心（改为在新窗口中打开）
    const onOpenResourceCenterFn = () => {
        const { BrowserWindow } = getElectronRemote();
        const resourceCenterWindow = new BrowserWindow({
            width: 900,
            height: 640,
            title: '资料中心',
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
                enableRemoteModule: true,
            },
        });
        resourceCenterWindow.loadFile('./render/resource_center/resource_center.html');
    };

    // step 2 - 用户在资料中心选择资源后，调用 PlasoElectronSdk.insertObject 向 sdk 传递资源信息，插入资源
    useEffect(() => {
        const { ipcRenderer } = require('electron');
        const onMessage = (_, resourceInfo) => {
            const PlasoElectronSdk = window.require('@plasosdk/plaso-electron-sdk');
            PlasoElectronSdk.insertObject(resourceInfo);
        };
        ipcRenderer.on('resource-center-selected', onMessage);
        return () => ipcRenderer.off('resource-center-selected', onMessage);
    }, []);

    // step 3 - sdk 把资源信息广播给各成员后，各成员客户端内调用 getExtFileName 方法，根据资源信息获取资源的完整 URL
    // onGetExtFileNameFn

    /* ----------------------------------- 进入 ----------------------------------- */
    const enter = async () => {
        const query = await mockLiveElectronQuery(state.meetingId, state);
        const otherClassOptions = mockLiveElectronClassOptions(state);

        const PlasoElectronSdk = window.require('@plasosdk/plaso-electron-sdk');
        PlasoElectronSdk.initLogConfig(require('path').join(__dirname, './logger'));
        PlasoElectronSdk.createLiveClassWindow({
            classOptions: {
                query: query,
                supportShowResourceCenter: true,
                ...otherClassOptions,
            },
            onSaveBoardFn: onSaveBoardFn,
            onOpenResourceCenterFn,
            onGetExtFileNameFn: getExtFileName,
            onGetPreParseFileNameFn: getPreParseFileName,
        });
    };

    /* --------------------------------- render --------------------------------- */
    return html`
        <div class="page-container">
            <div className="live">
                <div className="live__sdk-demo">
                    <div className="live__form">
                        <label>
                            meetingId
                            <input
                                value=${state.meetingId ?? ''}
                                onInput=${(e) => setState((s) => ({ ...s, meetingId: e.target.value }))}
                            />
                        </label>
                        ${mockLiveQueryComponents(state, setState)}
                    </div>
                    <button onClick=${enter}>开始</button>
                </div>
            </div>
        </div>
    `;
}
