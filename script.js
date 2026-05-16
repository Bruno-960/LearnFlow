(function () {
    'use strict';

    // ========== HELPERS ==========
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const saveData = (key, data) => localStorage.setItem('learnflow_' + key, JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem('learnflow_' + key) || 'null');
    const deleteData = (key) => localStorage.removeItem('learnflow_' + key);
    const todayStr = () => new Date().toISOString().split('T')[0];
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

    // ========== ESTADO ==========
    let currentTab = 'dashboard';
    let calYear, calMonth;
    let pomodoroInterval, pomodoroTime = 25 * 60, pomodoroRunning = false;
    let sessaoInterval, sessaoTime = 0, sessaoRunning = false, sessaoPausado = false;
    let streak = loadData('streak') || 0;
    let pontos = loadData('pontos') || 0;
    let nivel = loadData('nivel') || 1;
    const hoje = new Date();
    calYear = hoje.getFullYear();
    calMonth = hoje.getMonth();

    // ========== FERIADOS ==========
    const feriados = {
        '2026-01-01': 'Confraternização',
        '2026-04-21': 'Tiradentes',
        '2026-05-01': 'Trabalho',
        '2026-06-04': 'Corpus Christi',
        '2026-09-07': 'Independência',
        '2026-10-12': 'Aparecida',
        '2026-11-02': 'Finados',
        '2026-11-15': 'Proclamação',
        '2026-12-25': 'Natal'
    };

    const materias = [
        { id: 'matematica', nome: 'Matemática', icone: '🧮', desc: 'Funções, geometria, trigonometria.' },
        { id: 'portugues', nome: 'Português', icone: '📝', desc: 'Gramática, literatura, redação.' },
        { id: 'fisica', nome: 'Física', icone: '⚡', desc: 'Mecânica, termodinâmica, ondas.' },
        { id: 'quimica', nome: 'Química', icone: '🧪', desc: 'Orgânica, inorgânica, físico-química.' },
        { id: 'biologia', nome: 'Biologia', icone: '🧬', desc: 'Citologia, genética, ecologia.' },
        { id: 'historia', nome: 'História', icone: '📜', desc: 'Brasil, geral, contemporânea.' },
        { id: 'geografia', nome: 'Geografia', icone: '🌍', desc: 'Física, humana, atualidades.' },
        { id: 'ingles', nome: 'Inglês', icone: '🇬🇧', desc: 'Gramática, vocabulário, leitura.' },
        { id: 'programacao', nome: 'Programação', icone: '💻', desc: 'Lógica, algoritmos, projetos.' }
    ];

    // ========== NOTIFICAÇÕES ==========
    function mostrarToast(msg, tipo = 'sucesso') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${tipo}`;
        toast.textContent = msg;
        $('#toastContainer').appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
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
        } catch(e) {}
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
        setupSessaoEstudo();
        setupNotificacoesTarefas();
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
        $('#tabNav').addEventListener('click', e => {
            const btn = e.target.closest('.tab-btn');
            if (btn) switchTab(btn.dataset.tab);
        });
        $('#sidebar').addEventListener('click', e => {
            const link = e.target.closest('.sidebar__link');
            if (!link) return;
            const tab = link.dataset.tab;
            if (tab) { switchTab(tab); if (window.innerWidth <= 900) closeSidebar(); }
        });
        $('#menuToggle').addEventListener('click', toggleSidebar);
        $('#sidebarOverlay').addEventListener('click', closeSidebar);
    }

    function switchTab(tab) {
        currentTab = tab;
        $$('.tab-btn').forEach(b => b.classList.toggle('tab-btn--active', b.dataset.tab === tab));
        $$('.tab-panel').forEach(p => p.classList.toggle('tab-panel--active', p.id === `panel-${tab}`));
        $$('.sidebar__link').forEach(l => l.classList.toggle('sidebar__link--active', l.dataset.tab === tab));
        if (tab === 'dashboard') atualizarDashboard();
        if (tab === 'calendario') renderCalendario();
        if (tab === 'tarefas') renderTarefas();
        if (tab === 'metas') renderMetas();
        if (tab === 'arquivos') renderArquivos();
        if (tab === 'estudos') renderMaterias();
    }

    function toggleSidebar() {
        $('#sidebar').classList.toggle('sidebar--open');
        $('#sidebarOverlay').classList.toggle('sidebar-overlay--visible');
    }
    function closeSidebar() {
        $('#sidebar').classList.remove('sidebar--open');
        $('#sidebarOverlay').classList.remove('sidebar-overlay--visible');
    }

    // ========== ESTUDOS ==========
    function setupEstudos() { renderMaterias(); }
    function renderMaterias() {
        const grid = $('#materiasGrid');
        if (!grid) return;
        const progressos = loadData('progressosMaterias') || {};
        grid.innerHTML = materias.map(m => {
            const prog = progressos[m.id] || 0;
            return `
                <article class="card card--estudo" data-materia="${m.id}">
                    <div class="card__icon">${m.icone}</div>
                    <h3 class="card__title">${m.nome}</h3>
                    <p class="card__text">${m.desc}</p>
                    <div style="background:var(--bg-input);height:6px;border-radius:3px;margin-top:8px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div>
                    <small class="text-muted">${prog}% concluído</small>
                </article>
            `;
        }).join('');
        $$('.card--estudo').forEach(card => {
            card.addEventListener('click', () => abrirMateria(card.dataset.materia));
        });
    }

    function abrirMateria(materiaId) {
        const materia = materias.find(m => m.id === materiaId);
        if (!materia) return;
        const progressos = loadData('progressosMaterias') || {};
        const prog = progressos[materiaId] || 0;
        const ultimaSessao = loadData(`ultimaSessao_${materiaId}`);
        $('#modalMateriaTitulo').textContent = `${materia.icone} ${materia.nome}`;
        $('#modalMateriaConteudo').innerHTML = `
            <p>${materia.desc}</p>
            <div style="background:var(--bg-input);height:8px;border-radius:4px;margin:12px 0;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:4px;"></div></div>
            <p class="text-muted">Progresso: ${prog}%</p>
            ${ultimaSessao ? `<p class="text-muted">Última sessão: ${new Date(ultimaSessao).toLocaleDateString('pt-BR')}</p>` : ''}
            <h4>📖 Conteúdos</h4>
            <ul><li>Resumo teórico</li><li>Exercícios resolvidos</li><li>Questões de vestibular</li><li>Revisão rápida</li></ul>
            <button class="btn btn--primary btn--sm abrir-sessao" data-materia="${materiaId}">▶ Iniciar Estudo</button>
        `;
        $('#modalMateriaOverlay').classList.add('modal-overlay--visible');
        document.querySelector('.abrir-sessao')?.addEventListener('click', () => {
            $('#modalMateriaOverlay').classList.remove('modal-overlay--visible');
            abrirModalSessao(materiaId);
        });
    }
    $('#modalMateriaFechar').addEventListener('click', () => $('#modalMateriaOverlay').classList.remove('modal-overlay--visible'));
    $('#modalMateriaOverlay').addEventListener('click', e => { if (e.target === $('#modalMateriaOverlay')) $('#modalMateriaOverlay').classList.remove('modal-overlay--visible'); });

    // ========== SESSÃO DE ESTUDO ==========
    function setupSessaoEstudo() {
        const select = $('#sessaoMateria');
        select.innerHTML = materias.map(m => `<option value="${m.id}">${m.icone} ${m.nome}</option>`).join('');
        $$('.sessao-tempo').forEach(btn => btn.addEventListener('click', () => {
            $$('.sessao-tempo').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            $('#sessaoTempoCustom').value = '';
        }));
        $('#sessaoIniciar').addEventListener('click', iniciarSessao);
        $('#sessaoPausar').addEventListener('click', togglePausaSessao);
        $('#sessaoEncerrar').addEventListener('click', encerrarSessao);
        $('#modalSessaoFechar').addEventListener('click', () => { if (sessaoRunning) encerrarSessao(); $('#modalSessaoOverlay').classList.remove('modal-overlay--visible'); });
        $('#modalSessaoOverlay').addEventListener('click', e => { if (e.target === $('#modalSessaoOverlay')) { if (sessaoRunning) encerrarSessao(); $('#modalSessaoOverlay').classList.remove('modal-overlay--visible'); } });
        $('#iniciarSessao').addEventListener('click', () => abrirModalSessao('matematica'));
    }

    function abrirModalSessao(materiaId) {
        $('#sessaoMateria').value = materiaId;
        $('#sessaoTempoCustom').value = '';
        $$('.sessao-tempo').forEach(b => b.classList.remove('active'));
        const btn25 = document.querySelector('.sessao-tempo[data-tempo="25"]');
        if (btn25) btn25.classList.add('active');
        $('#sessaoObjetivo').value = '';
        $('#sessaoContador').style.display = 'none';
        $('#sessaoIniciar').style.display = '';
        document.querySelectorAll('#modalSessao .prompt-form__row')[0].style.display = '';
        document.querySelector('#modalSessao .prompt-form__input')?.parentElement && (document.querySelector('#modalSessao .prompt-form__input').parentElement.style.display = '');
        $('#modalSessaoOverlay').classList.add('modal-overlay--visible');
    }

    function iniciarSessao() {
        const custom = parseInt($('#sessaoTempoCustom').value);
        const ativo = document.querySelector('.sessao-tempo.active');
        let minutos = custom > 0 ? custom : (ativo ? parseInt(ativo.dataset.tempo) : 25);
        sessaoTime = minutos * 60;
        sessaoRunning = true;
        sessaoPausado = false;
        document.querySelectorAll('#modalSessao .prompt-form__row')[0].style.display = 'none';
        $('#sessaoObjetivo').parentElement.style.display = 'none';
        $('#sessaoIniciar').style.display = 'none';
        $('#sessaoContador').style.display = 'block';
        $('#sessaoInfo').textContent = `Matéria: ${$('#sessaoMateria').selectedOptions[0]?.text || ''} | Objetivo: ${$('#sessaoObjetivo').value || 'Não definido'}`;
        atualizarDisplaySessao();
        sessaoInterval = setInterval(() => {
            if (!sessaoPausado) {
                if (sessaoTime > 0) { sessaoTime--; atualizarDisplaySessao(); }
                else { encerrarSessao(true); }
            }
        }, 1000);
    }

    function togglePausaSessao() {
        sessaoPausado = !sessaoPausado;
        $('#sessaoPausar').textContent = sessaoPausado ? '▶ Continuar' : '⏸ Pausar';
    }

    function encerrarSessao(concluido = false) {
        clearInterval(sessaoInterval);
        const minutosEstudados = sessaoTime > 0 ? ((sessaoTime / 60) - (concluido ? 0 : (sessaoTime / 60))) : (sessaoTime === 0 && concluido ? sessaoTime / 60 : 0);
        const horas = (minutosEstudados || 0.5) / 60;
        if (!concluido) sessaoTime = 0;
        sessaoRunning = false;
        sessaoPausado = false;
        const materiaId = $('#sessaoMateria').value;
        const progressos = loadData('progressosMaterias') || {};
        progressos[materiaId] = Math.min(100, (progressos[materiaId] || 0) + 5);
        saveData('progressosMaterias', progressos);
        saveData(`ultimaSessao_${materiaId}`, new Date().toISOString());
        const totalHoras = (loadData('horasEstudadas') || 0) + horas;
        saveData('horasEstudadas', totalHoras);
        atualizarStreak();
        atualizarDashboard();
        $('#modalSessaoOverlay').classList.remove('modal-overlay--visible');
        mostrarToast(`Sessão finalizada! +${horas.toFixed(1)}h estudadas`, 'sucesso');
    }

    function atualizarDisplaySessao() {
        const min = Math.floor(sessaoTime / 60);
        const seg = sessaoTime % 60;
        $('#sessaoDisplay').textContent = `${String(min).padStart(2,'0')}:${String(seg).padStart(2,'0')}`;
    }

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
        const primeiro = new Date(calYear, calMonth, 1).getDay();
        const ultimo = new Date(calYear, calMonth + 1, 0).getDate();
        grid.innerHTML = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div class="calendario-dia-semana">${d}</div>`).join('');
        for (let i = 0; i < primeiro; i++) grid.innerHTML += '<div></div>';
        const hojeStr = todayStr();
        const eventos = loadData('eventosCalendario') || [];
        for (let d = 1; d <= ultimo; d++) {
            const dataStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            let cls = 'calendario-dia';
            if (dataStr === hojeStr) cls += ' calendario-dia--hoje';
            if (feriados[dataStr]) cls += ' calendario-dia--feriado';
            if (eventos.some(ev => ev.data === dataStr)) cls += ' calendario-dia--tarefa';
            const count = eventos.filter(ev => ev.data === dataStr).length;
            grid.innerHTML += `<div class="${cls}" data-data="${dataStr}">${d}${count > 1 ? `<span style="font-size:0.6rem;position:absolute;top:2px;right:4px;">+${count-1}</span>` : ''}</div>`;
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
        lista.innerHTML = '<h4>📌 Eventos neste dia</h4>';
        if (!eventos.length) { lista.innerHTML += '<p class="text-muted">Nenhum.</p>'; return; }
        eventos.forEach((ev, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.cssText = 'margin:4px 0;display:flex;justify-content:space-between;align-items:center;padding:12px;';
            div.innerHTML = `<div><strong>${ev.titulo}</strong> (${ev.tipo}) ${ev.hora||''}</div>
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
            if (novoTitulo) {
                ev.titulo = novoTitulo;
                saveData('eventosCalendario', eventos);
                renderEventosDia(dataStr);
                renderCalendario();
                mostrarToast('Evento atualizado!', 'sucesso');
            }
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
        const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
        const hojeStr = todayStr();
        const eventos = loadData('eventosCalendario') || [];
        const disparadas = loadData('notificacoesDisparadas') || [];
        eventos.forEach(ev => {
            if (ev.data === hojeStr && ev.hora === horaAtual && !disparadas.includes(ev.titulo+ev.hora+ev.data)) {
                mostrarToast(`⏰ ${ev.titulo} agora!`, 'lembrete');
                tocarSom();
                disparadas.push(ev.titulo+ev.hora+ev.data);
                saveData('notificacoesDisparadas', disparadas);
            }
        });
    }

    function setupNotificacoesTarefas() { verificarPrazosTarefas(); }
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
    }
    function renderTarefas() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const lista = $('#tarefasLista');
        if (!tarefas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma tarefa.</p>'; return; }
        lista.innerHTML = tarefas.map(t => {
            let extraCls = t.prioridade === 'urgente' ? ' tarefa-urgente' : '';
            return `
                <div class="card${extraCls}" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <div><strong>${t.titulo}</strong> <span class="badge-${t.prioridade}">${t.prioridade}</span><br><small>${t.prazo ? formatDate(t.prazo) : ''} ${t.hora||''}</small></div>
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
        if (idx >= 0) { tarefas[idx].concluida = true; saveData('tarefas', tarefas); pontos += 10; verificarNivel(); atualizarStreak(); renderTarefas(); atualizarDashboard(); mostrarToast('Tarefa concluída! +10 pontos', 'sucesso'); }
    }
    function removerTarefa(id) {
        saveData('tarefas', (loadData('tarefas')||[]).filter(t => t.id !== id));
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
        if (!titulo) return;
        const metas = loadData('metas') || [];
        metas.push({ id: Date.now(), titulo, alvo: parseInt($('#metaAlvo').value)||100, unidade: $('#metaUnidade').value, progresso: 0 });
        saveData('metas', metas);
        renderMetas();
        mostrarToast('Meta criada!', 'sucesso');
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
            if (idx>=0 && metas[idx].progresso < metas[idx].alvo) { metas[idx].progresso++; saveData('metas', metas); renderMetas(); atualizarDashboard(); }
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
            if (pomodoroTime > 0) { pomodoroTime--; atualizarDisplayPomodoro(); }
            else { clearInterval(pomodoroInterval); pomodoroRunning = false; $('#pomodoroIniciar').disabled = false; $('#pomodoroPausar').disabled = true; tocarSom(); mostrarToast('Pomodoro concluído! Descanse.', 'sucesso'); atualizarHorasEstudadas(25/60); }
        }, 1000);
    }
    function pausarPomodoro() { clearInterval(pomodoroInterval); pomodoroRunning = false; $('#pomodoroIniciar').disabled = false; $('#pomodoroPausar').disabled = true; }
    function resetarPomodoro() { pausarPomodoro(); pomodoroTime = 25*60; atualizarDisplayPomodoro(); }
    function atualizarHorasEstudadas(horas) {
        saveData('horasEstudadas', (loadData('horasEstudadas')||0) + horas);
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
                reader.onload = () => { arquivos.push({ id: Date.now(), nome: file.name, tamanho: file.size, dataUrl: reader.result }); saveData('arquivos', arquivos); renderArquivos(); };
                reader.readAsDataURL(file);
            });
        });
        renderArquivos();
    }
    function renderArquivos() {
        const arquivos = loadData('arquivos') || [];
        $('#arquivosLista').innerHTML = arquivos.length ? arquivos.map(a => `<div class="card" style="margin:4px 0;">📄 ${a.nome}</div>`).join('') : '<p class="text-muted">Nenhum arquivo.</p>';
    }

    // ========== CONFIGURAÇÕES ==========
    function setupConfiguracoes() {
        $('#configTema').addEventListener('click', () => $('#themeToggle').click());
        $('#exportarDados').addEventListener('click', () => {
            const dados = {};
            for (let i=0;i<localStorage.length;i++) { const k=localStorage.key(i); if(k.startsWith('learnflow_')) dados[k]=localStorage.getItem(k); }
            const blob = new Blob([JSON.stringify(dados,null,2)],{type:'application/json'});
            const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='learnflow_backup.json'; a.click(); URL.revokeObjectURL(url);
        });
        $('#limparDados').addEventListener('click', () => {
            if(confirm('Limpar todos os dados?')) { Object.keys(localStorage).filter(k=>k.startsWith('learnflow_')).forEach(k=>localStorage.removeItem(k)); location.reload(); }
        });
    }

    // ========== PERFIL ==========
    function setupPerfil() {
        $('#headerAvatar').addEventListener('click', abrirPerfil);
        $('#modalPerfilFechar').addEventListener('click', () => $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'));
        $('#modalPerfilOverlay').addEventListener('click', e => { if(e.target===$('#modalPerfilOverlay')) $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'); });
        $('#perfilEditarNome').addEventListener('click', () => {
            const nome = prompt('Seu nome:', loadData('nomePerfil')||'Estudante');
            if(nome) { saveData('nomePerfil',nome); $('#perfilNome').textContent=nome; }
        });
        $('#perfilEditarAvatar').addEventListener('click', () => {
            const avatares = ['👤','👩','👨','👩‍🎓','👨‍🎓','🧑‍💻','👩‍💻','👨‍💻','🦸','🦹'];
            const atual = $('#perfilAvatar').textContent;
            const idx = avatares.indexOf(atual);
            const novo = avatares[(idx+1)%avatares.length];
            $('#perfilAvatar').textContent=novo;
            $('#headerAvatar').textContent=novo;
            saveData('avatar',novo);
        });
    }
    function abrirPerfil() {
        $('#perfilNome').textContent = loadData('nomePerfil')||'Estudante';
        $('#perfilStreak').textContent = `${streak} dias`;
        $('#perfilHoras').textContent = `${(loadData('horasEstudadas')||0).toFixed(1)}h`;
        $('#perfilMetas').textContent = (loadData('metas')||[]).length;
        $('#perfilNivel').textContent = nivel;
        const avatar = loadData('avatar')||'👤';
        $('#perfilAvatar').textContent = avatar;
        $('#headerAvatar').textContent = avatar;
        $('#modalPerfilOverlay').classList.add('modal-overlay--visible');
    }

    // ========== DASHBOARD ==========
    function setupDashboard() {
        $('#iniciarSessao').addEventListener('click', () => abrirModalSessao('matematica'));
        atualizarDashboard();
    }
    function atualizarDashboard() {
        const tarefas = (loadData('tarefas')||[]).filter(t=>!t.concluida);
        const metas = loadData('metas')||[];
        const horas = loadData('horasEstudadas')||0;
        const aproveitamento = metas.length ? Math.round(metas.reduce((s,m)=>s+(m.progresso/m.alvo),0)/metas.length*100) : 0;
        $('#stat-horas').textContent = horas.toFixed(1)+'h';
        $('#stat-tarefas').textContent = tarefas.length;
        $('#stat-streak').textContent = streak;
        $('#stat-aproveitamento').textContent = aproveitamento+'%';
        $('#headerStreak').textContent = `🔥 ${streak} dias`;
        const eventos = (loadData('eventosCalendario')||[]).filter(ev=>ev.data>=todayStr()).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,3);
        $('#proximosEventos').innerHTML = eventos.length ? eventos.map(e=>`<div><strong>${formatDate(e.data)}</strong>: ${e.titulo}</div>`).join('') : '<p class="text-muted">Nenhum.</p>';
        const tarefasHoje = tarefas.filter(t=>t.prazo===todayStr());
        $('#tarefasHoje').innerHTML = tarefasHoje.length ? tarefasHoje.map(t=>`<div>✅ ${t.titulo}</div>`).join('') : '<p class="text-muted">Nada.</p>';
        const recomendacoes = ['Revise um conteúdo antigo.','Faça um simulado.','Estude com Pomodoro.','Crie metas realistas.'];
        $('#recomendacaoDia').textContent = recomendacoes[Math.floor(Math.random()*recomendacoes.length)];
        const grafico = $('#graficoBarras');
        if(grafico) {
            const dados = [horas, tarefas.length, streak, aproveitamento];
            const max = Math.max(...dados,1);
            grafico.innerHTML = dados.map(v=>`<div class="grafico-barra" style="height:${(v/max)*80}px;" title="${v}"></div>`).join('');
        }
    }
    function atualizarStreak() {
        const hoje = todayStr();
        const ultimo = loadData('ultimoEstudo');
        if(ultimo===hoje) return;
        const ontem = new Date(); ontem.setDate(ontem.getDate()-1);
        streak = (ultimo===ontem.toISOString().split('T')[0]) ? streak+1 : 1;
        saveData('ultimoEstudo',hoje);
        saveData('streak',streak);
        atualizarDashboard();
    }
    function verificarNivel() {
        const novoNivel = Math.floor(pontos/50)+1;
        if(novoNivel>nivel) { nivel=novoNivel; mostrarToast(`🎉 Nível ${nivel}!`); }
        saveData('pontos',pontos);
        saveData('nivel',nivel);
    }

    // ========== INICIAR ==========
    init();
})();