/**
 * ==========================================================================
 * PORTFÓLIO PESSOAL — LUCAS CISTERNA
 * Script: Interações, Navegação, ScrollSpy, Validação e Acessibilidade
 * JavaScript Puro (Sem dependências externas)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressBar();
  initHeaderScroll();
  initMobileNav();
  initSmoothScroll();
  initScrollSpy();
  initScrollAnimations();
  initCopyEmail();
  initContactForm();
});

/**
 * 1. Indicador da barra de progresso da rolagem
 */
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/**
 * 2. Altera estilo do cabeçalho com base no scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 3. Controle do Menu Mobile (Acessibilidade & Toggle)
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !primaryNav) return;

  const toggleMenu = (forceClose) => {
    const isCurrentlyOpen = primaryNav.classList.contains('is-open');
    const nextState = forceClose ? false : !isCurrentlyOpen;

    toggleBtn.setAttribute('aria-expanded', String(nextState));
    primaryNav.classList.toggle('is-open', nextState);

    if (nextState) {
      toggleBtn.setAttribute('aria-label', 'Fechar menu de navegação');
    } else {
      toggleBtn.setAttribute('aria-label', 'Abrir menu de navegação');
    }
  };

  toggleBtn.addEventListener('click', () => toggleMenu());

  // Fecha menu ao clicar em qualquer link de navegação
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (primaryNav.classList.contains('is-open')) {
        toggleMenu(true);
      }
    });
  });

  // Fecha menu ao pressionar a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      toggleMenu(true);
      toggleBtn.focus();
    }
  });
}

/**
 * 4. Rolagem Suave com compensação de cabeçalho e animação no menu
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Feedback visual sutil de clique e animação curta no indicador verde-lima
        if (link.classList.contains('nav-link')) {
          link.classList.add('is-just-clicked');
          setTimeout(() => {
            link.classList.remove('is-just-clicked');
          }, 450);
        }

        const headerHeight = document.getElementById('site-header')?.offsetHeight || 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight + 5;

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });

        // Atualiza o foco acessível
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });
}

/**
 * 5. ScrollSpy — Atualiza visualmente o link ativo do menu ao rolar
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.primary-nav .nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/**
 * 6. Animações acionadas pelo scroll (Reveal on scroll com IntersectionObserver)
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  // Se o usuário preferir redução de movimento, ativa tudo diretamente
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealObserver.observe(el));
}

/**
 * 7. Copiar E-mail com Toast Notification
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('btn-copy-email');
  const emailElement = document.getElementById('email-address');

  if (!copyBtn || !emailElement) return;

  copyBtn.addEventListener('click', async () => {
    const email = emailElement.textContent.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback para ambientes restritos
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      showToast('E-mail copiado para a área de transferência!');
    } catch (err) {
      showToast('E-mail: ' + email);
    }
  });
}

/**
 * Exibe Toast notification temporário
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}

/**
 * 8. Validação e Feedback do Formulário de Contato
 * REGRA: Não simular envio falso sem backend. Informar a necessidade de conexão e fornecer alternativa mailto.
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorMessage = document.getElementById('error-message');
  const feedbackBox = document.getElementById('form-feedback');

  const validateField = (input, errorEl, validator, errorMsg) => {
    const isValid = validator(input.value.trim());
    if (!isValid) {
      input.classList.add('has-error');
      input.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorMsg;
      return false;
    } else {
      input.classList.remove('has-error');
      input.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  };

  const isNameValid = (val) => val.length >= 2;
  const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isMessageValid = (val) => val.length >= 10;

  // Validação em tempo real ao digitar
  nameInput?.addEventListener('input', () => {
    if (nameInput.classList.contains('has-error')) {
      validateField(nameInput, errorName, isNameValid, 'Por favor, informe seu nome completo (mínimo 2 letras).');
    }
  });

  emailInput?.addEventListener('input', () => {
    if (emailInput.classList.contains('has-error')) {
      validateField(emailInput, errorEmail, isEmailValid, 'Por favor, informe um endereço de e-mail válido.');
    }
  });

  messageInput?.addEventListener('input', () => {
    if (messageInput.classList.contains('has-error')) {
      validateField(messageInput, errorMessage, isMessageValid, 'A mensagem deve ter pelo menos 10 caracteres.');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const validName = validateField(nameInput, errorName, isNameValid, 'Por favor, informe seu nome completo (mínimo 2 letras).');
    const validEmail = validateField(emailInput, errorEmail, isEmailValid, 'Por favor, informe um endereço de e-mail válido.');
    const validMessage = validateField(messageInput, errorMessage, isMessageValid, 'A mensagem deve conter pelo menos 10 caracteres.');

    if (!validName || !validEmail || !validMessage) {
      if (feedbackBox) {
        feedbackBox.className = 'form-feedback-box';
        feedbackBox.innerHTML = '';
      }
      return;
    }

    const name = encodeURIComponent(nameInput.value.trim());
    const email = encodeURIComponent(emailInput.value.trim());
    const message = encodeURIComponent(messageInput.value.trim());
    const subject = encodeURIComponent(`Contato pelo Portfólio de: ${nameInput.value.trim()}`);
    const mailtoBody = encodeURIComponent(`Nome: ${nameInput.value.trim()}\nE-mail: ${emailInput.value.trim()}\n\nMensagem:\n${messageInput.value.trim()}`);
    const mailtoLink = `mailto:lucascist2009@gmail.com?subject=${subject}&body=${mailtoBody}`;

    // Apresenta feedback técnico e verdadeiro (sem simulação falsa de envio)
    feedbackBox.className = 'form-feedback-box is-info';
    feedbackBox.innerHTML = `
      <div class="feedback-title">
        <span>Dados validados com sucesso</span>
      </div>
      <p class="feedback-desc">
        Este formulário opera no modo estático e requer um serviço de mensageria (como Formspree ou backend próprio) para despacho direto na nuvem. Você pode enviar seus dados agora pelo seu aplicativo padrão de e-mail:
      </p>
      <a href="${mailtoLink}" class="btn-feedback-mailto">
        <span>Abrir no E-mail com estes dados</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </a>
    `;
  });
}
