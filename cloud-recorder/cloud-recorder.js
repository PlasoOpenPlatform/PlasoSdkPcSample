import { getExtFileName } from '../common/resource_center/getExtFileName.js';
import { getPreParseFileName } from '../common/resource_center/getPreParseFileName.js';
import { mockChangeEnv, mockCloudRecorderQuery, mockLiveSdkUrl } from '../common/mock.js';

const jsSdkContainer = document.getElementById('sdk-container');
let jsSdkLiveInstance = null;
let jsSdkLoaded = false;

const paramsFromUrl = Object.fromEntries(new URLSearchParams(location.search));

const enter = async () => {
    // load JS SDK
    await new Promise((resolve) => {
        if (jsSdkLoaded) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.onload = () => {
            jsSdkLoaded = true;
            resolve();
        };
        script.src = mockLiveSdkUrl(paramsFromUrl);
        document.head.appendChild(script);
    });
    mockChangeEnv(paramsFromUrl);

    // generate query
    const query = await mockCloudRecorderQuery(paramsFromUrl.meetingId);

    // create live
    jsSdkLiveInstance = PlasoStyleUpime.createLiveClient(
        jsSdkContainer,
        {
            query: query,
            autoClose: true,
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

window.addEventListener('load', enter);
