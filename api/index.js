require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
// Caminho para content.json
// Em produção Vercel: /var/task/public/content.json
// Em desenvolvimento: ../assets/data/content.json
const CONTENT_PATH = path.join(process.cwd(), 'public', 'content.json');

// Credenciais de admin (carregadas do .env ou variáveis de ambiente Vercel)
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'gustavo matos';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gustavomatos2026';
const TOKEN_SECRET = process.env.SESSION_SECRET || 'seu-segredo-super-secreto-aqui-2024-fallback';

console.log('✅ Admin credentials loaded:');
console.log('   Login:', ADMIN_LOGIN);
console.log('   Password:', ADMIN_PASSWORD ? '***' : 'NOT SET');

// =====================================================
// GERAÇÃO E VERIFICAÇÃO DE TOKEN (sem memory store)
// =====================================================
function generateToken(username) {
    const timestamp = Date.now();
    const data = `${username}:${timestamp}`;
    const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
    return Buffer.from(`${data}:${signature}`).toString('base64');
}

function verifyToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length !== 3) return null;

        const [username, timestamp, signature] = parts;
        const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${username}:${timestamp}`).digest('hex');

        if (signature !== expectedSignature) return null;

        // Verificar se token não expirou (24 horas)
        const age = Date.now() - parseInt(timestamp);
        if (age > 24 * 60 * 60 * 1000) return null;

        return { username, timestamp };
    } catch (e) {
        return null;
    }
}

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

// Middleware de autenticação (baseado em token, não em sessão)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const verified = verifyToken(token);
    if (verified) {
        req.user = verified;
        next();
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
};

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        const token = generateToken(ADMIN_LOGIN);
        res.json({ success: true, message: 'Login realizado!', token: token });
    } else {
        res.status(401).json({ success: false, error: 'Usuário ou senha inválidos' });
    }
});

// Logout (client-side remove o token, apenas retorna sucesso)
app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Logout realizado!' });
});

// Verificar autenticação
app.get('/api/auth-status', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const verified = verifyToken(token);
    res.json({ authenticated: !!verified });
});

// Get current content (PÚBLICO - para que o site principal possa carregar)
app.get('/api/content', (req, res) => {
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        res.json(JSON.parse(data));
    });
});

// Update content (PROTEGIDO - apenas admin pode editar)
app.post('/api/content', requireAuth, (req, res) => {
    const newContent = req.body;
    fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).send('Error saving data');
        res.json({ success: true, message: 'Content updated successfully' });
    });
});

module.exports = app;
