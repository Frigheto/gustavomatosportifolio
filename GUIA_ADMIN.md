# 📋 Guia de Administração - Site Gustavo Matos

## 🔐 Como Acessar a Área Admin

### 1. Iniciar o Servidor
```bash
npm run dev
```

Isso irá iniciar:
- **Servidor API**: `http://localhost:3001`
- **Site Principal**: `http://localhost:5173` (ou porta Vite padrão)

### 2. Fazer Login
Acesse: `http://localhost:3001/login.html`

**Credenciais padrão:**
- **Usuário**: `admin`
- **Senha**: `admin123`

Após fazer login, você será redirecionado para: `http://localhost:3001/admin/`

---

## 📝 Funcionalidades da Área Admin

### 1️⃣ Fotos do Site
Altere as imagens principais que aparecem no site principal:

**Campos disponíveis:**
- **Imagem do Topo (Hero)** - Imagem grande que fica no topo do site
- **Imagem da Apresentação (Bio)** - Foto de perfil/apresentação
- **Texto de Fundo do Topo** - Texto grande que aparece atrás do conteúdo (ex: "ATOR • DANÇARINO • PERFORMER")

**Como usar:**
1. Clique em **"Fotos do Site"** no menu
2. Preencha os campos com:
   - **Caminho local**: `assets/images/hero/sua-foto.jpg`
   - **URL externa**: `https://link-da-imagem.jpg` (Drive, Imgur, etc)
3. Clique em **"💾 Salvar Fotos"**

**Resultado:** As imagens mudam automaticamente no site principal!

---

### 2️⃣ Vídeos
Gerencie todos os vídeos que aparecem no site:

**Campos disponíveis:**
- **Título** - Nome do vídeo (ex: "Vídeo Promocional")
- **Categoria/Tag** - Tipo de vídeo (ex: "PROMO / COMERCIAL")
- **Descrição** - Texto descritivo curto
- **Imagem/Thumbnail** - Imagem que aparece antes de clicar
- **Link do Vídeo** - URL do vídeo

**Como Adicionar um Novo Vídeo:**
1. Clique em **"Vídeos"** no menu
2. Clique em **"+ Novo Vídeo"**
3. Preencha os campos
4. Clique em **"Salvar Vídeo"**

**Como Editar um Vídeo Existente:**
1. Clique em **"Vídeos"** no menu
2. Encontre o vídeo que deseja editar
3. Clique em **"✏️ Editar"**
4. Modifique os campos
5. Clique em **"Salvar Vídeo"**

**Como Deletar um Vídeo:**
1. Clique em **"Vídeos"** no menu
2. Encontre o vídeo
3. Clique em **"🗑️ Deletar"**
4. Confirme a exclusão

**Resultado:** Os vídeos mudam automaticamente no site principal!

---

## 🎬 Formatos de Vídeos Suportados

### YouTube
**Link:** `https://www.youtube.com/embed/ID_DO_VIDEO`

Exemplo:
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

### Google Drive
**Link:** `https://drive.google.com/file/d/ID_DO_ARQUIVO/preview`

Exemplo:
```
https://drive.google.com/file/d/1E4p-123ABC456def/preview
```

### Vimeo
**Link:** `https://vimeo.com/ID_DO_VIDEO`

Exemplo:
```
https://vimeo.com/123456789
```

---

## 🖼️ Formatos de Imagens Suportados

### Caminhos Locais (Pastas do Projeto)
```
assets/images/hero/minha-foto.jpg
assets/images/about/perfil.png
assets/images/videos/thumbnail.jpg
```

### URLs Externas
```
https://drive.google.com/uc?id=SEU_ID&export=view
https://imgur.com/abc123.jpg
https://example.com/imagem.png
```

---

## 🔒 Segurança

### Mudança de Senha
Para mudar a senha padrão, edite o arquivo `server.js`:

1. Abra `server.js`
2. Procure por:
```javascript
const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin123';
```
3. Altere os valores:
```javascript
const ADMIN_LOGIN = 'seu-usuario';
const ADMIN_PASSWORD = 'sua-senha-nova';
```
4. Reinicie o servidor

### Dicas de Segurança
- ✅ Use uma senha forte (letras, números, caracteres especiais)
- ✅ Não compartilhe suas credenciais
- ✅ Clique em **"Sair"** quando terminar

---

## 🌐 Como Vídeos e Fotos Atualizam no Site

### Fluxo de Sincronização

```
Você edita no Admin
    ↓
Clica "Salvar"
    ↓
Servidor salva as mudanças
    ↓
Site recarrega os dados
    ↓
Visitantes veem as mudanças ao acessar o site!
```

**Importante:**
- As mudanças são salvas automaticamente no servidor
- Visitantes precisam recarregar a página para ver as mudanças
- Não há atraso - é sincronização em tempo real!

---

## 🐛 Solução de Problemas

### "Erro ao conectar"
- Verifique se o servidor está rodando: `npm run dev`
- Verifique se você está na URL correta: `http://localhost:3001/admin/`

### "Usuário ou senha inválidos"
- Verifique maiúsculas/minúsculas
- Credencial padrão: `admin` / `admin123`

### Imagem não carrega
- Verifique se o caminho/URL está correto
- Use URLs públicas (Google Drive compartilhado, Imgur, etc)

### Vídeo não aparece
- Verifique o link do vídeo (é um link de embed?)
- Para YouTube, use: `https://www.youtube.com/embed/ID`
- Para Google Drive, use: `https://drive.google.com/file/d/ID/preview`

---

## 📱 Visualizar Mudanças

### No Seu Computador
1. Abra: `http://localhost:5173` (site principal)
2. Faça as mudanças no admin
3. Recarregue a página do site (F5)
4. Veja as mudanças!

### Para Visitantes
- Qualquer pessoa que acessa seu site verá as mudanças
- Não precisa de login para ver os vídeos e fotos

---

## 📞 Suporte

Se tiver dúvidas ou problemas, verifique:
- Se o servidor está rodando (`npm run dev`)
- As credenciais de login (padrão: admin / admin123)
- A conexão com a internet (para URLs externas)

---

**Última atualização:** 2024
**Versão do Admin:** 2.0 (com autenticação e interface renovada)
