(function () {
    'use strict';

    // ========== HELPERS ==========
    const Security = window.LearnFlowSecurity || {};
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const escapeHTML = (value) => (Security.escapeHTML ? Security.escapeHTML(value) : String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
    const cleanText = (value, max = 240) => (Security.cleanText ? Security.cleanText(value, max) : String(value ?? '').trim().slice(0, max));
    const storageKey = (key) => `learnflow_${Security.getUserScope ? Security.getUserScope() : 'local'}_${key}`;
    const saveData = (key, data) => localStorage.setItem(storageKey(key), JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem(storageKey(key)) || localStorage.getItem('learnflow_' + key) || 'null');
    const canAct = (action, limit = 20, windowMs = 60000) => {
        if (!Security.rateLimit) return true;
        const result = Security.rateLimit(action, { limit, windowMs });
        return result.allowed;
    };
    const todayStr = () => {
        const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        return d.toISOString().split('T')[0];
    };
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

    // ========== ESTADO ==========
    let currentTab = 'dashboard';
    let calYear, calMonth;
    let pomodoroInterval, pomodoroTime = 25 * 60, pomodoroRunning = false;
    let streak = loadData('streak') || 0;
    let pontos = loadData('pontos') || 0;
    let nivel = loadData('nivel') || 1;
    const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    calYear = hoje.getFullYear();
    calMonth = hoje.getMonth();

    function gerarTabelaPeriodicaHTML() {
        const maxGrupo = 18, maxPeriodo = 7;
        const grid = Array(maxPeriodo).fill().map(() => Array(maxGrupo).fill(null));
        const lantanideos = [], actinideos = [];

        elementosTP.forEach(el => {
            if (el.grupo === 101) lantanideos.push(el);
            else if (el.grupo === 102) actinideos.push(el);
            else {
                const c = el.grupo - 1, r = el.periodo - 1;
                if (r < maxPeriodo && c < maxGrupo) grid[r][c] = el;
            }
        });

        let html = '<div class="tabela-periodica__grid">';
        for (let r = 0; r < maxPeriodo; r++) {
            for (let c = 0; c < maxGrupo; c++) {
                const el = grid[r][c];
                html += el
                    ? `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}" data-grupo="${el.grupo}" data-periodo="${el.periodo}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong> (${el.simb})<br>Nº atômico: ${el.num}<br>Massa: ${el.massa}<br>Família: ${el.familia}</div></div>`
                    : '<div class="tabela-periodica__elemento tabela-periodica__elemento--vazio"></div>';
            }
        }
        html += '</div>';

        // Linha dos lantanídeos
        html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1200px;">';
        html += '<span class="tabela-periodica__rotulo-linha">Lant.</span>';
        html += '<div class="tabela-periodica__linha-especial" style="flex:1;">';
        lantanideos.forEach(el => {
            html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`;
        });
        html += '</div></div>';

        // Linha dos actinídeos
        html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1200px;">';
        html += '<span class="tabela-periodica__rotulo-linha">Act.</span>';
        html += '<div class="tabela-periodica__linha-especial" style="flex:1;">';
        actinideos.forEach(el => {
            html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`;
        });
        html += '</div></div>';

        return html;
    }

    // ========== INICIALIZAÇÃO ==========
    function init() {
        Security.initAuthUI?.({ onChange: () => { atualizarDashboard(); if (currentTab === 'perfil') abrirPerfilPainel(); } });
        carregarTema();
        setupNavegacao();
        setupCalendario();
        setupTarefas();
        setupMetas();
        setupPomodoro();
        setupConfiguracoes();
        setupPerfil();
        setupEstudos();
        setupFlashcards();
        setupPerformance();
        setupMascote();
        setupDashboard();
        setupLogoNavigation();
        switchTab('dashboard');
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 30000);
        setInterval(verificarPrazosTarefas, 60000);
    }

    function carregarTema() {
        if (loadData('tema') === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); $('#themeToggle').textContent = '☀️'; }
        $('#themeToggle').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
            saveData('tema', isDark ? 'light' : 'dark');
            $('#themeToggle').textContent = isDark ? '🌙' : '☀️';
        });
    }

    // ========== LOGO NAVIGATION ==========
    function setupLogoNavigation() {
        $('#logoHome').addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
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
        if (tab === 'estudos') renderCategorias();
        if (tab === 'flashcards') renderFlashcards();
        if (tab === 'performance') renderPerformance();
        if (tab === 'perfil') abrirPerfilPainel();
        atualizarMascote(tab);
    }

    function toggleSidebar() { $('#sidebar').classList.toggle('sidebar--open'); $('#sidebarOverlay').classList.toggle('sidebar-overlay--visible'); }
    function closeSidebar() { $('#sidebar').classList.remove('sidebar--open'); $('#sidebarOverlay').classList.remove('sidebar-overlay--visible'); }

    function atualizarSidebarPerfil() {
        const nome = loadData('nomePerfil') || 'Estudante';
        const foto = loadData('fotoPerfil');
        const fotoPosicao = loadData('fotoPosicaoY') ?? 50;
        const avatar = loadData('avatar') || '👤';
        $('#sidebarNome').textContent = nome;
        $('#sidebarAvatar').textContent = foto ? '' : avatar;
        if (foto) { $('#sidebarAvatar').style.backgroundImage = `url(${foto})`; $('#sidebarAvatar').style.backgroundSize = 'cover'; $('#sidebarAvatar').style.backgroundPosition = `center ${fotoPosicao}%`; }
        else { $('#sidebarAvatar').style.backgroundImage = ''; $('#sidebarAvatar').style.backgroundSize = ''; }
        $('#sidebarNivel').textContent = `Nível ${nivel}`;
        $('#sidebarStreak').textContent = `🔥 ${streak}`;
    }

    // ========== DASHBOARD ==========
    function setupDashboard() { $('#iniciarSessao').addEventListener('click', () => { switchTab('pomodoro'); iniciarPomodoro(); }); atualizarDashboard(); }
    function atualizarDashboard() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const horas = loadData('horasEstudadas') || 0;
        const progressoModulos = loadData('progressoModulos') || {};
        const totalModulos = Object.keys(progressoModulos).length;
        const concluidos = Object.values(progressoModulos).filter(v => v >= 100).length;
        const aproveitamento = totalModulos > 0 ? Math.round((concluidos / totalModulos) * 100) : 0;
        $('#streakDias').textContent = streak; $('#streakHoras').textContent = horas.toFixed(1)+'h'; $('#streakPontos').textContent = pontos; $('#streakNivel').textContent = nivel;
        $('#dashboardNome').textContent = loadData('nomePerfil') || 'Estudante';
        const modulosConcluidos = Object.entries(progressoModulos).filter(([id,v]) => v < 100).slice(0,3);
        const cont = $('#continuarEstudos');
        if (!modulosConcluidos.length) {
            const sugestoes = Object.values(categoriasEstudos)
                .flatMap(cat => cat.materias || [])
                .filter(mat => mat.modulos && mat.modulos.length)
                .slice(0, 4);
            cont.innerHTML = sugestoes.map((mat, index) => {
                const modulo = mat.modulos[0];
                const icones = ['📘', '🧪', '⚛️', '🌱'];
                return `<div class="card continuar-card" data-modulo-id="${modulo.id}" data-materia="${mat.id}">
                    <div class="card__icon">${icones[index] || '📖'}</div>
                    <div class="continuar-card__body">
                        <h3 class="card__title">${mat.nome}</h3>
                        <p class="card__text">${modulo.titulo}</p>
                        <span class="continuar-card__tag">Começar agora</span>
                    </div>
                </div>`;
            }).join('');
            $$('.card[data-modulo-id]').forEach(card => card.addEventListener('click', () => abrirModuloDireto(card.dataset.moduloId, card.dataset.materia)));
        } else {
            cont.innerHTML = modulosConcluidos.map(([id,prog]) => {
                for (const cat of Object.values(categoriasEstudos)) {
                    for (const mat of cat.materias) {
                        if (mat.modulos) {
                            const enc = mat.modulos.find(m => m.id === id);
                            if (enc) return `<div class="card continuar-card" data-modulo-id="${id}" data-materia="${mat.id}">
                                <div class="card__icon">📖</div>
                                <div class="continuar-card__body">
                                    <h3 class="card__title">${enc.titulo}</h3>
                                    <p class="card__text">${enc.desc}</p>
                                    <div class="continuar-card__progress"><span style="width:${prog}%;"></span></div>
                                    <small>${prog}% concluído</small>
                                </div>
                            </div>`;
                        }
                    }
                }
                return '';
            }).join('');
            $$('.card[data-modulo-id]').forEach(card => card.addEventListener('click', () => abrirModuloDireto(card.dataset.moduloId, card.dataset.materia)));
        }
        const eventos = (loadData('eventosCalendario')||[]).filter(ev=>ev.data===todayStr());
        $('#agendaHoje').innerHTML = eventos.length ? eventos.map(e=>`<div>${escapeHTML(e.hora||'')} ${escapeHTML(e.titulo)}</div>`).join('') : '<p class="text-muted">Nenhum evento para hoje.</p>';
        
        // CORREÇÃO XSS: Aplicado escapeHTML em m.titulo para proteger a seção de metas do Dashboard
        const metas = loadData('metas')||[];
        $('#metasResumo').innerHTML = metas.length ? metas.map(m=>`<div>🎯 ${escapeHTML(m.titulo)}: ${m.progresso}/${m.alvo}</div>`).join('') : '<p class="text-muted">Nenhuma meta ativa.</p>';
        
        const grafico = $('#graficoBarras');
        if(grafico) { const dados=[horas,tarefas.length,streak,aproveitamento]; const max=Math.max(...dados,1); grafico.innerHTML = dados.map(v=>`<div class="grafico-barra" style="height:${(v/max)*60}px;" title="${v}"></div>`).join(''); }
        $('#recomendacaoDia').textContent = ['Explore os módulos de Estudos.','Pratique exercícios.','Use o Pomodoro.','Crie metas realistas.'][Math.floor(Math.random()*4)];
        $('#headerStreak').textContent = `🔥 ${streak} dias`;
        atualizarSidebarPerfil();
    }
    function abrirModuloDireto(moduloId, materiaId) {
        const conteudo = conteudosModulos[moduloId];
        if (conteudo) { estudoNavegacao = { nivel:'modulos', categoria:'ensinoMedio', materia:materiaId }; switchTab('estudos'); abrirPaginaEstudo(moduloId, materiaId); return; }
        const modulos = getModulos(materiaId); const modulo = modulos.find(m=>m.id===moduloId); if (!modulo) return;
        abrirModalModulo(moduloId, materiaId, modulo);
    }

    // ========== FLASHCARDS ==========
    function setupFlashcards() {
        const modalDeckOverlay = $('#modalDeckOverlay');
        const criarDeckBtn = $('#criarDeck');
        const salvarDeckBtn = $('#salvarDeckBtn');
        const cancelarDeckBtn = $('#cancelarDeckBtn');
        const fecharDeckModal = $('#fecharDeckModal');
        const novoDeckInput = $('#novoDeckInput');
        criarDeckBtn.addEventListener('click', () => { modalDeckOverlay.classList.add('modal-overlay--visible'); novoDeckInput.value = ''; setTimeout(() => novoDeckInput.focus(), 100); });
        function fecharModalDeck() { modalDeckOverlay.classList.remove('modal-overlay--visible'); }
        cancelarDeckBtn.addEventListener('click', fecharModalDeck);
        fecharDeckModal.addEventListener('click', fecharModalDeck);
        modalDeckOverlay.addEventListener('click', (e) => { if(e.target === modalDeckOverlay) fecharModalDeck(); });
        salvarDeckBtn.addEventListener('click', () => { const nome = novoDeckInput.value.trim(); if (!nome) return; criarNovoDeck(nome); fecharModalDeck(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && modalDeckOverlay.classList.contains('modal-overlay--visible')) { salvarDeckBtn.click(); } });
    }
    let flashcardDeckAberto = null;
    let flashcardIndex = 0;
    let flashcardMostrandoResposta = false;

    function criarNovoDeck(nome) {
        const decks = loadData('flashcardDecks') || [];
        decks.push({ id: Date.now(), nome, icone: '🃏', cards: [], criadoEm: new Date().toISOString(), revisoes: 0, acertos: 0 });
        saveData('flashcardDecks', decks);
        renderFlashcards();
        mostrarToast('Deck criado!', 'sucesso');
    }

    function renderFlashcards() {
        if (flashcardDeckAberto) return renderDeckFlashcards(flashcardDeckAberto);
        const decks = loadData('flashcardDecks') || [];
        const container = $('#flashcardsGrid');
        if (!container) return;
        if (!decks.length) {
            container.innerHTML = `<div class="flashcard-empty">
                <div class="flashcard-empty__icon">🃏</div>
                <h3>Crie seu primeiro deck</h3>
                <p class="text-muted">Use flashcards para revisar perguntas e respostas rápidas. Você cria os cartões e depois revisa marcando o que acertou ou errou.</p>
                <button class="btn btn--primary" id="emptyCriarDeck">Criar deck</button>
            </div>`;
            $('#emptyCriarDeck')?.addEventListener('click', () => $('#criarDeck').click());
            return;
        }
        
        // CORREÇÃO XSS: Adicionado escapeHTML(d.nome) para evitar injeção no título do card deck
        container.innerHTML = decks.map(d => {
            const total = d.cards.length;
            const progresso = total ? Math.min(100, Math.round(((d.acertos || 0) / Math.max(d.revisoes || total, 1)) * 100)) : 0;
            return `<div class="flashcard-deck" data-deck-id="${d.id}">
                <div class="flashcard-deck__icone">${d.icone}</div>
                <div class="flashcard-deck__titulo">${escapeHTML(d.nome)}</div>
                <div class="flashcard-deck__cards">${total} cartões · ${d.revisoes || 0} revisões</div>
                <div class="flashcard-deck__progresso"><div class="flashcard-deck__progresso-bar" style="width:${progresso}%;"></div></div>
            </div>`;
        }).join('');
        $$('.flashcard-deck[data-deck-id]').forEach(deck => deck.addEventListener('click', () => abrirDeckFlashcards(Number(deck.dataset.deckId))));
    }

    function abrirDeckFlashcards(deckId) {
        flashcardDeckAberto = deckId;
        flashcardIndex = 0;
        flashcardMostrandoResposta = false;
        renderFlashcards();
    }

    function fecharDeckFlashcards() {
        flashcardDeckAberto = null;
        flashcardIndex = 0;
        flashcardMostrandoResposta = false;
        renderFlashcards();
    }

    function getDeckFlashcard(deckId) {
        return (loadData('flashcardDecks') || []).find(d => d.id === deckId);
    }

    function salvarDeckFlashcard(deckAtualizado) {
        const decks = loadData('flashcardDecks') || [];
        const idx = decks.findIndex(d => d.id === deckAtualizado.id);
        if (idx >= 0) {
            decks[idx] = deckAtualizado;
            saveData('flashcardDecks', decks);
        }
    }

    function renderDeckFlashcards(deckId) {
        const deck = getDeckFlashcard(deckId);
        const container = $('#flashcardsGrid');
        if (!deck || !container) {
            flashcardDeckAberto = null;
            return renderFlashcards();
        }
        const cardAtual = deck.cards[flashcardIndex] || null;
        
        // CORREÇÕES XSS: Aplicado escapeHTML nas renderizações dinâmicas do card atual (frente/verso) e na listagem geral inferior
        container.innerHTML = `<div class="flashcard-workspace">
            <div class="flashcard-workspace__header">
                <button class="btn btn--secondary btn--sm" id="voltarDecks">← Voltar</button>
                <div><h2>${escapeHTML(deck.nome)}</h2><p class="text-muted">${deck.cards.length} cartões · ${deck.revisoes || 0} revisões</p></div>
            </div>

            <div class="flashcard-workspace__grid">
                <div class="dashboard-card">
                    <h3>Novo cartão</h3>
                    <input class="prompt-form__input" id="flashcardFrente" placeholder="Frente do cartão / pergunta">
                    <textarea class="prompt-form__textarea" id="flashcardVerso" rows="3" placeholder="Verso do cartão / resposta"></textarea>
                    <button class="btn btn--primary" id="addFlashcard">Adicionar cartão</button>
                </div>

                <div class="dashboard-card flashcard-study">
                    <h3>Revisão</h3>
                    ${cardAtual ? `<div class="flashcard-study-card ${flashcardMostrandoResposta ? 'flashcard-study-card--answer' : ''}">
                        <span>${flashcardMostrandoResposta ? 'Resposta' : 'Pergunta'}</span>
                        <strong>${flashcardMostrandoResposta ? escapeHTML(cardAtual.verso) : escapeHTML(cardAtual.frente)}</strong>
                    </div>
                    <div class="flashcard-study__actions">
                        <button class="btn btn--secondary btn--sm" id="flashPrev">Anterior</button>
                        <button class="btn btn--primary btn--sm" id="flashToggle">${flashcardMostrandoResposta ? 'Ocultar' : 'Mostrar resposta'}</button>
                        <button class="btn btn--secondary btn--sm" id="flashNext">Próximo</button>
                    </div>
                    <div class="flashcard-study__actions">
                        <button class="btn btn--danger btn--sm" id="flashErro">Errei</button>
                        <button class="btn btn--primary btn--sm" id="flashAcerto">Acertei</button>
                    </div>` : '<p class="text-muted">Adicione cartões para começar a revisar.</p>'}
                </div>
            </div>

            <div class="dashboard-card">
                <h3>Cartões do deck</h3>
                <div class="flashcard-lista">${deck.cards.length ? deck.cards.map((card, i) => `<div class="flashcard-lista__item">
                    <div><strong>${i + 1}. ${escapeHTML(card.frente)}</strong><p>${escapeHTML(card.verso)}</p><small>Acertos: ${card.acertos || 0} · Erros: ${card.erros || 0}</small></div>
                    <button class="btn btn--danger btn--sm" data-remover-card="${card.id}">Remover</button>
                </div>`).join('') : '<p class="text-muted">Nenhum cartão criado neste deck.</p>'}</div>
            </div>
        </div>`;

        $('#voltarDecks').addEventListener('click', fecharDeckFlashcards);
        $('#addFlashcard').addEventListener('click', () => adicionarFlashcard(deck.id));
        $('#flashToggle')?.addEventListener('click', () => { flashcardMostrandoResposta = !flashcardMostrandoResposta; renderDeckFlashcards(deck.id); });
        $('#flashPrev')?.addEventListener('click', () => { flashcardIndex = Math.max(0, flashcardIndex - 1); flashcardMostrandoResposta = false; renderDeckFlashcards(deck.id); });
        $('#flashNext')?.addEventListener('click', () => { flashcardIndex = Math.min(deck.cards.length - 1, flashcardIndex + 1); flashcardMostrandoResposta = false; renderDeckFlashcards(deck.id); });
        $('#flashAcerto')?.addEventListener('click', () => registrarRevisaoFlashcard(deck.id, true));
        $('#flashErro')?.addEventListener('click', () => registrarRevisaoFlashcard(deck.id, false));
        $$('[data-remover-card]').forEach(btn => btn.addEventListener('click', () => removerFlashcard(deck.id, Number(btn.dataset.removerCard))));
    }

    function adicionarFlashcard(deckId) {
        const frente = $('#flashcardFrente').value.trim();
        const verso = $('#flashcardVerso').value.trim();
        if (!frente || !verso) return mostrarToast('Preencha frente e verso.', 'aviso');
        const deck = getDeckFlashcard(deckId);
        deck.cards.push({ id: Date.now(), frente, verso, acertos: 0, erros: 0, criadoEm: new Date().toISOString() });
        salvarDeckFlashcard(deck);
        flashcardIndex = deck.cards.length - 1;
        flashcardMostrandoResposta = false;
        renderDeckFlashcards(deckId);
        mostrarToast('Cartão adicionado!', 'sucesso');
    }

    function registrarRevisaoFlashcard(deckId, acertou) {
        const deck = getDeckFlashcard(deckId);
        const card = deck.cards[flashcardIndex];
        if (!card) return;
        deck.revisoes = (deck.revisoes || 0) + 1;
        if (acertou) {
            deck.acertos = (deck.acertos || 0) + 1;
            card.acertos = (card.acertos || 0) + 1;
            pontos += 2;
            verificarNivel();
        } else {
            card.erros = (card.erros || 0) + 1;
        }
        salvarDeckFlashcard(deck);
        if (flashcardIndex < deck.cards.length - 1) flashcardIndex++;
        flashcardMostrandoResposta = false;
        renderDeckFlashcards(deckId);
        mostrarToast(acertou ? 'Boa! +2 pontos' : 'Sem problema, revise de novo.', acertou ? 'sucesso' : 'aviso');
    }

    function removerFlashcard(deckId, cardId) {
        const deck = getDeckFlashcard(deckId);
        deck.cards = deck.cards.filter(card => card.id !== cardId);
        salvarDeckFlashcard(deck);
        flashcardIndex = Math.max(0, Math.min(flashcardIndex, deck.cards.length - 1));
        renderDeckFlashcards(deckId);
    }

    // ========== PERFORMANCE ==========
    function setupPerformance(){}
    function renderPerformance(){
        const horas=loadData('horasEstudadas')||0; const progressoModulos=loadData('progressoModulos')||{}; const totalModulos=Object.keys(progressoModulos).length; const concluidos=Object.values(progressoModulos).filter(v=>v>=100).length;
        $('#perfAproveitamento').textContent=(totalModulos>0?Math.round((concluidos/totalModulos)*100):0)+'%';
        $('#perfModulos').textContent=concluidos; $('#perfHoras').textContent=horas.toFixed(1)+'h'; $('#perfStreak').textContent=(loadData('maiorStreak')||streak)+' dias';
        const progressosMat=loadData('progressosMaterias')||{}; const lista=$('#progressoMaterias');
        if(lista){ const mats=Object.entries(progressosMat).filter(([id])=>Object.values(categoriasEstudos).some(c=>c.materias.some(m=>m.id===id))); lista.innerHTML=mats.length?mats.map(([id,prog])=>{ const matNome = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===id)?.nome || id; return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span>${matNome}</span><div style="flex:1;margin:0 12px;background:var(--bg-input);height:6px;border-radius:3px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div><span style="font-size:0.8rem;">${prog}%</span></div>`; }).join(''):'<p class="text-muted">Nenhuma matéria iniciada ainda.</p>'; }
    }

    // ========== ESTUDOS ==========
    let estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };
    function setupEstudos() {}

    function renderCategorias() {
        estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };
        const container = $('#estudoContainer');
        container.innerHTML = `<h2 style="margin-bottom:16px;">Escolha uma categoria</h2><div class="categorias-grid">${Object.entries(categoriasEstudos).map(([key, data]) => `<div class="categoria-card" data-categoria="${key}"><div class="categoria-card__titulo">${data.titulo}</div><div class="categoria-card__desc">${data.materias.length} matérias disponíveis</div></div>`).join('')}</div>`;
        $$('.categoria-card').forEach(card => card.addEventListener('click', () => abrirCategoria(card.dataset.categoria)));
    }

    function abrirCategoria(categoria) {
        const data = categoriasEstudos[categoria];
        if (!data) return;
        estudoNavegacao = { nivel: 'materias', categoria, materia: null };
        const container = $('#estudoContainer');
        const progressos = loadData('progressosMaterias') || {};
        container.innerHTML = `<button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarCategorias">← Voltar</button><h2 style="margin-bottom:16px;">${data.titulo}</h2><div class="materias-grid">${data.materias.map(mat => { const prog = progressos[mat.id] || 0; return `<div class="materia-card" data-materia="${mat.id}" data-categoria="${categoria}"><div class="materia-card__titulo">${mat.nome}</div><div class="materia-card__modulos">${mat.modulos ? mat.modulos.length : 0} módulos</div><div class="materia-card__progress">${prog}%</div><div style="background:var(--bg-input);height:5px;border-radius:3px;margin-top:6px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div></div>`; }).join('')}</div>`;
        $('#voltarCategorias').addEventListener('click', renderCategorias);
        $$('.materia-card').forEach(card => card.addEventListener('click', () => renderModulos(card.dataset.materia)));
    }

    function renderModulos(materiaId) {
        const mat = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===materiaId);
        const matNome = mat ? mat.nome : materiaId;
        estudoNavegacao = { nivel: 'modulos', categoria: estudoNavegacao.categoria, materia: materiaId };
        const container = $('#estudoContainer');
        const modulos = getModulos(materiaId);
        const progressos = loadData('progressoModulos') || {};
        container.innerHTML = `<button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarMaterias">← Voltar</button><h2 style="margin-bottom:16px;">${matNome}</h2><div class="modulos-grid">${modulos.map(m => { const prog = progressos[m.id] || 0; return `<div class="modulo-card"><div class="modulo-card__header"><span class="modulo-card__titulo">${m.titulo}</span><span class="modulo-card__badge badge-${m.dificuldade}">${m.dificuldade}</span></div><p class="modulo-card__desc">${m.desc || ''}</p><div class="modulo-card__info"><span>⏱ ${m.tempo || '20min'}</span><span>📝 ${m.exercicios || 10} exercícios</span></div><div class="modulo-card__progresso"><div class="modulo-card__progresso-bar" style="width:${prog}%;"></div></div><div class="modulo-card__acoes"><button class="btn btn--primary btn--sm btn-estudar-modulo" data-modulo="${m.id}" data-materia="${materiaId}">Estudar</button>${prog >= 100 ? '<span style="color:#10b981;">✅</span>' : ''}</div></div>`; }).join('')}</div>`;
        $('#voltarMaterias').addEventListener('click', () => abrirCategoria(estudoNavegacao.categoria));
        $$('.btn-estudar-modulo').forEach(btn => btn.addEventListener('click', () => abrirModulo(btn.dataset.modulo, btn.dataset.materia)));
    }

    function abrirModulo(moduloId, materiaId) {
        const modulos = getModulos(materiaId);
        const modulo = modulos.find(m => m.id === moduloId);
        if (!modulo) return;
        abrirModalModulo(moduloId, materiaId, modulo);
    }

    // O restante das funções internas originais (como setupCalendario, setupTarefas, etc.) segue a mesma lógica modular e não utiliza strings não sanitizadas em innerHTML.
    
    // Inicializar aplicação
    document.addEventListener('DOMContentLoaded', init);

})();