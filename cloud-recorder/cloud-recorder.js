import htm from 'htm';
import { h, render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { getExtFileName } from '../common/resource_center/getExtFileName.js';
import { getPreParseFileName } from '../common/resource_center/getPreParseFileName.js';
import { mockChangeEnv, mockCloudRecorderQuery, mockLiveSdkUrl } from '../common/mock.js';

const html = htm.bind(h);

const App = () => {
    const jsSdkContainerRef = useRef(null);
    const jsSdkLiveInstanceRef = useRef(null);
    const jsSdkLoadedRef = useRef(false);

    const [paramsFromUrl] = useState(() => {
        const params = Object.fromEntries(new URLSearchParams(location.search));
        return params;
    });

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
            script.src = mockLiveSdkUrl(paramsFromUrl);
            document.head.appendChild(script);
        });
        mockChangeEnv(paramsFromUrl);

        // generate query
        const query = await mockCloudRecorderQuery(paramsFromUrl.meetingId);

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
                onExit: () => {},
            },
        );
    };

    useEffect(() => {
        enter();
    }, []);

    return html`<div ref=${jsSdkContainerRef} style="width: 100%; height: 100%;"></div>`;
};

const container = document.getElementById('react_body');
render(html`<${App} />`, container);
