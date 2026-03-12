document.addEventListener('DOMContentLoaded', () => {
    // Usar configuração centralizada
    const API_URL = window.APP_CONFIG.API_CONTENT;

    let siteContent = {};

    // ======== NOTA: Autenticação removida - Admin acessível diretamente ========

    // ======== LOGOUT (Desativado - sem autenticação) ========
    // Logout removido pois admin é agora acessível diretamente

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
            console.log('📂 loadContent() iniciado');
            console.log('API_URL:', API_URL);

            const resp = await fetch(API_URL);
            console.log('📡 Resposta do servidor:', resp.status);

            if (resp.ok) {
                siteContent = await resp.json();
                console.log('✅ Conteúdo carregado da API');
                // Salvar no localStorage como backup
                localStorage.setItem('siteContent', JSON.stringify(siteContent));
            } else {
                throw new Error(`API retornou ${resp.status}`);
            }

            // Garantir que a estrutura existe
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
            console.warn('⚠️ Erro ao carregar da API:', err.message);

            // Tentar carregar do localStorage como backup
            const backup = localStorage.getItem('siteContent');
            if (backup) {
                console.log('📦 Carregando dados do localStorage (backup)');
                siteContent = JSON.parse(backup);
                populateForms();
                renderVideos();
                alert('⚠️ Usando dados em cache (offline mode)');
            } else {
                console.error('❌ Erro ao carregar dados');
                // Criar estrutura padrão
                siteContent = {
                    hero: { image: '', bgText: 'GUSTAVO MATOS' },
                    presentation: { image: '', bio1: '', bio2: '', cards: [] },
                    videos: []
                };
                localStorage.setItem('siteContent', JSON.stringify(siteContent));
                populateForms();
                renderVideos();
                alert('Usando estrutura padrão. Os dados serão salvos localmente.');
            }
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
            console.log('💾 Salvando fotos...');
            console.log('Dados a salvar:', siteContent);

            // Salvar no localStorage primeiro (sempre funciona)
            localStorage.setItem('siteContent', JSON.stringify(siteContent));
            console.log('✅ Dados salvos no localStorage');

            // Tentar salvar na API (em background)
            try {
                const resp = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(siteContent)
                });
                if (resp.ok) {
                    console.log('✅ Dados também salvos na API');
                    alert('✓ Fotos salvas com sucesso!');
                } else {
                    console.warn('⚠️ API falhou, mas dados estão salvos localmente');
                    alert('✓ Fotos salvas localmente (API indisponível)');
                }
            } catch (apiErr) {
                console.warn('⚠️ Erro na API, mas dados estão salvos localmente:', apiErr);
                alert('✓ Fotos salvas localmente (usando cache)');
            }
        } catch (err) {
            alert('✗ Erro ao salvar fotos');
            console.error('❌ Erro:', err);
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
            const deletedVideo = siteContent.videos[index];
            console.log('🗑️ Deletando vídeo:', deletedVideo.title);
            siteContent.videos.splice(index, 1);
            try {
                console.log('💾 Salvando após deletar...');

                // Salvar no localStorage primeiro (sempre funciona)
                localStorage.setItem('siteContent', JSON.stringify(siteContent));
                console.log('✅ Dados salvos no localStorage');

                // Tentar salvar na API (em background)
                try {
                    const resp = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(siteContent)
                    });

                    if (resp.ok) {
                        console.log('✅ Dados também salvos na API');
                        renderVideos();
                        alert('✓ Vídeo deletado com sucesso!');
                    } else {
                        console.warn('⚠️ API falhou, mas dados estão salvos localmente');
                        renderVideos();
                        alert('✓ Vídeo deletado localmente (API indisponível)');
                    }
                } catch (apiErr) {
                    console.warn('⚠️ Erro na API, mas dados estão salvos localmente:', apiErr);
                    renderVideos();
                    alert('✓ Vídeo deletado localmente (usando cache)');
                }
            } catch (err) {
                alert('✗ Erro ao deletar vídeo');
                console.error('❌ Erro:', err);
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
            console.log('💾 Salvando vídeo...');
            console.log('Vídeos a salvar:', siteContent.videos);

            // Salvar no localStorage primeiro (sempre funciona)
            localStorage.setItem('siteContent', JSON.stringify(siteContent));
            console.log('✅ Dados salvos no localStorage');

            // Tentar salvar na API (em background)
            try {
                const resp = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(siteContent)
                });

                if (resp.ok) {
                    console.log('✅ Dados também salvos na API');
                    modal.style.display = 'none';
                    renderVideos();
                    alert('✓ Vídeo salvo com sucesso!');
                } else {
                    console.warn('⚠️ API falhou, mas dados estão salvos localmente');
                    modal.style.display = 'none';
                    renderVideos();
                    alert('✓ Vídeo salvo localmente (API indisponível)');
                }
            } catch (apiErr) {
                console.warn('⚠️ Erro na API, mas dados estão salvos localmente:', apiErr);
                modal.style.display = 'none';
                renderVideos();
                alert('✓ Vídeo salvo localmente (usando cache)');
            }
        } catch (err) {
            alert('✗ Erro ao salvar vídeo');
            console.error('❌ Erro:', err);
        }
    });

    // ======== GALERIA DE FOTOS DO ARTISTA ========
    function loadPhotosGallery() {
        console.log('🖼️ loadPhotosGallery() iniciado');
        const gallery = document.getElementById('photos-gallery');
        console.log('📸 Gallery element encontrado:', gallery ? 'SIM' : 'NÃO');

        // Adicionar listeners aos radio buttons
        const radioButtons = document.querySelectorAll('input[name="photo-target"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const target = radio.value;
                const fieldLabel = target === 'bio' ? 'Imagem da Apresentação (Bio)' : 'Imagem do Topo (Hero)';
                console.log('🎯 Campo alvo mudado para:', fieldLabel);
            });
        });

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

        let photoCount = 0;
        fotos.forEach((foto) => {
            const img = document.createElement('img');
            // Usar caminho absoluto para funcionar em Vercel
            const caminho = `/assets/images/fotos-artista/${foto}`;
            img.src = caminho;
            img.alt = foto;
            img.style.cursor = 'pointer';
            photoCount++;

            console.log(`  ${photoCount}. Carregando: ${foto}`);

            img.addEventListener('click', (event) => {
                console.log('🖼️ Foto clicada:', foto);

                // Verificar qual campo foi selecionado (Hero ou Bio)
                const selectedTarget = document.querySelector('input[name="photo-target"]:checked');
                const target = selectedTarget ? selectedTarget.value : 'hero';
                console.log('🎯 Alvo selecionado:', target);

                // Remover seleção anterior
                const allPhotos = document.querySelectorAll('#photos-gallery img');
                allPhotos.forEach(i => i.classList.remove('selected'));

                // Adicionar seleção
                img.classList.add('selected');
                console.log('✨ Foto marcada como selecionada');

                // Preencher o input correto baseado na seleção
                const inputId = target === 'bio' ? 'bio-img-path' : 'hero-img-path';
                const inputField = document.getElementById(inputId);
                console.log('📝 Preenchendo campo:', inputId);
                console.log('📝 Caminho:', caminho);

                if (inputField) {
                    inputField.value = caminho;
                    console.log('✅ Campo preenchido com sucesso');

                    // Mostrar feedback visual
                    const fieldLabel = target === 'bio' ? 'Imagem da Apresentação (Bio)' : 'Imagem do Topo (Hero)';
                    alert(`✅ ${fieldLabel} atualizado com: ${foto}`);
                } else {
                    console.error('❌ Campo não encontrado:', inputId);
                }
            });

            gallery.appendChild(img);
        });
        console.log(`✅ Galeria carregada com ${photoCount} fotos`);
    }

    // ======== INICIALIZAR ========
    // (auth-check.js já verificou autenticação antes deste script carregar)
    console.log('🎉 Script.js inicializado');
    console.log('✅ Token disponível:', window.AUTH_TOKEN ? `Sim (${window.AUTH_TOKEN.substring(0, 20)}...)` : 'Em localStorage');
    loadPhotosGallery();
    loadContent();
});
