# 🌐 GUIA: Como Mudar de Domínio

## ⚠️ IMPORTANTE

Quando você mudar de domínio (ex: `localhost:5174` → `seu-dominio.com.br`), siga EXATAMENTE este guia para evitar erros de conexão.

---

## 📋 Lista de Mudanças Necessárias

Todas as URLs do projeto estão centralizadas em **UM ÚNICO ARQUIVO**: `config.js`

### ✅ Método Correto (Recomendado)

**Edite APENAS o arquivo `config.js` e NADA MAIS**

---

## 🔧 COMO MUDAR: Passo a Passo

### PASSO 1: Abrir o arquivo `config.js`

Localização: `/config.js` (raiz do projeto)

```
seu-projeto/
├── config.js    ← EDITE ESTE ARQUIVO
├── index.html
├── admin/
├── assets/
└── server.js
```

---

### PASSO 2: Encontrar a Seção PRODUÇÃO

No arquivo `config.js`, procure por:

```javascript
// ==================== PRODUÇÃO ====================
production: {
  // MUDE AQUI QUANDO FOR PARA PRODUÇÃO
  // Exemplo: 'https://gustavomatos.com.br'
  API_BASE: 'https://seu-dominio-aqui.com.br',

  API_CONTENT: 'https://seu-dominio-aqui.com.br/api/content',
  API_LOGIN: 'https://seu-dominio-aqui.com.br/api/login',
  API_LOGOUT: 'https://seu-dominio-aqui.com.br/api/logout',
  API_AUTH_STATUS: 'https://seu-dominio-aqui.com.br/api/auth-status',

  FRONTEND_BASE: 'https://seu-dominio-aqui.com.br',
  ADMIN_PANEL: 'https://seu-dominio-aqui.com.br/admin/',
  LOGIN_PAGE: 'https://seu-dominio-aqui.com.br/login.html',
  HOME_PAGE: 'https://seu-dominio-aqui.com.br/',
}
```

---

### PASSO 3: Substituir `seu-dominio-aqui.com.br`

Mude TODOS os `seu-dominio-aqui.com.br` para seu domínio real, **incluindo CORS_ORIGIN**.

**Exemplo:**
```javascript
// ==================== PRODUÇÃO ====================
production: {
  API_BASE: 'https://gustavomatos.com.br',

  API_CONTENT: 'https://gustavomatos.com.br/api/content',
  API_LOGIN: 'https://gustavomatos.com.br/api/login',
  API_LOGOUT: 'https://gustavomatos.com.br/api/logout',
  API_AUTH_STATUS: 'https://gustavomatos.com.br/api/auth-status',

  FRONTEND_BASE: 'https://gustavomatos.com.br',
  ADMIN_PANEL: 'https://gustavomatos.com.br/admin/',
  LOGIN_PAGE: 'https://gustavomatos.com.br/login.html',
  HOME_PAGE: 'https://gustavomatos.com.br/',

  // ⚠️ NÃO ESQUEÇA DE ATUALIZAR CORS_ORIGIN TAMBÉM!
  CORS_ORIGIN: 'https://gustavomatos.com.br',
}
```

---

### PASSO 4: Salvar o arquivo

Pressione `Ctrl+S` (Windows/Linux) ou `Cmd+S` (Mac)

---

### PASSO 5: Testar as mudanças

Acesse seu novo domínio:
```
https://gustavomatos.com.br/
```

E verifique se tudo funciona:
- ✅ Site carrega
- ✅ Admin faz login
- ✅ Vídeos carregam
- ✅ Edição de fotos/vídeos funciona

---

## 📝 Exemplo Completo de Mudança

### ANTES (Desenvolvimento)
```
Site:  http://localhost:5174/
Admin: http://localhost:5174/admin/
API:   http://localhost:3001/api/content
```

### DEPOIS (Produção)
```
Site:  https://gustavomatos.com.br/
Admin: https://gustavomatos.com.br/admin/
API:   https://gustavomatos.com.br/api/content
```

**Config.js após mudança:**
```javascript
production: {
  API_BASE: 'https://gustavomatos.com.br',
  API_CONTENT: 'https://gustavomatos.com.br/api/content',
  API_LOGIN: 'https://gustavomatos.com.br/api/login',
  API_LOGOUT: 'https://gustavomatos.com.br/api/logout',
  API_AUTH_STATUS: 'https://gustavomatos.com.br/api/auth-status',
  FRONTEND_BASE: 'https://gustavomatos.com.br',
  ADMIN_PANEL: 'https://gustavomatos.com.br/admin/',
  LOGIN_PAGE: 'https://gustavomatos.com.br/login.html',
  HOME_PAGE: 'https://gustavomatos.com.br/',
}
```

---

## 🚨 ERROS COMUNS

### ❌ Erro 1: Esqueceu de mudar a URL da API

**Sintoma**: "Erro ao conectar com o servidor" ou vídeos não carregam

**Solução**: Verifique se todas as URLs em `config.js` foram atualizadas para o novo domínio.

---

### ❌ Erro 2: Misturou HTTP com HTTPS

**Sintoma**: "Mixed Content" error no navegador

**Solução**: Use `https://` para domínios em produção.

---

### ❌ Erro 3: Editou arquivo errado

**Sintoma**: Site funciona, mas admin não funciona (ou vice-versa)

**Solução**: Verifique que APENAS `config.js` foi editado. Não edite:
- ❌ `admin/script.js`
- ❌ `assets/js/script.js`
- ❌ `login.html`
- ❌ `server.js`

---

## 📍 Arquivos que USAM a Config

O arquivo `config.js` é usado por:

1. **admin/script.js** (linha 2-4)
   ```javascript
   const API_URL = window.APP_CONFIG.API_CONTENT;
   const AUTH_URL = window.APP_CONFIG.API_AUTH_STATUS;
   const LOGOUT_URL = window.APP_CONFIG.API_LOGOUT;
   ```

2. **assets/js/script.js** (linha 35-36)
   ```javascript
   const API_URL = window.APP_CONFIG.API_CONTENT;
   ```

3. **login.html** (linhas 230, 248)
   ```javascript
   fetch(window.APP_CONFIG.API_LOGIN)
   window.location.href = window.APP_CONFIG.ADMIN_PANEL
   ```

✅ Todos esses arquivos carregam automaticamente a config correta

---

## ✅ Checklist de Mudança

Antes de ir para produção:

- [ ] Editei `config.js` com o novo domínio
- [ ] Verifiquei se `https://` está correto (não `http://`)
- [ ] Testei o site principal
- [ ] Testei o login do admin
- [ ] Testei criação/edição de vídeos
- [ ] Testei carregamento de imagens
- [ ] Verifiquei console do navegador (F12) para erros
- [ ] O site está funcionando 100%

---

## 🆘 Precisando de Ajuda?

Se algo não funcionar após a mudança:

1. Abra `config.js`
2. Verifique se o domínio está correto em TODOS os lugares
3. Verifique se está usando `https://` (não `http://`)
4. Abra o Console do navegador (F12) e procure por erros
5. Mensagem de erro típica: "Failed to fetch..." → Verifique domínio em `config.js`

---

## 📞 Resumo

**REGRA DE OURO**: Quando mudar de domínio, edite APENAS `config.js`

Pronto! Seu projeto está configurado corretamente. 🎉

---

**Última atualização**: 12 de Março de 2026
**Versão do projeto**: 1.0.0
