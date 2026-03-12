/**
 * =====================================================
 * ARQUIVO DE CONFIGURAÇÃO CENTRALIZADO
 * =====================================================
 *
 * IMPORTANTE: Este arquivo contém TODAS as URLs do projeto
 * Quando mudar de domínio, altere APENAS AQUI
 *
 * Desenvolvimento: localhost:5174 (Vite) + localhost:3001 (Express)
 * Produção: seu-dominio.com.br
 *
 */

// Detectar ambiente (desenvolvimento vs produção)
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

// =====================================================
// CONFIGURAÇÃO DE URLs
// =====================================================

const CONFIG = {
  // ==================== DESENVOLVIMENTO ====================
  development: {
    // URL do servidor API (Express)
    // Rodando em http://localhost:3001
    API_BASE: 'http://localhost:3001',

    // Endpoints da API
    API_CONTENT: 'http://localhost:3001/api/content',
    API_LOGIN: 'http://localhost:3001/api/login',
    API_LOGOUT: 'http://localhost:3001/api/logout',
    API_AUTH_STATUS: 'http://localhost:3001/api/auth-status',

    // URLs do frontend (Vite em 5173)
    FRONTEND_BASE: 'http://localhost:5173',
    ADMIN_PANEL: 'http://localhost:5173/admin/',
    LOGIN_PAGE: 'http://localhost:5173/login.html',
    HOME_PAGE: 'http://localhost:5173/',

    // CORS Origin (origem permitida no servidor)
    CORS_ORIGIN: 'http://localhost:5173',
  },

  // ==================== PRODUÇÃO ====================
  production: {
    // URL de produção na Vercel
    // https://portifoliogmatos.vercel.app/
    API_BASE: 'https://portifoliogmatos.vercel.app',

    API_CONTENT: 'https://portifoliogmatos.vercel.app/api/content',
    API_LOGIN: 'https://portifoliogmatos.vercel.app/api/login',
    API_LOGOUT: 'https://portifoliogmatos.vercel.app/api/logout',
    API_AUTH_STATUS: 'https://portifoliogmatos.vercel.app/api/auth-status',

    FRONTEND_BASE: 'https://portifoliogmatos.vercel.app',
    ADMIN_PANEL: 'https://portifoliogmatos.vercel.app/admin/',
    LOGIN_PAGE: 'https://portifoliogmatos.vercel.app/login.html',
    HOME_PAGE: 'https://portifoliogmatos.vercel.app/',

    // CORS Origin (origem permitida no servidor)
    CORS_ORIGIN: 'https://portifoliogmatos.vercel.app',
  }
};

// =====================================================
// SELECIONAR CONFIGURAÇÃO BASEADA NO AMBIENTE
// =====================================================

const ACTIVE_CONFIG = isDevelopment ? CONFIG.development : CONFIG.production;

// =====================================================
// EXPORTAR PARA USO EM OUTROS ARQUIVOS
// =====================================================

// Para uso em módulos ES6 (se usar build tools)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ACTIVE_CONFIG;
}

// Para uso direto em scripts inline
window.APP_CONFIG = ACTIVE_CONFIG;

console.log(`
╔════════════════════════════════════════════════════╗
║          CONFIGURAÇÃO CARREGADA                    ║
╠════════════════════════════════════════════════════╣
║ Ambiente: ${isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}
║ API Base: ${ACTIVE_CONFIG.API_BASE}
║ Frontend Base: ${ACTIVE_CONFIG.FRONTEND_BASE}
╚════════════════════════════════════════════════════╝
`);
