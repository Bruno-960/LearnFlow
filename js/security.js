(function () {
    'use strict';

    const AUTH_KEY = 'learnflow_auth_session';
    const RATE_PREFIX = 'learnflow_rate_';

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    function cleanText(value, maxLength = 240) {
        return String(value ?? '')
            .replace(/[\u0000-\u001f\u007f]/g, '')
            .trim()
            .slice(0, maxLength);
    }

    function safeJsonParse(raw, fallback = null) {
        try {
            return raw ? JSON.parse(raw) : fallback;
        } catch (_) {
            return fallback;
        }
    }

    function slug(value) {
        return cleanText(value, 80)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'local';
    }

    function getSession() {
        return safeJsonParse(localStorage.getItem(AUTH_KEY), null);
    }

    function getUserScope() {
        const session = getSession();
        return session && session.id ? slug(session.id) : 'local';
    }

    function setLocalSession(name) {
        const cleanName = cleanText(name, 80) || 'Estudante';
        const session = {
            id: slug(cleanName),
            name: cleanName,
            provider: 'local',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('learnflow:auth-change', { detail: session }));
        return session;
    }

    function signOut() {
        localStorage.removeItem(AUTH_KEY);
        window.dispatchEvent(new CustomEvent('learnflow:auth-change', { detail: null }));
    }

    function rateLimit(action, options = {}) {
        const limit = Number(options.limit || 20);
        const windowMs = Number(options.windowMs || 60000);
        const scope = options.scope || getUserScope();
        const now = Date.now();
        const key = RATE_PREFIX + slug(`${scope}_${action}`);
        const entry = safeJsonParse(localStorage.getItem(key), { start: now, count: 0 });

        if (!entry.start || now - entry.start > windowMs) {
            localStorage.setItem(key, JSON.stringify({ start: now, count: 1 }));
            return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterMs: 0 };
        }

        if (entry.count >= limit) {
            return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - entry.start) };
        }

        entry.count += 1;
        localStorage.setItem(key, JSON.stringify(entry));
        return { allowed: true, remaining: Math.max(0, limit - entry.count), retryAfterMs: 0 };
    }

    function validateImageFile(file) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxBytes = 1.5 * 1024 * 1024;
        if (!file) return { ok: false, message: 'Nenhuma imagem selecionada.' };
        if (!allowed.includes(file.type)) return { ok: false, message: 'Use PNG, JPG, WebP ou GIF.' };
        if (file.size > maxBytes) return { ok: false, message: 'A imagem deve ter no máximo 1,5 MB.' };
        return { ok: true };
    }

    function initAuthUI(options = {}) {
        const headerInfo = document.querySelector('.header__info');
        if (!headerInfo || document.getElementById('authStatus')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'auth-status';
        wrapper.id = 'authStatus';
        headerInfo.prepend(wrapper);

        function render() {
            const session = getSession();
            wrapper.innerHTML = '';

            const label = document.createElement('span');
            label.className = 'auth-status__label';
            label.textContent = session ? session.name : 'Modo local';
            wrapper.appendChild(label);

            const button = document.createElement('button');
            button.className = 'auth-status__button';
            button.type = 'button';
            button.textContent = session ? 'Sair' : 'Entrar';
            button.addEventListener('click', () => {
                if (getSession()) {
                    signOut();
                    render();
                    options.onChange?.(null);
                    return;
                }
                const name = window.prompt('Nome do usuário local:');
                if (!name) return;
                const newSession = setLocalSession(name);
                render();
                options.onChange?.(newSession);
            });
            wrapper.appendChild(button);
        }

        render();
    }

    window.LearnFlowSecurity = {
        cleanText,
        escapeHTML,
        getSession,
        getUserScope,
        initAuthUI,
        rateLimit,
        safeJsonParse,
        setLocalSession,
        signOut,
        validateImageFile
    };
})();
