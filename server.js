require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;
const CONTENT_PATH = path.join(__dirname, 'assets/data/content.json');

// Credenciais de admin (carregadas do .env)
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'gustavo matos';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gustavomatos2026';

// =====================================================
// CONFIGURAÇÃO DE CORS CORRETA (com Credentials)
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
    credentials: true, // Permitir cookies/sessão
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use(session({
    secret: process.env.SESSION_SECRET || 'seu-segredo-super-secreto-aqui-2024-fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware de autenticação
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
};

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true, message: 'Login realizado!' });
    } else {
        res.status(401).json({ success: false, error: 'Usuário ou senha inválidos' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout realizado!' });
});

// Verificar autenticação
app.get('/api/auth-status', (req, res) => {
    res.json({ authenticated: req.session.authenticated || false });
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
        res.send('Content updated successfully');
    });
});

app.listen(PORT, () => {
    console.log(`✅ CMS API Server running on http://localhost:${PORT}`);
    console.log(`📝 Admin Panel: http://localhost:${PORT}/admin/`);
    console.log(`🔐 Credentials loaded from environment variables`);
    console.log(`⚠️  Never share your .env file or credentials`);
});
