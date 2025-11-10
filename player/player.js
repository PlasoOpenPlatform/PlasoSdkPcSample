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

    /* ------------------------------- controller ------------------------------- */
    const sdkInstanceRef = useRef(null);

    const [isCanPlay, setIsCanPlay] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);

    const play = useMemoizedFn(async () => {
        if (!isCanPlay || !sdkInstanceRef.current) {
            return;
        }
        if (sdkInstanceRef.current.ended) {
            sdkInstanceRef.current.currentTime = 0;
        }
        await sdkInstanceRef.current.play();
        setPlaying(true);
    });

    const pause = useMemoizedFn(async () => {
        if (!isCanPlay || !sdkInstanceRef.current) {
            return;
        }
        await sdkInstanceRef.current.pause();
        setPlaying(false);
    });

    const onPlayAndPause = useMemoizedFn(() => {
        if (playing) {
            pause();
        } else {
            play();
        }
    });

    const onScrubberClick = (event) => {
        if (!isCanPlay || !sdkInstanceRef.current) {
            return;
        }
        const scrubber = event.currentTarget;
        const rect = scrubber.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / scrubber.offsetWidth;
        const time = percent * sdkInstanceRef.current.duration;
        sdkInstanceRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const onSpeedSelect = (event) => {
        const nextSpeed = parseFloat(event.target.value);
        setSpeed(nextSpeed);
        if (sdkInstanceRef.current) {
            sdkInstanceRef.current.playbackRate = nextSpeed;
        }
    };

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

        setIsCanPlay(false);
        setPlaying(false);

        sdkInstanceRef.current.on('canplay', () => {
            setIsCanPlay(true);
            sdkInstanceRef.current.playbackRate = speed;
            setDuration(sdkInstanceRef.current.duration);
        });

        sdkInstanceRef.current.on('timeupdate', () => {
            setCurrentTime(sdkInstanceRef.current.currentTime);
            setDuration(sdkInstanceRef.current.duration);
        });

        sdkInstanceRef.current.on('ended', () => {
            setPlaying(false);
        });

        sdkInstanceRef.current.on('click', onPlayAndPause);
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

            <div class="plaso-player__controls">
                <div class="plaso-player__scrubber" onClick=${onScrubberClick}>
                    <div
                        class="plaso-player__progress"
                        style=${{ width: (duration > 0 ? (currentTime * 100) / duration : 0) + '%' }}
                    />
                </div>

                <div class="plaso-player__toolbar">
                    <button class="plaso-player__play-pause" onClick=${onPlayAndPause}>${playing ? '暂停' : '播放'}</button>
                    <span class="plaso-player__played">${formatTime(currentTime)}</span>
                    <span>/</span>
                    <span class="plaso-player__duration">${formatTime(duration)}</span>
                    <label class="plaso-player__speed-label">
                        倍速:
                        <select class="plaso-player__speed" value=${speed} onChange=${onSpeedSelect}>
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>
                    </label>
                </div>
            </div>
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

function formatTime(time) {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const minute = m > 9 ? m : '0' + m;
    const second = s > 9 ? s : '0' + s;
    return minute + ':' + second;
}
