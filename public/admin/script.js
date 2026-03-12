document.addEventListener('DOMContentLoaded', () => {
    // Usar configuração centralizada
    const API_URL = window.APP_CONFIG.API_CONTENT;
    const AUTH_URL = window.APP_CONFIG.API_AUTH_STATUS;
    const LOGOUT_URL = window.APP_CONFIG.API_LOGOUT;
    const LOGIN_PAGE = window.APP_CONFIG.LOGIN_PAGE;

    let siteContent = {};

    // ======== VERIFICAR AUTENTICAÇÃO ========
    function checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            // Sem token, não autenticado
            window.location.href = LOGIN_PAGE;
        }
    }

    // ======== GET TOKEN DO LOCALSTORAGE ========
    function getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }

    // ======== LOGOUT ========
    document.getElementById('logout-btn').addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja sair?')) {
            // Remover token do localStorage
            localStorage.removeItem('auth_token');
            window.location.href = LOGIN_PAGE;
        }
    });

    // ======== NAVEGAÇÃO ENTRE ABAS ========
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section-card');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Atualizar aba ativa
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');

            // Mostrar/esconder seções
            sections.forEach(s => s.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // ======== CARREGAR CONTEÚDO ========
    async function loadContent() {
        try {
            const resp = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            if (!resp.ok) throw new Error('Erro ao carregar conteúdo');
            siteContent = await resp.json();

            // Garantir que a estrutura existe (inicializar se vazio)
            if (!siteContent.hero) {
                siteContent.hero = { image: '', bgText: 'GUSTAVO MATOS GUSTAVO MATOS GUSTAVO MATOS' };
            }
            if (!siteContent.presentation) {
                siteContent.presentation = { image: '', bio1: '', bio2: '', cards: [] };
            }
            if (!siteContent.videos || !Array.isArray(siteContent.videos)) {
                siteContent.videos = [];
            }

            populateForms();
            renderVideos();
        } catch (err) {
            console.error('Error loading content:', err);
            alert('Erro ao carregar dados. Verifique se está autenticado.');
        }
    }

    function populateForms() {
        document.getElementById('hero-img-path').value = siteContent.hero?.image || '';
        document.getElementById('bio-img-path').value = siteContent.presentation?.image || '';
        document.getElementById('hero-bg-text').value = siteContent.hero?.bgText || '';
    }

    // ======== RENDERIZAR VÍDEOS EM GRID ========
    function renderVideos() {
        const grid = document.getElementById('videos-grid');
        grid.innerHTML = '';

        if (!siteContent.videos || siteContent.videos.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum vídeo adicionado ainda</p>';
            return;
        }

        siteContent.videos.forEach((video, index) => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-card-image">
                    <img src="${video.image}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
                </div>
                <div class="video-card-content">
                    <h3>${video.title}</h3>
                    <p class="video-tag">${video.tag}</p>
                    <p class="video-desc">${video.description}</p>
                </div>
                <div class="video-card-actions">
                    <button class="btn-icon" onclick="editVideo(${index})">✏️ Editar</button>
                    <button class="btn-icon btn-delete" onclick="deleteVideo(${index})">🗑️ Deletar</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ======== FUNÇÃO: Converter links do Google Drive ========
    const convertGoogleDriveLink = (url) => {
      if (!url || !url.includes('drive.google.com')) return url;

      // Extrair FILE_ID do link do Google Drive
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        // Retornar no formato que funciona para imagens
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      return url;
    };

    // ======== SALVAR FOTOS ========
    document.getElementById('images-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Converter links do Google Drive automaticamente
        siteContent.hero.image = convertGoogleDriveLink(document.getElementById('hero-img-path').value);
        siteContent.presentation.image = convertGoogleDriveLink(document.getElementById('bio-img-path').value);
        siteContent.hero.bgText = document.getElementById('hero-bg-text').value;

        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(siteContent)
            });
            if (resp.ok) {
                alert('✓ Fotos salvas com sucesso!');
            }
        } catch (err) {
            alert('✗ Erro ao salvar fotos');
            console.error(err);
        }
    });

    // ======== MODAL DE VÍDEOS ========
    const modal = document.getElementById('video-modal');
    const videoForm = document.getElementById('video-form');

    window.editVideo = (index) => {
        const v = siteContent.videos[index];
        document.getElementById('modal-title').innerText = 'Editar Vídeo';
        document.getElementById('v-index').value = index;
        document.getElementById('v-title').value = v.title;
        document.getElementById('v-tag').value = v.tag;
        document.getElementById('v-desc').value = v.description;
        document.getElementById('v-thumb').value = v.image;
        document.getElementById('v-link').value = v.link || '';
        modal.style.display = 'flex';
    };

    window.deleteVideo = async (index) => {
        if (confirm('Tem certeza que deseja deletar este vídeo?')) {
            siteContent.videos.splice(index, 1);
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`
                    },
                    body: JSON.stringify(siteContent)
                });
                renderVideos();
                alert('✓ Vídeo deletado com sucesso!');
            } catch (err) {
                alert('✗ Erro ao deletar vídeo');
                console.error(err);
            }
        }
    };

    document.getElementById('add-video-btn').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = 'Novo Vídeo';
        videoForm.reset();
        document.getElementById('v-index').value = '';
        modal.style.display = 'flex';
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('cancel-modal-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = document.getElementById('v-index').value;
        let thumbUrl = document.getElementById('v-thumb').value;
        let videoLink = document.getElementById('v-link').value;

        // Converter links do Google Drive automaticamente
        thumbUrl = convertGoogleDriveLink(thumbUrl);
        if (videoLink.includes('drive.google.com')) {
          const fileIdMatch = videoLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (fileIdMatch) {
            videoLink = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
          }
        }

        const videoData = {
            id: index !== '' ? siteContent.videos[index].id : Date.now().toString(),
            title: document.getElementById('v-title').value,
            tag: document.getElementById('v-tag').value,
            description: document.getElementById('v-desc').value,
            image: thumbUrl,
            link: videoLink
        };

        if (index !== '') {
            siteContent.videos[index] = videoData;
        } else {
            siteContent.videos.push(videoData);
        }

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(siteContent)
            });
            modal.style.display = 'none';
            renderVideos();
            alert('✓ Vídeo salvo com sucesso!');
        } catch (err) {
            alert('✗ Erro ao salvar vídeo');
            console.error(err);
        }
    });

    // ======== GALERIA DE FOTOS DO ARTISTA ========
    function loadPhotosGallery() {
        const gallery = document.getElementById('photos-gallery');
        const fotos = [
            'IMG_9621.JPG.jpeg',
            'IMG_9622.JPG.jpeg',
            'IMG_9623.JPG.jpeg',
            'IMG_9624.JPG.jpeg',
            'IMG_9625.JPG.jpeg',
            'IMG_9626.JPG.jpeg',
            'IMG_9627.JPG.jpeg',
            'IMG_9628.JPG.jpeg',
            'IMG_9629.JPG.jpeg',
            'IMG_9630.JPG.jpeg',
            'IMG_9631.JPG.jpeg',
            'IMG_9632.JPG.jpeg',
            'IMG_9633.JPG.jpeg',
            'IMG_9634.JPG.jpeg',
            'IMG_9635.JPG.jpeg',
            'IMG_9636.JPG.jpeg',
            'IMG_9637.JPG.jpeg',
            'IMG_9638.JPG.jpeg',
            'IMG_9639.JPG.jpeg'
        ];

        fotos.forEach((foto) => {
            const img = document.createElement('img');
            const caminho = `assets/images/fotos-artista/${foto}`;
            img.src = caminho;
            img.alt = foto;
            img.style.cursor = 'pointer';

            img.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('#photos-gallery img').forEach(i => i.classList.remove('selected'));
                // Adicionar seleção
                img.classList.add('selected');
                // Preencher o input
                document.getElementById('hero-img-path').value = caminho;
            });

            gallery.appendChild(img);
        });
    }

    // ======== INICIALIZAR ========
    loadPhotosGallery();
    checkAuth();
    loadContent();
});
