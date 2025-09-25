// EcoLife Web - JavaScript Principal
// Calculadora de Pegada Ecológica

// Estado global da aplicação
const AppState = {
    currentPage: 'home',
    formData: {},
    lastResult: null,
    history: []
};

// Configurações do questionário
const QuestionnaireConfig = {
    totalQuestions: 10,
    sections: ['transporte', 'energia', 'alimentacao', 'agua']
};

// Mensagens de classificação
const ClassificationMessages = {
    baixa: "Parabéns! Seus hábitos são sustentáveis. Continue assim e inspire outras pessoas.",
    moderada: "Você está no caminho! Considere reduzir ainda mais o consumo de carne e energia elétrica.",
    alta: "Atenção! Considere usar transporte público, reduzir carne e adotar práticas de economia de energia e água."
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadHistoryFromStorage();
    setupEventListeners();
    setupFormValidation();
    updateProgress();
    
    // Carregar último resultado se existir
    const lastResult = localStorage.getItem('ecolife_last_result');
    if (lastResult) {
        AppState.lastResult = JSON.parse(lastResult);
    }
    
    console.log('EcoLife Web inicializado com sucesso');
}

// Event Listeners
function setupEventListeners() {
    // Navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Formulário
    const form = document.getElementById('eco-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('change', handleFormChange);
    }
    
    // Opções do questionário
    const options = document.querySelectorAll('.option input[type="radio"]');
    options.forEach(option => {
        option.addEventListener('change', handleOptionChange);
    });
    
    // Teclas de atalho
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleNavigation(event) {
    event.preventDefault();
    const targetPage = event.target.getAttribute('data-page');
    if (targetPage) {
        navigateToPage(targetPage);
    }
}

function navigateToPage(page) {
    // Ocultar página atual
    const currentPageElement = document.querySelector('.page.active');
    if (currentPageElement) {
        currentPageElement.classList.remove('active');
    }
    
    // Mostrar nova página
    const targetPageElement = document.getElementById(page);
    if (targetPageElement) {
        targetPageElement.classList.add('active');
        AppState.currentPage = page;
        
        // Ações específicas por página
        switch(page) {
            case 'historico':
                loadHistory();
                break;
            case 'resultado':
                if (AppState.lastResult) {
                    displayResults(AppState.lastResult);
                }
                break;
        }
        
        // Rolar para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Foco na página para acessibilidade
        targetPageElement.focus();
    }
}

// Manipulação do formulário
function setupFormValidation() {
    const form = document.getElementById('eco-form');
    const requiredFields = form.querySelectorAll('input[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('invalid', handleFieldError);
        field.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const isValid = validateForm(form);
    
    if (!isValid) {
        showToast('Por favor, responda todas as perguntas obrigatórias.', 'error');
        return;
    }
    
    // Calcular resultado
    const result = calculateEcologicalFootprint(formData);
    
    // Salvar resultado
    saveResult(result);
    
    // Mostrar resultado
    displayResults(result);
    
    // Navegar para página de resultado
    navigateToPage('resultado');
    
    showToast('Cálculo realizado com sucesso!', 'success');
}

function validateForm(form) {
    const requiredGroups = [
        'carro_freq',
        'transporte_publico', 
        'bicicleta_caminhada',
        'consumo_energia',
        'energia_alternativa',
        'lampadas_led',
        'desligar_aparelhos',
        'carne_vermelha',
        'industrializados',
        'produtores_locais',
        'economia_agua',
        'captacao_agua'
    ];
    
    let isValid = true;
    
    requiredGroups.forEach(groupName => {
        const radioGroup = form.querySelectorAll(`input[name="${groupName}"]`);
        const isGroupValid = Array.from(radioGroup).some(radio => radio.checked);
        
        if (!isGroupValid) {
            isValid = false;
            highlightError(groupName);
        } else {
            clearError(groupName);
        }
    });
    
    return isValid;
}

function highlightError(groupName) {
    const radioGroup = document.querySelectorAll(`input[name="${groupName}"]`);
    radioGroup.forEach(radio => {
        const option = radio.closest('.option');
        if (option) {
            option.classList.add('error');
        }
    });
}

function clearError(groupName) {
    const radioGroup = document.querySelectorAll(`input[name="${groupName}"]`);
    radioGroup.forEach(radio => {
        const option = radio.closest('.option');
        if (option) {
            option.classList.remove('error');
        }
    });
}

function handleFieldError(event) {
    const field = event.target;
    const groupName = field.name;
    highlightError(groupName);
}

function clearFieldError(event) {
    const field = event.target;
    const groupName = field.name;
    clearError(groupName);
}

function handleFormChange(event) {
    updateProgress();
    
    // Salvar progresso temporário
    const formData = new FormData(event.target.form);
    const tempData = {};
    for (let [key, value] of formData.entries()) {
        tempData[key] = value;
    }
    AppState.formData = tempData;
}

function handleOptionChange(event) {
    // Remover seleção visual anterior
    const groupName = event.target.name;
    const allOptionsInGroup = document.querySelectorAll(`input[name="${groupName}"]`);
    
    allOptionsInGroup.forEach(radio => {
        const option = radio.closest('.option');
        if (option) {
            option.classList.remove('selected');
        }
    });
    
    // Adicionar seleção visual atual
    const currentOption = event.target.closest('.option');
    if (currentOption) {
        currentOption.classList.add('selected');
    }
    
    clearError(groupName);
}

// Cálculo da pegada ecológica
function calculateEcologicalFootprint(formData) {
    let totalScore = 0;
    
    // Converter FormData em objeto
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = parseInt(value);
        totalScore += parseInt(value);
    }
    
    // Calcular planetas necessários
    const planetsNeeded = 1 + (totalScore / 10);
    
    // Determinar classificação
    let classification = 'baixa';
    if (totalScore >= 15) {
        classification = 'alta';
    } else if (totalScore >= 8) {
        classification = 'moderada';
    }
    
    // Criar objeto de resultado
    const result = {
        timestamp: new Date().toISOString(),
        totalScore: totalScore,
        planetsNeeded: parseFloat(planetsNeeded.toFixed(1)),
        classification: classification,
        message: ClassificationMessages[classification],
        details: data
    };
    
    return result;
}

function displayResults(result) {
    // Atualizar elementos da página de resultado
    document.getElementById('score-display').textContent = result.totalScore;
    document.getElementById('planets-display').textContent = `🌍 ${result.planetsNeeded} planetas`;
    
    const classificationElement = document.getElementById('classification');
    classificationElement.textContent = `Pegada ${result.classification.charAt(0).toUpperCase() + result.classification.slice(1)}`;
    classificationElement.className = `classification ${result.classification}`;
    
    document.getElementById('recommendation-text').textContent = result.message;
    
    AppState.lastResult = result;
}

// Sistema de persistência
function saveResult(result) {
    // Salvar último resultado
    localStorage.setItem('ecolife_last_result', JSON.stringify(result));
    
    // Adicionar ao histórico
    AppState.history.unshift(result);
    
    // Limitar histórico a 50 itens
    if (AppState.history.length > 50) {
        AppState.history = AppState.history.slice(0, 50);
    }
    
    // Salvar histórico
    localStorage.setItem('ecolife_history', JSON.stringify(AppState.history));
}

function loadHistoryFromStorage() {
    try {
        const savedHistory = localStorage.getItem('ecolife_history');
        if (savedHistory) {
            AppState.history = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        AppState.history = [];
    }
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    
    if (AppState.history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <h3>📊 Nenhuma avaliação realizada</h3>
                <p>Faça seu primeiro questionário para ver o histórico aqui.</p>
                <button class="btn" onclick="navigateToPage('questionario')" style="margin-top: 1rem;">
                    Fazer Avaliação
                </button>
            </div>
        `;
        return;
    }
    
    const historyHTML = AppState.history.map((result, index) => {
        const date = new Date(result.timestamp);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="history-item">
                <div>
                    <div class="history-date">${formattedDate}</div>
                    <div class="classification ${result.classification}">
                        Pegada ${result.classification.charAt(0).toUpperCase() + result.classification.slice(1)}
                    </div>
                </div>
                <div>
                    <div class="history-score">${result.totalScore} pontos</div>
                    <div>🌍 ${result.planetsNeeded} planetas</div>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="viewHistoryDetails(${index})">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
}

function viewHistoryDetails(index) {
    const result = AppState.history[index];
    if (result) {
        displayResults(result);
        navigateToPage('resultado');
    }
}

function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
        AppState.history = [];
        localStorage.removeItem('ecolife_history');
        loadHistory();
        showToast('Histórico limpo com sucesso!', 'success');
    }
}

// Sistema de progresso
function updateProgress() {
    const form = document.getElementById('eco-form');
    if (!form) return;
    
    const totalQuestions = QuestionnaireConfig.totalQuestions;
    const answeredQuestions = getAnsweredQuestionsCount(form);
    const progressPercent = (answeredQuestions / totalQuestions) * 100;
    
    const progressBar = document.getElementById('progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

function getAnsweredQuestionsCount(form) {
    const requiredGroups = [
        'carro_freq',
        'transporte_publico', 
        'bicicleta_caminhada',
        'consumo_energia',
        'energia_alternativa',
        'lampadas_led',
        'desligar_aparelhos',
        'carne_vermelha',
        'industrializados',
        'produtores_locais',
        'economia_agua',
        'captacao_agua'
    ];
    
    let answeredCount = 0;
    
    requiredGroups.forEach(groupName => {
        const radioGroup = form.querySelectorAll(`input[name="${groupName}"]`);
        const isAnswered = Array.from(radioGroup).some(radio => radio.checked);
        if (isAnswered) {
            answeredCount++;
        }
    });
    
    return answeredCount;
}

// Sistema de notificações
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Ocultar toast após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Navegação por teclado
function handleKeyboardNavigation(event) {
    // ESC para voltar à página inicial
    if (event.key === 'Escape' && AppState.currentPage !== 'home') {
        navigateToPage('home');
        return;
    }
    
    // Navegação com Alt + número
    if (event.altKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                navigateToPage('home');
                break;
            case '2':
                event.preventDefault();
                navigateToPage('questionario');
                break;
            case '3':
                event.preventDefault();
                navigateToPage('historico');
                break;
            case '4':
                event.preventDefault();
                navigateToPage('sobre');
                break;
        }
    }
}

// Utilitários
function exportResults() {
    if (!AppState.lastResult) {
        showToast('Nenhum resultado para exportar.', 'error');
        return;
    }
    
    const exportData = {
        aplicacao: 'EcoLife Web',
        versao: '1.0',
        data_exportacao: new Date().toISOString(),
        resultado: AppState.lastResult
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ecolife-resultado-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Resultado exportado com sucesso!', 'success');
}

function shareResults() {
    if (!AppState.lastResult) {
        showToast('Nenhum resultado para compartilhar.', 'error');
        return;
    }
    
    const shareText = `🌍 Minha Pegada Ecológica: ${AppState.lastResult.totalScore} pontos (${AppState.lastResult.planetsNeeded} planetas necessários). Classificação: ${AppState.lastResult.classification}. Calcule a sua em EcoLife Web!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Minha Pegada Ecológica - EcoLife Web',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showToast('Resultado compartilhado com sucesso!', 'success');
        }).catch((error) => {
            console.error('Erro ao compartilhar:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Texto copiado para a área de transferência!', 'success');
    }).catch(() => {
        showToast('Não foi possível copiar o texto.', 'error');
    });
}

// Análise de dados
function getStatistics() {
    if (AppState.history.length === 0) {
        return null;
    }
    
    const scores = AppState.history.map(result => result.totalScore);
    const planets = AppState.history.map(result => result.planetsNeeded);
    
    return {
        totalEvaluations: AppState.history.length,
        averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
        averagePlanets: (planets.reduce((a, b) => a + b, 0) / planets.length).toFixed(1),
        bestScore: Math.min(...scores),
        worstScore: Math.max(...scores),
        improvement: scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0
    };
}

// Performance e monitoramento
function measurePerformance() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Performance EcoLife Web:', {
            loadTime: perfData.loadEventEnd - perfData.fetchStart,
            domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            renderTime: perfData.domComplete - perfData.domLoading
        });
    }
}

// Executar medição de performance após carregamento
window.addEventListener('load', measurePerformance);

// Funções globais expostas
window.navigateToPage = navigateToPage;
window.viewHistoryDetails = viewHistoryDetails;
window.clearHistory = clearHistory;
window.exportResults = exportResults;
window.shareResults = shareResults;
