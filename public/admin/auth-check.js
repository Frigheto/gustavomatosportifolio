/**
 * AUTH-CHECK.JS
 *
 * Verificação de autenticação que DEVE rodar ANTES de script.js
 * Valida o token tanto localmente quanto no servidor
 */

console.log('🔐 AUTH-CHECK.JS INICIADO');

// Esperar config.js ser carregado
if (!window.APP_CONFIG) {
    console.error('❌ APP_CONFIG não definido! Aguardando config.js...');
    setTimeout(() => {
        if (!window.APP_CONFIG) {
            console.error('❌ TIMEOUT: APP_CONFIG ainda não disponível!');
            window.location.href = '/login.html';
        }
    }, 1000);
} else {
    console.log('✅ APP_CONFIG carregado:', window.APP_CONFIG);
}

// Função para verificar autenticação
async function verifyAuthentication() {
    const token = localStorage.getItem('auth_token');
    console.log('📋 Token no localStorage:', token ? `Sim (${token.substring(0, 20)}...)` : 'NÃO');

    if (!token) {
        console.warn('⚠️ Nenhum token encontrado no localStorage');
        console.log('Redirecionando para:', window.APP_CONFIG?.LOGIN_PAGE || '/login.html');
        window.location.href = window.APP_CONFIG?.LOGIN_PAGE || '/login.html';
        return false;
    }

    // Verificar token no servidor
    try {
        console.log('🔍 Verificando token no servidor...');
        const response = await fetch(window.APP_CONFIG?.API_AUTH_STATUS || '/api/auth-status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Resposta do servidor:', response.status);
        const data = await response.json();
        console.log('📦 Data:', data);

        if (data.authenticated) {
            console.log('✅ AUTENTICAÇÃO VÁLIDA - Token verificado no servidor');
            return true;
        } else {
            console.warn('❌ Token inválido no servidor');
            localStorage.removeItem('auth_token');
            window.location.href = window.APP_CONFIG?.LOGIN_PAGE || '/login.html';
            return false;
        }
    } catch (err) {
        console.error('❌ Erro ao verificar autenticação no servidor:', err);
        window.location.href = window.APP_CONFIG?.LOGIN_PAGE || '/login.html';
        return false;
    }
}

// Executar verificação imediatamente
console.log('🚀 Iniciando verificação de autenticação...');
verifyAuthentication();
