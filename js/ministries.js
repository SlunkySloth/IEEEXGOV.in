// IEEExGOV.in — Ministries Module
import { schemes, ministries } from './data/schemes-data.js';
import { renderSchemes } from './schemes.js';
import { getLang, t } from './i18n.js';

// Ministry icons mapping
const ministryIcons = {
  'DPIIT': '🏢',
  'MoE': '📚',
  'MoLaborEmployment': '💼',
  'MSDE': '🛠️',
  'MoHUA': '🏘️',
  'MoF': '💰',
  'MSME': '🏭',
  'NITI Aayog': '🎯',
  'MoSJE': '🤝',
  'MoD': '🛡️',
  'MoAFW': '🌾',
  'MoWCD': '👩'
};

// Ministry full names mapping
const ministryFullNames = {
  'DPIIT': 'Department for Promotion of Industry and Internal Trade',
  'MoE': 'Ministry of Education',
  'MoLaborEmployment': 'Ministry of Labor and Employment',
  'MSDE': 'Ministry of Skill Development and Entrepreneurship',
  'MoHUA': 'Ministry of Housing and Urban Affairs',
  'MoF': 'Ministry of Finance',
  'MSME': 'Ministry of Micro, Small and Medium Enterprises',
  'NITI Aayog': 'NITI Aayog',
  'MoSJE': 'Ministry of Social Justice and Empowerment',
  'MoD': 'Ministry of Defence',
  'MoAFW': 'Ministry of Agriculture and Farmers Welfare',
  'MoWCD': 'Ministry of Women and Child Development'
};

export function renderMinistries() {
  const ministriesGrid = document.getElementById('ministries-grid');
  if (!ministriesGrid) return;

  const ministriesData = ministries.map(ministry => {
    const ministrySchemes = schemes.filter(scheme => scheme.ministry === ministry);
    return {
      code: ministry,
      name: ministryFullNames[ministry] || ministry,
      icon: ministryIcons[ministry] || '🏛️',
      schemes: ministrySchemes,
      schemeCount: ministrySchemes.length
    };
  });

  ministriesGrid.innerHTML = ministriesData.map(ministry => `
    <div class="ministry-card" data-ministry="${ministry.code}">
      <div class="ministry-icon">${ministry.icon}</div>
      <h3>${ministry.name}</h3>
      <p>${ministry.schemeCount} scheme${ministry.schemeCount > 1 ? 's' : ''} available</p>
      <div class="scheme-count">${ministry.schemeCount} Schemes</div>
    </div>
  `).join('');

  // Add click handlers to ministry cards
  document.querySelectorAll('.ministry-card').forEach(card => {
    card.addEventListener('click', () => {
      const ministryCode = card.dataset.ministry;
      showMinistryDetail(ministryCode);
    });
  });
}

export function showMinistryDetail(ministryCode) {
  // Redirect to individual ministry page
  window.location.href = `ministry-${ministryCode.toLowerCase()}.html`;
}

export function initMinistries() {
  // Render ministries on page load
  renderMinistries();

  // Back button functionality
  const backBtn = document.getElementById('back-to-ministries');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('ministry-detail-section').style.display = 'none';
      document.getElementById('ministries-section').style.display = 'block';
      document.getElementById('ministries-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
}
