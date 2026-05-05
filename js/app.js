// IEEExGOV.in — Main App Initialization
import { initI18n, setLang, getLang, t } from './i18n.js';
import { renderSchemes, searchSchemes } from './schemes.js';
import { initFilters, filterByCategory } from './filters.js';
import { initChatbot } from './chatbot.js';
import { initVoice } from './voice.js';
import { schemes } from './data/schemes-data.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  renderSchemes(schemes);
  initFilters();
  initChatbot();
  initVoice();
  initNavbar();
  initSearch();
  initFAQ();
  initCategoryPills();
  initScrollAnimations();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  menuBtn?.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuBtn?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  // Language toggle
  document.getElementById('lang-en')?.addEventListener('click', () => {
    setLang('en');
    document.getElementById('lang-en').classList.add('active');
    document.getElementById('lang-hi').classList.remove('active');
    renderSchemes(schemes);
  });
  document.getElementById('lang-hi')?.addEventListener('click', () => {
    setLang('hi');
    document.getElementById('lang-hi').classList.add('active');
    document.getElementById('lang-en').classList.remove('active');
    renderSchemes(schemes);
  });
}

function initSearch() {
  const searchInput = document.getElementById('hero-search-input');
  const searchBtn = document.getElementById('hero-search-btn');

  const doSearch = () => {
    const query = searchInput?.value || '';
    const results = searchSchemes(query);
    renderSchemes(results);
    if (query) document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  searchInput?.addEventListener('input', doSearch);
  searchBtn?.addEventListener('click', doSearch);
  searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

function initCategoryPills() {
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      if (cat) filterByCategory(cat);
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(el => observer.observe(el));
}
