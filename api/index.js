require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Redis } = require('@upstash/redis');

const app = express();

// Detectar ambiente
const isDevelopment = process.env.NODE_ENV !== 'production';

// Inicializar Redis
let redis = null;
try {
    // Vercel auto-injeta as variávies quando conectamos a integração do Upstash
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
        });
    } else {
        console.warn('⚠️ AVISO: Variáveis do Vercel KV (Upstash) não encontradas!');
    }
} catch (e) {
    console.error("Erro ao inicializar Redis:", e);
}

// Caminho de Fallback para desenvolvimento local
const LOCAL_CONTENT_PATH = path.join(process.cwd(), 'public', 'content.json');

console.log('✅ API iniciada - Admin sem autenticação (público)');
console.log('🌍 Ambiente:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO (VERCEL)');
console.log('🛢️  Redis (Upstash) conectado:', !!redis);


// =====================================================
// CONFIGURAÇÃO DE CORS
// =====================================================
const allowedOrigins = isDevelopment
    ? ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173']
    : ['https://portifoliogmatos.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
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


// Função auxiliar para inicializar do disco para o Redis caso o Redis esteja vazio na primeira vez
async function initRedisIfNeeded() {
    if (!redis) return;
    try {
        const existingContent = await redis.get('site_content');
        if (!existingContent && fs.existsSync(LOCAL_CONTENT_PATH)) {
            console.log('📥 Inicializando Redis com o conteúdo local default...');
            const defaultData = fs.readFileSync(LOCAL_CONTENT_PATH, 'utf8');
            await redis.set('site_content', JSON.parse(defaultData));
            console.log('✅ Redis inicializado com sucesso.');
        }
    } catch (e) {
        console.error("Falha ao checar/inicializar Redis:", e);
    }
}
initRedisIfNeeded();


// Get current content
app.get('/api/content', async (req, res) => {
    try {
        if (redis) {
            console.log('📖 GET /api/content - lendo do REDIS (Upstash)');
            const data = await redis.get('site_content');
            if (data) {
                return res.json(typeof data === 'string' ? JSON.parse(data) : data);
            }
        }
        
        // Fallback para arquivo local (se não tiver redis)
        console.log('📖 GET /api/content - lendo do ARQUIVO LOCAL fallback');
        fs.readFile(LOCAL_CONTENT_PATH, 'utf8', (err, data) => {
            if (err) {
                console.error('❌ Erro ao ler local fallback:', err.message);
                return res.status(500).send('Error reading data');
            }
            res.json(JSON.parse(data));
        });
    } catch (e) {
        console.error('❌ Erro no GET /api/content:', e);
        res.status(500).json({ error: 'Server error', details: e.message });
    }
});

// Update content
app.post('/api/content', async (req, res) => {
    const newContent = req.body;
    
    try {
        let savedToRedis = false;
        
        // Salvar no Redis se estiver em Produção/Conectado
        if (redis) {
            console.log('💾 Tentando salvar no REDIS (Upstash)...');
            await redis.set('site_content', newContent);
            savedToRedis = true;
            console.log('✅ Salvo no Redis com sucesso!');
        }

        // Se local/desenvolvimento, salvar também no disco
        if (isDevelopment || !redis) {
            console.log('💾 Tentando salvar no DISCO (Fallback / Local)...');
            fs.writeFile(LOCAL_CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('❌ Erro ao salvar log local:', err);
                } else {
                    console.log('✅ Salvo localmente.');
                }
            });
        }
        
        res.json({ success: true, message: 'Content updated successfully', savedToRedis });
    } catch (e) {
        console.error('❌ Erro no POST /api/content:', e);
        res.status(500).json({ error: 'Error saving data', details: e.message });
    }
});

// List images (PÚBLICO)
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images', 'fotos-artista');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error('❌ Erro ao ler diretório de imagens:', err.message);
            return res.status(500).json({ error: 'Error reading images' });
        }
        const images = files.filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));
        res.json(images);
    });
});

module.exports = app;
