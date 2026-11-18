/* FindingX WebUI runtime. */

/* ---- 00_types.js ---- */

"use strict";
/* FindingX WebUI shared runtime types.
 *
 * 所有源文件都是全局脚本（无 import/export），依赖顺序由文件名前缀保证：
 *   00_types.ts 10_i18n.ts 20_core.ts 30_bridge.ts 40_schema.ts 50_pages.ts 90_main.ts
 */

/* ---- 20_core.js ---- */

/*
 * FindingX WebUI core.
 * 由 build/webui.py 编译进 ui.js。
 *
 * 职责：设置持久化与主题应用、通用组件行为（菜单/对话框/折叠/状态视图/
 * 图表/Toast）、无障碍辅助、i18n 与 b64 工具。
 * 页面逻辑在 50_pages.ts。
 */
"use strict";
(function (global) {
    /* ============ i18n ============ */
    const STRINGS = {
        zh: {
            "app.title": "FindingX",
            "nav.dash": "仪表盘", "nav.conf": "配置", "nav.log": "日志",
            "dash.kernel": "内核通道", "dash.stats": "统计", "dash.state": "状态",
            "dash.frames": "已投递帧", "dash.events": "ioctl 事件",
            "dash.tid": "目标 tid", "dash.temp": "CPU 温度",
            "dash.engaged": "工作状态", "dash.gate": "温度门控", "dash.ceil": "频率上限",
            "dash.busy": "负载", "dash.delivering": "投递中", "dash.idle": "空闲",
            "dash.paused": "超温暂停", "dash.normal": "正常",
            "dash.ceilingLow": "已压制", "dash.ceilingOrig": "原始",
            "dash.present": "存在", "dash.absent": "缺失", "dash.unlocked": "已解锁",
            "conf.discard": "放弃",
            "conf.reload": "重新加载", "conf.sfHint": "保存后需重启设备生效",
            "conf.mainHint": "守护 5s 内热加载",
            "log.refresh": "刷新", "log.empty": "暂无日志",
            "settings.title": "设置", "settings.appearance": "外观",
            "settings.fan": "风扇", "settings.fan.enable": "风扇控制",
            "settings.fan.enable.desc": "关闭后交给系统温度曲线", "settings.fan.level": "转速档位",
            "settings.theme": "主题", "settings.theme.light": "浅色", "settings.fontSize": "字体大小", "settings.fontSize.desc": "只缩放文字", "settings.uiScale": "显示大小", "settings.uiScale.desc": "整体缩放界面", "settings.size.s": "小", "settings.size.m": "标准", "settings.size.l": "大", "settings.size.xl": "超大",
            "settings.theme.dark": "深色", "settings.theme.auto": "跟随系统",
            "settings.motion": "动效", "settings.motion.standard": "标准",
            "settings.motion.spring": "实验性",
            "settings.motion.desc": "更有阻尼、更有弹性的弹簧曲线",
            "settings.contrast": "对比度", "settings.contrast.high": "高",
            "settings.contrast.standard": "中", "settings.contrast.low": "低",
            "settings.wallpaper": "壁纸", "settings.wallpaper.pick": "选择图片",
            "settings.wallpaper.clear": "清除",
            "settings.wallpaper.desc": "文字色跟随壁纸明暗（4.5:1 保护）",
            "settings.navbar": "底栏", "settings.navbar.style": "风格",
            "settings.navbar.liquid": "液态玻璃", "settings.navbar.flat": "平铺", "settings.navbar.compact": "紧凑",
            "settings.navbar.rail": "侧栏", "settings.navbar.drawer": "抽屉",
            "settings.reset": "恢复默认设置", "settings.resetBody": "主题 / 动效 / 壁纸 / 头像将恢复默认。",
            "settings.export": "导出主题", "settings.import": "导入主题",
            "settings.exported": "已复制到剪贴板", "settings.importPh": "粘贴主题 JSON",
            "settings.back": "返回",
            "a11y.nav": "主导航", "a11y.settings": "打开设置", "a11y.back": "返回",
            "a11y.chart": "图表", "a11y.ring": "状态环",
            "a11y.loading": "加载中", "a11y.error": "加载失败",
            "common.cancel": "取消", "common.ok": "确定", "common.save": "保存",
            "common.saved": "已保存", "common.empty": "暂无内容",
            "common.refresh": "刷新", "common.close": "关闭", "common.dismiss": "知道了",
            "faq.title": "常见问题",
            "state.loading": "加载中…", "state.empty": "暂无数据",
            "state.error": "加载失败", "state.retry": "重试"
        },
        en: {
            "app.title": "FindingX",
            "nav.dash": "Dashboard", "nav.conf": "Config", "nav.log": "Logs",
            "dash.kernel": "Kernel channels", "dash.stats": "Statistics", "dash.state": "State",
            "dash.frames": "Frames delivered", "dash.events": "ioctl events",
            "dash.tid": "Target tid", "dash.temp": "CPU temp",
            "dash.engaged": "Work state", "dash.gate": "Thermal gate", "dash.ceil": "Freq ceiling",
            "dash.busy": "Load", "dash.delivering": "Delivering", "dash.idle": "Idle",
            "dash.paused": "Paused (hot)", "dash.normal": "Normal",
            "dash.ceilingLow": "Capped", "dash.ceilingOrig": "Original",
            "dash.present": "present", "dash.absent": "missing", "dash.unlocked": "unlocked",
            "conf.discard": "Discard",
            "conf.reload": "Reload", "conf.sfHint": "Requires a reboot to take effect",
            "conf.mainHint": "Hot-reloaded within 5s",
            "log.refresh": "Refresh", "log.empty": "No logs yet",
            "settings.title": "Settings", "settings.appearance": "Appearance",
            "settings.fan": "Fan", "settings.fan.enable": "Fan control",
            "settings.fan.enable.desc": "Off lets the system thermal curve take over",
            "settings.fan.level": "Speed level",
            "settings.theme": "Theme", "settings.theme.light": "Light", "settings.fontSize": "Font size", "settings.fontSize.desc": "Text only", "settings.uiScale": "Display size", "settings.uiScale.desc": "Scale the whole UI", "settings.size.s": "S", "settings.size.m": "M", "settings.size.l": "L", "settings.size.xl": "XL",
            "settings.theme.dark": "Dark", "settings.theme.auto": "System",
            "settings.motion": "Motion", "settings.motion.standard": "Standard",
            "settings.motion.spring": "Experimental",
            "settings.motion.desc": "Damped, bouncy spring curves",
            "settings.contrast": "Contrast", "settings.contrast.high": "High",
            "settings.contrast.standard": "Medium", "settings.contrast.low": "Low",
            "settings.wallpaper": "Wallpaper", "settings.wallpaper.pick": "Choose image",
            "settings.wallpaper.clear": "Clear",
            "settings.wallpaper.desc": "Ink follows wallpaper luminance (4.5:1)",
            "settings.navbar": "Navbar", "settings.navbar.style": "Style",
            "settings.navbar.liquid": "Liquid Glass", "settings.navbar.flat": "Flat", "settings.navbar.compact": "Compact",
            "settings.navbar.rail": "Rail", "settings.navbar.drawer": "Drawer",
            "settings.reset": "Reset to defaults", "settings.resetBody": "Theme, motion, wallpaper and avatar return to defaults.",
            "settings.export": "Export theme", "settings.import": "Import theme",
            "settings.exported": "Copied to clipboard", "settings.importPh": "Paste theme JSON",
            "settings.back": "Back",
            "a11y.nav": "Main navigation", "a11y.settings": "Open settings", "a11y.back": "Back",
            "a11y.chart": "Chart", "a11y.ring": "Status ring",
            "a11y.loading": "Loading", "a11y.error": "Failed to load",
            "common.cancel": "Cancel", "common.ok": "OK", "common.save": "Save",
            "common.saved": "Saved", "common.empty": "Nothing here yet",
            "common.refresh": "Refresh", "common.close": "Close", "common.dismiss": "Got it",
            "faq.title": "FAQ",
            "state.loading": "Loading…", "state.empty": "No data",
            "state.error": "Failed to load", "state.retry": "Retry"
        }
    };
    let lang = "zh";
    function t(key) {
        return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.zh[key] || key;
    }
    function setLang(l) {
        lang = STRINGS[l] ? l : "zh";
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
            el.placeholder = t(el.getAttribute("data-i18n-ph"));
        });
        document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
            el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
        });
    }
    /* ============ 设置 ============ */
    const SET_KEY = "fx.settings.v1";
    const DEFAULTS = {
        theme: "auto", motion: "standard", contrast: "standard",
        navbarStyle: "liquid", navIcons: "rounded",
        wallpaper: "", wallpaperAuto: true,
        fontScale: "1", uiScale: "0.9",
        uiStyle: ""
    };
    function loadSettings() {
        try {
            const raw = localStorage.getItem(SET_KEY);
            if (raw)
                return Object.assign({}, DEFAULTS, JSON.parse(raw));
        }
        catch (e) { /* 隐私模式 / 配额满 */ }
        return Object.assign({}, DEFAULTS);
    }
    function saveSettings(s) {
        try {
            localStorage.setItem(SET_KEY, JSON.stringify(s));
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function exportTheme() {
        const s = loadSettings();
        return JSON.stringify({
            theme: s.theme, contrast: s.contrast, motion: s.motion,
            navbarStyle: s.navbarStyle, navIcons: s.navIcons
        });
    }
    function importTheme(json) {
        try {
            const o = JSON.parse(json);
            const s = loadSettings();
            if (["light", "dark", "auto"].includes(o.theme))
                s.theme = o.theme;
            if (["high", "standard", "low"].includes(o.contrast))
                s.contrast = o.contrast;
            if (["standard", "spring"].includes(o.motion))
                s.motion = o.motion;
            if (["flat", "drawer"].includes(o.navbarStyle))
                s.navbarStyle = o.navbarStyle;
            if (o.navIcons)
                s.navIcons = o.navIcons;
            saveSettings(s);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /* ============ 主题 ============ */
    function prefersDark() {
        return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    function resolvedTheme(s) {
        return s.theme === "auto" ? (prefersDark() ? "dark" : "light") : s.theme;
    }
    /** 圆形揭示：以触发元素为圆心，旧底色盖住 → 切主题 → 扩散消失 */
    function revealSwap(applyFn, originEl) {
        const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !originEl) {
            applyFn();
            return;
        }
        const rect = originEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
        const layer = document.createElement("div");
        layer.className = "fx-reveal";
        const oldBg = getComputedStyle(document.documentElement).getPropertyValue("--m3-surface").trim();
        layer.style.cssText = `left:${cx}px;top:${cy}px;width:${r * 2}px;height:${r * 2}px;background:${oldBg}`;
        document.body.appendChild(layer);
        requestAnimationFrame(() => {
            layer.classList.add("fx-run");
            setTimeout(applyFn, 90);
            setTimeout(() => layer.remove(), 720);
        });
    }
    function applyTheme(s, opts) {
        const root = document.documentElement;
        const apply = () => {
            root.setAttribute("data-theme", resolvedTheme(s));
            root.setAttribute("data-contrast", s.contrast);
            root.setAttribute("data-motion", s.motion);
            applyWallpaper(s);
        };
        if (opts && opts.revealFrom)
            revealSwap(apply, opts.revealFrom);
        else
            apply();
    }
    /* ============ 壁纸：亮度自适应 + 4.5:1 ============ */
    function imageLuminance(img) {
        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, 32, 32);
        const d = ctx.getImageData(0, 0, 32, 32).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) {
            sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        }
        return sum / (d.length / 4);
    }
    const LIGHT_INK = 0.93;
    function relLum(v255) {
        const v = v255 / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    function contrastRatio(a, b) {
        const [hi, lo] = a > b ? [a, b] : [b, a];
        return (hi + 0.05) / (lo + 0.05);
    }
    /** 亮壁纸用深字、暗壁纸用浅字；浅字时自动加深遮罩直到 ≥4.5:1 */
    function wallpaperAdapt(img, auto) {
        const root = document.documentElement;
        const wall = relLum(imageLuminance(img));
        if (!auto) {
            root.removeAttribute("data-wallpaper");
            root.style.removeProperty("--m3-wallpaper-scrim");
            return { wall, scrimAlpha: null };
        }
        let scrimAlpha;
        if (wall > 0.5) {
            root.setAttribute("data-wallpaper", "light");
            scrimAlpha = 0.08;
        }
        else {
            root.setAttribute("data-wallpaper", "dark");
            const need = (LIGHT_INK + 0.05) / 4.5 - 0.05;
            scrimAlpha = wall > need ? 1 - need / Math.max(wall, 0.001) : 0;
            scrimAlpha = Math.min(0.75, Math.max(0.12, scrimAlpha));
        }
        root.style.setProperty("--m3-wallpaper-scrim", scrimAlpha.toFixed(3));
        return { wall, scrimAlpha, ratio: contrastRatio(LIGHT_INK, wall * (1 - scrimAlpha)) };
    }
    function applyWallpaper(s) {
        const wp = document.querySelector(".fx-wallpaper");
        const root = document.documentElement;
        if (!s.wallpaper) {
            if (wp)
                wp.style.backgroundImage = "";
            root.removeAttribute("data-wallpaper");
            root.style.removeProperty("--m3-wallpaper-scrim");
            return;
        }
        if (wp)
            wp.style.backgroundImage = `url("${s.wallpaper}")`;
        const img = new Image();
        img.onload = () => wallpaperAdapt(img, s.wallpaperAuto);
        img.onerror = () => root.removeAttribute("data-wallpaper");
        img.src = s.wallpaper;
    }
    function pickWallpaper(cb) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
            const f = input.files && input.files[0];
            if (!f)
                return;
            const r = new FileReader();
            r.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const scale = Math.min(1, 1080 / img.width);
                    const c = document.createElement("canvas");
                    c.width = Math.round(img.width * scale);
                    c.height = Math.round(img.height * scale);
                    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                    let url;
                    try {
                        url = c.toDataURL("image/jpeg", 0.82);
                    }
                    catch (e) {
                        url = r.result;
                    }
                    cb(url);
                };
                img.src = r.result;
            };
            r.readAsDataURL(f);
        };
        input.click();
    }
    /* ============ 底栏 ============ */
    const NAV_ICONS = {
        rounded: {
            dash: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm0-13a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z",
            conf: "M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5a.5.5 0 0 0 .1-.7l-2-3.4a.5.5 0 0 0-.6-.2l-2.3 1a7.4 7.4 0 0 0-1.7-1L14.5 2.4A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4L9 5.2a7.4 7.4 0 0 0-1.7 1l-2.3-1a.5.5 0 0 0-.6.2l-2 3.4a.5.5 0 0 0 .1.7L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.5a.5.5 0 0 0-.1.7l2 3.4a.5.5 0 0 0 .6.2l2.3-1a7.4 7.4 0 0 0 1.7 1l.5 2.8a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.5-2.8a7.4 7.4 0 0 0 1.7-1l2.3 1a.5.5 0 0 0 .6-.2l2-3.4a.5.5 0 0 0-.1-.7ZM12 15a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z",
            log: "M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 4h14v12H5Zm2 2h10v2H7Zm0 4h7v2H7Z",
            chart: "M3 21V9h4v12H3Zm7 0V3h4v18h-4Zm7 0v-8h4v8h-4Z",
            settings: "M12 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4Zm0 12c3.3 0 8 1.7 8 4v2H4v-2c0-2.3 4.7-4 8-4Z"
        },
        cute: {
            dash: "M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9Zm0 3a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6Zm-2 3.5A1.8 1.8 0 1 1 10 14a1.8 1.8 0 0 1 0-3.5Zm4 0A1.8 1.8 0 1 1 14 14a1.8 1.8 0 0 1 0-3.5Zm-2 4.5a3.2 3.2 0 0 0 3.2 2.6H8.8A3.2 3.2 0 0 0 12 14Z",
            conf: "M12 3l1.2 2.6 2.6-1.2.4 2.8 2.8-.4-.3 2.9 2.3 1.6-1.9 2.1 1.2 2.6-2.8.7v2.9l-2.9.1L14 21l-2-1.5L10 21l-1.6-2.3-2.9-.1v-2.9l-2.8-.7 1.2-2.6L2 10.6l2.3-1.6-.3-2.9 2.8.4.4-2.8L10 5.8 12 3Zm0 5.5a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 12 8.5Z",
            log: "M6 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm0 4v10h10V8Zm2 2h6v2H8Zm0 4h4v2H8Z",
            chart: "M4 20V10h3v10H4Zm5 0V4h3v16H9Zm5 0v-7h3v7h-3Zm5 0V8h3v12h-3Z",
            settings: "M12 5a3.5 3.5 0 1 1-3.5 3.5A3.5 3.5 0 0 1 12 5Zm0 8c3.6 0 7.5 1.9 7.5 4.2V20h-15v-2.8C4.5 14.9 8.4 13 12 13Z"
        },
        classic: {
            dash: "M3 13h4v-2H3v2Zm3-6v6h2V7H6Zm4 10h2V3h-2v14Zm4-12v8h2V5h-2Zm4 6v4h2v-4h-2Z",
            conf: "M3 17h18v2H3v-2Zm3-4h12v2H6v-2Zm3-4h6v2H9V7Zm3-4v2h0V3Z",
            log: "M3 5h18v2H3V5Zm0 6h18v2H3v-2Zm0 6h12v2H3v-2Z",
            chart: "M3 19h2V9H3v10Zm5 0h2V5H8v14Zm5 0h2v-6h-2v6Zm5 0h2v-9h-2v9Z",
            settings: "M12 3h2v4h-2V3Zm0 14h2v4h-2v-4ZM3 11h4v2H3v-2Zm14 0h4v2h-4v-2Zm-2-8h4v4h-4V3Z"
        }
    };
    function applyNavbar(s) {
        const nav = document.querySelector(".fx-navbar");
        if (nav) {
            nav.setAttribute("data-style", s.navbarStyle);
            nav.setAttribute("data-icons", s.navIcons);
            const set = NAV_ICONS[s.navIcons] || NAV_ICONS.rounded;
            nav.querySelectorAll(".fx-navbtn").forEach((btn) => {
                const page = btn.getAttribute("data-page");
                const path = btn.querySelector("svg path");
                if (page && path && set[page])
                    path.setAttribute("d", set[page]);
            });
        }
        document.querySelectorAll("[data-navicons]").forEach((el) => {
            el.setAttribute("aria-pressed", String(el.getAttribute("data-navicons") === s.navIcons));
        });
        // 侧栏风格需要给内容让出横向空间，用 body 属性驱动 CSS
        document.body.setAttribute("data-navbar-style", s.navbarStyle);
        // 切换风格后布局会变，等一帧再量高度
        requestAnimationFrame(syncNavbarHeight);
    }
    /** 实测底栏高度写入 CSS 变量，供 body 底部留白使用。
     *  不同风格（pill / drawer / rail 等）高度差别很大，写死数值必然遮住内容。 */
    function syncNavbarHeight() {
        const nav = document.querySelector(".fx-navbar");
        if (!nav)
            return;
        const h = Math.ceil(nav.getBoundingClientRect().height);
        if (h > 0)
            document.documentElement.style.setProperty("--fx-navbar-h", h + "px");
    }
    function syncNavbarVisibility() {
        const nav = document.querySelector(".fx-navbar");
        if (!nav)
            return;
        // 只按「可见的」沉浸页判断：hidden 的 section 仍在 DOM 里
        const immersive = !!document.querySelector("[data-immersive='true']:not([hidden])");
        nav.classList.toggle("fx-hidden", immersive);
    }
    /* ============ Toast ============ */
    let toastEl = null;
    let toastTimer = null;
    function toast(msg, ms) {
        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.className = "fx-toast";
            toastEl.setAttribute("role", "status");
            toastEl.setAttribute("aria-live", "polite");
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add("fx-show");
        if (toastTimer !== null)
            clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("fx-show"), ms || 1800);
    }
    /* ============ 对话框 ============ */
    function dialog(opts) {
        return new Promise((resolve) => {
            const scrim = document.createElement("div");
            scrim.className = "fx-dialog-scrim";
            const dlg = document.createElement("div");
            dlg.className = "fx-dialog";
            dlg.setAttribute("role", "alertdialog");
            dlg.setAttribute("aria-modal", "true");
            const title = document.createElement("h2");
            title.className = "fx-dialog__title";
            title.textContent = opts.title || "";
            const body = document.createElement("p");
            body.className = "fx-body fx-dialog__body";
            body.textContent = opts.body || "";
            const actions = document.createElement("div");
            actions.className = "fx-dialog__actions";
            const close = (val) => {
                scrim.classList.remove("fx-open");
                setTimeout(() => scrim.remove(), 320);
                resolve(val);
            };
            if (opts.cancel !== null) {
                const no = document.createElement("button");
                no.className = "fx-btn fx-btn--ghost fx-btn--sm";
                no.textContent = opts.cancel || t("common.cancel");
                no.onclick = () => close(false);
                actions.appendChild(no);
            }
            const yes = document.createElement("button");
            yes.className = "fx-btn fx-btn--filled fx-btn--sm";
            yes.textContent = opts.ok || t("common.ok");
            yes.onclick = () => close(true);
            actions.appendChild(yes);
            dlg.append(title);
            if (opts.body)
                dlg.append(body);
            if (opts.content)
                dlg.append(opts.content);
            dlg.append(actions);
            scrim.appendChild(dlg);
            document.body.appendChild(scrim);
            requestAnimationFrame(() => scrim.classList.add("fx-open"));
            scrim.addEventListener("click", (e) => { if (e.target === scrim)
                close(false); });
            dlg.addEventListener("keydown", (e) => { if (e.key === "Escape")
                close(false); });
            yes.focus();
        });
    }
    const confirmDialog = (o) => dialog(Object.assign({ cancel: null }, o));
    /* ============ 菜单 ============ */
    /** 在 anchorEl 旁弹出菜单；items: [{label, checked, onSelect}] */
    function menu(anchorEl, items) {
        /*
         * 定位策略：fixed + 锚点实测坐标。
         * 旧实现把 .fx-menu-wrap 插进锚点的父节点——而父节点是 flex 容器
         * （日志页的 .fx-inline），插入一个 inline-block 会参与 flex 布局并挤动
         * 兄弟元素，菜单（absolute 相对它定位）于是跟着漂移。
         * 现在 pop 直接挂在 body 下，只按锚点的 getBoundingClientRect 定位，
         * 不改变文档流，滚动/布局变化时跟随重算。
         */
        const pop = document.createElement("div");
        pop.className = "fx-menu";
        pop.setAttribute("role", "menu");
        let closed = false;
        const close = () => {
            if (closed)
                return;
            closed = true;
            pop.classList.remove("fx-open");
            document.removeEventListener("click", onDocClick, true);
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
            setTimeout(() => pop.remove(), 300);
        };
        const onDocClick = (e) => {
            if (!pop.contains(e.target) && !anchorEl.contains(e.target))
                close();
        };
        items.forEach((it) => {
            const btn = document.createElement("button");
            btn.className = "fx-menu__item";
            btn.setAttribute("role", "menuitem");
            if (it.checked !== undefined)
                btn.setAttribute("aria-checked", String(!!it.checked));
            btn.textContent = it.label;
            btn.onclick = () => { close(); if (it.onSelect)
                it.onSelect(); };
            pop.appendChild(btn);
        });
        /** 按锚点实时位置摆放；超出视口时向内侧收 */
        function place() {
            const r = anchorEl.getBoundingClientRect();
            pop.style.visibility = "hidden";
            document.body.appendChild(pop);
            const pw = pop.offsetWidth || 168;
            const ph = pop.offsetHeight || 160;
            const gap = 6;
            let left = r.right - pw; // 右对齐锚点
            if (left < 8)
                left = 8; // 左边越界
            if (left + pw > innerWidth - 8)
                left = innerWidth - 8 - pw;
            let top = r.bottom + gap; // 默认向下展开
            if (top + ph > innerHeight - 8) { // 下方空间不够则向上
                top = r.top - gap - ph;
                if (top < 8)
                    top = 8;
            }
            pop.style.left = Math.round(left) + "px";
            pop.style.top = Math.round(top) + "px";
            pop.style.visibility = "";
        }
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        requestAnimationFrame(() => {
            pop.classList.add("fx-open");
            document.addEventListener("click", onDocClick, true);
        });
        return { close };
    }
    /* ============ 折叠面板 ============ */
    /** 渲染 FAQ 式折叠列表到 container；items: [{q, a}] */
    function accordion(container, items) {
        container.innerHTML = "";
        const list = document.createElement("div");
        list.className = "fx-accordion";
        items.forEach((it) => {
            const row = document.createElement("div");
            row.className = "fx-accordion__item";
            row.setAttribute("aria-expanded", "false");
            const head = document.createElement("button");
            head.className = "fx-accordion__head";
            head.type = "button";
            const q = document.createElement("span");
            q.textContent = it.q;
            const icon = document.createElement("span");
            icon.className = "fx-accordion__icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "▾";
            head.append(q, icon);
            const panel = document.createElement("div");
            panel.className = "fx-accordion__panel";
            const inner = document.createElement("div");
            const body = document.createElement("div");
            body.className = "fx-accordion__body";
            body.textContent = it.a;
            inner.appendChild(body);
            panel.appendChild(inner);
            head.onclick = () => {
                const open = row.getAttribute("aria-expanded") === "true";
                row.setAttribute("aria-expanded", String(!open));
                head.setAttribute("aria-expanded", String(!open));
            };
            head.setAttribute("aria-expanded", "false");
            row.append(head, panel);
            list.appendChild(row);
        });
        container.appendChild(list);
    }
    /* ============ 状态视图 ============ */
    /** kind: "loading" | "empty" | "error" */
    function stateView(kind, opts) {
        const o = opts || {};
        const box = document.createElement("div");
        box.className = "fx-state";
        box.setAttribute("role", kind === "error" ? "alert" : "status");
        if (kind === "loading") {
            const sp = document.createElement("div");
            sp.className = "fx-spinner";
            sp.setAttribute("aria-hidden", "true");
            box.appendChild(sp);
        }
        const title = document.createElement("div");
        title.className = "fx-state__title";
        title.textContent = o.title || t("state." + kind) || "";
        box.appendChild(title);
        if (o.body) {
            const b = document.createElement("div");
            b.className = "fx-state__body";
            b.textContent = o.body;
            box.appendChild(b);
        }
        if (kind === "error" && o.onRetry) {
            const btn = document.createElement("button");
            btn.className = "fx-btn fx-btn--tonal fx-btn--sm fx-mt2";
            btn.textContent = o.retryLabel || t("state.retry");
            btn.onclick = o.onRetry;
            box.appendChild(btn);
        }
        return box;
    }
    function renderState(container, kind, opts) {
        container.innerHTML = "";
        container.appendChild(stateView(kind, opts));
    }
    /* ============ 搜索过滤 ============ */
    /** 订阅搜索框输入，对 rows 做包含匹配过滤 */
    function filterRows(input, selector, getText) {
        const apply = () => {
            const q = input.value.trim().toLowerCase();
            document.querySelectorAll(selector).forEach((row) => {
                const txt = getText ? getText(row) : row.textContent;
                row.hidden = q !== "" && !String(txt).toLowerCase().includes(q);
            });
        };
        input.addEventListener("input", apply);
        input.addEventListener("search", apply);
        return apply;
    }
    /* ============ 无障碍 ============ */
    /** 给一组元素统一添加键盘激活（Enter / Space）
     *  接受 Array / NodeList / HTMLCollection / 单个元素——
     *  注意不能用 Array.isArray 判断，NodeList 会返回 false 而被整体包成单元素数组。 */
    function clickable(els) {
        let list;
        if (!els)
            return;
        if (els.nodeType === 1)
            list = [els]; // 单个元素
        else if (typeof els.forEach === "function")
            list = Array.from(els); // NodeList/HTMLCollection
        else if (Array.isArray(els))
            list = els;
        else
            return;
        list.forEach((el) => {
            if (!el || el.nodeType !== 1 || el.dataset.fxClickable)
                return;
            el.dataset.fxClickable = "1";
            if (!el.hasAttribute("role"))
                el.setAttribute("role", "button");
            if (!el.hasAttribute("tabindex"))
                el.tabIndex = 0;
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    el.click();
                }
            });
        });
    }
    /* ============ b64 ============ */
    function b64encode(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = "";
        const CH = 0x8000;
        for (let i = 0; i < bytes.length; i += CH) {
            bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + CH)));
        }
        return btoa(bin);
    }
    function b64decode(b64) {
        if (!b64)
            return "";
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++)
            bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }
    /* ============ 波浪状态环 ============ */
    function waveRingPath(pct, timeMs) {
        const R = 100, CX = 112, CY = 112;
        const p = Math.max(0, Math.min(1, pct));
        const startA = -Math.PI / 2;
        const sweep = Math.PI * 2 * p;
        const SEGS = 96;
        let d = "";
        for (let i = 0; i <= SEGS; i++) {
            const a = startA + sweep * (i / SEGS);
            const w1 = Math.sin(a * 6 + timeMs / 1600) * 2.2;
            const w2 = Math.sin(a * 11 - timeMs / 900) * 1.1;
            const r = R + (w1 + w2) * (1 - 0.55 * p);
            d += (i === 0 ? "M" : " L") + (CX + Math.cos(a) * r).toFixed(1) + " " + (CY + Math.sin(a) * r).toFixed(1);
        }
        return d;
    }
    /* ============ 统一应用 ============ */
    function applyUI(s) {
        const id = s.uiStyle || "";
        if (id)
            document.documentElement.dataset.ui = id;
        else
            delete document.documentElement.dataset.ui;
    }
    function applyAll(s, opts) {
        applyTheme(s, opts);
        applyNavbar(s);
        syncNavbarVisibility();
        if (s.uiStyle)
            applyUI(s); // 随机风格由页面设置，空值不覆盖
        // 字体大小 / 显示大小（设置页可调）
        document.documentElement.style.setProperty("--fx-font-scale", String(s.fontScale || 1));
        document.documentElement.style.zoom = String(s.uiScale || 1);
    }
    /* ============ 配置表单 ============ */
    /*
     * 设计约束：必须原地改值，不能重新生成整份文件。
     * 配置文件里有大量解释性注释（每项背后的决策依据），重新生成会把它们全部
     * 抹掉——那是用户理解模块行为的主要线索。所以按行解析成 token，只替换
     * KEY=value 里的 value 部分，注释行与顺序原样保留。
     */
    /** 把配置文件切成行；有 key 的行记录 value 位置，其余原样保留 */
    function parseConf(text) {
        return String(text).replace(/\r\n/g, "\n").split("\n").map((raw) => {
            const m = raw.match(/^(\s*)([A-Z][A-Z0-9_]*)(\s*)=(\s*)(.*)$/);
            if (!m)
                return { raw, key: null };
            return { raw, key: m[2], eqPad: m[3], valPad: m[4], value: m[5] };
        });
    }
    function serializeConf(lines) {
        return lines
            .map((ln) => (ln.key ? ln.eqPad !== undefined
            ? ln.key + ln.eqPad + "=" + ln.valPad + ln.value
            : ln.key + "=" + ln.value : ln.raw))
            .join("\n");
    }
    function confGet(lines, key) {
        for (const ln of lines)
            if (ln.key === key)
                return ln.value;
        return undefined;
    }
    function confSet(lines, key, value) {
        let hit = false;
        for (const ln of lines) {
            if (ln.key === key) {
                ln.value = String(value);
                hit = true;
            }
        }
        return hit;
    }
    /* 控件工厂 ---------------------------------------------------------- */
    function el(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls)
            n.className = cls;
        if (text !== undefined)
            n.textContent = text;
        return n;
    }
    function makeToggle(on, onInput) {
        const wrap = el("button", "fx-toggle");
        wrap.type = "button";
        wrap.setAttribute("role", "switch");
        wrap.setAttribute("aria-checked", on ? "true" : "false");
        wrap.appendChild(el("span", "fx-toggle__knob"));
        wrap.addEventListener("click", () => {
            const next = wrap.getAttribute("aria-checked") !== "true";
            wrap.setAttribute("aria-checked", next ? "true" : "false");
            onInput(next ? 1 : 0);
        });
        return wrap;
    }
    function makeNumber(value, spec, onInput) {
        const wrap = el("div", "fx-numbox");
        const dec = el("button", "fx-numbox__btn", "−");
        dec.type = "button";
        const input = el("input", "fx-numbox__in");
        input.type = "text";
        input.inputMode = "numeric";
        input.value = String(value);
        const inc = el("button", "fx-numbox__btn", "+");
        inc.type = "button";
        const clamp = (v) => {
            let n = Number(v);
            if (!isFinite(n))
                n = spec.min !== undefined ? spec.min : 0;
            if (spec.min !== undefined && n < spec.min)
                n = spec.min;
            if (spec.max !== undefined && n > spec.max)
                n = spec.max;
            return Math.round(n);
        };
        const commit = (v) => {
            const n = clamp(v);
            input.value = String(n);
            onInput(n);
        };
        dec.addEventListener("click", () => commit(Number(input.value) - (spec.step || 1)));
        inc.addEventListener("click", () => commit(Number(input.value) + (spec.step || 1)));
        input.addEventListener("change", () => commit(input.value));
        input.addEventListener("blur", () => commit(input.value));
        wrap.append(dec, input, inc);
        return wrap;
    }
    function makeRange(value, spec, onInput) {
        const wrap = el("div", "fx-rangebox");
        const input = el("input", "fx-rangebox__in");
        input.type = "range";
        input.min = spec.min;
        input.max = spec.max;
        input.step = spec.step || 1;
        input.value = String(value);
        const out = el("span", "fx-rangebox__v", String(value) + (spec.unit || ""));
        input.addEventListener("input", () => {
            out.textContent = input.value + (spec.unit || "");
            onInput(Number(input.value));
        });
        wrap.append(input, out);
        return wrap;
    }
    function makeSelect(value, spec, onInput) {
        const wrap = el("div", "fx-selectbox");
        const sel = el("select", "fx-selectbox__in");
        sel.setAttribute("aria-label", spec.label || "");
        (spec.options || []).forEach((o) => {
            const opt = el("option", null, o.label);
            opt.value = String(o.value);
            if (String(o.value) === String(value))
                opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener("change", () => onInput(sel.value));
        wrap.appendChild(sel);
        return wrap;
    }
    function makeText(value, spec, onInput) {
        const wrap = el("div", "fx-field");
        const input = el("input");
        input.type = "text";
        input.value = value === undefined ? "" : String(value);
        input.placeholder = spec.placeholder || "";
        input.addEventListener("change", () => onInput(input.value));
        input.addEventListener("blur", () => onInput(input.value));
        wrap.appendChild(input);
        return wrap;
    }
    function makeHex(value, spec, onInput) {
        const wrap = el("div", "fx-field fx-hexbox");
        const input = el("input");
        input.type = "text";
        input.inputMode = "text";
        input.value = value === undefined ? "" : String(value);
        input.spellcheck = false;
        const commit = () => {
            const v = input.value.trim();
            const okVal = /^0x[0-9a-fA-F]{1,16}$/.test(v) || /^\d{1,20}$/.test(v);
            input.classList.toggle("fx-invalid", !okVal);
            if (okVal)
                onInput(v);
        };
        input.addEventListener("change", commit);
        input.addEventListener("blur", commit);
        wrap.appendChild(input);
        return wrap;
    }
    /** 空格/逗号分隔的进程名列表（可增删的 chip） */
    function makeChips(value, spec, onInput) {
        const wrap = el("div", "fx-chips");
        let items = String(value || "").split(/[ ]+/).filter(Boolean);
        const emit = () => onInput(items.join(" "));
        const render = () => {
            wrap.innerHTML = "";
            items.forEach((it, idx) => {
                const chip = el("span", "fx-chip");
                chip.appendChild(el("span", null, it));
                const x = el("button", "fx-chip__x", "×");
                x.type = "button";
                x.setAttribute("aria-label", "移除 " + it);
                x.onclick = () => { items.splice(idx, 1); render(); emit(); };
                chip.appendChild(x);
                wrap.appendChild(chip);
            });
            // 输入框：回车添加
            const input = el("input", "fx-chips__in");
            input.type = "text";
            input.placeholder = spec.placeholder || "添加…";
            input.setAttribute("aria-label", spec.placeholder || "添加");
            input.addEventListener("keydown", (e) => {
                if (e.key !== "Enter")
                    return;
                e.preventDefault();
                const v = input.value.trim();
                if (v && !items.includes(v)) {
                    items.push(v);
                    render();
                    emit();
                }
            });
            wrap.appendChild(input);
        };
        render();
        return wrap;
    }
    /* 渲染 -------------------------------------------------------------- */
    /**
     * 渲染结构化配置表单。
     * schema: [{group, items:[{key, type, label, desc, min, max, step, unit, options, placeholder, source}]}]
     *   source: "conf"（默认，读写配置文件行）| "param"（读写 /sys/module/ifas/parameters）
     * opts: { text, schema, params, onChange, onParamChange }
     * 返回 { el, serialize, dirtyKeys, changed, paramDirty }
     */
    function configForm(opts) {
        const lines = parseConf(opts.text || "");
        const params = Object.assign({}, opts.params || {});
        const dirty = new Set(); // conf 键
        const paramDirty = new Set(); // 内核参数
        const root = el("div", "fx-confform");
        const api = {
            el: root,
            dirtyKeys: dirty,
            paramDirty,
            get dirtyCount() { return dirty.size; },
            get paramCount() { return paramDirty.size; },
            get totalDirty() { return dirty.size + paramDirty.size; },
            serialize: () => serializeConf(lines),
            value: (k) => confGet(lines, k),
            setValue: (k, v) => {
                confSet(lines, k, v);
                const row = root.querySelector('.fx-confrow[data-key="' + CSS.escape(k) + '"]');
                if (row && k === "TARGET_APPS") {
                    const button = row.querySelector("button");
                    if (button) {
                        const count = String(v || "").split(/[\s,]+/).filter(Boolean).length;
                        button.textContent = count ? "已选 " + count + " 个应用" : "选择应用";
                    }
                }
            },
            paramValue: (k) => params[k],
            paramChanges: () => Array.from(paramDirty).map((k) => [k, params[k]]),
            markClean: () => { dirty.clear(); paramDirty.clear(); }
        };
        // 节流：拖滑块时 input 事件很密，只在一帧内通知一次底部栏
        let notifyScheduled = false;
        const notify = () => {
            if (notifyScheduled || !opts.onChange)
                return;
            notifyScheduled = true;
            requestAnimationFrame(() => {
                notifyScheduled = false;
                opts.onChange(dirty.size + paramDirty.size);
            });
        };
        // 先建分组标题与卡片，收集行任务；行本身分帧渲染。
        // 真机上配置页有 300+ 节点，一次性创建会明显卡顿。
        const rowTasks = [];
        (opts.schema || []).forEach((group) => {
            // 过滤掉真实不存在的键：conf 键看文件里有没有，param 键看内核是否导出
            const present = (group.items || []).filter((it) => {
                if (it.source === "param")
                    return Object.prototype.hasOwnProperty.call(params, it.key);
                return confGet(lines, it.key) !== undefined;
            });
            if (!present.length)
                return;
            // 分组标题；advanced 分组折叠进 details，常用分组照常展开
            let host = root;
            if (group.advanced) {
                const det = el("details", "fx-adv");
                det.appendChild(el("summary", "", group.title));
                root.appendChild(det);
                host = det;
            }
            else {
                host.appendChild(el("h2", "fx-section", group.title));
            }
            const card = el("div", "fx-card fx-card--tight");
            host.appendChild(card);
            present.forEach((it) => rowTasks.push({ card, it }));
        });
        const buildRow = (it) => {
            const isParam = it.source === "param";
            const raw = isParam ? params[it.key] : confGet(lines, it.key);
            const row = el("div", "fx-confrow");
            row.setAttribute("data-key", it.key);
            if (isParam)
                row.setAttribute("data-source", "param");
            const text = el("div", "fx-confrow__text");
            text.appendChild(el("div", "fx-confrow__label", it.label || it.key));
            if (it.desc)
                text.appendChild(el("div", "fx-confrow__desc", it.desc));
            row.appendChild(text);
            const ctl = el("div", "fx-confrow__ctl");
            const set = (v) => {
                const oldVal = isParam ? String(params[it.key]) : (confGet(lines, it.key) || "");
                if (isParam) {
                    params[it.key] = Number(v);
                    paramDirty.add(it.key);
                    if (opts.onParamChange)
                        opts.onParamChange(it.key, Number(v));
                }
                else {
                    confSet(lines, it.key, v);
                    dirty.add(it.key);
                }
                row.classList.add("fx-confrow--dirty");
                // 行内预览：旧值 → 新值（保存前就能看出改了什么）
                let delta = row.querySelector(".fx-confrow__delta");
                if (!delta) {
                    delta = el("div", "fx-confrow__delta");
                    row.querySelector(".fx-confrow__text").appendChild(delta);
                }
                const nv = String(v);
                delta.textContent = oldVal !== nv && oldVal !== "" ? oldVal + " → " + nv : "";
                delta.hidden = !delta.textContent;
                notify();
            };
            if (it.type === "toggle") {
                ctl.appendChild(makeToggle(Number(raw) === 1, set));
            }
            else if (it.type === "select") {
                ctl.appendChild(makeSelect(raw, it, set));
            }
            else if (it.type === "range") {
                ctl.appendChild(makeRange(Number(raw) || 0, it, set));
            }
            else if (it.type === "number") {
                ctl.appendChild(makeNumber(raw === "" ? 0 : Number(raw), it, set));
            }
            else if (it.type === "hex") {
                ctl.appendChild(makeHex(raw, it, set));
            }
            else if (it.type === "chips") {
                ctl.appendChild(makeChips(raw, it, set));
                row.classList.add("fx-confrow--stack");
            }
            else if (it.type === "apps") {
                // 目标应用：不在这里直接编辑，跳到独立二级页勾选（应用多，chips 不适合）
                const cnt = String(raw == null ? "" : raw).split(/[\s]+/).filter(Boolean).length;
                const btn = el("button", "fx-btn fx-btn--tonal fx-btn--sm");
                btn.type = "button";
                btn.textContent = cnt ? "已选 " + cnt + " 个应用" : "选择应用";
                btn.onclick = () => { if (opts.onOpenApps)
                    opts.onOpenApps(); };
                ctl.appendChild(btn);
                row.classList.add("fx-confrow--stack");
            }
            else {
                ctl.appendChild(makeText(raw, it, set));
            }
            row.appendChild(ctl);
            return row;
        };
        // 每帧渲染 10 行：首屏立刻出现，剩余行后续帧补齐
        let taskIdx = 0;
        const renderChunk = () => {
            const end = Math.min(taskIdx + 10, rowTasks.length);
            for (; taskIdx < end; taskIdx++) {
                const task = rowTasks[taskIdx];
                task.card.appendChild(buildRow(task.it));
            }
            if (taskIdx < rowTasks.length)
                requestAnimationFrame(renderChunk);
        };
        if (rowTasks.length)
            renderChunk();
        if (!root.children.length) {
            root.appendChild(stateView("empty", { title: t("state.empty") }));
        }
        return api;
    }
    /* ============ 导出 ============ */
    global.FX = {
        t, setLang, STRINGS,
        loadSettings, saveSettings, DEFAULTS, exportTheme, importTheme,
        applyAll, applyUI, applyTheme, applyNavbar, syncNavbarVisibility, syncNavbarHeight,
        revealSwap, wallpaperAdapt, pickWallpaper,
        toast, dialog, confirmDialog, menu, accordion,
        stateView, renderState,
        filterRows, clickable,
        b64encode, b64decode, waveRingPath,
        NAV_ICONS,
        configForm,
        conf: { parse: parseConf, serialize: serializeConf, get: confGet, set: confSet }
    };
    /* 系统主题变化时跟随（仅 auto） */
    if (window.matchMedia) {
        try {
            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
                const s = loadSettings();
                if (s.theme === "auto")
                    applyTheme(s);
            });
        }
        catch (e) { /* 老内核无 addEventListener */ }
    }
})(window);

