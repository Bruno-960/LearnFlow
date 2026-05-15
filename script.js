/**
 * ============================================================
 * LEARNFLOW - SISTEMA COMPLETO
 * Funcionalidades:
 * - Abas principais + sub-abas de matérias
 * - Sidebar, tema escuro, menu mobile
 * - Gerador de prompts
 * - NOVO: Calendário com feriados e tarefas
 * - NOVO: Gerenciador de tarefas com níveis e prazos
 * - NOVO: Metas com barra de progresso
 * - NOVO: Upload de arquivos (localStorage)
 * - NOVO: Histórico de tarefas concluídas
 * - NOVO: Sistema de folgas automáticas
 * ============================================================
 */

(function () {
    'use strict';

    // ============================================================
    // REFERÊNCIAS DO DOM
    // ============================================================
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const themeToggle = document.getElementById('themeToggle');
    const tabNav = document.getElementById('tabNav');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    sidebarOverlay.id = 'sidebarOverlay';
    document.body.appendChild(sidebarOverlay);

    // ============================================================
    // ESTADO
    // ============================================================
    let currentTab = 'dashboard';
    let currentMateria = 'portugues';
    let currentSubmodulo = 'calendario';

    // ============================================================
    // DADOS (localStorage)
    // ============================================================
    function getTarefas() { return JSON.parse(localStorage.getItem('learnflow-tarefas') || '[]'); }
    function setTarefas(data) { localStorage.setItem('learnflow-tarefas', JSON.stringify(data)); }
    function getMetas() { return JSON.parse(localStorage.getItem('learnflow-metas') || '[]'); }
    function setMetas(data) { localStorage.setItem('learnflow-metas', JSON.stringify(data)); }
    function getHistorico() { return JSON.parse(localStorage.getItem('learnflow-historico') || '[]'); }
    function setHistorico(data) { localStorage.setItem('learnflow-historico', JSON.stringify(data)); }
    function getArquivos() { return JSON.parse(localStorage.getItem('learnflow-arquivos') || '[]'); }
    function setArquivos(data) { localStorage.setItem('learnflow-arquivos', JSON.stringify(data)); }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    function init() {
        loadTheme();
        setupMainEvents();
        setupMateriaNavigation();
        setupProdutividadeNavigation();
        setupPromptGenerator();
        setupConteudoDetalhado();
        setupCalendario();
        setupTarefas();
        setupMetas();
        setupArquivos();
        setupHistorico();
        setupFolgas();
        setupDashboardStats();
        switchTab('dashboard');
        console.log('✅ LearnFlow inicializado com sucesso!');
    }

    // ============================================================
    // EVENTOS PRINCIPAIS
    // ============================================================
    function setupMainEvents() {
        if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

        if (tabNav) {
            tabNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                const tab = btn.dataset.tab;
                if (tab) switchTab(tab);
            });
        }

        if (sidebar) {
            sidebar.addEventListener('click', function (e) {
                const link = e.target.closest('.sidebar__link');
                if (!link) return;
                const tab = link.dataset.tab;
                const materia = link.dataset.materia;
                const submodulo = link.dataset.submodulo;

                if (tab === 'estudos' && materia) { switchTab('estudos'); switchMateria(materia); }
                else if (tab === 'produtividade' && submodulo) { switchTab('produtividade'); switchSubmodulo(submodulo); }
                else if (tab && !materia && !submodulo) { switchTab(tab); }
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('sidebar--open')) closeSidebar();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900 && sidebar && sidebar.classList.contains('sidebar--open')) closeSidebar();
        });
    }

    // ============================================================
    // NAVEGAÇÃO DE MATÉRIAS
    // ============================================================
    function setupMateriaNavigation() {
        const materiaNav = document.getElementById('materiaNav');
        if (materiaNav) {
            materiaNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.materia-btn');
                if (!btn) return;
                const materia = btn.dataset.materia;
                if (materia) switchMateria(materia);
            });
        }
        document.addEventListener('click', function (e) {
            const card = e.target.closest('.card--clickable');
            if (!card) return;
            const tab = card.dataset.tab;
            const materia = card.dataset.materia;
            const submodulo = card.dataset.submodulo;
            if (tab === 'estudos' && materia) { switchTab('estudos'); switchMateria(materia); }
            if (tab === 'produtividade' && submodulo) { switchTab('produtividade'); switchSubmodulo(submodulo); }
        });
    }

    function switchMateria(materia) {
        currentMateria = materia;
        document.querySelectorAll('.materia-btn').forEach(b => b.classList.remove('materia-btn--active'));
        document.querySelector(`.materia-btn[data-materia="${materia}"]`)?.classList.add('materia-btn--active');
        document.querySelectorAll('.materia-panel').forEach(p => p.classList.remove('materia-panel--active'));
        document.getElementById(`materia-${materia}`)?.classList.add('materia-panel--active');
        updateSidebarActive();
    }

    // ============================================================
    // NAVEGAÇÃO DE PRODUTIVIDADE (SUBMÓDULOS)
    // ============================================================
    function setupProdutividadeNavigation() {
        const prodNav = document.getElementById('produtividadeNav');
        if (prodNav) {
            prodNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.materia-btn');
                if (!btn) return;
                const submodulo = btn.dataset.submodulo;
                if (submodulo) switchSubmodulo(submodulo);
            });
        }
    }

    function switchSubmodulo(submodulo) {
        currentSubmodulo = submodulo;
        document.querySelectorAll('#produtividadeNav .materia-btn').forEach(b => b.classList.remove('materia-btn--active'));
        document.querySelector(`#produtividadeNav .materia-btn[data-submodulo="${submodulo}"]`)?.classList.add('materia-btn--active');
        document.querySelectorAll('#panel-produtividade .materia-panel').forEach(p => p.classList.remove('materia-panel--active'));
        document.getElementById(`submodulo-${submodulo}`)?.classList.add('materia-panel--active');
        updateSidebarActive();
        // Atualiza componentes específicos
        if (submodulo === 'calendario') renderCalendario();
        if (submodulo === 'tarefas') renderTarefas();
        if (submodulo === 'metas') renderMetas();
        if (submodulo === 'historico') renderHistorico();
        if (submodulo === 'arquivos') renderArquivos();
    }

    function updateSidebarActive() {
        document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
        const activeLink = document.querySelector(`.sidebar__link[data-tab="${currentTab}"][data-materia="${currentMateria}"], .sidebar__link[data-tab="${currentTab}"][data-submodulo="${currentSubmodulo}"]`);
        if (activeLink) activeLink.classList.add('sidebar__link--active');
        else {
            const mainLink = document.querySelector(`.sidebar__link[data-tab="${currentTab}"]:not([data-materia]):not([data-submodulo])`);
            if (mainLink) mainLink.classList.add('sidebar__link--active');
        }
    }

    // ============================================================
    // SIDEBAR MOBILE
    // ============================================================
    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('sidebar--open');
        sidebarOverlay.classList.add('sidebar-overlay--visible');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('sidebar--open');
        sidebarOverlay.classList.remove('sidebar-overlay--visible');
        document.body.style.overflow = '';
    }
    function toggleSidebar() {
        sidebar.classList.contains('sidebar--open') ? closeSidebar() : openSidebar();
    }

    // ============================================================
    // TEMA
    // ============================================================
    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('learnflow-theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('learnflow-theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    }
    function loadTheme() {
        if (localStorage.getItem('learnflow-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    }

    // ============================================================
    // ABAS PRINCIPAIS
    // ============================================================
    function switchTab(tabName) {
        currentTab = tabName;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.classList.add('tab-btn--active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
        document.getElementById(`panel-${tabName}`)?.classList.add('tab-panel--active');
        updateSidebarActive();
        if (tabName === 'estudos') {
            const active = document.querySelector('.materia-panel--active');
            if (!active) switchMateria('portugues');
        }
        if (tabName === 'produtividade') {
            const active = document.querySelector('#panel-produtividade .materia-panel--active');
            if (!active) switchSubmodulo('calendario');
        }
        if (window.innerWidth <= 900) closeSidebar();
    }

    // ============================================================
    // CONTEÚDO DETALHADO (ESTUDAR AGORA)
    // ============================================================
    function setupConteudoDetalhado() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn--estudar');
            if (!btn) return;
            const id = btn.dataset.conteudo;
            if (id) abrirConteudo(id);
        });
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn--voltar');
            if (!btn) return;
            const materia = btn.dataset.voltar;
            if (materia) voltarParaMateria(materia);
        });
        document.addEventListener('click', function (e) {
            const link = e.target.closest('.indice-links a');
            if (!link) return;
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('href').substring(1));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
    function abrirConteudo(id) {
        const ativa = document.querySelector('.materia-panel--active');
        if (ativa) { const grid = ativa.querySelector('.cards-grid'); if (grid) grid.style.display = 'none'; }
        document.querySelectorAll('.conteudo-detalhado').forEach(c => c.style.display = 'none');
        const conteudo = document.getElementById('conteudo-' + id);
        if (conteudo) { conteudo.style.display = 'block'; conteudo.scrollIntoView({ behavior: 'smooth' }); }
    }
    function voltarParaMateria(materia) {
        document.querySelectorAll('.conteudo-detalhado').forEach(c => c.style.display = 'none');
        const panel = document.getElementById('materia-' + materia);
        if (panel) { const grid = panel.querySelector('.cards-grid'); if (grid) grid.style.display = 'grid'; }
        document.getElementById('materiaNav')?.scrollIntoView({ behavior: 'smooth' });
    }

    // ============================================================
    // GERADOR DE PROMPTS
    // ============================================================
    function setupPromptGenerator() {
        const btn = document.getElementById('gerarPrompt');
        if (!btn) return;
        btn.addEventListener('click', function () {
            const input = document.getElementById('promptInput');
            const prompt = input.value.trim();
            if (!prompt) {
                input.style.borderColor = '#ef4444';
                setTimeout(() => input.style.borderColor = '', 500);
                return;
            }
            const conteudo = `<div style="padding:16px;background:var(--accent-light);border-radius:12px;margin-bottom:16px;"><strong>📌 Tema:</strong> "${prompt}"</div><p>Conteúdo gerado simulado para: <strong>${prompt}</strong></p><p>Em uma versão futura, este conteúdo será gerado por IA real.</p>`;
            document.getElementById('resultsContent').innerHTML = conteudo;
            document.getElementById('resultsArea').style.display = 'block';
            document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ============================================================
    // CALENDÁRIO COM FERIADOS
    // ============================================================
    const feriados = {
        '2026-01-01': 'Confraternização Universal',
        '2026-04-21': 'Tiradentes',
        '2026-05-01': 'Dia do Trabalho',
        '2026-09-07': 'Independência do Brasil',
        '2026-10-12': 'Nossa Senhora Aparecida',
        '2026-11-02': 'Finados',
        '2026-11-15': 'Proclamação da República',
        '2026-12-25': 'Natal'
    };

    let calData = new Date();

    function setupCalendario() {
        document.getElementById('calPrev')?.addEventListener('click', () => { calData.setMonth(calData.getMonth() - 1); renderCalendario(); });
        document.getElementById('calNext')?.addEventListener('click', () => { calData.setMonth(calData.getMonth() + 1); renderCalendario(); });
        renderCalendario();
    }

    function renderCalendario() {
        const grid = document.getElementById('calendarioGrid');
        const titulo = document.getElementById('calTitulo');
        if (!grid || !titulo) return;

        const ano = calData.getFullYear();
        const mes = calData.getMonth();
        titulo.textContent = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        grid.innerHTML = diasSemana.map(d => `<div class="calendario-dia-semana">${d}</div>`).join('');

        const primeiroDia = new Date(ano, mes, 1).getDay();
        const ultimoDia = new Date(ano, mes + 1, 0).getDate();

        for (let i = 0; i < primeiroDia; i++) grid.innerHTML += '<div></div>';

        const hoje = new Date();
        const tarefas = getTarefas();

        for (let dia = 1; dia <= ultimoDia; dia++) {
            const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
            const isFeriado = feriados[dataStr];
            const temTarefa = tarefas.some(t => t.prazo === dataStr && !t.concluida);

            let classes = 'calendario-dia';
            if (isHoje) classes += ' calendario-dia--hoje';
            if (isFeriado) classes += ' calendario-dia--feriado';
            if (temTarefa) classes += ' calendario-dia--tarefa';

            let tooltip = '';
            if (isFeriado) tooltip = ` title="${feriados[dataStr]}"`;

            grid.innerHTML += `<div class="${classes}"${tooltip}>${dia}</div>`;
        }
    }

    // ============================================================
    // SISTEMA DE FOLGAS
    // ============================================================
    function setupFolgas() {
        const msg = document.getElementById('folgasMensagem');
        if (!msg) return;
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        let folgaMsg = '';

        if (diaSemana >= 1 && diaSemana <= 5) {
            folgaMsg = '📅 Você está em dia útil. Sua próxima folga é no <strong>sábado</strong>!';
        } else if (diaSemana === 6) {
            folgaMsg = '🎉 Hoje é sábado! Aproveite sua folga merecida!';
        } else {
            folgaMsg = '🌅 Hoje é domingo! Descanse e recarregue as energias para amanhã.';
        }

        const tarefasConcluidas = getTarefas().filter(t => t.concluida).length;
        if (tarefasConcluidas >= 5) {
            folgaMsg += '<br><br>🏆 <strong>Você concluiu 5+ tarefas!</strong> Tire uma folga extra merecida!';
        }

        msg.innerHTML = folgaMsg;
    }

    // ============================================================
    // GERENCIADOR DE TAREFAS
    // ============================================================
    function setupTarefas() {
        document.getElementById('btnAddTarefa')?.addEventListener('click', adicionarTarefa);
        renderTarefas();
    }

    function adicionarTarefa() {
        const titulo = document.getElementById('tarefaTitulo').value.trim();
        const descricao = document.getElementById('tarefaDescricao').value.trim();
        const prazo = document.getElementById('tarefaPrazo').value;
        const nivel = document.getElementById('tarefaNivel').value;

        if (!titulo) {
            document.getElementById('tarefaTitulo').style.borderColor = '#ef4444';
            setTimeout(() => document.getElementById('tarefaTitulo').style.borderColor = '', 500);
            return;
        }

        const tarefas = getTarefas();
        tarefas.push({
            id: Date.now(),
            titulo,
            descricao,
            prazo,
            nivel,
            concluida: false,
            criadaEm: new Date().toISOString()
        });
        setTarefas(tarefas);
        renderTarefas();
        setupFolgas();
        setupDashboardStats();

        // Limpar formulário
        document.getElementById('tarefaTitulo').value = '';
        document.getElementById('tarefaDescricao').value = '';
        document.getElementById('tarefaPrazo').value = '';
        document.getElementById('tarefaNivel').value = 'moderado';
    }

    function renderTarefas() {
        const lista = document.getElementById('tarefasLista');
        if (!lista) return;
        const tarefas = getTarefas().filter(t => !t.concluida);

        if (tarefas.length === 0) {
            lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Nenhuma tarefa pendente. 🎉</p>';
            return;
        }

        lista.innerHTML = tarefas.map(t => `
            <div class="tarefa-item tarefa-item--${t.nivel}">
                <div class="tarefa-info">
                    <h4>${t.titulo}</h4>
                    ${t.descricao ? `<p>${t.descricao}</p>` : ''}
                    ${t.prazo ? `<p>📅 Prazo: ${new Date(t.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}</p>` : ''}
                    <span class="tarefa-nivel nivel-${t.nivel}">${t.nivel === 'urgente' ? '🔴 Urgente' : t.nivel === 'moderado' ? '🟡 Moderado' : '🟢 Tranquilo'}</span>
                </div>
                <div class="tarefa-acoes">
                    <button class="btn btn--success btn--sm" onclick="window.concluirTarefa(${t.id})">✅</button>
                    <button class="btn btn--danger btn--sm" onclick="window.removerTarefa(${t.id})">🗑️</button>
                </div>
            </div>
        `).join('');

        renderCalendario();
    }

    window.concluirTarefa = function (id) {
        const tarefas = getTarefas();
        const idx = tarefas.findIndex(t => t.id === id);
        if (idx >= 0) {
            tarefas[idx].concluida = true;
            tarefas[idx].concluidaEm = new Date().toISOString();
            setTarefas(tarefas);
            const historico = getHistorico();
            historico.push(tarefas[idx]);
            setHistorico(historico);
            renderTarefas();
            renderHistorico();
            setupFolgas();
            setupDashboardStats();
        }
    };

    window.removerTarefa = function (id) {
        const tarefas = getTarefas().filter(t => t.id !== id);
        setTarefas(tarefas);
        renderTarefas();
        setupDashboardStats();
    };

    // ============================================================
    // METAS
    // ============================================================
    function setupMetas() {
        document.getElementById('btnAddMeta')?.addEventListener('click', adicionarMeta);
        renderMetas();
    }

    function adicionarMeta() {
        const titulo = document.getElementById('metaTitulo').value.trim();
        const alvo = parseInt(document.getElementById('metaAlvo').value) || 100;
        const unidade = document.getElementById('metaUnidade').value;

        if (!titulo) return;

        const metas = getMetas();
        metas.push({ id: Date.now(), titulo, alvo, unidade, progresso: 0 });
        setMetas(metas);
        renderMetas();
        setupDashboardStats();
        document.getElementById('metaTitulo').value = '';
    }

    function renderMetas() {
        const lista = document.getElementById('metasLista');
        if (!lista) return;
        const metas = getMetas();

        if (metas.length === 0) {
            lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Nenhuma meta definida. Crie sua primeira meta! 🎯</p>';
            return;
        }

        lista.innerHTML = metas.map(m => {
            const pct = Math.min(100, Math.round((m.progresso / m.alvo) * 100));
            return `
                <div class="meta-item">
                    <div class="meta-info">
                        <h4>${m.titulo}</h4>
                        <p>${m.progresso} / ${m.alvo} ${m.unidade}</p>
                        <div class="meta-barra"><div class="meta-barra-preenchida" style="width:${pct}%"></div></div>
                    </div>
                    <div class="meta-acoes">
                        <button class="btn btn--success btn--sm" onclick="window.avancarMeta(${m.id})">+</button>
                        <button class="btn btn--danger btn--sm" onclick="window.removerMeta(${m.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.avancarMeta = function (id) {
        const metas = getMetas();
        const idx = metas.findIndex(m => m.id === id);
        if (idx >= 0 && metas[idx].progresso < metas[idx].alvo) {
            metas[idx].progresso++;
            setMetas(metas);
            renderMetas();
            setupDashboardStats();
        }
    };

    window.removerMeta = function (id) {
        setMetas(getMetas().filter(m => m.id !== id));
        renderMetas();
        setupDashboardStats();
    };

    // ============================================================
    // ARQUIVOS (localStorage - simulação)
    // ============================================================
    function setupArquivos() {
        document.getElementById('btnUpload')?.addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput')?.addEventListener('change', handleFileUpload);
        document.getElementById('uploadArea')?.addEventListener('click', (e) => {
            if (e.target !== document.getElementById('btnUpload')) document.getElementById('fileInput').click();
        });
        renderArquivos();
    }

    function handleFileUpload(e) {
        const files = e.target.files;
        if (!files.length) return;
        const arquivos = getArquivos();
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function () {
                arquivos.push({
                    id: Date.now() + Math.random(),
                    nome: file.name,
                    tipo: file.type,
                    tamanho: file.size,
                    data: reader.result,
                    adicionadoEm: new Date().toISOString()
                });
                setArquivos(arquivos);
                renderArquivos();
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }

    function renderArquivos() {
        const lista = document.getElementById('arquivosLista');
        if (!lista) return;
        const arquivos = getArquivos();

        if (arquivos.length === 0) {
            lista.innerHTML += '<p style="color:var(--text-muted);text-align:center;padding:10px;">Nenhum arquivo importado ainda.</p>';
            return;
        }

        lista.innerHTML = '<h4>📎 Arquivos recentes:</h4>' + arquivos.map(a => `
            <div class="arquivo-item">
                <div class="arquivo-item__icone">${a.tipo.startsWith('image') ? '🖼️' : '📄'}</div>
                <div class="arquivo-item__info">
                    <strong>${a.nome}</strong>
                    <span>${(a.tamanho / 1024).toFixed(1)} KB • ${new Date(a.adicionadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
                <button class="btn btn--danger btn--sm" onclick="window.removerArquivo(${a.id})">🗑️</button>
            </div>
        `).join('');
    }

    window.removerArquivo = function (id) {
        setArquivos(getArquivos().filter(a => a.id !== id));
        renderArquivos();
    };

    // ============================================================
    // HISTÓRICO DE TAREFAS
    // ============================================================
    function setupHistorico() {
        document.getElementById('btnLimparHistorico')?.addEventListener('click', () => {
            if (confirm('Limpar todo o histórico?')) {
                setHistorico([]);
                renderHistorico();
            }
        });
        renderHistorico();
    }

    function renderHistorico() {
        const lista = document.getElementById('historicoLista');
        if (!lista) return;
        const historico = getHistorico();

        if (historico.length === 0) {
            lista.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Nenhuma tarefa concluída ainda.</p>';
            return;
        }

        lista.innerHTML = historico.slice().reverse().map(t => `
            <div class="tarefa-item tarefa-item--concluida">
                <div class="tarefa-info">
                    <h4>✅ ${t.titulo}</h4>
                    <p>Concluída em: ${new Date(t.concluidaEm).toLocaleString('pt-BR')}</p>
                </div>
            </div>
        `).join('');
    }

    // ============================================================
    // DASHBOARD STATS
    // ============================================================
    function setupDashboardStats() {
        const tarefasConcluidas = getTarefas().filter(t => t.concluida).length;
        const metasAlcancadas = getMetas().filter(m => m.progresso >= m.alvo).length;
        const totalMetas = getMetas().length;
        const aproveitamento = totalMetas > 0 ? Math.round((metasAlcancadas / totalMetas) * 100) : 0;

        const elTarefas = document.getElementById('stat-tarefas');
        const elMetas = document.getElementById('stat-metas');
        const elAproveitamento = document.getElementById('stat-aproveitamento');

        if (elTarefas) elTarefas.textContent = tarefasConcluidas;
        if (elMetas) elMetas.textContent = metasAlcancadas;
        if (elAproveitamento) elAproveitamento.textContent = aproveitamento + '%';
    }

    // ============================================================
    // INICIAR
    // ============================================================
    init();

})();