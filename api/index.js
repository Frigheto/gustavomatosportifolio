require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
// Caminho para content.json
// Em produção Vercel: /var/task/public/content.json
// Em desenvolvimento: ../assets/data/content.json
const CONTENT_PATH = path.join(process.cwd(), 'public', 'content.json');

console.log('✅ API iniciada - Admin sem autenticação (público)');

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
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        res.json(JSON.parse(data));
    });
});

// Update content (PUBLIC - admin é acessível diretamente)
app.post('/api/content', (req, res) => {
    const newContent = req.body;
    fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).send('Error saving data');
        res.json({ success: true, message: 'Content updated successfully' });
    });
});

module.exports = app;
