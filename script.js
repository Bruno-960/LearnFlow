(function () {
    'use strict';

    // ========== HELPERS ==========
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const saveData = (key, data) => localStorage.setItem('learnflow_' + key, JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem('learnflow_' + key) || 'null');
    const todayStr = () => new Date().toISOString().split('T')[0];
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

    // ========== ESTADO ==========
    let currentTab = 'dashboard';
    let currentMateria = 'portugues';
    let currentSubmodulo = 'calendario';
    let calYear, calMonth;
    let pomodoroInterval, pomodoroTime = 25 * 60, pomodoroRunning = false;
    let streak = 0, pontos = 0, nivel = 1;
    const today = new Date();
    calYear = today.getFullYear();
    calMonth = today.getMonth();

    // ========== FERIADOS ==========
    const feriados = {
        '2026-01-01': 'Confraternização Universal',
        '2026-04-21': 'Tiradentes',
        '2026-05-01': 'Dia do Trabalho',
        '2026-06-04': 'Corpus Christi',
        '2026-09-07': 'Independência',
        '2026-10-12': 'Aparecida',
        '2026-11-02': 'Finados',
        '2026-11-15': 'Proclamação',
        '2026-12-25': 'Natal'
    };

    // ========== INICIALIZAÇÃO ==========
    function init() {
        carregarTema();
        carregarDados();
        setupNavegacao();
        setupCalendario();
        setupTarefas();
        setupMetas();
        setupPomodoro();
        setupArquivos();
        setupPrompts();
        setupConteudoEstudo();
        atualizarDashboard();
        switchTab('dashboard');
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

    function carregarDados() {
        const data = loadData('gamificacao');
        if (data) {
            streak = data.streak || 0;
            pontos = data.pontos || 0;
            nivel = data.nivel || 1;
        }
    }

    function salvarGamificacao() {
        saveData('gamificacao', { streak, pontos, nivel });
    }

    // ========== NAVEGAÇÃO ==========
    function setupNavegacao() {
        $('#tabNav').addEventListener('click', e => {
            const btn = e.target.closest('.tab-btn');
            if (btn) switchTab(btn.dataset.tab);
        });
        $('#sidebar').addEventListener('click', e => {
            const link = e.target.closest('.sidebar__link');
            if (!link) return;
            const tab = link.dataset.tab;
            const materia = link.dataset.materia;
            const sub = link.dataset.submodulo;
            if (tab === 'estudos' && materia) { switchTab('estudos'); switchMateria(materia); }
            else if (tab === 'produtividade' && sub) { switchTab('produtividade'); switchSubmodulo(sub); }
            else if (tab) switchTab(tab);
            if (window.innerWidth <= 900) closeSidebar();
        });
        $('#menuToggle').addEventListener('click', () => {
            $('#sidebar').classList.toggle('sidebar--open');
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        $$('.tab-btn').forEach(b => b.classList.toggle('tab-btn--active', b.dataset.tab === tab));
        $$('.tab-panel').forEach(p => p.classList.toggle('tab-panel--active', p.id === `panel-${tab}`));
        $$('.sidebar__link').forEach(l => {
            const match = (l.dataset.tab === tab && !l.dataset.materia && !l.dataset.submodulo);
            l.classList.toggle('sidebar__link--active', match);
        });
        if (tab === 'estudos') switchMateria('portugues');
        if (tab === 'produtividade') switchSubmodulo('calendario');
    }

    function switchMateria(materia) {
        currentMateria = materia;
        $$('#materiaNav .materia-btn').forEach(b => b.classList.toggle('materia-btn--active', b.dataset.materia === materia));
        $$('#panel-estudos .materia-panel').forEach(p => p.classList.toggle('materia-panel--active', p.id === `materia-${materia}`));
    }

    function switchSubmodulo(sub) {
        currentSubmodulo = sub;
        $$('#produtividadeNav .materia-btn').forEach(b => b.classList.toggle('materia-btn--active', b.dataset.submodulo === sub));
        $$('#panel-produtividade .materia-panel').forEach(p => p.classList.toggle('materia-panel--active', p.id === `submodulo-${sub}`));
        if (sub === 'calendario') renderCalendario();
        if (sub === 'tarefas') renderTarefas();
        if (sub === 'metas') renderMetas();
        if (sub === 'arquivos') renderArquivos();
    }

    function closeSidebar() { $('#sidebar').classList.remove('sidebar--open'); }

    // ========== CALENDÁRIO ==========
    function setupCalendario() {
        $('#calPrev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calYear--; calMonth = 11; } renderCalendario(); });
        $('#calNext').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calYear++; calMonth = 0; } renderCalendario(); });
        $('#calHoje').addEventListener('click', () => { const t = new Date(); calYear = t.getFullYear(); calMonth = t.getMonth(); renderCalendario(); });
        renderCalendario();
    }

    function renderCalendario() {
        const grid = $('#calendarioGrid');
        $('#calTitulo').textContent = new Date(calYear, calMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const primeiroDia = new Date(calYear, calMonth, 1).getDay();
        const ultimoDia = new Date(calYear, calMonth + 1, 0).getDate();
        grid.innerHTML = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div class="calendario-dia-semana">${d}</div>`).join('');
        for (let i = 0; i < primeiroDia; i++) grid.innerHTML += '<div></div>';
        const hoje = todayStr();
        const tarefasDias = (loadData('tarefas') || []).filter(t => !t.concluida).map(t => t.prazo);
        for (let dia = 1; dia <= ultimoDia; dia++) {
            const dataStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            let cls = 'calendario-dia';
            if (dataStr === hoje) cls += ' calendario-dia--hoje';
            if (feriados[dataStr]) cls += ' calendario-dia--feriado';
            if (tarefasDias.includes(dataStr)) cls += ' calendario-dia--tarefa';
            grid.innerHTML += `<div class="${cls}" data-data="${dataStr}">${dia}</div>`;
        }
        $$('.calendario-dia[data-data]').forEach(el => el.addEventListener('click', (e) => abrirModalDia(e.target.dataset.data)));
    }

    function abrirModalDia(dataStr) {
        $('#modalDiaTitulo').textContent = formatDate(dataStr);
        $('#modalDia').dataset.data = dataStr;
        $('#modalDiaOverlay').classList.add('modal-overlay--visible');
        renderEventosDia(dataStr);
    }

    $('#modalDiaFechar').addEventListener('click', () => $('#modalDiaOverlay').classList.remove('modal-overlay--visible'));
    $('#modalDiaOverlay').addEventListener('click', (e) => { if (e.target === $('#modalDiaOverlay')) $('#modalDiaOverlay').classList.remove('modal-overlay--visible'); });

    function renderEventosDia(dataStr) {
        const eventos = (loadData('eventos') || []).filter(ev => ev.data === dataStr);
        const lista = $('#modalEventosLista');
        lista.innerHTML = '<h4>📌 Eventos neste dia</h4>';
        if (eventos.length === 0) lista.innerHTML += '<p class="text-muted">Nenhum evento.</p>';
        else eventos.forEach(ev => {
            lista.innerHTML += `<div style="background:var(--bg-input);padding:8px;border-radius:6px;margin-bottom:6px;"><strong>${ev.titulo}</strong> (${ev.tipo}) ${ev.hora ? 'às '+ev.hora : ''}</div>`;
        });
    }

    $('#modalSalvarEvento').addEventListener('click', () => {
        const data = $('#modalDia').dataset.data;
        const titulo = $('#modalEventoTitulo').value.trim();
        if (!titulo) return mostrarToast('Preencha o título!');
        const eventos = loadData('eventos') || [];
        eventos.push({
            data,
            titulo,
            tipo: $('#modalEventoTipo').value,
            hora: $('#modalEventoHora').value,
            descricao: $('#modalEventoDescricao').value
        });
        saveData('eventos', eventos);
        renderEventosDia(data);
        renderCalendario();
        mostrarToast('Evento adicionado! ✅');
        $('#modalEventoTitulo').value = '';
    });

    // ========== TAREFAS ==========
    function setupTarefas() {
        $('#btnAddTarefa').addEventListener('click', adicionarTarefa);
        renderTarefas();
    }
    function adicionarTarefa() {
        const titulo = $('#tarefaTitulo').value.trim();
        if (!titulo) return mostrarToast('Título obrigatório');
        const tarefas = loadData('tarefas') || [];
        tarefas.push({
            id: Date.now(),
            titulo,
            descricao: $('#tarefaDescricao').value,
            prazo: $('#tarefaPrazo').value,
            nivel: $('#tarefaNivel').value,
            hora: $('#tarefaHora').value,
            concluida: false
        });
        saveData('tarefas', tarefas);
        renderTarefas();
        atualizarDashboard();
        mostrarToast('Tarefa adicionada! ✅');
        $('#tarefaTitulo').value = '';
    }
    function renderTarefas() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const lista = $('#tarefasLista');
        if (!tarefas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma tarefa.</p>'; return; }
        lista.innerHTML = tarefas.map(t => `
            <div class="card" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                <div><strong>${t.titulo}</strong> <span class="badge-${t.nivel}">${t.nivel}</span><br><small>${t.prazo ? formatDate(t.prazo) : ''} ${t.hora||''}</small></div>
                <div>
                    <button class="btn btn--primary btn--sm" data-concluir="${t.id}">✅</button>
                    <button class="btn btn--danger btn--sm" data-remover="${t.id}">🗑️</button>
                </div>
            </div>
        `).join('');
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
            mostrarToast('Tarefa concluída! +10 pontos 🎉');
        }
    }
    function removerTarefa(id) {
        saveData('tarefas', (loadData('tarefas')||[]).filter(t => t.id !== id));
        renderTarefas();
    }

    // ========== METAS ==========
    function setupMetas() {
        $('#btnAddMeta').addEventListener('click', adicionarMeta);
        renderMetas();
    }
    function adicionarMeta() {
        const titulo = $('#metaTitulo').value.trim();
        if (!titulo) return;
        const metas = loadData('metas') || [];
        metas.push({ id: Date.now(), titulo, alvo: parseInt($('#metaAlvo').value)||100, unidade: $('#metaUnidade').value, progresso: 0 });
        saveData('metas', metas);
        renderMetas();
        mostrarToast('Meta criada! 🎯');
        $('#metaTitulo').value = '';
    }
    function renderMetas() {
        const metas = loadData('metas') || [];
        const lista = $('#metasLista');
        if (!metas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma meta.</p>'; return; }
        lista.innerHTML = metas.map(m => {
            const pct = Math.min(100, Math.round((m.progresso/m.alvo)*100));
            return `<div class="card" style="margin-bottom:10px;">
                <strong>${m.titulo}</strong> (${m.progresso}/${m.alvo} ${m.unidade})
                <div style="background:var(--bg-input);height:8px;border-radius:4px;margin:8px 0;"><div style="width:${pct}%;height:100%;background:var(--accent);border-radius:4px;"></div></div>
                <button class="btn btn--primary btn--sm" data-avancar="${m.id}">+1</button>
            </div>`;
        }).join('');
        lista.querySelectorAll('[data-avancar]').forEach(b => b.addEventListener('click', () => {
            const metas = loadData('metas')||[];
            const idx = metas.findIndex(m => m.id === parseInt(b.dataset.avancar));
            if (idx>=0 && metas[idx].progresso < metas[idx].alvo) metas[idx].progresso++;
            saveData('metas', metas);
            renderMetas();
            atualizarDashboard();
        }));
    }

    // ========== POMODORO ==========
    function setupPomodoro() {
        $('#pomodoroIniciar').addEventListener('click', iniciarPomodoro);
        $('#pomodoroPausar').addEventListener('click', pausarPomodoro);
        $('#pomodoroResetar').addEventListener('click', resetarPomodoro);
    }
    function atualizarDisplayPomodoro() {
        const min = Math.floor(pomodoroTime/60);
        const seg = pomodoroTime%60;
        $('#pomodoroDisplay').textContent = `${String(min).padStart(2,'0')}:${String(seg).padStart(2,'0')}`;
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
                mostrarToast('Pomodoro concluído! Hora de descansar. 🎉');
                const historico = loadData('pomodoroHistorico') || [];
                historico.push(new Date().toISOString());
                saveData('pomodoroHistorico', historico);
                atualizarHorasEstudadas(25/60);
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
        pomodoroTime = 25*60;
        atualizarDisplayPomodoro();
    }
    function tocarSom() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    function atualizarHorasEstudadas(horas) {
        const total = (loadData('horasEstudadas') || 0) + horas;
        saveData('horasEstudadas', total);
        atualizarDashboard();
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
        lista.innerHTML = '<h4>📎 Arquivos recentes:</h4>' + (arquivos.length ? arquivos.map(a => `<div style="display:flex;gap:10px;align-items:center;background:var(--bg-card);padding:8px;border-radius:6px;margin-bottom:6px;"><span>📄</span><span>${a.nome}</span></div>`).join('') : '<p class="text-muted">Nenhum arquivo.</p>');
    }

    // ========== PROMPTS ==========
    function setupPrompts() {
        $('#gerarPrompt').addEventListener('click', () => {
            const texto = $('#promptInput').value.trim();
            if (!texto) return;
            $('#resultsContent').innerHTML = `<p><strong>${texto}</strong></p><p>Este é um conteúdo simulado. Em breve, IA real.</p>`;
            $('#resultsArea').style.display = 'block';
        });
    }

    // ========== CONTEÚDO DE ESTUDO ==========
    function setupConteudoEstudo() {
        document.addEventListener('click', e => {
            const card = e.target.closest('.card--estudo');
            if (card) {
                const materia = card.dataset.materia;
                const tema = card.dataset.tema;
                if (materia && tema) {
                    switchTab('estudos');
                    switchMateria(materia);
                    mostrarToast(`Abrindo: ${tema} 📖`);
                }
            }
        });
    }

    // ========== DASHBOARD ==========
    function atualizarDashboard() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const metas = loadData('metas') || [];
        const horas = loadData('horasEstudadas') || 0;
        const aproveitamento = metas.length ? Math.round(metas.reduce((s,m)=>s+(m.progresso/m.alvo),0)/metas.length*100) : 0;
        $('#stat-horas').textContent = horas.toFixed(1) + 'h';
        $('#stat-tarefas').textContent = tarefas.length;
        $('#stat-streak').textContent = streak;
        $('#stat-aproveitamento').textContent = aproveitamento + '%';
        $('#headerStreak').textContent = `🔥 ${streak} dias`;

        // Próximos eventos
        const eventos = (loadData('eventos') || []).filter(ev => ev.data >= todayStr()).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,3);
        const proxEl = $('#proximosEventos');
        proxEl.innerHTML = eventos.length ? eventos.map(e => `<div><strong>${formatDate(e.data)}</strong>: ${e.titulo}</div>`).join('') : '<p class="text-muted">Nenhum evento próximo.</p>';

        // Tarefas de hoje
        const tarefasHoje = tarefas.filter(t => t.prazo === todayStr());
        const tarefasHojeEl = $('#tarefasHoje');
        tarefasHojeEl.innerHTML = tarefasHoje.length ? tarefasHoje.map(t => `<div>✅ ${t.titulo}</div>`).join('') : '<p class="text-muted">Nada para hoje.</p>';

        // Recomendação
        const recomendacoes = ['Revise um conteúdo antigo.','Faça um simulado.','Estude com o Pomodoro.','Crie metas realistas.'];
        $('#recomendacaoDia').textContent = recomendacoes[Math.floor(Math.random()*recomendacoes.length)];

        // Gráfico (canvas simples)
        const canvas = $('#graficoProgresso');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            const dados = [horas, tarefas.length, streak, aproveitamento];
            const labels = ['Horas','Tarefas','Streak','Aprov.'];
            const max = Math.max(...dados, 1);
            const w = canvas.width / dados.length;
            ctx.fillStyle = 'var(--accent)';
            dados.forEach((val, i) => {
                const h = (val / max) * canvas.height;
                ctx.fillRect(i*w + 5, canvas.height - h, w - 10, h);
                ctx.fillStyle = 'var(--text-primary)';
                ctx.font = '10px sans-serif';
                ctx.fillText(labels[i], i*w + 8, canvas.height - 2);
                ctx.fillStyle = 'var(--accent)';
            });
        }
    }

    function atualizarStreak() {
        const hoje = todayStr();
        const ultimo = loadData('ultimoEstudo');
        if (ultimo === hoje) return;
        const ontem = new Date();
        ontem.setDate(ontem.getDate()-1);
        const ontemStr = ontem.toISOString().split('T')[0];
        if (ultimo === ontemStr) streak++;
        else streak = 1;
        saveData('ultimoEstudo', hoje);
        salvarGamificacao();
        atualizarDashboard();
    }

    function verificarNivel() {
        const novoNivel = Math.floor(pontos / 50) + 1;
        if (novoNivel > nivel) {
            nivel = novoNivel;
            mostrarToast(`🎉 Subiu para o nível ${nivel}!`);
        }
        salvarGamificacao();
    }

    // ========== TOAST ==========
    function mostrarToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        $('#toastContainer').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ========== INICIAR ==========
    init();
})();