import { html } from '../utils.js';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} [props.title]
 * @param {() => void} [props.onClose]
 * @param {any} [props.children]
 */
export function Modal({ open, title, onClose, children }) {
    return html`
        <div class="rc-modal" style=${{ display: open ? undefined : 'none' }}>
            <div class="rc-modal__modal">
                <button class="rc-modal__close" onClick=${onClose}>×</button>
                ${title ? html`<div class="rc-modal__title">${title}</div>` : null}
                ${children}
            </div>
        </div>
    `;
}