/* ---- 30_bridge.js ---- */

"use strict";
/*
 * FindingX backend bridge.
 *
 * 统一 KernelSU / APatch / WebUI-X / MMRL / 独立 APK 的 exec 差异，
 * 对外只暴露 call(action, ...args) 与 execSh(cmd)。
 */
const FXBridge = (function () {
    /* ---- ksu 桥 ----
     * 不同模块管理器的 exec 返回结构并不统一：
     *   KernelSU / APatch : {errno:number, stdout, stderr}
     *   WebUI-X / MMRL    : 可能给 {code} 或 {exitCode}，也可能直接给字符串
     * 旧实现只认 errno:number，在 Magisk 系 WebUI 里一律抛「返回异常」，
     * 表现为整页数据都是「—」。这里做宽容解析，并把无法识别时的原始
     * 返回序列化进错误信息，方便一眼看出对方到底给了什么。
     */
    function execBridges() {
        const out = [];
        for (const c of [window.ksu, window.MMRL, window.mmrl, window.wxc]) {
            if (c && typeof c.exec === "function" && out.indexOf(c) < 0)
                out.push(c);
        }
        // 独立 APK：原生桥用 su -c 执行，回调式异步；返回结构与 ksu.exec 一致
        if (window.AndroidBridge && typeof window.AndroidBridge.execAsync === "function") {
            if (!window.__fxExecWait) {
                window.__fxExecWait = {};
                window.__fxExecSeq = 0;
                window.__fxExecCb = (id, data) => {
                    const cb = window.__fxExecWait[id];
                    if (cb) {
                        delete window.__fxExecWait[id];
                        cb(data);
                    }
                };
            }
            out.push({
                exec: (cmd) => new Promise((res) => {
                    const id = "e" + (++window.__fxExecSeq);
                    window.__fxExecWait[id] = res;
                    window.AndroidBridge.execAsync(cmd, id);
                }),
            });
        }
        return out;
    }
    /** 单次调用，返回 {stdout} 或抛出。bridgeUnusable 标记表示“这个桥给的数据
     *  没法用”，调用方可以换下一个桥重试；普通错误（退出码非 0）不重试。 */
    async function execOnce(bridge, cmd) {
        let r = bridge.exec(cmd);
        if (r && typeof r.then === "function")
            r = await r;
        if (typeof r === "string")
            return r;
        if (r == null) {
            const e = new Error("执行接口返回空值（" + cmd + "）");
            e.bridgeUnusable = true;
            throw e;
        }
        if (typeof r !== "object") {
            const e = new Error("执行接口返回 " + typeof r + "：" + String(r));
            e.bridgeUnusable = true;
            throw e;
        }
        const code = typeof r.errno === "number" ? r.errno :
            typeof r.code === "number" ? r.code :
                typeof r.exitCode === "number" ? r.exitCode :
                    null;
        const stdout = r.stdout != null ? String(r.stdout)
            : r.output != null ? String(r.output) : "";
        const stderr = r.stderr != null ? String(r.stderr) : "";
        if (code === null) {
            if (stdout)
                return stdout;
            let raw;
            try {
                raw = JSON.stringify(r);
            }
            catch (e) {
                raw = String(r);
            }
            const e = new Error("执行接口返回结构无法识别：" + raw.slice(0, 200));
            e.bridgeUnusable = true;
            throw e;
        }
        if (code !== 0)
            throw new Error(stderr.trim() || ("退出码 " + code));
        return stdout;
    }
    async function execSh(cmd) {
        const bridges = execBridges();
        if (!bridges.length) {
            throw new Error("未找到执行接口：请在 KernelSU / APatch / WebUI-X 等支持 webui 的管理器中打开本页");
        }
        let last = null;
        for (const b of bridges) {
            try {
                return await execOnce(b, cmd);
            }
            catch (e) {
                last = e;
                // 只有“桥不可用”才换下一个；命令本身失败（退出码非 0）立即上报，
                // 避免把有副作用的命令在其他桥上再执行一遍
                if (!e || !e.bridgeUnusable)
                    throw e;
            }
        }
        throw last;
    }
    /** 调用后端。args 原样作为独立参数传给 shell（内部负责加引号，
     *  调用方不要再自己拼引号——曾因此拼出 ''name' '55'' 导致命令错乱、
     *  保存静默失败却把脏标记清掉）。
     *  stdout 可能混入杂音（某些管理器把 stderr 合并进来），逐行从后往前试解析。 */
    async function call(action, ...args) {
        let cmd = "sh /data/adb/modules/findingx_webui/webui.sh " + action;
        args.forEach((a) => { cmd += " '" + String(a).replace(/'/g, "'\\''") + "'"; });
        const out = await execSh(cmd);
        const lines = String(out || "").trim().split(/\r?\n/).filter((s) => s.trim());
        for (let i = lines.length - 1; i >= 0; i--) {
            let j;
            try {
                j = JSON.parse(lines[i]);
            }
            catch (e) {
                continue;
            }
            if (j && typeof j === "object") {
                if (!j.ok)
                    throw new Error(j.error || "后端返回失败");
                return j;
            }
        }
        throw new Error("后端未返回有效 JSON（" + (lines.length ? lines[lines.length - 1].slice(0, 160) : "空输出") + "）");
    }
    return { call, execSh };
})();

/* ---- 40_schema.js ---- */

"use strict";
/*
 * FindingX configuration schema.
 * CONF_SCHEMA：findingx.conf / 内核参数；SF_SCHEMA：sf.conf。
 */
const FXSchema = (function () {
    const CONF_SCHEMA = [
        {
            title: "引擎", items: [
                { key: "ENABLED", type: "toggle", label: "启用 IFAS 引擎",
                    desc: "关闭后只运行 SF 引擎，service.sh 不拉起 fxd" },
                { key: "TARGET_FPS", type: "number", label: "目标帧率", desc: "事件节奏基准", min: 24, max: 240, step: 1, unit: "fps" },
                { key: "SAMPLE_MS", type: "number", label: "采样周期", desc: "越小越及时，也越费电", min: 4, max: 100, step: 1, unit: "ms" },
                { key: "LEVEL", type: "number", label: "性能档位", desc: "1 性能优先 / 2 均衡 / 3 轻度节能 / 4 明显节能；应用页可单独覆盖", min: 1, max: 4, step: 1 },
                { key: "PROFILE", type: "select", label: "策略组", desc: "全局策略；应用策略可在应用页单独覆盖", options: [
                        { label: "low", value: "powersave" }, { label: "medium", value: "balance" },
                        { label: "high", value: "performance" }, { label: "xhigh", value: "gaming" },
                        { label: "max", value: "fast" },
                    ] },
                { key: "APP_PROFILE", type: "apps", label: "应用策略组", desc: "进入应用页，为任意已安装应用选择策略组" },
                { key: "APP_TARGET_FPS", type: "text", label: "应用目标帧率", desc: "格式：包名:30/60/120，多个应用用逗号分隔；留空跟随全局档位" },
            ],
        },
        {
            title: "负载判定", items: [
                { key: "BUSY_HIGH", type: "range", label: "升频阈值", desc: "整机 CPU 占用（非空闲占比，与 PerfDog 同口径）达到该值开始投递帧事件", min: 5, max: 100, step: 1, unit: "%" },
                { key: "BUSY_LOW", type: "range", label: "释放阈值", desc: "低到该值并连续确认后停止投递。整机口径下建议 8-15", min: 0, max: 90, step: 1, unit: "%" },
                { key: "RELEASE_CONFIRM", type: "number", label: "释放确认拍数", desc: "连续多少拍低于释放阈值才松手；太小会让频率反复甩", min: 1, max: 30, step: 1 },
                { key: "COOLDOWN_MS", type: "number", label: "冷却期", desc: "一次释放后多久才允许再次升频", min: 0, max: 5000, step: 50, unit: "ms" },
            ],
        },
        {
            title: "内核通道", items: [
                { key: "ENABLE_GPU_POLICY", type: "toggle", label: "解锁 GPU 策略",
                    desc: "enable_gpu_policy。反汇编确认它有真实读取点，默认 0 时 GPU 事件全部无效" },
                { key: "ENABLE_GPU_EVENTS", type: "toggle", label: "发送 GPU 帧事件",
                    desc: "真机实测会与厂商 HAL 互搏（SOC 107.8℃），默认关闭" },
                { key: "IDENT", type: "hex", label: "identifier", desc: "固定值复用同一 buffer，避免内核 25 项防泄漏瞬断" },
            ],
        },
        {
            title: "温度门控", items: [
            ],
        },
        {
            title: "目标与其他", items: [
                { key: "TARGET_APPS", type: "apps", label: "目标应用", desc: "点击右侧按钮进入列表勾选；全部取消 = 全局模式（tid=1）" },
                { key: "SCAN_MS", type: "number", label: "目标扫描周期", desc: "查找前台进程的间隔", min: 200, max: 10000, step: 100, unit: "ms" },
            ],
        },
        /* ---- 以下直接读写 /sys/module/ifas/parameters（改完立即生效，重启丢失）----
           ifas_enable 与 enable_gpu_policy 不在此列：由 fxd 启动时接管并负责还原。 */
        {
            title: "内核 · CPU 负载门控", advanced: true, items: [
                { key: "cpu_loading_enable", source: "param", type: "toggle", label: "启用 CPU 负载门控",
                    desc: "厂商默认 1。关掉后升降频完全由 jank 计数驱动" },
                { key: "cpu_loading_high", source: "param", type: "range", label: "升频负载阈值",
                    desc: "高于该负载才升频。厂商默认 100 = 永远不触发，等于废掉门控", min: 0, max: 100, step: 1, unit: "%" },
                { key: "cpu_loading_low", source: "param", type: "range", label: "降频负载阈值",
                    desc: "低于该负载才降频。厂商默认 0 = 永远不降", min: 0, max: 100, step: 1, unit: "%" },
                { key: "scaling_cur_freq_enable", source: "param", type: "toggle", label: "按当前频率缩放",
                    desc: "以 scaling_cur_freq 为基准计算步进（而非 max_freq）" },
                { key: "rescue_freq_level_up", source: "param", type: "number", label: "救援升频档数", desc: "jank 时一次性跳几档", min: 0, max: 20, step: 1 },
                { key: "rescue_freq_level_down", source: "param", type: "number", label: "救援降频档数", desc: "连续正常帧后回落几档", min: 0, max: 20, step: 1 },
            ],
        },
        {
            title: "内核 · 帧判定", advanced: true, items: [
                { key: "fixed_target_fps", source: "param", type: "number", label: "固定目标帧率",
                    desc: "内核用于换算帧周期的目标值，≤29 会被钳到 60", min: 0, max: 240, step: 1, unit: "fps" },
                { key: "normal_frame_keep_count", source: "param", type: "number", label: "正常帧保留数", desc: "判定为正常帧需要连续多少帧", min: 0, max: 240, step: 1 },
                { key: "jank_frame_keep_count", source: "param", type: "number", label: "jank 帧保留数", desc: "jank 判定的统计窗口帧数", min: 0, max: 240, step: 1 },
                { key: "jank_frame_delta", source: "param", type: "number", label: "jank 判定阈值", desc: "帧时长超出目标多少算一次 jank", min: 0, max: 500, step: 1, unit: "ms" },
                { key: "ifas_detect_cpu_jank", source: "param", type: "toggle", label: "检测 CPU 侧 jank", desc: "开启后 CPU 通道也参与 jank 统计" },
                { key: "delay_num_frame", source: "param", type: "number", label: "自动释放延迟",
                    desc: "停止喂事件后多少帧触发降频；<120 会被钳到 120（默认 300 ≈ 5s@60fps）", min: 120, max: 3000, step: 10, unit: "帧" },
                { key: "single_frame_boost", source: "param", type: "number", label: "单帧冲刺频率", desc: "遇到单帧超时时的冲击频率", min: 0, max: 5000, step: 50, unit: "MHz" },
                { key: "single_frame_up", source: "param", type: "toggle", label: "启用单帧冲刺", desc: "允许因单帧超时直接拉高一次" },
            ],
        },
        {
            title: "内核 · 步进系数", advanced: true, items: [
                { key: "scaling_a", source: "param", type: "number", label: "缩放系数 A", desc: "负载→频率映射的乘数项", min: 0, max: 2000, step: 1 },
                { key: "scaling_b", source: "param", type: "number", label: "缩放系数 B", desc: "负载→频率映射的加数项", min: 0, max: 1000, step: 1 },
                { key: "scaling_c", source: "param", type: "number", label: "缩放系数 C", desc: "步长的除数项", min: 0, max: 100, step: 1 },
                { key: "target_scaling", source: "param", type: "number", label: "目标缩放", desc: "目标频率的整体缩放因子", min: 0, max: 100, step: 1 },
                { key: "load_scaling_x", source: "param", type: "number", label: "负载缩放 X", desc: "负载值的横向缩放", min: 0, max: 100, step: 1 },
                { key: "load_scaling_y", source: "param", type: "number", label: "负载缩放 Y", desc: "负载值的纵向缩放", min: 0, max: 100, step: 1 },
                { key: "load_reset", source: "param", type: "toggle", label: "负载重算", desc: "每次评估前是否重置累计负载" },
            ],
        },
        {
            title: "内核 · GPU 策略", advanced: true, items: [
                { key: "gpu_loading_high", source: "param", type: "range", label: "GPU 升频阈值", desc: "默认 100 = 不触发", min: 0, max: 100, step: 1, unit: "%" },
                { key: "gpu_loading_low", source: "param", type: "range", label: "GPU 降频阈值", desc: "默认 0 = 不降", min: 0, max: 100, step: 1, unit: "%" },
                { key: "gpu_stepup_scaling", source: "param", type: "range", label: "GPU 升频步长", desc: "每次升频跨越的档位比例", min: 0, max: 100, step: 1, unit: "%" },
                { key: "gpu_stepdown_scaling", source: "param", type: "range", label: "GPU 降频步长", desc: "每次降频跨越的档位比例", min: 0, max: 100, step: 1, unit: "%" },
                { key: "gpu_frame_match_count", source: "param", type: "number", label: "GPU 帧匹配计数", desc: "参与 GPU 策略的连续帧数", min: 0, max: 240, step: 1 },
                { key: "gpu_frame_match_count_gate", source: "param", type: "number", label: "GPU 帧匹配门限", desc: "达到多少帧才允许调频", min: 0, max: 240, step: 1 },
                { key: "gpu_max_pwrlevel_ceiling", source: "param", type: "number", label: "GPU 最高档位上限", desc: "0 = 不限制，数值越小频率上限越低", min: 0, max: 64, step: 1 },
                { key: "rescue_gpu_level_up", source: "param", type: "number", label: "GPU 救援升档", desc: "jank 时一次跳几档", min: 0, max: 20, step: 1 },
                { key: "rescue_gpu_level_down", source: "param", type: "number", label: "GPU 救援降档", desc: "回落时一次降几档", min: 0, max: 20, step: 1 },
            ],
        },
        {
            title: "内核 · 用户态频率接受", advanced: true, items: [
                { key: "accept_userset_freq_max", source: "param", type: "toggle", label: "接受用户态最高频", desc: "允许外部写入的 max_freq 生效" },
                { key: "accept_userset_freq_min", source: "param", type: "toggle", label: "接受用户态最低频", desc: "允许外部写入的 min_freq 生效" },
                { key: "accept_userset_gpu_freq_max", source: "param", type: "toggle", label: "接受 GPU 最高档", desc: "允许外部写入的 GPU 上限生效" },
                { key: "accept_userset_gpu_freq_min", source: "param", type: "toggle", label: "接受 GPU 最低档", desc: "允许外部写入的 GPU 下限生效" },
                { key: "ifas_log_enable", source: "param", type: "toggle", label: "内核日志", desc: "打开后 dmesg 会有 IFAS 调试输出，刷得很快" },
            ],
        },
    ];
    const SF_SCHEMA = [
        {
            title: "SF 引擎", items: [
                { key: "ENABLED", type: "toggle", label: "启用 SF 引擎", desc: "关闭后开机不写任何 debug.sf.* 属性" },
                { key: "SF_GL_BACKPRESSURE", type: "toggle", label: "合成背压", desc: "把集中丢帧摊平为均匀轻微延迟（低风险）" },
                { key: "SF_PREDICTIVE_BACKPRESSURE", type: "toggle", label: "预测式背压", desc: "提前一帧预判，效果优于普通背压（Android 13+）" },
                { key: "SF_LAYER_CACHING", type: "toggle", label: "图层缓存", desc: "缓存未变化图层，减少每帧重复合成开销" },
                { key: "SF_FRAME_RATE_OVERRIDE", type: "toggle", label: "帧率覆盖", desc: "让 SF 按内容决定帧率（中风险，默认开）" },
                { key: "SF_FRAME_RATE_MULTIPLE_THRESHOLD", type: "number", label: "帧率倍数阈值", desc: "仅在上项开启时生效，0 = 不设", min: 0, max: 100, step: 1 },
                { key: "SF_IDLE_TIMER_MS", type: "number", label: "空闲计时", desc: "0 = 系统默认", min: 0, max: 10000, step: 100, unit: "ms" },
                { key: "SF_LATCH_UNSIGNALED", type: "toggle", label: "不等 vsync 提交", desc: "降低约一帧延迟，可能撕裂（中高风险）" },
                { key: "SF_BOOST_CPUSET", type: "toggle", label: "SF cpuset 提升", desc: "把 surfaceflinger 放进指定 cpuset 组，避免被后台挤占（运行时生效，service 重启应用）" },
                { key: "SF_CPUSET_GROUP", type: "select", label: "cpuset 组", options: [
                        { label: "top-app", value: "top-app" },
                        { label: "foreground", value: "foreground" },
                    ], desc: "组不存在时 service.sh 记录日志并跳过" },
            ],
        },
    ];
    return { CONF_SCHEMA, SF_SCHEMA };
})();

/* ---- 50_pages.js ---- */

/*
 * FindingX page logic.
 *
 * 仪表盘轮询、配置读写、日志、设置、应用页与启动流程。
 * 依赖 20_core.ts 的 FX 与 30_bridge.ts 的 FXBridge。
 */
"use strict";
/* ================= 页面逻辑 ================= */
(function (FX, FXBridge) {
    const $ = (id) => document.getElementById(id);
    const call = FXBridge.call;
    const CONF_SCHEMA = FXSchema.CONF_SCHEMA;
    const SF_SCHEMA = FXSchema.SF_SCHEMA;
    const PAGES = ["dash", "conf", "log", "settings", "apps"];
    let S = FX.loadSettings();
    let curPage = "dash";
    let dashTimer = null;
    let running = false; // 守护是否在跑（决定按钮文案）
    let lastState = null;
    const applyUI = () => FX.applyAll(S);
    /* ---- 分段控件 ---- */
    function bindSegGroups() {
        document.querySelectorAll("[data-setting]").forEach((group) => {
            const key = group.getAttribute("data-setting");
            group.querySelectorAll(".fx-seg__btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    S[key] = btn.getAttribute("data-val");
                    FX.saveSettings(S);
                    if (key === "theme")
                        FX.applyTheme(S, { revealFrom: btn });
                    else
                        applyUI();
                    syncSegState();
                });
            });
        });
    }
    function syncSegState() {
        document.querySelectorAll("[data-setting]").forEach((group) => {
            const key = group.getAttribute("data-setting");
            group.querySelectorAll(".fx-seg__btn").forEach((btn) => {
                btn.setAttribute("aria-pressed", String(S[key] === btn.getAttribute("data-val")));
            });
        });
    }
    /* ---- 风扇（/sys/kernel/fan/*） ---- */
    let fanEn = false, fanLv = 0, fanUnsupported = false, fanBusy = false;
    async function initFan() {
        if (fanBusy)
            return;
        try {
            const j = await call("fan");
            const tgl = $("fanToggle"), lv = $("fanLevel"), st = $("fanState");
            if (!tgl || !lv || !st)
                return;
            if (!j.supported) {
                fanUnsupported = true;
                tgl.disabled = true;
                lv.disabled = true;
                st.textContent = "本机无风扇节点";
                return;
            }
            fanEn = String(j.enable) === "1";
            fanLv = parseInt(j.level, 10) || 0;
            tgl.setAttribute("aria-checked", fanEn ? "true" : "false");
            lv.value = String(fanLv);
            st.textContent = (fanEn ? "手动 · 档位 " + fanLv : "系统接管") +
                (j.speed && j.speed !== "?" ? " · 转速 " + j.speed : "");
        }
        catch (e) { /* 后端不可用时保持静默 */ }
    }
    async function applyFan() {
        if (fanUnsupported || fanBusy)
            return;
        fanBusy = true;
        try {
            const r = await call("fan_set", fanEn ? "1" : "0", String(fanLv));
            // 档位节点拒绝写入时后端只返回 warn：开关已生效，不按失败处理
            if (r && r.warn) {
                FX.toast("开关已生效，档位未写入（节点拒绝）", 3000);
            }
            await initFan();
        }
        catch (e) {
            FX.toast("风扇写入失败：" + e.message, 3000);
        }
        finally {
            fanBusy = false;
        }
    }
    $("fanToggle").addEventListener("click", () => {
        if (fanUnsupported)
            return;
        fanEn = !fanEn;
        $("fanToggle").setAttribute("aria-checked", fanEn ? "true" : "false");
        applyFan();
    });
    $("fanLevel").addEventListener("change", () => {
        if (fanUnsupported)
            return;
        fanLv = parseInt($("fanLevel").value, 10) || 0;
        applyFan();
    });
    /* ---- 路由 ---- */
    let keepConfForm = false; // 从二级页返回时保留表单，避免丢掉未保存的改动
    let confSaveFailUntil = 0; // 保存失败后的冷却截止时间（毫秒），避免每次切页都重试
    const pageScroll = {};
    async function showPage(name) {
        if (!PAGES.includes(name))
            name = "dash";
        const prev = curPage;
        if (prev === "conf" && prev !== name && formMain
            && Date.now() >= confSaveFailUntil
            && (formMain.totalDirty > 0 || (formSf && formSf.dirtyCount > 0))) {
            await saveConf(true);
        }
        if (prev && prev !== name)
            pageScroll[prev] = window.scrollY;
        curPage = name;
        PAGES.forEach((p) => { const el = $("page-" + p); if (el)
            el.hidden = p !== name; });
        document.querySelectorAll(".fx-navbtn").forEach((b) => {
            if (b.getAttribute("data-page") === name)
                b.setAttribute("aria-current", "page");
            else
                b.removeAttribute("aria-current");
        });
        FX.syncNavbarVisibility();
        // 采样定时器只跟页面类型有关，已经在跑就复用，别每次切页都重建
        const needDash = name === "dash";
        if (needDash) {
            if (!dashTimer)
                startDash();
        }
        else {
            stopDash();
        }
        // 先让页面切换完成再发请求；exec 是同步调用，放在同一帧里会让底栏点起来发滞
        if (name === "conf" && !keepConfForm) {
            requestAnimationFrame(() => { loadConf().catch(showLoadError); });
        }
        keepConfForm = false;
        if (name === "apps") {
            loadApps();
        }
        if (name === "log")
            loadLog();
        if (name === "settings")
            initFan();
        window.scrollTo(0, pageScroll[name] || 0);
    }
    document.querySelectorAll(".fx-navbtn").forEach((b) => {
        b.addEventListener("click", () => showPage(b.getAttribute("data-page")));
    });
    $("bTopSettings").addEventListener("click", () => showPage("settings"));
    $("bDashRefresh").addEventListener("click", () => { refreshDash(); });
    // 内核通道折叠：默认只显示 3 行，其余收起
    // 环境入口：展开时才拉取并显示五项状态（模块 / 后端 / 引擎 / 内核 / 权限）
    const bEnv = document.getElementById("bEnv");
    const envBox = document.getElementById("envBox");
    if (bEnv && envBox) {
        bEnv.addEventListener("click", () => {
            const open = envBox.hidden;
            envBox.hidden = !open;
            bEnv.setAttribute("aria-expanded", open ? "true" : "false");
            if (open)
                refreshDash();
        });
    }
    function updateEnv(j) {
        const host = document.getElementById("envState");
        if (!host || !envBox || envBox.hidden)
            return;
        const env = j.env || {};
        host.querySelectorAll(".fx-kstate__item").forEach((el) => {
            const k = el.getAttribute("data-k");
            const ok = env[k] === 1;
            el.setAttribute("data-ok", ok ? "1" : "0");
            const v = el.querySelector(".fx-kstate__v");
            if (v)
                v.textContent = ok ? "正常" : "缺失";
        });
    }
    const bKMore = document.getElementById("bKMore");
    if (bKMore) {
        bKMore.addEventListener("click", () => {
            const more = document.querySelectorAll('#kState .fx-kstate__item[data-more="1"]');
            if (!more.length)
                return;
            const open = more[0].hidden;
            more.forEach((el) => {
                el.hidden = !open;
                if (open)
                    el.classList.add("fx-kstate__item--in");
            });
            bKMore.setAttribute("aria-expanded", open ? "true" : "false");
            const label = document.getElementById("bKMoreLabel");
            if (label)
                label.textContent = open ? "收起" : "展开更多";
        });
    }
    $("bSettingsBack").addEventListener("click", () => showPage("dash"));
    /* ---- 设置工具行 ---- */
    const TOOL_ICONS = {
        theme: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 16V5a7 7 0 0 1 0 14Z"/></svg>',
        wallpaper: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4Zm2 2v8l3-3 3 3 3-4 3 4V6Z"/></svg>',
        navbar: '<svg viewBox="0 0 24 24"><path d="M3 15h18v6H3Zm0-12h18v6H3Z"/></svg>',
    };
    /* ---- 壁纸 ---- */
    $("bWallpaperPick").addEventListener("click", () => {
        FX.pickWallpaper((url) => {
            S.wallpaper = url;
            FX.saveSettings(S);
            applyUI();
            FX.toast(FX.t("common.saved"));
        });
    });
    $("bWallpaperClear").addEventListener("click", () => {
        S.wallpaper = "";
        FX.saveSettings(S);
        applyUI();
    });
    /* ---- 主题导入导出 ---- */
    $("bThemeExport").addEventListener("click", async () => {
        const json = FX.exportTheme();
        try {
            await navigator.clipboard.writeText(json);
            FX.toast(FX.t("settings.exported"));
        }
        catch (e) {
            FX.toast(json, 5000);
        }
    });
    $("bThemeImport").addEventListener("click", async () => {
        const input = document.createElement("textarea");
        input.className = "fx-textarea";
        input.style.minHeight = "110px";
        input.placeholder = FX.t("settings.importPh");
        const ok = await FX.dialog({
            title: FX.t("settings.import"), content: input, ok: FX.t("common.ok"), cancel: null,
        });
        if (!ok)
            return;
        if (FX.importTheme(input.value)) {
            S = FX.loadSettings();
            applyUI();
            syncSegState();
            FX.toast(FX.t("common.saved"));
        }
        else {
            FX.toast("JSON 无效", 2500);
        }
    });
    /* ---- 恢复默认 ---- */
    $("bSettingsReset").addEventListener("click", async () => {
        const ok = await FX.confirmDialog({ title: FX.t("settings.reset"), body: FX.t("settings.resetBody") });
        if (!ok)
            return;
        Object.keys(FX.DEFAULTS).forEach((k) => { S[k] = FX.DEFAULTS[k]; });
        FX.saveSettings(S);
        applyUI();
        syncSegState();
        FX.toast(FX.t("common.saved"));
    });
    /* ---- 仪表盘 ---- */
    function stopDash() {
        if (dashTimer) {
            clearInterval(dashTimer);
            dashTimer = null;
        }
    }
    function startDash() {
        // 幂等：已经在采样就不要重建定时器，否则每次切页都会多发一次 status
        if (dashTimer) {
            return;
        }
        // 先让页面切过去再发请求（exec 在 WebUI 容器里是一次进程调用，同步排队会卡住首帧）
        setTimeout(refreshDash, 16);
        dashTimer = setInterval(refreshDash, 2000);
    }
    const B = (cls, text) => { const s = document.createElement("span"); s.className = "fx-badge fx-badge--" + cls; s.textContent = text; return s; };
    function setBadge(id, cls, text) {
        const el = $(id);
        if (!el)
            return;
        el.className = "fx-badge fx-badge--" + cls;
        el.textContent = text;
    }
    function renderDash(j) {
        const st = j.state || {};
        lastState = st;
        running = !!j.running;
        const appVer = $("appVer");
        if (appVer)
            appVer.textContent = j.version ? "v" + j.version : "";
        renderCapability(j, st);
        if ($("sRun")) setBadge("sRun", running ? "on" : "off", running ? "运行中" : "已停止");
        if ($("sEng")) setBadge("sEng", st.engaged ? "primary" : "off", st.engaged ? FX.t("dash.delivering") : FX.t("dash.idle"));
        if ($("sGate")) setBadge("sGate", st.overTemp ? "err" : "on", st.overTemp ? FX.t("dash.paused") : FX.t("dash.normal"));
        if ($("mCeil")) $("mCeil").textContent = st.ceilingLow ? FX.t("dash.ceilingLow") : FX.t("dash.ceilingOrig");
        if ($("mFrames")) $("mFrames").textContent = st.frames != null ? st.frames : "—";
        if ($("mEvents")) $("mEvents").textContent = st.events != null ? st.events : "—";
        if ($("sTid")) $("sTid").textContent = st.tid != null ? st.tid : "—";
        if ($("sEr")) $("sEr").textContent = (st.engages != null ? st.engages : "—") + " / " + (st.releases != null ? st.releases : "—");
        if ($("sDev")) $("sDev").textContent = j.ko && j.ko.dev === "true" ? FX.t("dash.present") : FX.t("dash.absent");
        if ($("sIe")) $("sIe").textContent = j.ko ? j.ko.ifas_enable : "—";
        if ($("sEgp")) $("sEgp").textContent = j.ko && j.ko.enable_gpu_policy === "1" ? "1 · " + FX.t("dash.unlocked") : (j.ko ? j.ko.enable_gpu_policy : "—");
        // 内核版本与刷入时识别的策略（customize.sh 写入）
        const sKern = $("sKern");
        if (sKern)
            sKern.textContent = (j.kernel || "?") + " · " + (j.kernelProfile || "?");
        // 徽章状态点：1 = 正常/启用，0 = 未启用/缺失
        const ks = $("kState");
        const setK = (k, ok) => {
            if (!ks)
                return;
            const el = ks.querySelector('[data-k="' + k + '"]');
            if (el)
                el.setAttribute("data-ok", ok ? "1" : "0");
        };
        setK("dev", j.ko.dev === "true");
        setK("ie", j.ko.ifas_enable === "1");
        setK("egp", j.ko.enable_gpu_policy === "1");
        setK("tid", st.tid != null && st.tid > 0);
        setK("er", !!st.engaged);
        setK("ceil", !st.ceilingLow);
        // 策略可观测性(4.26.03,与既有条目同风格:$() 直取 + 无守卫;
        // 着色由 data-ok 驱动 dot,值文本不做内联着色)
        setK("scene", st.scene != null && st.scene !== "off");
        $("sScene").textContent = (st.scene && st.scene !== "off" ? st.scene : "关") +
            " · " + (st.tb === true ? "加速中" : "待命");
        setK("slope", st.slope != null);
        $("sSlope").textContent = st.slope != null
            ? (st.slope > 0 ? "+" : "") + (st.slope / 100).toFixed(1)
            : "—";
        setK("gpu", !!st.gpuGuard && st.gpuGuard !== "off");
        $("sGpu").textContent = st.gpuGuard && st.gpuGuard !== "off" && st.gpuGuard !== "idle"
            ? ({ boost: "托底中", damp: "抑抖中" }[st.gpuGuard] || st.gpuGuard) +
              (st.gpuCv != null ? " " + st.gpuCv + "%" : "")
            : st.gpuCv != null ? "无 " + st.gpuCv + "%"
            : "—";
        // HAWK 策略展示(4.28.00,kState 风格:setK 驱动 dot,简洁值文本):
        // hawkTh 热状态(温度安全→亮/HOT→灰)、hawkBatt 电量(充电或充足→亮/SAVE→灰)、
        // hawk 档位(Full/Normal→亮,Save/Emergency→灰)。感知器不可用→"—"不误报。
        setK("hawkTh", st.temp != null && st.temp >= 0 && st.temp < 75);
        $("sHawkTh").textContent = st.temp != null && st.temp >= 0 ? st.temp + "℃" : "—";
        setK("hawkBatt", st.chg === true || (st.batt != null && st.batt > 20));
        $("sHawkBatt").textContent = st.batt != null && st.batt > 0
            ? st.batt + "%" + (st.chg === true ? " ⚡" : "")
            : "—";
        setK("hawk", st.hawk === "full" || st.hawk === "normal");
        $("sHawk").textContent = st.hawk
            ? ({ full: "全速", normal: "正常", hot: "过热", save: "省电", emergency: "紧急" }[st.hawk] || st.hawk)
            : "—";
        // THERMAL 温度降档(4.31.00,kState 风格):off(未降档)→亮,mild 及以上→灰;
        // 值 = 中文档位名(与后端 level_name 一致),无字段→"—"不误报。
        setK("thermal", st.thermal === "off");
        $("sThermal").textContent = st.thermal
            ? ({ off: "未降档", mild: "轻度降档", moderate: "中度降档",
                 severe: "重度降档", critical: "临界降档" }[st.thermal] || st.thermal)
            : "—";
        // FLOW 帧节奏(4.30.00,kState 风格):评级 good/smooth→亮,fair/bumpy/none→灰;
        // 值 = 平滑分数 + 评级文案;none(无前台渲染)→"—"不误报。
        setK("flow", st.flow === "smooth" || st.flow === "good");
        $("sFlow").textContent = st.flow && st.flow !== "none"
            ? st.flowScore + " · " +
              ({ smooth: "平稳", good: "良好", fair: "一般", bumpy: "颠簸" }[st.flow] || st.flow)
            : "—";
        updateEnv(j);
    }

    function renderCapability(j, st) {
        const dev = j.ko && j.ko.dev === "true";
        const kernel = dev ? (j.ko.ifas_enable === "1" ? 100 : 65) : 0;
        const frame = j.running ? (st.engaged ? 100 : 72) : null;
        const gpu = st.gpuGuard ? (st.gpuGuard === "off" ? null : (st.gpuGuard === "idle" ? 75 : 100)) : null;
        const thread = j.xts ? (j.xts.running ? 100 : 0) : null;
        const sf = j.sf ? (j.sf.enabled ? 100 : 0) : null;
        const health = j.env ? (j.env.root && j.env.fxd ? 100 : (j.env.root ? 50 : 0)) : null;
        const axes = [["IFAS 内核", kernel], ["帧调度", frame], ["GPU 稳定", gpu], ["线程调度", thread], ["SF 合成", sf], ["健康度", health]];
        const pts = axes.map((a, i) => {
            const angle = -Math.PI / 2 + i * Math.PI / 3;
            const r = 96 * Math.max(0, Math.min(100, a[1] == null ? 0 : a[1])) / 100;
            return `${(180 + Math.cos(angle) * r).toFixed(1)},${(156 + Math.sin(angle) * r).toFixed(1)}`;
        }).join(" ");
        const area = $("capRadarArea");
        if (area) area.setAttribute("points", pts);
        const dots = $("capRadarDots");
        if (dots) dots.innerHTML = axes.map((a, i) => {
            const angle = -Math.PI / 2 + i * Math.PI / 3;
            const r = 96 * Math.max(0, Math.min(100, a[1] == null ? 0 : a[1])) / 100;
            return `<circle cx="${(180 + Math.cos(angle) * r).toFixed(1)}" cy="${(156 + Math.sin(angle) * r).toFixed(1)}" r="4"/>`;
        }).join("");
        const measured = axes.filter(a => a[1] != null);
        const avg = measured.length ? Math.round(measured.reduce((n, a) => n + a[1], 0) / measured.length) : null;
        const score = $("capScore"); if (score) score.textContent = avg == null ? "—" : avg;
        const legend = $("capLegend");
        if (legend) legend.innerHTML = axes.map(a => `<div class="fx-capability__item"><span>${a[0]}</span><b>${a[1] == null ? "未接入" : a[1]}</b></div>`).join("");
    }
    let connFailStreak = 0;
    async function refreshDash() {
        try {
            const j = await call("status");
            renderDash(j);
            connFailStreak = 0;
            hideConnError();
        }
        catch (e) {
            // 连续两次失败才亮横幅：单次超时/抖动不弹，避免横幅闪一下又消失
            connFailStreak++;
            if (connFailStreak >= 2)
                showConnError(e);
        }
    }
    /* ---- 连接错误横幅 ---- */
    function showConnError(e) {
        const box = $("connErr");
        if (!box)
            return;
        box.hidden = false;
        $("connErrMsg").textContent = e && e.message ? e.message : String(e);
        $("connErrDiag").textContent = diagnoseBridge();
    }
    function hideConnError() {
        const box = $("connErr");
        if (box && !box.hidden)
            box.hidden = true;
    }
    /** 把当前环境能看到的执行接口列举出来，便于判断是哪个管理器 */
    function diagnoseBridge() {
        const found = [];
        if (window.ksu && typeof window.ksu.exec === "function")
            found.push("ksu.exec");
        if (window.MMRL && typeof window.MMRL.exec === "function")
            found.push("MMRL.exec");
        if (window.mmrl && typeof window.mmrl.exec === "function")
            found.push("mmrl.exec");
        if (window.wxc && typeof window.wxc.exec === "function")
            found.push("wxc.exec");
        return found.length ? ("已检测到：" + found.join("、")) : "未检测到任何 exec 接口";
    }
    /* ---- 配置 ----
     * 表单视图为主：按 schema 渲染 24 个配置项，原地改值（保留注释与键顺序）。
     * 源码视图保留，用于查看注释原文或粘贴整份配置。
     */
    let confText = { main: "", sf: "" };
    let koParams = {}; // /sys/module/ifas/parameters 的实时值
    let formMain = null, formSf = null;
    function dirtyTotal() {
        return (formMain ? formMain.totalDirty : 0) + (formSf ? formSf.dirtyCount : 0);
    }
    function updateSaveBar() {
        const n = dirtyTotal();
        const bar = $("saveBar");
        if (!bar)
            return;
        bar.classList.toggle("fx-show", n > 0);
        bar.setAttribute("aria-hidden", n > 0 ? "false" : "true");
        $("saveBarText").textContent = n > 0 ? ("有 " + n + " 项改动未保存") : "";
        const st = $("confStatus");
        if (st)
            st.textContent = n > 0 ? "" : (confText.main ? "已同步" : "");
    }
    function buildForms() {
        const host = $("confFormHost");
        host.innerHTML = "";
        formMain = FX.configForm({
            text: confText.main, schema: CONF_SCHEMA, params: koParams,
            onChange: updateSaveBar,
            onOpenApps: () => showPage("apps"),
        });
        formSf = FX.configForm({
            text: confText.sf, schema: SF_SCHEMA,
            onChange: updateSaveBar,
        });
        const wrap = document.createElement("div");
        wrap.appendChild(formMain.el);
        if (Object.keys(koParams).length) {
            const note = document.createElement("p");
            note.className = "fx-micro fx-dim";
            note.style.cssText = "padding-inline:4px;margin:-4px 0 8px";
            note.textContent = "直接读写 /sys/module/ifas/parameters/：改动立即生效，并保存到 /data/adb/findingx/kernel_params.conf，开机由守护重新应用。";
            wrap.appendChild(note);
        }
        wrap.appendChild(formSf.el);
        host.appendChild(wrap);
        updateSaveBar();
    }
    function sectionLabel(text) {
        const h = document.createElement("h2");
        h.className = "fx-section";
        h.textContent = text;
        return h;
    }
    /** 拉取两份配置 + 内核参数。参数读不到时整组自动隐藏（不同 ko 参数集不同）。
     *  加序号防重入：快速切页会并发触发多次加载，旧请求的结果必须丢弃，
     *  否则会把刚渲染好的表单又重建一遍（表现为闪一下、更差的会卡顿）。 */
    let confLoadSeq = 0;
    async function loadConf() {
        const seq = ++confLoadSeq;
        // 一次拿到配置 + 参数。WebView 的 exec 是同步阻塞的，
        // 原来 read_main/read_sf/params 三次调用会把切到配置页的动作拖慢数百毫秒。
        const j = await call("all");
        const main = FX.b64decode(j.main);
        const sf = FX.b64decode(j.sf);
        const params = j.params || {};
        if (seq !== confLoadSeq)
            return; // 已有更新的加载请求，丢弃本次
        confText.main = main;
        confText.sf = sf;
        koParams = params;
        buildForms();
        updateAppsButton(); // 表单重建后同步「已选 N 个应用」
    }
    function showLoadError(e) {
        FX.toast("加载失败：" + e.message, 3000);
        FX.renderState($("confFormHost"), "error", {
            title: FX.t("state.error"), body: e.message, onRetry: () => loadConf().catch(showLoadError),
        });
    }
    /** 保存：配置走文件，内核参数逐个写 sysfs（顺序写，失败单独报告） */
    async function saveConf(silent) {
        if (!formMain && !formSf)
            return;
        const mainKeys = formMain ? Array.from(formMain.dirtyKeys) : [];
        const sfKeys = formSf ? Array.from(formSf.dirtyKeys) : [];
        const paramChanges = formMain ? formMain.paramChanges() : [];
        if (!mainKeys.length && !sfKeys.length && !paramChanges.length) {
            if (!silent)
                FX.toast("没有改动");
            return;
        }
        let confOk = 0;
        const confFail = [];
        const paramFail = [];
        /* 1.11.0：整文件写入（一次 exec）优先。
           逐键写 58 次会把保存/切页拖到几秒，每次还有失败概率。
           整份 base64 约 4-5KB；万一管理器截断，回退逐键保证兼容。 */
        async function writeWhole(action, form, dirtySet, names) {
            if (!names.length)
                return;
            try {
                await call(action, FX.b64encode(form.serialize()));
                names.forEach((k) => dirtySet.delete(k));
                confOk += names.length;
            }
            catch (e) {
                for (const k of names) {
                    const want = String(form.value(k) ?? "");
                    try {
                        const r = await call("set_conf", action === "save_main" ? "findingx.conf" : "sf.conf", k, want);
                        if (String(r.value).trim() !== want.trim()) {
                            throw new Error("回读不一致：" + r.value);
                        }
                        dirtySet.delete(k);
                        confOk++;
                    }
                    catch (e2) {
                        confFail.push(k);
                    }
                }
            }
        }
        await writeWhole("save_main", formMain, formMain.dirtyKeys, mainKeys);
        await writeWhole("save_sf", formSf, formSf.dirtyKeys, sfKeys);
        /* 内核参数：一次 param_set_many 写完（35 项 ≈ 700 字节） */
        if (paramChanges.length) {
            try {
                const pairs = paramChanges.map(([k, v]) => k + "=" + v).join(",");
                const result = await call("param_set_many", pairs);
                const failed = new Set(String(result.failed || "").split(",").filter(Boolean));
                paramChanges.forEach(([k]) => {
                    if (failed.has(k)) paramFail.push(k);
                    else formMain.paramDirty.delete(k);
                });
            }
            catch (e) {
                paramChanges.forEach(([k]) => paramFail.push(k));
            }
        }
        document.querySelectorAll(".fx-confrow--dirty").forEach((r) => {
            const k = r.getAttribute("data-key");
            const isParam = r.getAttribute("data-source") === "param";
            if (isParam && paramFail.indexOf(k) >= 0)
                return;
            if (!isParam && confFail.indexOf(k) >= 0)
                return;
            r.classList.remove("fx-confrow--dirty");
        });
        updateSaveBar();
        const parts = [];
        if (confOk)
            parts.push("配置 " + confOk + " 项");
        if (paramChanges.length - paramFail.length)
            parts.push("内核参数 " + (paramChanges.length - paramFail.length) + " 项");
        if (parts.length && !silent)
            FX.toast("已保存：" + parts.join("、"), 2400);
        const fails = confFail.concat(paramFail);
        if (fails.length) {
            confSaveFailUntil = Date.now() + 30000;
            FX.toast("写入失败（已保留标记）：" + fails.join(", "), 4500);
        }
    }
    $("bConfSave").addEventListener("click", saveConf);
    $("bConfDiscard").addEventListener("click", async () => {
        const ok = await FX.confirmDialog({
            title: FX.t("conf.discard"), body: "放弃后重新从设备读取配置与内核参数。",
        });
        if (!ok)
            return;
        $("saveBar").classList.remove("fx-show");
        loadConf().then(() => FX.toast("已重新加载")).catch(showLoadError);
    });
    $("bConfReload").addEventListener("click", () => {
        loadConf().then(() => FX.toast("已重新加载")).catch(showLoadError);
    });
    /* ---- 目标应用二级页 ----
     * 勾选立即写文件（set_conf），写完回读；与配置页的“保存”按钮解耦，
     * 避免用户以为还要再点一次保存。 */
    let appsAll = [];
    let appsSel = new Set();
    function appsValue() {
        const m = confText.main.match(/^TARGET_APPS=(.*)$/m);
        return m ? m[1].trim() : "";
    }
    async function loadApps() {
        const host = $("appsHost");
        host.innerHTML = "";
        if (!confText.main) {
            try {
                const j = await call("read_main");
                confText.main = FX.b64decode(j.b64);
            }
            catch (e) { /* 下面统一报错 */ }
        }
        appsSel = new Set(appsValue().split(/[\s,]+/).filter(Boolean));
        appLevels = parseAppProfiles();
        appProfiles = parseNamedAppProfiles();
        $("appsCount").textContent = String(appsSel.size);
        try {
            const j = await call("list_apps");
            appsAll = j.apps || [];
        }
        catch (e) {
            FX.renderState(host, "error", {
                title: FX.t("state.error"), body: e.message, onRetry: loadApps,
            });
            return;
        }
        renderApps();
    }
    /* ---- 应用级性能档位（0 = 跟随全局） ---- */
    let appLevels = {}; // legacy pkg -> 0..4
    let appProfiles = {}; // pkg -> named policy profile
    const APP_LEVEL_NAMES = { 0: "跟随全局", 1: "high", 2: "medium", 3: "low", 4: "low" };
    const APP_PROFILE_NAMES = { "": "跟随全局", powersave: "low", balance: "medium", performance: "high", gaming: "xhigh", fast: "max" };
    function parseAppProfiles() {
        const m = confText.main.match(/^APP_PROFILES=(.*)$/m);
        const map = {};
        if (m && m[1].trim()) {
            m[1].split(",").forEach((item) => {
                const parts = item.split(":");
                if (parts[0] && parts[0].trim()) {
                    map[parts[0].trim()] = parseInt(parts[1], 10) || 0;
                }
            });
        }
        return map;
    }
    function parseNamedAppProfiles() {
        const m = confText.main.match(/^APP_PROFILE=(.*)$/m);
        const map = {};
        if (m && m[1].trim()) m[1].split(/[ ,]+/).forEach((item) => {
            const parts = item.split(":");
            if (parts[0] && Object.prototype.hasOwnProperty.call(APP_PROFILE_NAMES, parts[1])) map[parts[0]] = parts[1];
        });
        return map;
    }
    async function saveAppProfile(pkg, profile) {
        const next = Object.assign({}, appProfiles);
        if (profile) next[pkg] = profile; else delete next[pkg];
        const value = Object.entries(next).map(([p, v]) => p + ":" + v).join(",");
        try {
            const r = await call("set_conf", "findingx.conf", "APP_PROFILE", value);
            if (!r || !r.ok) throw new Error(r && r.error || "保存失败");
            appProfiles = next;
            const parsed = FX.conf.parse(confText.main);
            if (FX.conf.get(parsed, "APP_PROFILE") === undefined) {
                confText.main = confText.main.replace(/\s*$/, "") + "\nAPP_PROFILE=" + value + "\n";
            } else {
                FX.conf.set(parsed, "APP_PROFILE", value);
                confText.main = FX.conf.serialize(parsed);
            }
            if (formMain) formMain.setValue("APP_PROFILE", value);
            renderApps();
        } catch (e) { FX.toast("策略写入失败：" + e.message, 3000); }
    }
    async function cycleAppLevel(pkg) {
        const cur = appLevels[pkg] || 0;
        const next = (cur + 1) % 5; // 跟随 -> 性能 -> 均衡 -> 节能 -> 省电 -> 跟随
        try {
            const r = await call("set_app_level", pkg, String(next));
            const val = String(r.value || "");
            const esc = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const m = val.match(new RegExp(esc + ":([0-9])"));
            const got = m ? parseInt(m[1], 10) : 0;
            if (got !== next)
                throw new Error("回读不一致");
            appLevels[pkg] = next;
            if (/^APP_PROFILES=/m.test(confText.main)) {
                confText.main = confText.main.replace(/^APP_PROFILES=.*$/m, "APP_PROFILES=" + val);
            }
            else {
                confText.main += "\nAPP_PROFILES=" + val + "\n";
            }
            const row = document.querySelector('.fx-optrow[data-pkg="' + CSS.escape(pkg) + '"]');
            if (row) {
                const btn = row.querySelector("button");
                if (btn)
                    btn.textContent = APP_LEVEL_NAMES[next] || "跟随";
            }
        }
        catch (e) {
            FX.toast("档位写入失败：" + e.message, 3000);
        }
    }
    function buildAppRow(pkg) {
        const row = document.createElement("label");
        row.className = "fx-optrow";
        row.setAttribute("data-pkg", pkg);
        const txt = document.createElement("div");
        txt.className = "fx-optrow__text";
        const lbl = document.createElement("div");
        lbl.className = "fx-label";
        lbl.textContent = pkg;
        txt.appendChild(lbl);
        const selectedProfile = appProfiles[pkg] || "";
        const lv = appLevels[pkg] || 0;
        const lvBtn = document.createElement("button");
        lvBtn.type = "button";
        lvBtn.className = "fx-btn fx-btn--tonal fx-btn--sm";
        lvBtn.textContent = APP_PROFILE_NAMES[selectedProfile] || APP_LEVEL_NAMES[lv] || "跟随";
        lvBtn.title = "点击切换策略组";
        lvBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const choices = ["", "powersave", "balance", "performance", "gaming", "fast"];
            const idx = choices.indexOf(appProfiles[pkg] || "");
            saveAppProfile(pkg, choices[(idx + 1) % choices.length]);
        };
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = appsSel.has(pkg);
        cb.onchange = () => toggleApp(pkg, cb.checked);
        row.appendChild(txt);
        row.appendChild(lvBtn);
        row.appendChild(cb);
        return row;
    }
    function applyAppsFilter(card) {
        const q = ($("inAppSearch").value || "").trim().toLowerCase();
        card.querySelectorAll(".fx-optrow").forEach((row) => {
            const pkg = row.getAttribute("data-pkg") || "";
            row.style.display = (!q || pkg.toLowerCase().indexOf(q) >= 0) ? "" : "none";
        });
    }
    /** 列表只构建一次；搜索只切换 display，不重建 DOM（应用多时重建会卡） */
    function renderApps() {
        const host = $("appsHost");
        let card = host.querySelector(".fx-card");
        if (!card) {
            host.innerHTML = "";
            if (!appsAll.length) {
                FX.renderState(host, "empty", { title: "未读取到已安装应用" });
                return;
            }
            card = document.createElement("div");
            card.className = "fx-card fx-card--tight";
            appsAll.forEach((pkg) => card.appendChild(buildAppRow(pkg)));
            host.appendChild(card);
        }
        applyAppsFilter(card);
    }
    async function toggleApp(pkg, on) {
        const next = new Set(appsSel);
        if (on)
            next.add(pkg);
        else
            next.delete(pkg);
        const val = Array.from(next).join(",");
        try {
            const r = await call("set_conf", "findingx.conf", "TARGET_APPS", val);
            if (String(r.value).trim() !== val.trim()) {
                throw new Error("回读不一致：" + r.value);
            }
            appsSel = next;
            if (/^TARGET_APPS=/m.test(confText.main)) {
                confText.main = confText.main.replace(/^TARGET_APPS=.*$/m, "TARGET_APPS=" + val);
            }
            else {
                confText.main += "\nTARGET_APPS=" + val + "\n";
            }
            if (formMain) formMain.setValue("TARGET_APPS", val);
            $("appsCount").textContent = String(appsSel.size);
        }
        catch (e) {
            FX.toast("写入失败：" + e.message, 3000);
            const row = document.querySelector('.fx-optrow[data-pkg="' + CSS.escape(pkg) + '"]');
            if (row) {
                const cb = row.querySelector('input[type="checkbox"]');
                if (cb)
                    cb.checked = appsSel.has(pkg);
            }
        }
    }
    function updateAppsButton() {
        const row = document.querySelector('.fx-confrow[data-key="TARGET_APPS"]');
        const btn = row && row.querySelector("button");
        if (btn) {
            btn.textContent = appsSel.size ? "已选 " + appsSel.size + " 个应用" : "选择应用";
        }
    }
    $("bAppsBack").addEventListener("click", () => {
        // 只有配置页真的加载过才保留表单；否则从应用页返回会是一片空白
        keepConfForm = !!(formMain || formSf);
        showPage("conf");
        updateAppsButton();
    });
    $("inAppSearch").addEventListener("input", renderApps);
    /* ---- 日志 ---- */
    let curLog = "fxd";
    let logErrOnly = false;
    document.querySelectorAll("[data-log]").forEach((b) => {
        b.addEventListener("click", () => {
            document.querySelectorAll("[data-log]").forEach((x) => {
                x.classList.remove("fx-on");
                x.setAttribute("aria-pressed", "false");
            });
            b.classList.add("fx-on");
            b.setAttribute("aria-pressed", "true");
            curLog = b.getAttribute("data-log");
            loadLog();
        });
    });
    $("bLogMore").addEventListener("click", () => {
        const pre = document.querySelector("#logHost pre.fx-log");
        FX.menu($("bLogMore"), [
            {
                label: "复制日志",
                onSelect: async () => {
                    if (!pre) {
                        FX.toast(FX.t("log.empty"), 2000);
                        return;
                    }
                    try {
                        await navigator.clipboard.writeText(pre.textContent);
                        FX.toast(FX.t("settings.exported"));
                    }
                    catch (e) {
                        FX.toast("复制失败", 2500);
                    }
                },
            },
            { label: "仅看错误行", checked: logErrOnly, onSelect: () => { logErrOnly = !logErrOnly; loadLog(); } },
            { label: FX.t("log.refresh"), onSelect: () => loadLog() },
        ]);
    });
    let logCache = "";
    async function loadLog() {
        const host = $("logHost");
        // 已有日志在显示时不重建：只换文本，避免每次切页/刷新闪一下
        const hasPre = !!host.querySelector("pre.fx-log");
        if (!hasPre) {
            host.innerHTML = "";
            host.appendChild(FX.stateView("loading", { title: FX.t("state.loading") }));
        }
        try {
            const j = await call("log", curLog);
            const text = FX.b64decode(j.b64);
            if (!text.trim()) {
                logCache = "";
                if (!hasPre) {
                    host.innerHTML = "";
                    host.appendChild(FX.stateView("empty", { title: FX.t("log.empty") }));
                }
                return;
            }
            logCache = text;
            renderLogText();
        }
        catch (e) {
            if (!hasPre) {
                FX.renderState(host, "error", { title: FX.t("state.error"), body: e.message, onRetry: loadLog });
            }
        }
    }
    /** 按错误过滤 + 关键词过滤渲染缓存内容；输入时不重新请求 */
    function renderLogText() {
        const host = $("logHost");
        let pre = host.querySelector("pre.fx-log");
        if (!pre) {
            host.innerHTML = "";
            pre = document.createElement("pre");
            pre.className = "fx-log";
            pre.tabIndex = 0;
            host.appendChild(pre);
        }
        let lines = (logCache || "").split("\n");
        if (logErrOnly) {
            lines = lines.filter((l) => /error|fail|错误|失败|EPERM|denied|超温/i.test(l));
        }
        const kwInput = $("inLogFilter");
        const kw = (kwInput && kwInput.value || "").trim().toLowerCase();
        if (kw) {
            lines = lines.filter((l) => l.toLowerCase().indexOf(kw) >= 0);
        }
        if (!lines.length) {
            pre.textContent = logErrOnly || kw ? "（无匹配行）" : "";
        }
        else {
            pre.textContent = lines.join("\n");
        }
    }
    const inLogFilter = $("inLogFilter");
    if (inLogFilter) {
        inLogFilter.addEventListener("input", () => {
            if (logCache)
                renderLogText();
        });
    }
    /* ---- FAQ ---- */
    function renderFaq() {
        const zh = [
            { q: "界面如何切换主题？", a: "可以在设置页切换浅色、深色或跟随系统。" },
            { q: "改了 SF 配置为什么没生效？", a: "debug.sf.* 属性只在 SurfaceFlinger 启动时读取一次，保存后需重启设备。" },
            { q: "停止引擎会改内核状态吗？", a: "停止即还原：ifas_enable / enable_gpu_policy / 频率上限都写回备份原值。" },
            { q: "SF 通道要不要开？", a: "只有 6.18 内核的 ifas 模块带 0x4040672d，默认关闭；旧内核上该调用会直接失败。" },
            { q: "守护崩溃了怎么办？", a: "启动时自动还原上次残留备份；也可手动执行 sh /data/adb/modules/findingx/bin/fx.sh recover。" },
        ];
        const en = [
            { q: "How do I change the theme?", a: "Use Settings to choose Light, Dark, or System." },
            { q: "Why does my SF config change have no effect?", a: "debug.sf.* properties are read once when SurfaceFlinger starts; reboot after saving." },
            { q: "Does stopping the engine change kernel state?", a: "Stopping restores everything: ifas_enable, enable_gpu_policy and freq ceilings are written back from backup." },
            { q: "Should I enable the SF channel?", a: "Only 6.18 kernels ship ifas with 0x4040672d. It stays off by default; older kernels fail the call." },
            { q: "What if the daemon crashes?", a: "It restores leftover backups on next start. Manual fallback: sh /data/adb/modules/findingx/bin/fx.sh recover" },
        ];
        FX.accordion($("faqHost"), document.documentElement.lang.startsWith("zh") ? zh : en);
    }
    /* ---- 配置页搜索：命中高级组时自动展开 ---- */
    function wireConfSearch() {
        const input = $("inConfSearch");
        const host = $("confFormHost");
        if (!input || !host)
            return;
        const apply = () => {
            const q = input.value.trim().toLowerCase();
            host.querySelectorAll(".fx-confrow").forEach((row) => {
                row.hidden = q !== "" && !row.textContent.toLowerCase().includes(q);
            });
            host.querySelectorAll("details.fx-adv").forEach((det) => {
                const any = Array.from(det.querySelectorAll(".fx-confrow")).some((r) => !r.hidden);
                det.open = q !== "" && any;
            });
            // 普通分组标题：整组没有可见行时一起隐藏
            host.querySelectorAll("h2.fx-section").forEach((h) => {
                let node = h.nextElementSibling;
                let any = false;
                while (node && !node.classList.contains("fx-section")) {
                    if (node.matches && node.matches(".fx-card")) {
                        if (node.querySelector(".fx-confrow:not([hidden])")) {
                            any = true;
                            break;
                        }
                    }
                    node = node.nextElementSibling;
                }
                h.hidden = q !== "" && !any;
            });
        };
        input.addEventListener("input", apply);
        input.addEventListener("search", apply);
    }
    /* ---- 设置搜索 ---- */
    function wireSettingsSearch() {
        const input = $("inSettingsSearch");
        if (!input)
            return;
        FX.filterRows(input, "#page-settings .fx-optrow");
        input.addEventListener("input", () => {
            document.querySelectorAll("#page-settings .fx-card").forEach((card) => {
                const rows = card.querySelectorAll(".fx-optrow");
                const anyVisible = Array.from(rows).some((r) => !r.hidden);
                card.hidden = rows.length > 0 && !anyVisible;
            });
            document.querySelectorAll("#page-settings .fx-section").forEach((h) => {
                const card = h.nextElementSibling;
                if (card && card.classList.contains("fx-card"))
                    h.hidden = card.hidden;
            });
            if (!input.value.trim()) {
                document.querySelectorAll("#page-settings .fx-card, #page-settings .fx-section")
                    .forEach((el) => { el.hidden = false; });
            }
        });
    }
    /* ---- 无障碍 ---- */
    function wireA11y() {
        FX.clickable(document.querySelectorAll(".fx-accordion__head"));
    }
    /* ---- 启动 ---- */
    function boot() {
        FX.setLang((navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en");
        // Use the default theme unless the user has selected another one.
        document.documentElement.removeAttribute("data-ui");
        bindSegGroups();
        syncSegState();
        applyUI();
        FX.syncNavbarHeight();
        renderFaq();
        wireA11y();
        wireSettingsSearch();
        wireConfSearch();
        showPage("dash");
    }
    /* 旋转屏幕 / 改变窗口尺寸后底栏高度会变，重新测量 */
    window.addEventListener("resize", () => FX.syncNavbarHeight());
    document.addEventListener("visibilitychange", () => {
        if (document.hidden)
            stopDash();
        else if (curPage === "dash")
            startDash();
    });
    boot();
    window.__fx = {
        refresh: refreshDash, call, loadConf, saveConf, loadLog,
        showPage,
        get S() { return S; },
        get state() { return lastState; },
    };
})(FX, FXBridge);

/* ---- 90_main.js ---- */

"use strict";
/* FindingX WebUI entrypoint. */
