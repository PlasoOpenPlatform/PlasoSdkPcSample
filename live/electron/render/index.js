import { h, render } from 'preact';
import htm from 'htm';
import App from './app.js';

export const html = htm.bind(h);

const container = document.getElementById('react_body');
render(html`<${App} />`, container);
