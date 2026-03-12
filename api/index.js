require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Detectar ambiente
const isDevelopment = process.env.NODE_ENV !== 'production';

// Caminho para content.json
// Em desenvolvimento: usar arquivo no public/
// Em produção Vercel: usar /tmp (que funciona durante requisição)
let CONTENT_PATH;
if (isDevelopment) {
    CONTENT_PATH = path.join(process.cwd(), 'public', 'content.json');
} else {
    CONTENT_PATH = '/tmp/content.json';
}

console.log('✅ API iniciada - Admin sem autenticação (público)');
console.log('🌍 Ambiente:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO (VERCEL)');
console.log('📂 process.cwd():', process.cwd());
console.log('📁 CONTENT_PATH:', CONTENT_PATH);

// Verificar se arquivo existe
if (fs.existsSync(CONTENT_PATH)) {
    console.log('✅ Arquivo content.json encontrado');
} else {
    console.warn('⚠️ Arquivo content.json NÃO encontrado, criando arquivo padrão...');

    // Tentar copiar do public/
    const sourceFile = path.join(process.cwd(), 'public', 'content.json');
    if (fs.existsSync(sourceFile)) {
        try {
            const data = fs.readFileSync(sourceFile, 'utf8');
            fs.writeFileSync(CONTENT_PATH, data, 'utf8');
            console.log('✅ Arquivo copiado com sucesso');
        } catch (err) {
            console.error('❌ Erro ao copiar arquivo:', err.message);
        }
    }
}

// =====================================================
// TOKEN REMOVIDO - Admin agora é público
// =====================================================

// =====================================================
// CONFIGURAÇÃO DE CORS CORRETA
// =====================================================
// Detectar ambiente
const isDevelopment = process.env.NODE_ENV !== 'production';

// Definir origens permitidas
const allowedOrigins = isDevelopment
  ? ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173']
  : ['https://portifoliogmatos.vercel.app']; // Produção no Vercel

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requisições sem origin (como mobile apps ou curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '50mb' }));

// Middleware de autenticação removido - admin agora é público

// Login/Logout/Auth removidos - Admin é público

// Get current content (PÚBLICO - para que o site principal possa carregar)
app.get('/api/content', (req, res) => {
    console.log('📖 GET /api/content - lendo de:', CONTENT_PATH);
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Erro ao ler:', err.message);
            return res.status(500).send('Error reading data');
        }
        console.log('✅ Conteúdo lido com sucesso');
        res.json(JSON.parse(data));
    });
});

// Update content (PUBLIC - admin é acessível diretamente)
app.post('/api/content', (req, res) => {
    const newContent = req.body;
    console.log('💾 Tentando salvar em:', CONTENT_PATH);
    fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('❌ Erro ao salvar:', err.message);
            console.error('   Código:', err.code);
            console.error('   Path:', CONTENT_PATH);
            return res.status(500).json({ error: 'Error saving data', details: err.message });
        }
        console.log('✅ Arquivo salvo com sucesso');
        res.json({ success: true, message: 'Content updated successfully' });
    });
});

module.exports = app;
