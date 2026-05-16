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
        setupNotificacoes();
        switchTab('dashboard');
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 30000);
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
            if (tab) switchTab(tab);
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
        $$('.sidebar__link').forEach(l => l.classList.toggle('sidebar__link--active', l.dataset.tab === tab));
        if (tab === 'dashboard') atualizarDashboard();
        if (tab === 'calendario') renderCalendario();
        if (tab === 'tarefas') renderTarefas();
        if (tab === 'metas') renderMetas();
        if (tab === 'arquivos') renderArquivos();
        if (tab === 'estudos') renderMaterias();
    }

    function closeSidebar() { $('#sidebar').classList.remove('sidebar--open'); }

    // ========== ESTUDOS ==========
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

    function setupEstudos() {
        renderMaterias();
    }

    function renderMaterias() {
        const grid = $('#materiasGrid');
        if (!grid) return;
        grid.innerHTML = materias.map(m => `
            <article class="card card--estudo" data-materia="${m.id}">
                <div class="card__icon">${m.icone}</div>
                <h3 class="card__title">${m.nome}</h3>
                <p class="card__text">${m.desc}</p>
            </article>
        `).join('');
        $$('.card--estudo').forEach(card => {
            card.addEventListener('click', () => abrirMateria(card.dataset.materia));
        });
    }

    function abrirMateria(materiaId) {
        const materia = materias.find(m => m.id === materiaId);
        if (!materia) return;
        $('#modalMateriaTitulo').textContent = `${materia.icone} ${materia.nome}`;
        $('#modalMateriaConteudo').innerHTML = `
            <p>${materia.desc}</p>
            <h4>📖 Conteúdos</h4>
            <ul>
                <li>Resumo teórico</li>
                <li>Exercícios resolvidos</li>
                <li>Questões de vestibular</li>
                <li>Revisão rápida</li>
            </ul>
            <button class="btn btn--primary btn--sm" id="iniciarEstudoMateria">▶ Iniciar Estudo</button>
        `;
        $('#modalMateriaOverlay').classList.add('modal-overlay--visible');
        $('#iniciarEstudoMateria').addEventListener('click', () => {
            atualizarStreak();
            const horas = loadData('horasEstudadas') || 0;
            saveData('horasEstudadas', horas + 0.5);
            mostrarToast(`Estudando ${materia.nome}... +30 min`);
            atualizarDashboard();
        });
    }

    $('#modalMateriaFechar').addEventListener('click', () => $('#modalMateriaOverlay').classList.remove('modal-overlay--visible'));
    $('#modalMateriaOverlay').addEventListener('click', e => { if (e.target === $('#modalMateriaOverlay')) $('#modalMateriaOverlay').classList.remove('modal-overlay--visible'); });

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
            grid.innerHTML += `<div class="${cls}" data-data="${dataStr}">${d}</div>`;
        }
        $$('.calendario-dia[data-data]').forEach(el => el.addEventListener('click', e => abrirModalDia(e.target.dataset.data)));
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
        if (!eventos.length) lista.innerHTML += '<p class="text-muted">Nenhum.</p>';
        else eventos.forEach(ev => lista.innerHTML += `<div class="card" style="margin:4px 0;"><strong>${ev.titulo}</strong> (${ev.tipo}) ${ev.hora||''}</div>`);
    }

    $('#modalSalvarEvento').addEventListener('click', () => {
        const data = $('#modalDia').dataset.data;
        const titulo = $('#modalEventoTitulo').value.trim();
        if (!titulo) return mostrarToast('Preencha o título!');
        const eventos = loadData('eventosCalendario') || [];
        eventos.push({
            data,
            titulo,
            tipo: $('#modalEventoTipo').value,
            hora: $('#modalEventoHora').value,
            prioridade: 'media'
        });
        saveData('eventosCalendario', eventos);
        renderEventosDia(data);
        renderCalendario();
        mostrarToast('Evento salvo!');
        $('#modalEventoTitulo').value = '';
    });

    // ========== NOTIFICAÇÕES EM TEMPO REAL ==========
    function setupNotificacoes() {}
    function verificarNotificacoes() {
        const agora = new Date();
        const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
        const hojeStr = todayStr();
        const eventos = loadData('eventosCalendario') || [];
        const notificacoesDisparadas = loadData('notificacoesDisparadas') || [];
        eventos.forEach(ev => {
            if (ev.data === hojeStr && ev.hora === horaAtual && !notificacoesDisparadas.includes(ev.titulo+ev.hora)) {
                mostrarToast(`⏰ ${ev.titulo} agora!`);
                tocarSom();
                notificacoesDisparadas.push(ev.titulo+ev.hora);
                saveData('notificacoesDisparadas', notificacoesDisparadas);
            }
        });
    }

    function tocarSom() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch(e) {}
    }

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
            prioridade: $('#tarefaPrioridade').value,
            hora: $('#tarefaHora').value,
            concluida: false
        });
        saveData('tarefas', tarefas);
        renderTarefas();
        atualizarDashboard();
        mostrarToast('Tarefa adicionada!');
        $('#tarefaTitulo').value = '';
    }
    function renderTarefas() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const lista = $('#tarefasLista');
        if (!tarefas.length) { lista.innerHTML = '<p class="text-muted">Nenhuma tarefa.</p>'; return; }
        lista.innerHTML = tarefas.map(t => `
            <div class="card" style="margin-bottom:10px;display:flex;justify-content:space-between;">
                <div><strong>${t.titulo}</strong> <span class="badge-${t.prioridade}">${t.prioridade}</span><br><small>${t.prazo ? formatDate(t.prazo) : ''} ${t.hora||''}</small></div>
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
            mostrarToast('Concluída! +10 pontos');
        }
    }
    function removerTarefa(id) {
        saveData('tarefas', (loadData('tarefas')||[]).filter(t => t.id !== id));
        renderTarefas();
        atualizarDashboard();
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
        mostrarToast('Meta criada!');
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
                mostrarToast('Pomodoro concluído! Descanse.');
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
        lista.innerHTML = arquivos.length ? arquivos.map(a => `<div class="card" style="margin:4px 0;">📄 ${a.nome}</div>`).join('') : '<p class="text-muted">Nenhum arquivo.</p>';
    }

    // ========== CONFIGURAÇÕES ==========
    function setupConfiguracoes() {
        $('#configTema').addEventListener('click', () => $('#themeToggle').click());
        $('#exportarDados').addEventListener('click', () => {
            const dados = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('learnflow_')) dados[key] = localStorage.getItem(key);
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
            if (confirm('Limpar todos os dados?')) {
                Object.keys(localStorage).filter(k => k.startsWith('learnflow_')).forEach(k => localStorage.removeItem(k));
                location.reload();
            }
        });
    }

    // ========== PERFIL ==========
    function setupPerfil() {
        $('#headerAvatar').addEventListener('click', () => {
            $('#perfilNome').textContent = loadData('nomePerfil') || 'Estudante';
            $('#perfilStreak').textContent = `${streak} dias`;
            $('#perfilHoras').textContent = `${(loadData('horasEstudadas')||0).toFixed(1)}h`;
            $('#perfilMetas').textContent = (loadData('metas')||[]).length;
            $('#modalPerfilOverlay').classList.add('modal-overlay--visible');
        });
        $('#modalPerfilFechar').addEventListener('click', () => $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'));
        $('#modalPerfilOverlay').addEventListener('click', e => { if (e.target === $('#modalPerfilOverlay')) $('#modalPerfilOverlay').classList.remove('modal-overlay--visible'); });
        $('#perfilEditarNome').addEventListener('click', () => {
            const nome = prompt('Seu nome:', loadData('nomePerfil') || 'Estudante');
            if (nome) { saveData('nomePerfil', nome); $('#perfilNome').textContent = nome; }
        });
    }

    // ========== DASHBOARD ==========
    function setupDashboard() {
        $('#iniciarSessao').addEventListener('click', () => {
            switchTab('pomodoro');
            iniciarPomodoro();
            atualizarStreak();
            mostrarToast('Sessão de estudo iniciada!');
        });
        atualizarDashboard();
    }

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
        const eventos = (loadData('eventosCalendario') || []).filter(ev => ev.data >= todayStr()).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,3);
        $('#proximosEventos').innerHTML = eventos.length ? eventos.map(e => `<div><strong>${formatDate(e.data)}</strong>: ${e.titulo}</div>`).join('') : '<p class="text-muted">Nenhum.</p>';
        const tarefasHoje = tarefas.filter(t => t.prazo === todayStr());
        $('#tarefasHoje').innerHTML = tarefasHoje.length ? tarefasHoje.map(t => `<div>✅ ${t.titulo}</div>`).join('') : '<p class="text-muted">Nada.</p>';
        const recomendacoes = ['Revise um conteúdo antigo.','Faça um simulado.','Estude com Pomodoro.','Crie metas realistas.'];
        $('#recomendacaoDia').textContent = recomendacoes[Math.floor(Math.random()*recomendacoes.length)];
        const grafico = $('#graficoBarras');
        if (grafico) {
            const dados = [horas, tarefas.length, streak, aproveitamento];
            const max = Math.max(...dados, 1);
            grafico.innerHTML = dados.map(v => `<div class="grafico-barra" style="height:${(v/max)*80}px;" title="${v}"></div>`).join('');
        }
    }

    function atualizarStreak() {
        const hoje = todayStr();
        const ultimo = loadData('ultimoEstudo');
        if (ultimo === hoje) return;
        const ontem = new Date();
        ontem.setDate(ontem.getDate()-1);
        if (ultimo === ontem.toISOString().split('T')[0]) streak++;
        else streak = 1;
        saveData('ultimoEstudo', hoje);
        saveData('streak', streak);
        atualizarDashboard();
    }

    function verificarNivel() {
        const novoNivel = Math.floor(pontos / 50) + 1;
        if (novoNivel > nivel) {
            nivel = novoNivel;
            mostrarToast(`🎉 Nível ${nivel}!`);
        }
        saveData('pontos', pontos);
        saveData('nivel', nivel);
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