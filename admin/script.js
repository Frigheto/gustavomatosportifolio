// ======== MODAL DE FOTOS (GLOBAL SCOPE) ========
let currentPhotoTarget = '';

function openPhotoModal(target) {
    const photoModal = document.getElementById('photo-modal');
    const modalTargetLabel = document.getElementById('modal-target-label');

    currentPhotoTarget = target;

    let labelText = 'Imagem';
    if (target === 'hero') labelText = 'Imagem do Topo (Hero)';
    else if (target === 'bio') labelText = 'Imagem da Apresentação (Bio)';
    else if (target === 'contact') labelText = 'Foto do Rodapé (Contato)';
    else if (target === 'video-thumb') labelText = 'Thumbnail do Vídeo';

    modalTargetLabel.innerText = labelText;
    photoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    const photoModal = document.getElementById('photo-modal');
    photoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ======== INICIALIZAR EVENTOS DO MODAL ========
function setupModalEvents() {
    const photoModal = document.getElementById('photo-modal');
    if (!photoModal) return;

    // Fechar modal ao clicar fora do conteúdo
    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) closePhotoModal();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Definir funções no window para acesso via HTML onclick
    window.openPhotoModal = openPhotoModal;
    window.closePhotoModal = closePhotoModal;
    setupModalEvents();

    // Usar configuração centralizada
    const API_URL = window.APP_CONFIG.API_CONTENT;
    const AUTH_URL = window.APP_CONFIG.API_AUTH_STATUS;
    const LOGOUT_URL = window.APP_CONFIG.API_LOGOUT;
    const LOGIN_PAGE = window.APP_CONFIG.LOGIN_PAGE;
    const API_IMAGES = window.APP_CONFIG.API_LIST_IMAGES;

    let siteContent = {};

    // ======== VERIFICAR AUTENTICAÇÃO ========
    async function checkAuth() {
        // Autenticação desativada
        // O painel agora é público, usando rotas públicas
        return true;
    }

    // ======== LOGOUT ========
    document.getElementById('logout-btn').addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                await fetch(LOGOUT_URL, {
                    method: 'POST',
                    credentials: 'include'
                });
                window.location.href = LOGIN_PAGE;
            } catch (err) {
                console.error('Logout error:', err);
                window.location.href = LOGIN_PAGE;
            }
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
                credentials: 'include'
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
            if (!siteContent.contact) {
                siteContent.contact = { image: '' };
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
        document.getElementById('contact-img-path').value = siteContent.contact?.image || '';
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
                    <img src="${video.image}" alt="${video.title}" onerror="this.style.background='#333';this.style.minHeight='120px';this.removeAttribute('src')">
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

    // ======== FUNÇÃO: Toast Notification ========
    function showToast(message, isError = false) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;

        const icon = isError ? '❌' : '✅';
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;

        container.appendChild(toast);

        // Trigger reflow for animation
        void toast.offsetWidth;
        toast.classList.add('show');

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for transition
        }, 3000);
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

        // Salvar apenas os caminhos locais já selecionados
        siteContent.hero.image = document.getElementById('hero-img-path').value;
        siteContent.presentation.image = document.getElementById('bio-img-path').value;
        siteContent.contact.image = document.getElementById('contact-img-path').value;
        siteContent.hero.bgText = document.getElementById('hero-bg-text').value;

        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(siteContent)
            });
            const result = await resp.json();
            if (resp.ok && result.success) {
                showToast('Fotos salvas com sucesso!');
            } else {
                showToast('Falha ao salvar: ' + (result.error || 'Erro desconhecido'), true);
                console.error('Erro ao salvar fotos:', result);
            }
        } catch (err) {
            showToast('Erro ao salvar fotos', true);
            console.error(err);
        }
    });

    // ======== MODAL DE VÍDEOS ========
    const videoModal = document.getElementById('video-modal');
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
        videoModal.style.display = 'flex';
    };

    window.deleteVideo = async (index) => {
        if (confirm('Tem certeza que deseja deletar este vídeo?')) {
            siteContent.videos.splice(index, 1);
            try {
                const resp = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(siteContent)
                });
                const result = await resp.json();
                if (resp.ok && result.success) {
                    renderVideos();
                    showToast('Vídeo deletado com sucesso!');
                } else {
                    showToast('Falha ao deletar: ' + (result.error || 'Erro desconhecido'), true);
                    console.error('Erro ao deletar vídeo:', result);
                }
            } catch (err) {
                showToast('Erro ao deletar vídeo', true);
                console.error(err);
            }
        }
    };

    document.getElementById('add-video-btn').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = 'Novo Vídeo';
        videoForm.reset();
        document.getElementById('v-index').value = '';
        videoModal.style.display = 'flex';
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        videoModal.style.display = 'none';
    });

    document.getElementById('cancel-modal-btn').addEventListener('click', () => {
        videoModal.style.display = 'none';
    });

    // Fechar modal ao clicar fora
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
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
            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(siteContent)
            });
            const result = await resp.json();
            if (resp.ok && result.success) {
                videoModal.style.display = 'none';
                renderVideos();
                showToast('Vídeo salvo com sucesso!');
            } else {
                showToast('Falha ao salvar: ' + (result.error || 'Erro desconhecido'), true);
                console.error('Erro ao salvar vídeo:', result);
            }
        } catch (err) {
            showToast('Erro ao salvar vídeo', true);
            console.error(err);
        }
    });

    // ======== GALERIA NO MODAL ========
    async function loadPhotosGallery() {
        const gallery = document.getElementById('photos-gallery');

        try {
            const resp = await fetch(API_IMAGES);
            const fotos = await resp.json();

            gallery.innerHTML = '';
            fotos.forEach((foto) => {
                const img = document.createElement('img');
                const caminho = `assets/images/fotos-artista/${foto}`;
                img.src = `../${caminho}`;
                img.alt = foto;
                img.loading = 'lazy';

                img.addEventListener('click', () => {
                    let targetInputId = 'hero-img-path'; // default
                    if (currentPhotoTarget === 'bio') targetInputId = 'bio-img-path';
                    else if (currentPhotoTarget === 'contact') targetInputId = 'contact-img-path';
                    else if (currentPhotoTarget === 'video-thumb') targetInputId = 'v-thumb';

                    document.getElementById(targetInputId).value = caminho;
                    closePhotoModal();
                });

                gallery.appendChild(img);
            });
        } catch (err) {
            console.error('Error loading gallery:', err);
            gallery.innerHTML = '<p style="color: #ff4444;">Erro ao carregar fotos.</p>';
        }
    }

    // ======== INICIALIZAR ========
    loadPhotosGallery();
    checkAuth();
    loadContent();
});
