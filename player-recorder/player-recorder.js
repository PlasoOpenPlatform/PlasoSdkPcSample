import htm from 'htm';
import { h, render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { getExtFileName } from '../common/resource_center/getExtFileName.js';
import { getPreParseFileName } from '../common/resource_center/getPreParseFileName.js';
import { mockPlayerQuery, mockPlayerSdkCssUrl, mockPlayerSdkHlsUrl, mockPlayerSdkJsUrl } from '../common/mock.js';

const html = htm.bind(h);

const App = () => {
    const [urlParams] = useState(() => {
        const params = Object.fromEntries(new URLSearchParams(location.search));
        return params;
    });

    /* -------------------------------- load sdk -------------------------------- */
    const loadSdk = async () => {
        const isSdkLoaded = !!window.PlasoUpimePlayer;
        if (isSdkLoaded) {
            return;
        }

        const loadJsPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = mockPlayerSdkJsUrl();
            script.onload = () => {
                resolve();
            };
            document.head.appendChild(script);
        });

        const loadCssPromise = new Promise((resolve) => {
            const link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            const href = mockPlayerSdkCssUrl();
            if (!href) {
                resolve();
                return;
            }
            link.href = href;
            link.onload = () => {
                resolve();
            };
            document.head.appendChild(link);
        });

        const loadHlsPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = mockPlayerSdkHlsUrl();
            script.onload = () => {
                resolve();
            };
            document.head.appendChild(script);
        });

        await Promise.all([loadJsPromise, loadCssPromise, loadHlsPromise]);
    };

    /* ----------------------------- 与录制者通信 - notify ---------------------------- */
    const notifyPlayReady = () => {
        window.upimePlayReady?.();
    };

    const notifyPlayStart = () => {
        window.upimePlayStart?.();
    };

    const notifyPlayEnd = () => {
        window.upimePlayEnd?.();
    };

    /* ----------------------------- 与录制者通信 - expose ---------------------------- */
    const sdkInstanceRef = useRef(null);

    const play = useMemoizedFn(async () => {
        if (!sdkInstanceRef.current) {
            return;
        }
        if (sdkInstanceRef.current.ended) {
            sdkInstanceRef.current.currentTime = 0;
        }
        await sdkInstanceRef.current.play();
        notifyPlayStart();
    });

    const pause = useMemoizedFn(async () => {
        if (!sdkInstanceRef.current) {
            return;
        }
        await sdkInstanceRef.current.pause();
    });

    const seekTo = useMemoizedFn((time) => {
        sdkInstanceRef.current.currentTime = time;
    });

    useEffect(() => {
        window.plasoUpimePlayerController = {
            play,
            pause,
            seekTo,
        };
    }, []);

    /* ------------------------------- load video ------------------------------- */
    const containerRef = useRef(null);

    const loadVideo = async () => {
        await loadSdk();

        const query = await mockPlayerQuery(urlParams.recordId);

        sdkInstanceRef.current = new PlasoUpimePlayer(containerRef.current);
        sdkInstanceRef.current.setSrc(query, {
            getPreParseFileName: getPreParseFileName,
            getExtFileName: getExtFileName,
        });

        sdkInstanceRef.current.on('canplay', () => {
            notifyPlayReady();
        });
        sdkInstanceRef.current.on('ended', () => {
            notifyPlayEnd();
        });
    };

    useEffect(() => {
        loadVideo();
        return () => {
            if (sdkInstanceRef.current) {
                sdkInstanceRef.current.destroy();
                sdkInstanceRef.current = null;
            }
        };
    }, []);

    /* ---------------------------------- other --------------------------------- */
    useEffect(() => {
        const handleResize = () => {
            sdkInstanceRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* --------------------------------- render --------------------------------- */
    return html`
        <div class="plaso-player">
            <div ref=${containerRef} class="plaso-player__stage"></div>
        </div>
    `;
};

const container = document.getElementById('react_body');
render(html`<${App} />`, container);

/**
 * 保证函数地址永远不会变化。
 * 详见 ahook 的 useMemoizedFn
 * @template T
 * @param {T} fn
 * @returns {T}
 */
function useMemoizedFn(fn) {
    const latestFn = useRef(fn);
    latestFn.current = fn;
    const memoizedFn = useRef((...args) => {
        latestFn.current?.(...args);
    });
    return memoizedFn.current;
}
