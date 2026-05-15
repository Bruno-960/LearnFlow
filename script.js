/**
 * ============================================================
 * LEARNFLOW - SISTEMA COMPLETO DE NAVEGAÇÃO
 * ============================================================
 * Funcionalidades:
 * - Troca dinâmica de abas principais
 * - Troca de matérias dentro da aba Estudos
 * - Sidebar com sincronização total
 * - Menu mobile (hamburguer)
 * - Modo claro/escuro com persistência
 * - Overlay para sidebar mobile
 * - Gerador de prompts simulado
 * - Conteúdo detalhado (Estudar Agora / Voltar)
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

    // Cria o overlay dinamicamente
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    sidebarOverlay.id = 'sidebarOverlay';
    document.body.appendChild(sidebarOverlay);

    // ============================================================
    // ESTADO
    // ============================================================
    let currentTab = 'dashboard';
    let currentMateria = 'portugues';

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    function init() {
        loadTheme();
        setupMainEvents();
        setupMateriaNavigation();
        setupPromptGenerator();
        setupConteudoDetalhado();  // ← ESSENCIAL para os botões "Estudar Agora"

        // Garante que o dashboard seja exibido ao carregar
        switchTab('dashboard');

        console.log('✅ LearnFlow inicializado com sucesso!');
    }

    // ============================================================
    // EVENTOS PRINCIPAIS
    // ============================================================
    function setupMainEvents() {
        // Menu mobile (hamburguer)
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }

        // Overlay - fecha sidebar ao clicar fora
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Alternância de tema
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Navegação por abas (botões superiores)
        if (tabNav) {
            tabNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                const tab = btn.dataset.tab;
                if (tab) {
                    switchTab(tab);
                }
            });
        }

        // Navegação pela sidebar (links principais)
        if (sidebar) {
            sidebar.addEventListener('click', function (e) {
                const link = e.target.closest('.sidebar__link');
                if (!link) return;
                const tab = link.dataset.tab;
                const materia = link.dataset.materia;
                // Se tem matéria associada, vai para estudos e abre a matéria
                if (tab === 'estudos' && materia) {
                    switchTab('estudos');
                    switchMateria(materia);
                }
                // Se é uma aba principal (dashboard, estudos, prompts, recursos)
                else if (tab && !materia) {
                    switchTab(tab);
                }
            });
        }

        // Fechar sidebar com tecla Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('sidebar--open')) {
                closeSidebar();
            }
        });

        // Fechar sidebar ao redimensionar para desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900 && sidebar && sidebar.classList.contains('sidebar--open')) {
                closeSidebar();
            }
        });
    }

    // ============================================================
    // SISTEMA DE MATÉRIAS (SUB-ABAS DENTRO DE ESTUDOS)
    // ============================================================
    function setupMateriaNavigation() {
        const materiaNav = document.getElementById('materiaNav');

        // Clique nos botões de matéria
        if (materiaNav) {
            materiaNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.materia-btn');
                if (!btn) return;
                const materia = btn.dataset.materia;
                if (materia) {
                    switchMateria(materia);
                }
            });
        }

        // Clique nos cards do Dashboard que direcionam para matérias
        document.addEventListener('click', function (e) {
            const card = e.target.closest('.card--clickable');
            if (!card) return;
            const tab = card.dataset.tab;
            const materia = card.dataset.materia;
            if (tab === 'estudos' && materia) {
                switchTab('estudos');
                switchMateria(materia);
            }
        });
    }

    function switchMateria(materia) {
        currentMateria = materia;

        // Atualiza botões da navegação de matérias
        const materiaBtns = document.querySelectorAll('.materia-btn');
        materiaBtns.forEach(btn => {
            btn.classList.remove('materia-btn--active');
            if (btn.dataset.materia === materia) {
                btn.classList.add('materia-btn--active');
            }
        });

        // Atualiza painéis de matéria
        const materiaPanels = document.querySelectorAll('.materia-panel');
        materiaPanels.forEach(panel => {
            panel.classList.remove('materia-panel--active');
            if (panel.id === `materia-${materia}`) {
                panel.classList.add('materia-panel--active');
            }
        });

        // Atualiza links da sidebar (seção de matérias)
        const sidebarLinks = document.querySelectorAll('.sidebar__link[data-materia]');
        sidebarLinks.forEach(link => {
            link.classList.remove('sidebar__link--active');
            if (link.dataset.materia === materia && link.dataset.tab === 'estudos') {
                link.classList.add('sidebar__link--active');
            }
        });

        // Remove destaque dos links principais da sidebar
        const mainLinks = document.querySelectorAll('.sidebar__link:not([data-materia])');
        mainLinks.forEach(link => {
            link.classList.remove('sidebar__link--active');
            if (link.dataset.tab === 'estudos') {
                link.classList.add('sidebar__link--active');
            }
        });

        console.log(`📚 Matéria alterada para: ${materia}`);
    }

    // ============================================================
    // CONTROLE DA SIDEBAR (MOBILE)
    // ============================================================
    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('sidebar--open');
        if (sidebarOverlay) sidebarOverlay.classList.add('sidebar-overlay--visible');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('sidebar--open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('sidebar-overlay--visible');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        if (!sidebar) return;
        const isOpen = sidebar.classList.contains('sidebar--open');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // ============================================================
    // CONTROLE DE TEMA (CLARO / ESCURO)
    // ============================================================
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('learnflow-theme', 'light');
            updateThemeIcon('light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('learnflow-theme', 'dark');
            updateThemeIcon('dark');
        }
        console.log(`🎨 Tema alterado para: ${currentTheme === 'dark' ? 'claro' : 'escuro'}`);
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('learnflow-theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon('dark');
        } else {
            updateThemeIcon('light');
        }
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        if (theme === 'dark') {
            themeToggle.textContent = '☀️';
            themeToggle.setAttribute('aria-label', 'Mudar para modo claro');
            themeToggle.title = 'Mudar para modo claro';
        } else {
            themeToggle.textContent = '🌙';
            themeToggle.setAttribute('aria-label', 'Mudar para modo escuro');
            themeToggle.title = 'Mudar para modo escuro';
        }
    }

    // ============================================================
    // SISTEMA DE ABAS PRINCIPAIS
    // ============================================================
    function switchTab(tabName) {
        currentTab = tabName;

        // 1. Atualiza botões da navegação de abas
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('tab-btn--active');
            if (button.dataset.tab === tabName) {
                button.classList.add('tab-btn--active');
            }
        });

        // 2. Atualiza links da sidebar (apenas os principais, sem matéria)
        const sidebarLinks = document.querySelectorAll('.sidebar__link:not([data-materia])');
        sidebarLinks.forEach(link => {
            link.classList.remove('sidebar__link--active');
            if (link.dataset.tab === tabName) {
                link.classList.add('sidebar__link--active');
            }
        });

        // 3. Se NÃO for a aba de estudos, remove destaque das matérias
        if (tabName !== 'estudos') {
            const materiaLinks = document.querySelectorAll('.sidebar__link[data-materia]');
            materiaLinks.forEach(link => link.classList.remove('sidebar__link--active'));
        }

        // 4. Alterna painéis de conteúdo
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            panel.classList.remove('tab-panel--active');
            if (panel.id === `panel-${tabName}`) {
                panel.classList.add('tab-panel--active');
            }
        });

        // 5. Se for aba de estudos, garante que uma matéria esteja ativa
        if (tabName === 'estudos') {
            const activeMateria = document.querySelector('.materia-panel--active');
            if (!activeMateria) {
                switchMateria('portugues');
            }
        }

        // 6. Fecha sidebar no mobile após selecionar
        if (window.innerWidth <= 900) {
            closeSidebar();
        }

        console.log(`📑 Aba alterada para: ${tabName}`);
    }

    // ============================================================
    // GERADOR DE PROMPTS (SIMULAÇÃO)
    // ============================================================
    function setupPromptGenerator() {
        const gerarBtn = document.getElementById('gerarPrompt');
        const promptInput = document.getElementById('promptInput');
        const nivelSelect = document.getElementById('nivelSelect');
        const formatoSelect = document.getElementById('formatoSelect');
        const resultsArea = document.getElementById('resultsArea');
        const resultsContent = document.getElementById('resultsContent');

        if (!gerarBtn) return;

        gerarBtn.addEventListener('click', function () {
            const prompt = promptInput.value.trim();
            if (!prompt) {
                promptInput.style.borderColor = '#e74c3c';
                promptInput.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    promptInput.style.borderColor = '';
                    promptInput.style.animation = '';
                }, 500);
                promptInput.focus();
                return;
            }
            const nivel = nivelSelect.value;
            const formato = formatoSelect.value;
            const conteudo = gerarConteudoSimulado(prompt, nivel, formato);
            resultsContent.innerHTML = conteudo;
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            console.log('🤖 Conteúdo gerado com sucesso!');
        });
    }

    function gerarConteudoSimulado(prompt, nivel, formato) {
        const nivelLabel = {
            'basico': 'Básico',
            'intermediario': 'Intermediário',
            'avancado': 'Avançado'
        }[nivel] || 'Intermediário';

        const formatoLabel = {
            'resumo': 'Resumo',
            'detalhado': 'Detalhado',
            'topicos': 'Tópicos'
        }[formato] || 'Resumo';

        return `
            <div style="background: var(--accent-light); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <strong>📌 Nível:</strong> ${nivelLabel} | 
                <strong>📝 Formato:</strong> ${formatoLabel}<br>
                <strong>🔍 Tema:</strong> "${prompt}"
            </div>
            <h4>📖 Introdução</h4>
            <p>Com base no tema solicitado, este conteúdo foi estruturado para proporcionar uma compreensão clara e objetiva, adequada ao nível ${nivelLabel.toLowerCase()}.</p>
            ${formato === 'topicos' ? `
                <h4>📋 Principais Tópicos:</h4>
                <ul>
                    <li>Conceito fundamental e definições iniciais</li>
                    <li>Contexto histórico e evolução do tema</li>
                    <li>Aplicações práticas no mundo real</li>
                    <li>Exemplos didáticos e exercícios sugeridos</li>
                </ul>
            ` : formato === 'detalhado' ? `
                <h4>📑 Desenvolvimento Detalhado</h4>
                <p><strong>1. Fundamentação Teórica:</strong> O assunto possui raízes profundas na área de conhecimento.</p>
                <p><strong>2. Aplicações Práticas:</strong> No contexto atual, este conhecimento é aplicado em diversas situações.</p>
            ` : `
                <h4>📝 Resumo</h4>
                <p>O tema "${prompt}" é abordado de forma concisa, destacando os pontos mais relevantes.</p>
            `}
            <div style="background: var(--bg-input); padding: 16px; border-radius: 12px; margin-top: 16px;">
                <strong>📎 Sugestão de Estudo:</strong>
                <ul style="margin-top: 8px;">
                    <li>Revise o conteúdo em intervalos espaçados</li>
                    <li>Elabore suas próprias anotações</li>
                    <li>Pratique com exercícios relacionados</li>
                </ul>
            </div>
        `;
    }

    // ============================================================
    // SISTEMA DE CONTEÚDO DETALHADO (ESTUDAR AGORA / VOLTAR)
    // ============================================================
    function setupConteudoDetalhado() {
        // Clique nos botões "Estudar Agora"
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn--estudar');
            if (!btn) return;
            const conteudoId = btn.dataset.conteudo;
            if (conteudoId) {
                abrirConteudo(conteudoId);
            }
        });

        // Clique nos botões "Voltar"
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn--voltar');
            if (!btn) return;
            const materia = btn.dataset.voltar;
            if (materia) {
                voltarParaMateria(materia);
            }
        });

        // Smooth scroll para links do índice
        document.addEventListener('click', function(e) {
            const link = e.target.closest('.indice-links a');
            if (!link) return;
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    function abrirConteudo(conteudoId) {
        // Esconde os cards da matéria atual
        const materiaAtiva = document.querySelector('.materia-panel--active');
        if (materiaAtiva) {
            const cardsGrid = materiaAtiva.querySelector('.cards-grid');
            if (cardsGrid) cardsGrid.style.display = 'none';
        }

        // Esconde todos os conteúdos detalhados
        const conteudosDetalhados = document.querySelectorAll('.conteudo-detalhado');
        conteudosDetalhados.forEach(c => c.style.display = 'none');

        // Mostra o conteúdo selecionado
        const conteudo = document.getElementById('conteudo-' + conteudoId);
        if (conteudo) {
            conteudo.style.display = 'block';
            conteudo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function voltarParaMateria(materia) {
        // Esconde todos os conteúdos detalhados
        const conteudosDetalhados = document.querySelectorAll('.conteudo-detalhado');
        conteudosDetalhados.forEach(c => c.style.display = 'none');

        // Mostra os cards novamente
        const materiaPanel = document.getElementById('materia-' + materia);
        if (materiaPanel) {
            const cardsGrid = materiaPanel.querySelector('.cards-grid');
            if (cardsGrid) cardsGrid.style.display = 'grid';
        }

        // Scroll para o topo da matéria
        const materiaNav = document.getElementById('materiaNav');
        if (materiaNav) {
            materiaNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ============================================================
    // INICIAR APLICAÇÃO
    // ============================================================
    init();

})();