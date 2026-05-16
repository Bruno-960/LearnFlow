(function () {
    'use strict';

    // ========== HELPERS ==========
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const saveData = (key, data) => localStorage.setItem('learnflow_' + key, JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem('learnflow_' + key) || 'null');
    const todayStr = () => new Date().toISOString().split('T')[0];
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

    // ========== ESTADO ==========
    let currentTab = 'dashboard';
    let calYear, calMonth;
    let pomodoroInterval, pomodoroTime = 25 * 60, pomodoroRunning = false;
    let streak = loadData('streak') || 0;
    let pontos = loadData('pontos') || 0;
    let nivel = loadData('nivel') || 1;
    const hoje = new Date();
    calYear = hoje.getFullYear();
    calMonth = hoje.getMonth();

    // ========== FERIADOS ==========
    const feriados = {
        '2026-01-01': 'Confraternização', '2026-04-21': 'Tiradentes', '2026-05-01': 'Trabalho',
        '2026-06-04': 'Corpus Christi', '2026-09-07': 'Independência', '2026-10-12': 'Aparecida',
        '2026-11-02': 'Finados', '2026-11-15': 'Proclamação', '2026-12-25': 'Natal'
    };

    // ========== DADOS DOS ESTUDOS ==========
    const categorias = [
        { id: 'ensino-medio', nome: 'Ensino Médio', icone: '🏫', desc: 'Matérias do 1º ao 3º ano', materias: ['portugues', 'matematica', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'filosofia', 'sociologia'] },
        { id: 'enem', nome: 'ENEM e Vestibulares', icone: '🎯', desc: 'Preparação para provas', materias: ['portugues', 'matematica', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'redacao'] },
        { id: 'faculdade', nome: 'Faculdade', icone: '🎓', desc: 'Conteúdos universitários', materias: ['calculo', 'estatistica', 'programacao'] },
        { id: 'programacao', nome: 'Programação', icone: '💻', desc: 'Lógica, web e Python', materias: ['logica', 'html', 'css', 'javascript', 'python'] },
        { id: 'livres', nome: 'Estudos Livres', icone: '📚', desc: 'O que quiser aprender', materias: ['ingles', 'espanhol', 'musica'] }
    ];

    const todasMaterias = {
        'portugues': { nome: 'Português', icone: '📝', cor: '#7c3aed' },
        'matematica': { nome: 'Matemática', icone: '🧮', cor: '#06b6d4' },
        'fisica': { nome: 'Física', icone: '⚡', cor: '#f59e0b' },
        'quimica': { nome: 'Química', icone: '🧪', cor: '#10b981' },
        'biologia': { nome: 'Biologia', icone: '🧬', cor: '#3b82f6' },
        'historia': { nome: 'História', icone: '📜', cor: '#ef4444' },
        'geografia': { nome: 'Geografia', icone: '🌍', cor: '#8b5cf6' },
        'filosofia': { nome: 'Filosofia', icone: '🤔', cor: '#6366f1' },
        'sociologia': { nome: 'Sociologia', icone: '👥', cor: '#ec4899' },
        'redacao': { nome: 'Redação', icone: '✍️', cor: '#f97316' },
        'calculo': { nome: 'Cálculo', icone: '📐', cor: '#14b8a6' },
        'estatistica': { nome: 'Estatística', icone: '📊', cor: '#0ea5e9' },
        'programacao': { nome: 'Programação', icone: '💻', cor: '#a855f7' },
        'logica': { nome: 'Lógica', icone: '🧠', cor: '#84cc16' },
        'html': { nome: 'HTML', icone: '🏗️', cor: '#e67e22' },
        'css': { nome: 'CSS', icone: '🎨', cor: '#3498db' },
        'javascript': { nome: 'JavaScript', icone: '📜', cor: '#f1c40f' },
        'python': { nome: 'Python', icone: '🐍', cor: '#2ecc71' },
        'ingles': { nome: 'Inglês', icone: '🇬🇧', cor: '#e74c3c' },
        'espanhol': { nome: 'Espanhol', icone: '🇪🇸', cor: '#f39c12' },
        'musica': { nome: 'Música', icone: '🎵', cor: '#9b59b6' }
    };

    function getModulos(materiaId) {
        const modulos = {
            'portugues': [
                { id: 'substantivos', titulo: 'Substantivos', desc: 'Classificação e flexões', dificuldade: 'basico', tempo: '20min', exercicios: 10 },
                { id: 'verbos', titulo: 'Verbos', desc: 'Conjugações e modos verbais', dificuldade: 'intermediario', tempo: '30min', exercicios: 15 },
                { id: 'adjetivos', titulo: 'Adjetivos', desc: 'Graus comparativo e superlativo', dificuldade: 'basico', tempo: '15min', exercicios: 8 },
                { id: 'sintaxe', titulo: 'Sintaxe', desc: 'Análise sintática completa', dificuldade: 'avancado', tempo: '45min', exercicios: 20 },
                { id: 'interpretacao', titulo: 'Interpretação Textual', desc: 'Técnicas de leitura', dificuldade: 'intermediario', tempo: '25min', exercicios: 12 },
                { id: 'redacao', titulo: 'Redação', desc: 'Estrutura dissertativa', dificuldade: 'avancado', tempo: '60min', exercicios: 5 }
            ],
            'matematica': [
                { id: 'funcoes', titulo: 'Funções', desc: 'Funções do 1º e 2º grau', dificuldade: 'intermediario', tempo: '40min', exercicios: 20 },
                { id: 'equacoes', titulo: 'Equações', desc: 'Resolução de equações', dificuldade: 'basico', tempo: '25min', exercicios: 15 },
                { id: 'geometria', titulo: 'Geometria', desc: 'Geometria plana e espacial', dificuldade: 'avancado', tempo: '50min', exercicios: 25 },
                { id: 'trigonometria', titulo: 'Trigonometria', desc: 'Ciclo e funções trigonométricas', dificuldade: 'avancado', tempo: '45min', exercicios: 18 }
            ],
            'fisica': [
                { id: 'newton', titulo: 'Leis de Newton', desc: 'Mecânica clássica', dificuldade: 'intermediario', tempo: '35min', exercicios: 15 }
            ],
            'quimica': [
                { id: 'tabela', titulo: 'Tabela Periódica', desc: 'Propriedades periódicas', dificuldade: 'basico', tempo: '20min', exercicios: 10 }
            ],
            'html': [
                { id: 'tags', titulo: 'Tags Semânticas', desc: 'Estrutura HTML5', dificuldade: 'basico', tempo: '30min', exercicios: 12 },
                { id: 'formularios', titulo: 'Formulários', desc: 'Inputs e validação', dificuldade: 'intermediario', tempo: '25min', exercicios: 8 }
            ],
            'css': [
                { id: 'flexbox', titulo: 'Flexbox', desc: 'Layout flexível', dificuldade: 'intermediario', tempo: '35min', exercicios: 15 }
            ],
            'javascript': [
                { id: 'variaveis', titulo: 'Variáveis e Tipos', desc: 'Fundamentos JS', dificuldade: 'basico', tempo: '20min', exercicios: 10 },
                { id: 'funcoes-js', titulo: 'Funções', desc: 'Escopo e arrow functions', dificuldade: 'intermediario', tempo: '30min', exercicios: 12 }
            ],
            'python': [
                { id: 'sintaxe-py', titulo: 'Sintaxe Python', desc: 'Primeiros passos', dificuldade: 'basico', tempo: '25min', exercicios: 15 }
            ],
            'logica': [
                { id: 'algoritmos', titulo: 'Algoritmos', desc: 'Estruturas básicas', dificuldade: 'basico', tempo: '30min', exercicios: 20 }
            ]
        };
        return modulos[materiaId] || [
            { id: 'modulo-1', titulo: 'Introdução', desc: 'Conceitos iniciais', dificuldade: 'basico', tempo: '15min', exercicios: 5 },
            { id: 'modulo-2', titulo: 'Avançado', desc: 'Tópicos avançados', dificuldade: 'avancado', tempo: '40min', exercicios: 15 }
        ];
    }

    // ========== INICIALIZAÇÃO ==========
    function init() {
        carregarTema();
        setupNavegacao();
        setupCalendario();
        setupTarefas();
        setupMetas();
        setupPomodoro();
        setupArquivos();
        setupConfiguracoes();
        setupPerfil();
        setupEstudos();
        setupDashboard();
        switchTab('dashboard');
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 30000);
        setInterval(verificarPrazosTarefas, 60000);
    }

    function carregarTema() {
        if (loadData('tema') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            $('#themeToggle').textContent = '☀️';
        }
        $('#themeToggle').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
            saveData('tema', isDark ? 'light' : 'dark');
            $('#themeToggle').textContent = isDark ? '🌙' : '☀️';
        });
    }

    // ========== NAVEGAÇÃO ==========
    function setupNavegacao() {
        $('#sidebar').addEventListener('click', e => {
            const link = e.target.closest('.sidebar__link');
            if (!link) return;
            if (link.dataset.tab) { switchTab(link.dataset.tab); if (window.innerWidth <= 900) closeSidebar(); }
        });
        $('#menuToggle').addEventListener('click', toggleSidebar);
        $('#sidebarOverlay').addEventListener('click', closeSidebar);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
    }

    function switchTab(tab) {
        currentTab = tab;
        $$('.tab-panel').forEach(p => p.classList.toggle('tab-panel--active', p.id === `panel-${tab}`));
        $$('.sidebar__link').forEach(l => l.classList.toggle('sidebar__link--active', l.dataset.tab === tab));
        if (tab === 'dashboard') atualizarDashboard();
        if (tab === 'calendario') renderCalendario();
        if (tab === 'tarefas') renderTarefas();
        if (tab === 'metas') renderMetas();
        if (tab === 'arquivos') renderArquivos();
        if (tab === 'estudos') renderCategorias();
    }

    function toggleSidebar() { $('#sidebar').classList.toggle('sidebar--open'); $('#sidebarOverlay').classList.toggle('sidebar-overlay--visible'); }
    function closeSidebar() { $('#sidebar').classList.remove('sidebar--open'); $('#sidebarOverlay').classList.remove('sidebar-overlay--visible'); }

    // ========== NOVA ARQUITETURA DE ESTUDOS ==========
    let estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };

    function setupEstudos() {
        $('#breadHome').addEventListener('click', () => { estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null }; renderCategorias(); });
    }

    function atualizarBreadcrumb() {
        $('#breadCategoria').textContent = '';
        $('#breadCategoria').style.display = 'none';
        $('#breadMateria').textContent = '';
        $('#breadMateria').style.display = 'none';
        $('#breadSepMateria').style.display = 'none';
        if (estudoNavegacao.categoria) {
            const cat = categorias.find(c => c.id === estudoNavegacao.categoria);
            if (cat) { $('#breadCategoria').textContent = cat.icone + ' ' + cat.nome; $('#breadCategoria').style.display = 'inline'; }
        }
        if (estudoNavegacao.materia) {
            const mat = todasMaterias[estudoNavegacao.materia];
            if (mat) { $('#breadMateria').textContent = mat.icone + ' ' + mat.nome; $('#breadMateria').style.display = 'inline'; $('#breadSepMateria').style.display = 'inline'; }
        }
    }

    function renderCategorias() {
        estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };
        atualizarBreadcrumb();
        const container = $('#estudoContainer');
        container.innerHTML = `
            <h2 style="margin-bottom:16px;">📖 Escolha uma categoria</h2>
            <div class="categorias-grid">
                ${categorias.map(c => `
                    <div class="categoria-card" data-categoria="${c.id}">
                        <div class="categoria-card__icone">${c.icone}</div>
                        <div class="categoria-card__titulo">${c.nome}</div>
                        <div class="categoria-card__desc">${c.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
        $$('.categoria-card').forEach(card => card.addEventListener('click', () => renderMaterias(card.dataset.categoria)));
    }

    function renderMaterias(categoriaId) {
        const cat = categorias.find(c => c.id === categoriaId);
        if (!cat) return;
        estudoNavegacao = { nivel: 'materias', categoria: categoriaId, materia: null };
        atualizarBreadcrumb();
        const container = $('#estudoContainer');
        const progressos = loadData('progressosMaterias') || {};
        container.innerHTML = `
            <button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarCategorias">← Voltar</button>
            <h2 style="margin-bottom:16px;">${cat.icone} ${cat.nome}</h2>
            <div class="materias-grid">
                ${cat.materias.map(mId => {
                    const mat = todasMaterias[mId] || { nome: mId, icone: '📄' };
                    const modulos = getModulos(mId);
                    const prog = progressos[mId] || 0;
                    return `
                        <div class="materia-card" data-materia="${mId}">
                            <div class="materia-card__icone">${mat.icone}</div>
                            <div class="materia-card__titulo">${mat.nome}</div>
                            <div class="materia-card__modulos">${modulos.length} módulos</div>
                            <div style="background:var(--bg-input);height:5px;border-radius:3px;margin-top:8px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div>
                            <small class="text-muted">${prog}%</small>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        $('#voltarCategorias').addEventListener('click', renderCategorias);
        $$('.materia-card').forEach(card => card.addEventListener('click', () => renderModulos(card.dataset.materia)));
    }

    function renderModulos(materiaId) {
        const mat = todasMaterias[materiaId] || { nome: materiaId, icone: '📄' };
        estudoNavegacao = { nivel: 'modulos', categoria: estudoNavegacao.categoria, materia: materiaId };
        atualizarBreadcrumb();
        const container = $('#estudoContainer');
        const modulos = getModulos(materiaId);
        const progressos = loadData('progressoModulos') || {};
        container.innerHTML = `
            <button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarMaterias">← Voltar</button>
            <h2 style="margin-bottom:16px;">${mat.icone} ${mat.nome}</h2>
            <div class="modulos-grid">
                ${modulos.map(m => {
                    const prog = progressos[m.id] || 0;
                    return `
                        <div class="modulo-card">
                            <div class="modulo-card__header">
                                <span class="modulo-card__titulo">${m.titulo}</span>
                                <span class="modulo-card__badge badge-${m.dificuldade}">${m.dificuldade}</span>
                            </div>
                            <p class="modulo-card__desc">${m.desc}</p>
                            <div class="modulo-card__info">
                                <span>⏱ ${m.tempo}</span>
                                <span>📝 ${m.exercicios} exercícios</span>
                            </div>
                            <div class="modulo-card__progresso">
                                <div class="modulo-card__progresso-bar" style="width:${prog}%;"></div>
                            </div>
                            <div class="modulo-card__acoes">
                                <button class="btn btn--primary btn--sm btn-estudar-modulo" data-modulo="${m.id}" data-materia="${materiaId}">📖 Estudar</button>
                                ${prog >= 100 ? '<span style="color:#10b981;">✅</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        $('#voltarMaterias').addEventListener('click', () => renderMaterias(estudoNavegacao.categoria));
        $$('.btn-estudar-modulo').forEach(btn => btn.addEventListener('click', () => abrirModulo(btn.dataset.modulo, btn.dataset.materia)));
    }

    function abrirModulo(moduloId, materiaId) {
        const modulos = getModulos(materiaId);
        const modulo = modulos.find(m => m.id === moduloId);
        if (!modulo) return;
        const mat = todasMaterias[materiaId] || { nome: materiaId };
        $('#modalModuloTitulo').textContent = `${mat.icone} ${modulo.titulo}`;
        $('#modalModuloConteudo').innerHTML = `
            <div class="modulo-conteudo">
                <span class="modulo-card__badge badge-${modulo.dificuldade}">${modulo.dificuldade}</span>
                <span style="margin-left:8px;">⏱ ${modulo.tempo}</span>
                <h4>📖 Resumo Teórico</h4>
                <p>Conteúdo detalhado sobre <strong>${modulo.titulo}</strong> será exibido aqui. Esta seção conterá explicações, exemplos e dicas de estudo.</p>
                <h4>💡 Exemplos</h4>
                <p>Exemplos práticos e aplicações do conteúdo.</p>
                <h4>📝 Exercícios</h4>
                <p>${modulo.exercicios} exercícios para praticar.</p>
                <ul>
                    <li>Exercício 1</li>
                    <li>Exercício 2</li>
                    <li>Exercício 3</li>
                </ul>
                <button class="btn btn--primary" id="concluirModulo">✅ Marcar como Concluído</button>
            </div>
        `;
        $('#modalModuloOverlay').classList.add('modal-overlay--visible');
        $('#concluirModulo').addEventListener('click', () => {
            const progressos = loadData('progressoModulos') || {};
            progressos[moduloId] = 100;
            saveData('progressoModulos', progressos);
            const progressosMat = loadData('progressosMaterias') || {};
            const modulos = getModulos(materiaId);
            const concluidos = modulos.filter(m => (progressos[m.id] || 0) >= 100).length + 1;
            progressosMat[materiaId] = Math.round((concluidos / modulos.length) * 100);
            saveData('progressosMaterias', progressosMat);
            mostrarToast('Módulo concluído! 🎉', 'sucesso');
            atualizarStreak();
            atualizarDashboard();
            $('#modalModuloOverlay').classList.remove('modal-overlay--visible');
            if (estudoNavegacao.nivel === 'modulos') renderModulos(materiaId);
        });
    }

    $('#modalModuloFechar').addEventListener('click', () => $('#modalModuloOverlay').classList.remove('modal-overlay--visible'));
    $('#modalModuloOverlay').addEventListener('click', e => { if (e.target === $('#modalModuloOverlay')) $('#modalModuloOverlay').classList.remove('modal-overlay--visible'); });

    // ========== CALENDÁRIO ==========
    function setupCalendario() {
        $('#calPrev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calYear--; calMonth = 11; } renderCalendario(); });
        $('#calNext').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calYear++; calMonth = 0; } renderCalendario(); });
        $('#calHoje').addEventListener('click', () => { const t = new Date(); calYear = t.getFullYear(); calMonth = t.getMonth(); renderCalendario(); });
        renderCalendario();
    }

    function renderCalendario() {
        const grid = $('#calendarioGrid');
        if (!grid) return;
        $('#calTitulo').textContent = new Date(calYear, calMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const primeiro = new Date(calYear, calMonth, 1).getDay();
        const ultimo = new Date(calYear, calMonth + 1, 0).getDate();
        grid.innerHTML = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => `<div class="calendario-dia-semana">${d}</div>`).join('');
        for (let i = 0; i < primeiro; i++) grid.innerHTML += '<div></div>';
        const hojeStr = todayStr();
        const eventos = loadData('eventosCalendario') || [];
        for (let d = 1; d <= ultimo; d++) {
            const dataStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let cls = 'calendario-dia';
            if (dataStr === hojeStr) cls += ' calendario-dia--hoje';
            if (feriados[dataStr]) cls += ' calendario-dia--feriado';
            if (eventos.some(ev => ev.data === dataStr)) cls += ' calendario-dia--tarefa';
            grid.innerHTML += `<div class="${cls}" data-data="${dataStr}">${d}</div>`;
        }
        $$('.calendario-dia[data-data]').forEach(el => el.addEventListener('click', e => abrirModalDia(e.currentTarget.dataset.data)));
    }

    function abrirModalDia(dataStr) {
        $('#modalDiaTitulo').textContent = formatDate(dataStr);
        $('#modalDia').dataset.data = dataStr;
        $('#modalDiaOverlay').classList.add('modal-overlay--visible');
        renderEventosDia(dataStr);
    }

    $('#modalDiaFechar').addEventListener('click', () => $('#modalDiaOverlay').classList.remove('modal-overlay--visible'));
    $('#modalDiaOverlay').addEventListener('click', e => { if (e.target === $('#modalDiaOverlay')) $('#modalDiaOverlay').classList.remove('modal-overlay--visible'); });

    function renderEventosDia(dataStr) {
        const eventos = (loadData('eventosCalendario') || []).filter(ev => ev.data === dataStr);
        const lista = $('#modalEventosLista');
        if (!lista) return;
        lista.innerHTML = '<h4>📌 Eventos neste dia</h4>';
        if (!eventos.length) { lista.innerHTML += '<p class="text-muted">Nenhum.</p>'; return; }
        eventos.forEach((ev, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.cssText = 'margin:4px 0;display:flex;justify-content:space-between;align-items:center;padding:12px;';
            div.innerHTML = `<div><strong>${ev.titulo}</strong> (${ev.tipo}) ${ev.hora || ''}</div>
                <div>
                    <button class="btn btn--secondary btn--sm editar-evento" data-idx="${idx}">✏️</button>
                    <button class="btn btn--danger btn--sm excluir-evento" data-idx="${idx}">🗑️</button>
                </div>`;
            lista.appendChild(div);
        });
        lista.querySelectorAll('.excluir-evento').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (confirm('Excluir este evento?')) {
                const eventos = loadData('eventosCalendario') || [];
                const dataStr = $('#modalDia').dataset.data;
                const evtsDoDia = eventos.filter(ev => ev.data === dataStr);
                const ev = evtsDoDia[idx];
                const globalIdx = eventos.findIndex(e => e === ev);
                if (globalIdx >= 0) { eventos.splice(globalIdx, 1); saveData('eventosCalendario', eventos); }
                renderEventosDia(dataStr);
                renderCalendario();
                mostrarToast('Evento removido', 'erro');
            }
        }));
        lista.querySelectorAll('.editar-evento').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const eventos = loadData('eventosCalendario') || [];
            const dataStr = $('#modalDia').dataset.data;
            const evtsDoDia = eventos.filter(ev => ev.data === dataStr);
            const ev = evtsDoDia[idx];
            const novoTitulo = prompt('Editar título:', ev.titulo);
            if (novoTitulo) { ev.titulo = novoTitulo; saveData('eventosCalendario', eventos); renderEventosDia(dataStr); renderCalendario(); mostrarToast('Evento atualizado!', 'sucesso'); }
        }));
    }

    $('#modalSalvarEvento').addEventListener('click', () => {
        const data = $('#modalDia').dataset.data;
        const titulo = $('#modalEventoTitulo').value.trim();
        if (!titulo) return mostrarToast('Preencha o título!', 'erro');
        const eventos = loadData('eventosCalendario') || [];
        eventos.push({ data, titulo, tipo: $('#modalEventoTipo').value, hora: $('#modalEventoHora').value });
        saveData('eventosCalendario', eventos);
        renderEventosDia(data);
        renderCalendario();
        mostrarToast('Evento salvo!', 'sucesso');
        $('#modalEventoTitulo').value = '';
    });

    // ========== NOTIFICAÇÕES ==========
    function verificarNotificacoes() {
        const agora = new Date();
        const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        const hojeStr = todayStr();
        const eventos = loadData('eventosCalendario') || [];
        const disparadas = loadData('notificacoesDisparadas') || [];
        eventos.forEach(ev => {
            if (ev.data === hojeStr && ev.hora === horaAtual && !disparadas.includes(ev.titulo + ev.hora + ev.data)) {
                mostrarToast(`⏰ ${ev.titulo} agora!`, 'lembrete');
                tocarSom();
                disparadas.push(ev.titulo + ev.hora + ev.data);
                saveData('notificacoesDisparadas', disparadas);
            }
        });
    }

    function verificarPrazosTarefas() {
        const agora = new Date();
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida && t.prazo && t.hora);
        const alertadas = loadData('tarefasAlertadas') || [];
        tarefas.forEach(t => {
            const dataHora = new Date(`${t.prazo}T${t.hora}`);
            const diff = dataHora - agora;
            const key = t.id + t.prazo + t.hora;
            if (diff > 0 && diff <= 3600000 && !alertadas.includes(key)) {
                const minutos = Math.ceil(diff / 60000);
                mostrarToast(`⏰ "${t.titulo}" em ${minutos} min!`, 'aviso');
                tocarSom();
                alertadas.push(key);
                saveData('tarefasAlertadas', alertadas);
            }
            if (diff <= 0 && !alertadas.includes(key + '_vencida')) {
                mostrarToast(`⚠️ "${t.titulo}" venceu!`, 'erro');
                alertadas.push(key + '_vencida');
                saveData('tarefasAlertadas', alertadas);
            }
        });
    }

    // ========== TAREFAS ==========
    function setupTarefas() {
        $('#btnAddTarefa').addEventListener('click', adicionarTarefa);
        renderTarefas();
    }

    function adicionarTarefa() {
        const titulo = $('#tarefaTitulo').value.trim();
        if (!titulo) return mostrarToast('Título obrigatório', 'erro');
        const tarefas = loadData('tarefas') || [];
        tarefas.push({
            id: Date.now(),
            titulo,
            descricao: $('#tarefaDescricao').value,
            prazo: $('#tarefaPrazo').value,
            prioridade: $('#tarefaPrioridade').value,
            hora: $('#tarefaHora').value,
            concluida: false
        });
        saveData('tarefas', tarefas);
        renderTarefas();
        atualizarDashboard();
        mostrarToast('Tarefa adicionada!', 'sucesso');
        $('#tarefaTitulo').value = '';
        $('#tarefaDescricao').value = '';
        $('#tarefaPrazo').value = '';
        $('#tarefaHora').value = '';
    }

    function renderTarefas() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const lista = $('#tarefasLista');
        if (!lista) return;
        if (!tarefas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma tarefa.</p>'; return; }
        lista.innerHTML = tarefas.map(t => {
            let extraCls = t.prioridade === 'urgente' ? ' tarefa-urgente' : '';
            return `
                <div class="card${extraCls}" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;padding:12px;">
                    <div>
                        <strong>${t.titulo}</strong>
                        <span class="badge-${t.prioridade}">${t.prioridade}</span>
                        <br><small>${t.prazo ? formatDate(t.prazo) : ''} ${t.hora || ''}</small>
                    </div>
                    <div>
                        <button class="btn btn--primary btn--sm" data-concluir="${t.id}">✅</button>
                        <button class="btn btn--danger btn--sm" data-remover="${t.id}">🗑️</button>
                    </div>
                </div>`;
        }).join('');
        lista.querySelectorAll('[data-concluir]').forEach(b => b.addEventListener('click', () => concluirTarefa(parseInt(b.dataset.concluir))));
        lista.querySelectorAll('[data-remover]').forEach(b => b.addEventListener('click', () => removerTarefa(parseInt(b.dataset.remover))));
    }

    function concluirTarefa(id) {
        const tarefas = loadData('tarefas') || [];
        const idx = tarefas.findIndex(t => t.id === id);
        if (idx >= 0) {
            tarefas[idx].concluida = true;
            saveData('tarefas', tarefas);
            pontos += 10;
            verificarNivel();
            atualizarStreak();
            renderTarefas();
            atualizarDashboard();
            mostrarToast('Tarefa concluída! +10 pontos', 'sucesso');
        }
    }

    function removerTarefa(id) {
        saveData('tarefas', (loadData('tarefas') || []).filter(t => t.id !== id));
        renderTarefas();
        atualizarDashboard();
        mostrarToast('Tarefa removida', 'erro');
    }

    // ========== METAS ==========
    function setupMetas() {
        $('#btnAddMeta').addEventListener('click', adicionarMeta);
        renderMetas();
    }

    function adicionarMeta() {
        const titulo = $('#metaTitulo').value.trim();
        if (!titulo) return mostrarToast('Título obrigatório', 'erro');
        const metas = loadData('metas') || [];
        metas.push({ id: Date.now(), titulo, alvo: parseInt($('#metaAlvo').value) || 100, unidade: $('#metaUnidade').value, progresso: 0 });
        saveData('metas', metas);
        renderMetas();
        atualizarDashboard();
        mostrarToast('Meta criada!', 'sucesso');
        $('#metaTitulo').value = '';
    }

    function renderMetas() {
        const metas = loadData('metas') || [];
        const lista = $('#metasLista');
        if (!lista) return;
        if (!metas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma meta.</p>'; return; }
        lista.innerHTML = metas.map(m => {
            const pct = Math.min(100, Math.round((m.progresso / m.alvo) * 100));
            return `
                <div class="card" style="margin-bottom:8px;padding:14px;">
                    <strong>${m.titulo}</strong> (${m.progresso}/${m.alvo} ${m.unidade})
                    <div style="background:var(--bg-input);height:6px;border-radius:3px;margin:6px 0;">
                        <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:3px;"></div>
                    </div>
                    <button class="btn btn--primary btn--sm" data-avancar="${m.id}">+1</button>
                </div>`;
        }).join('');
        lista.querySelectorAll('[data-avancar]').forEach(b => b.addEventListener('click', () => {
            const metas = loadData('metas') || [];
            const idx = metas.findIndex(m => m.id === parseInt(b.dataset.avancar));
            if (idx >= 0 && metas[idx].progresso < metas[idx].alvo) {
                metas[idx].progresso++;
                saveData('metas', metas);
                renderMetas();
                atualizarDashboard();
            }
        }));
    }

    // ========== POMODORO ==========
    function setupPomodoro() {
        $('#pomodoroIniciar').addEventListener('click', iniciarPomodoro);
        $('#pomodoroPausar').addEventListener('click', pausarPomodoro);
        $('#pomodoroResetar').addEventListener('click', resetarPomodoro);
    }

    function atualizarDisplayPomodoro() {
        const m = Math.floor(pomodoroTime / 60);
        const s = pomodoroTime % 60;
        const display = $('#pomodoroDisplay');
        if (display) display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function iniciarPomodoro() {
        if (pomodoroRunning) return;
        pomodoroRunning = true;
        $('#pomodoroIniciar').disabled = true;
        $('#pomodoroPausar').disabled = false;
        pomodoroInterval = setInterval(() => {
            if (pomodoroTime > 0) {
                pomodoroTime--;
                atualizarDisplayPomodoro();
            } else {
                clearInterval(pomodoroInterval);
                pomodoroRunning = false;
                $('#pomodoroIniciar').disabled = false;
                $('#pomodoroPausar').disabled = true;
                tocarSom();
                mostrarToast('Pomodoro concluído! Descanse.', 'sucesso');
                const horas = (loadData('horasEstudadas') || 0) + 25 / 60;
                saveData('horasEstudadas', horas);
                atualizarDashboard();
            }
        }, 1000);
    }

    function pausarPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        $('#pomodoroIniciar').disabled = false;
        $('#pomodoroPausar').disabled = true;
    }

    function resetarPomodoro() {
        pausarPomodoro();
        pomodoroTime = 25 * 60;
        atualizarDisplayPomodoro();
    }

    // ========== ARQUIVOS ==========
    function setupArquivos() {
        $('#btnUpload').addEventListener('click', () => $('#fileInput').click());
        $('#fileInput').addEventListener('change', (e) => {
            const files = e.target.files;
            const arquivos = loadData('arquivos') || [];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                    arquivos.push({ id: Date.now(), nome: file.name, tamanho: file.size, dataUrl: reader.result });
                    saveData('arquivos', arquivos);
                    renderArquivos();
                };
                reader.readAsDataURL(file);
            });
        });
        renderArquivos();
    }

    function renderArquivos() {
        const arquivos = loadData('arquivos') || [];
        const lista = $('#arquivosLista');
        if (!lista) return;
        lista.innerHTML = arquivos.length
            ? arquivos.map(a => `<div class="card" style="margin:4px 0;padding:10px;">📄 ${a.nome}</div>`).join('')
            : '<p class="text-muted">Nenhum arquivo.</p>';
    }

    // ========== CONFIGURAÇÕES ==========
    function setupConfiguracoes() {
        $('#configTema').addEventListener('click', () => $('#themeToggle').click());
        $('#exportarDados').addEventListener('click', () => {
            const dados = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k.startsWith('learnflow_')) dados[k] = localStorage.getItem(k);
            }
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'learnflow_backup.json';
            a.click();
            URL.revokeObjectURL(url);
        });
        $('#limparDados').addEventListener('click', () => {
            if (confirm('Limpar todos os dados? Esta ação não pode ser desfeita.')) {
                Object.keys(localStorage).filter(k => k.startsWith('learnflow_')).forEach(k => localStorage.removeItem(k));
                location.reload();
            }
        });
    }

    // ========== PERFIL ==========
    function setupPerfil() {
        $('#headerAvatar').addEventListener('click', abrirPerfil);
        $('#modalPerfilFechar').addEventListener('click', () => $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'));
        $('#modalPerfilOverlay').addEventListener('click', e => { if (e.target === $('#modalPerfilOverlay')) $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'); });
        $('#perfilEditarNome').addEventListener('click', () => {
            const nome = prompt('Seu nome:', loadData('nomePerfil') || 'Estudante');
            if (nome) { saveData('nomePerfil', nome); abrirPerfil(); }
        });
        $('#perfilEditarAvatar').addEventListener('click', () => {
            const avatares = ['👤', '👩', '👨', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💻', '👨‍💻', '🦸', '🦹'];
            const atual = $('#perfilAvatar').textContent;
            const idx = avatares.indexOf(atual);
            const novo = avatares[(idx + 1) % avatares.length];
            $('#perfilAvatar').textContent = novo;
            $('#headerAvatar').textContent = novo;
            saveData('avatar', novo);
        });
    }

    function abrirPerfil() {
        $('#perfilNome').textContent = loadData('nomePerfil') || 'Estudante';
        $('#perfilStreak').textContent = `${streak} dias`;
        $('#perfilHoras').textContent = `${(loadData('horasEstudadas') || 0).toFixed(1)}h`;
        $('#perfilMetas').textContent = (loadData('metas') || []).length;
        $('#perfilNivel').textContent = nivel;
        const avatar = loadData('avatar') || '👤';
        $('#perfilAvatar').textContent = avatar;
        $('#headerAvatar').textContent = avatar;
        $('#modalPerfilOverlay').classList.add('modal-overlay--visible');
    }

    // ========== DASHBOARD ==========
    function setupDashboard() {
        $('#iniciarSessao').addEventListener('click', () => {
            switchTab('pomodoro');
            iniciarPomodoro();
        });
        atualizarDashboard();
    }

    function atualizarDashboard() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const metas = loadData('metas') || [];
        const horas = loadData('horasEstudadas') || 0;
        const modulosProgresso = loadData('progressoModulos') || {};
        const totalModulos = Object.keys(modulosProgresso).length;
        const concluidos = Object.values(modulosProgresso).filter(v => v >= 100).length;
        const aproveitamento = totalModulos > 0 ? Math.round((concluidos / totalModulos) * 100) : 0;

        $('#stat-horas').textContent = horas.toFixed(1) + 'h';
        $('#stat-tarefas').textContent = tarefas.length;
        $('#stat-streak').textContent = streak;
        $('#stat-aproveitamento').textContent = aproveitamento + '%';
        $('#headerStreak').textContent = `🔥 ${streak} dias`;

        const eventos = (loadData('eventosCalendario') || []).filter(ev => ev.data >= todayStr()).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 3);
        $('#proximosEventos').innerHTML = eventos.length
            ? eventos.map(e => `<div><strong>${formatDate(e.data)}</strong>: ${e.titulo}</div>`).join('')
            : '<p class="text-muted">Nenhum.</p>';

        const tarefasHoje = tarefas.filter(t => t.prazo === todayStr());
        $('#tarefasHoje').innerHTML = tarefasHoje.length
            ? tarefasHoje.map(t => `<div>✅ ${t.titulo}</div>`).join('')
            : '<p class="text-muted">Nada.</p>';

        const recomendacoes = ['Explore os módulos de Estudos.', 'Pratique exercícios.', 'Use o Pomodoro.', 'Crie metas realistas.'];
        $('#recomendacaoDia').textContent = recomendacoes[Math.floor(Math.random() * recomendacoes.length)];

        const grafico = $('#graficoBarras');
        if (grafico) {
            const dados = [horas, tarefas.length, streak, aproveitamento];
            const max = Math.max(...dados, 1);
            grafico.innerHTML = dados.map(v => `<div class="grafico-barra" style="height:${(v / max) * 60}px;" title="${v}"></div>`).join('');
        }
    }

    function atualizarStreak() {
        const hojeStr = todayStr();
        const ultimo = loadData('ultimoEstudo');
        if (ultimo === hojeStr) return;
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        streak = (ultimo === ontem.toISOString().split('T')[0]) ? streak + 1 : 1;
        saveData('ultimoEstudo', hojeStr);
        saveData('streak', streak);
        atualizarDashboard();
    }

    function verificarNivel() {
        const novoNivel = Math.floor(pontos / 50) + 1;
        if (novoNivel > nivel) {
            nivel = novoNivel;
            mostrarToast(`🎉 Subiu para o nível ${nivel}!`, 'sucesso');
        }
        saveData('pontos', pontos);
        saveData('nivel', nivel);
    }

    // ========== TOAST E SOM ==========
    function mostrarToast(msg, tipo = 'sucesso') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${tipo}`;
        toast.textContent = msg;
        const container = $('#toastContainer');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
        }
    }

    function tocarSom() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch (e) {}
    }

    // ========== INICIAR ==========
    init();
})();