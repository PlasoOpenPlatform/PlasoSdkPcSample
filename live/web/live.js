import htm from 'htm';
import { h, render } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { getExtFileName } from '../../common/resource_center/getExtFileName.js';
import { getPreParseFileName } from '../../common/resource_center/getPreParseFileName.js';
import { Modal } from '../../common/resource_center/modal.js';
import { ResourceCenter } from '../../common/resource_center/resource_center.js';
import { mockChangeEnv, mockLiveQueryComponents, mockLiveQuery, mockLiveSdkUrl } from '../../common/mock.js';

const html = htm.bind(h);

const App = () => {
    /* ---------------------------------- state --------------------------------- */
    const STORAGE_KEY = 'live_demo_state';

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
    const [resourceCenterOpen, setResourceCenterOpen] = useState(false);

    // step 1 - 用户操作后，sdk 请求打开资料中心
    const showResourceCenter = () => {
        setResourceCenterOpen(true);
    };

    // step 2 - 用户在资料中心选择资源后，调用 jsSdkInstanceRef.current.insertObject 向 sdk 传递资源信息，插入资源
    const onResourceSelect = (resourceInfo) => {
        jsSdkLiveInstanceRef.current.insertObject(resourceInfo);
        setResourceCenterOpen(false);
    };

    // step 2.a - 用户关闭资料中心
    const onResourceCenterClose = () => {
        setResourceCenterOpen(false);
    };

    // step 3 - sdk 把资源信息广播给各成员后，各成员客户端内调用 getExtFileName 方法，根据资源信息获取资源的完整 URL
    // getExtFileName

    /* ----------------------------------- 进课堂 ---------------------------------- */
    const jsSdkContainerRef = useRef(null);
    const jsSdkLiveInstanceRef = useRef(null);
    const jsSdkLoadedRef = useRef(false);

    const enter = async () => {
        // load JS SDK
        await new Promise((resolve) => {
            if (jsSdkLoadedRef.current) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.onload = () => {
                jsSdkLoadedRef.current = true;
                resolve();
            };
            script.src = mockLiveSdkUrl(state);
            document.head.appendChild(script);
        });
        mockChangeEnv(state);

        // generate query
        const query = await mockLiveQuery(state.meetingId, state);

        // create live
        jsSdkLiveInstanceRef.current = PlasoStyleUpime.createLiveClient(
            jsSdkContainerRef.current,
            {
                query: query,
                autoClose: true,
                enableRbtWriteBoard: true,
                supportUndo: true,
                sendBugReport: () => Promise.resolve(0),
            },
            {
                getExtFileName,
                getPreParseFileName,
                showResourceCenter,
                onExit: () => {},
            },
        );
    };

    /* --------------------------------- render --------------------------------- */
    return html`
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

            <div className="live__js-sdk-container" ref=${jsSdkContainerRef}></div>

            <${Modal} open=${resourceCenterOpen} title="资料中心" onClose=${onResourceCenterClose}>
                <${ResourceCenter} onSelect=${onResourceSelect} />
            </${Modal}>
        </div>
    `;
};

const container = document.getElementById('react_body');
render(html`<${App} />`, container);
