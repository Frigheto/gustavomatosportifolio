/**
 * AUTH-CHECK.JS
 *
 * Verificação de autenticação SÍNCRONA que bloqueia script.js
 * Deve rodar ANTES de script.js
 */

console.log('🔐 AUTH-CHECK.JS INICIADO');

// 1. Verificar localStorage SINCRONAMENTE
const token = localStorage.getItem('auth_token');
console.log('📋 Token no localStorage:', token ? `Sim (${token.substring(0, 20)}...)` : 'NÃO ENCONTRADO');

if (!token) {
    console.error('❌ NENHUM TOKEN ENCONTRADO - Redirecionando para login');
    // Redirecionar imediatamente se não houver token
    window.location.href = '/login.html';
    // Parar execução aqui
    throw new Error('No auth token found');
}

// 2. Token existe, guardar em window para script.js usar
window.AUTH_TOKEN = token;
console.log('✅ Token armazenado em window.AUTH_TOKEN');

// 3. Verificar no servidor em BACKGROUND (não bloqueia)
console.log('🔍 Iniciando verificação no servidor (background)...');

fetch('/api/auth-status', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => {
    console.log('📡 Resposta do servidor:', response.status);
    return response.json();
})
.then(data => {
    console.log('📦 Server response:', data);

    if (data.authenticated) {
        console.log('✅ AUTENTICAÇÃO VÁLIDA no servidor');
    } else {
        console.error('❌ Token inválido no servidor');
        localStorage.removeItem('auth_token');
        // Redirecionar para login
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 100);
    }
})
.catch(err => {
    console.error('❌ Erro ao verificar no servidor:', err);
    // Mesmo com erro, permite continuar se tiver token local
    console.warn('⚠️ Continuando com token local apesar de erro no servidor');
});

console.log('✅ AUTH-CHECK.JS COMPLETADO - Permitindo script.js executar');
