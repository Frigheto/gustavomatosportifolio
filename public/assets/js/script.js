document.addEventListener('DOMContentLoaded', () => {
  // ============ NAVBAR SCROLL EFFECT ============
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ============ REVEAL ANIMATIONS ============
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============ PARALLAX BACKGROUND TEXT ============
  const bgText = document.querySelector('.hero-bg-text');
  window.addEventListener('scroll', () => {
    const depth = 0.5;
    const scrollPos = window.pageYOffset;
    if (bgText) {
      bgText.style.transform = `translateX(${100 - (scrollPos * depth)}px)`;
    }
  });

  // ============ DYNAMIC CONTENT LOADING ============
  // Usar configuração centralizada
  const API_URL = window.APP_CONFIG.API_CONTENT;

  async function loadDynamicContent() {
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();

      // Update Hero image
      const heroImg = document.getElementById('hero-main-img');
      if (data.hero?.image && heroImg) heroImg.src = data.hero.image;
      if (data.hero?.bgText && bgText) bgText.innerText = data.hero.bgText;

      // Update Bio
      const bioSection = document.getElementById('apresentacao');
      const bioImg = bioSection.querySelector('.presentation-image img');
      if (data.presentation?.image && bioImg) bioImg.src = data.presentation.image;

      // Update Contact background
      const contactSection = document.getElementById('contato');
      if (data.contact?.image && contactSection) {
        contactSection.style.backgroundImage = `url('${data.contact.image}')`;
      }

      // Update Videos
      let videoGrid = document.querySelector('#videos .video-grid');
      if (videoGrid && data.videos) {
        videoGrid.innerHTML = '';
        data.videos.forEach(v => {
          const article = document.createElement('article');
          article.className = 'video-card';
          article.innerHTML = `
            <div class="video-thumbnail">
              <img src="${v.image}" alt="${v.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
              <div class="play-icon"></div>
            </div>
            <div class="video-content">
              <span class="video-tag">${v.tag}</span>
              <h3>${v.title}</h3>
              <p>${v.description}</p>
            </div>
          `;

          if (v.link && v.link !== '#') {
            article.style.cursor = 'pointer';
            article.addEventListener('click', () => {
              openVideoModal(v);
            });
          }

          videoGrid.appendChild(article);
        });
      }

    } catch (err) {
      console.error('Error loading dynamic content:', err);
    }
  }

  // ============ VIDEO MODAL FUNCTIONALITY ============
  const videoModal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('video-player');
  const videoModalClose = document.querySelector('.video-modal-close');
  const videoModalOverlay = document.querySelector('.video-modal-overlay');

  window.openVideoModal = (videoData) => {
    const { title, description, link } = videoData;

    // Atualizar informações
    document.getElementById('video-modal-title').textContent = title;
    document.getElementById('video-modal-description').textContent = description;

    // Converter link para embed URL
    let embedUrl = '';

    if (link.includes('drive.google.com')) {
      // Google Drive: extrair FILE_ID e criar embed URL
      const fileIdMatch = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }
    } else if (link.includes('youtube.com') || link.includes('youtu.be')) {
      // YouTube: extrair VIDEO_ID e criar embed URL
      let videoId = '';
      if (link.includes('youtube.com/embed/')) {
        videoId = link.split('youtube.com/embed/')[1].split('?')[0];
      } else if (link.includes('youtube.com/watch?v=')) {
        videoId = link.split('v=')[1].split('&')[0];
      } else if (link.includes('youtu.be/')) {
        videoId = link.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (link.includes('vimeo.com')) {
      // Vimeo: extrair VIDEO_ID e criar embed URL
      const vimeoMatch = link.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Definir src do iframe
    if (embedUrl) {
      videoPlayer.src = embedUrl;
      videoModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } else {
      alert('Formato de vídeo não suportado');
    }
  };

  // Fechar modal
  const closeModal = () => {
    videoModal.style.display = 'none';
    videoPlayer.src = '';
    document.body.style.overflow = 'auto';
  };

  videoModalClose.addEventListener('click', closeModal);
  videoModalOverlay.addEventListener('click', closeModal);

  // Fechar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.style.display === 'flex') {
      closeModal();
    }
  });

  loadDynamicContent();

  // ============ NAV ACTIVE LINK TRACKING ============
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });
});
