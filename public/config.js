/**
 * CONFIG.JS - Detecção automática de ambiente
 * Sem necessidade de mudanças manuais
 */

// Detecta automaticamente se está em localhost ou produção
const getBackendUrl = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log("🏠 Modo LOCAL detectado - localhost:5000");
        return 'http://localhost:5000';
    }
    
    console.log("🌐 Modo PRODUÇÃO detectado - Render backend");
    return 'https://lingua-viva.onrender.com';
};

// Variável global disponível para todos os scripts
window.BACKEND_URL = getBackendUrl();
console.log(`🔌 Backend URL: ${window.BACKEND_URL}`);
