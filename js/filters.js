// IEEExGOV.in — Smart Filters
import { schemes, categories, ministries, benefitTypes } from './data/schemes-data.js';
import { renderSchemes } from './schemes.js';
import { getLang } from './i18n.js';

const activeFilters = { category: [], ministry: [], benefitType: [] };

export function initFilters() {
  renderFilterDropdowns();
  document.addEventListener('click', e => {
    if (!e.target.closest('.filter-group')) closeAllDropdowns();
  });
  document.getElementById('clear-filters-btn')?.addEventListener('click', clearAllFilters);
}

function renderFilterDropdowns() {
  renderDropdown('filter-category', categories, 'category');
  renderDropdown('filter-ministry', ministries, 'ministry');
  renderDropdown('filter-benefit', benefitTypes, 'benefitType');
}

function renderDropdown(containerId, options, filterKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const btn = container.querySelector('.filter-dropdown-btn');
  const dropdown = container.querySelector('.filter-dropdown');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) dropdown.classList.add('open');
  });

  dropdown.innerHTML = options.map(opt => `
    <label class="filter-option">
      <input type="checkbox" value="${opt}" data-filter="${filterKey}">
      <span>${opt}</span>
    </label>
  `).join('');

  dropdown.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', () => {
      if (inp.checked) {
        activeFilters[filterKey].push(inp.value);
      } else {
        activeFilters[filterKey] = activeFilters[filterKey].filter(v => v !== inp.value);
      }
      applyFilters();
      updateFilterBadges();
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'));
}

function applyFilters() {
  let result = [...schemes];

  if (activeFilters.category.length > 0) {
    result = result.filter(s => s.categories.some(c => activeFilters.category.includes(c)));
  }
  if (activeFilters.ministry.length > 0) {
    result = result.filter(s => activeFilters.ministry.includes(s.ministry));
  }
  if (activeFilters.benefitType.length > 0) {
    result = result.filter(s => s.benefitType.some(b => activeFilters.benefitType.includes(b)));
  }

  renderSchemes(result);
  updateResultsCount(result.length);
}

function updateFilterBadges() {
  ['category', 'ministry', 'benefitType'].forEach(key => {
    const containerId = key === 'category' ? 'filter-category' : key === 'ministry' ? 'filter-ministry' : 'filter-benefit';
    const container = document.getElementById(containerId);
    if (!container) return;
    const btn = container.querySelector('.filter-dropdown-btn');
    const existing = btn.querySelector('.filter-count');
    if (existing) existing.remove();
    if (activeFilters[key].length > 0) {
      btn.classList.add('active');
      const badge = document.createElement('span');
      badge.className = 'filter-count';
      badge.textContent = activeFilters[key].length;
      btn.appendChild(badge);
    } else {
      btn.classList.remove('active');
    }
  });

  const clearBtn = document.getElementById('clear-filters-btn');
  const total = Object.values(activeFilters).flat().length;
  if (clearBtn) clearBtn.style.display = total > 0 ? 'inline-flex' : 'none';
}

function updateResultsCount(count) {
  const el = document.getElementById('results-count');
  if (el) {
    const lang = getLang();
    el.textContent = lang === 'hi' ? `${count} योजनाएं मिलीं` : `${count} schemes found`;
  }
}

function clearAllFilters() {
  activeFilters.category = [];
  activeFilters.ministry = [];
  activeFilters.benefitType = [];
  document.querySelectorAll('.filter-option input').forEach(inp => inp.checked = false);
  updateFilterBadges();
  renderSchemes(schemes);
  updateResultsCount(schemes.length);
}

export function filterByCategory(cat) {
  clearAllFilters();
  activeFilters.category = [cat];
  const checkbox = document.querySelector(`input[value="${cat}"][data-filter="category"]`);
  if (checkbox) checkbox.checked = true;
  applyFilters();
  updateFilterBadges();
  document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
}
