// ============================================================
// SISTEMA DE CONTEÚDO DETALHADO (ESTUDAR AGORA)
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