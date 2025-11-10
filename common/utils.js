import htm from "htm";
import { h } from "preact";

export const html = htm.bind(h);

export function loadCSS(href) {
    let resolvedHref = href;

    // 如果是相对路径，则基于当前模块的位置解析
    if (!href.startsWith("/") && !href.startsWith("http")) {
        try {
            // 使用 import.meta.url 获取当前模块的 URL
            const moduleDir = new URL(".", import.meta.url).href;
            resolvedHref = new URL(href, moduleDir).href;
        } catch (e) {
            console.warn("无法解析相对路径:", href);
            return;
        }
    }

    if (document.querySelector(`link[href="${resolvedHref}"]`)) {
        return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = resolvedHref;
    document.head.appendChild(link);
}
