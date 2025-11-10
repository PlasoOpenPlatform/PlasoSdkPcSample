import { h, render } from 'preact';
import htm from 'htm';
import { ResourceCenter } from '../../../../common/resource_center/resource_center.js';

const html = htm.bind(h);

const App = () => {
    const onSelect = (resourceInfo) => {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('resource-center-selected', resourceInfo);
        window.close();
    };
    return html`<${ResourceCenter} onSelect=${onSelect} /> `;
};

const container = document.getElementById('react_body');
render(html`<${App} />`, container);
