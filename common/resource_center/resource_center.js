import { useState } from 'preact/hooks';
import { html, loadCSS } from '../utils.js';
import { ParsedResourcesTab } from './parsed_resources_tab.js';
import { RawResourcesTab } from './raw_resources_tab.js';

loadCSS('./resource_center/resource_center.css');

const TAB = {
    RAW: 'raw',
    PARSED: 'parsed',
};

/**
 * @param {Object} props
 * @param {(resourceInfo: any) => void} props.onSelect
 */
export const ResourceCenter = ({ onSelect }) => {
    const [activeTab, setActiveTab] = useState(TAB.RAW);

    return html`
        <div class="rc">
            <div class="rc__tabs">
                <div class="rc__tab ${activeTab === TAB.RAW ? 'rc__tab--active' : ''}" onClick=${() => setActiveTab(TAB.RAW)}>
                    原始资源
                </div>
                <div
                    class="rc__tab ${activeTab === TAB.PARSED ? 'rc__tab--active' : ''}"
                    onClick=${() => setActiveTab(TAB.PARSED)}
                >
                    预解析资源
                </div>
            </div>

            ${activeTab === TAB.RAW && html`<${RawResourcesTab} onSelect=${onSelect} />`}
            ${activeTab === TAB.PARSED && html`<${ParsedResourcesTab} onSelect=${onSelect} />`}
        </div>
    `;
};
