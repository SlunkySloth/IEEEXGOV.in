// IEEExGOV.in — Ministry Page Script
import { schemes } from './data/schemes-data.js';
import { renderSchemes } from './schemes.js';
import { initI18n, setLang, getLang, t } from './i18n.js';
import { initChatbot } from './chatbot.js';
import { initVoice } from './voice.js';

let allSchemes = [];
let showingAll = false;

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initChatbot();
  initVoice();
  initNavbar();
  initFAQ();
  
  // Get ministry code from URL
  const path = window.location.pathname;
  const ministryCode = path.split('ministry-')[1]?.split('.')[0] || '';
  
  if (ministryCode) {
    loadMinistrySchemes(ministryCode);
  }
});

function loadMinistrySchemes(ministryCode) {
  // Handle different ministry code formats
  const codeMapping = {
    'dpiit': 'DPIIT',
    'moe': 'MoE',
    'molaboremployment': 'MoLaborEmployment',
    'msde': 'MSDE',
    'mof': 'MoF',
    'msme': 'MSME',
    'mohua': 'MoHUA',
    'niti': 'NITI Aayog',
    'mosje': 'MoSJE',
    'mod': 'MoD',
    'moafw': 'MoAFW',
    'mowcd': 'MoWCD'
  };
  
  const actualMinistryCode = codeMapping[ministryCode.toLowerCase()] || ministryCode.toUpperCase();
  allSchemes = schemes.filter(scheme => scheme.ministry === actualMinistryCode);
  const topSchemes = allSchemes.slice(0, 6);
  
  renderSchemes(topSchemes, 'ministry-schemes-grid');
  
  // Show View All button if there are more than 6 schemes
  if (allSchemes.length > 6) {
    document.getElementById('view-all-container').style.display = 'block';
  }
}

function showAllSchemes() {
  showingAll = true;
  renderSchemes(allSchemes, 'ministry-schemes-grid');
  document.getElementById('view-all-container').style.display = 'none';
}

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
  });
  document.getElementById('lang-hi')?.addEventListener('click', () => {
    setLang('hi');
    document.getElementById('lang-hi').classList.add('active');
    document.getElementById('lang-en').classList.remove('active');
  });
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

// Make showAllSchemes globally available
window.showAllSchemes = showAllSchemes;
