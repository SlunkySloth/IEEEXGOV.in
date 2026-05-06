// IEEExGOV.in — Scheme Rendering & Search
import { schemes } from './data/schemes-data.js';
import { getLang, t } from './i18n.js';

let currentSchemes = [...schemes];

export function renderSchemes(filteredSchemes, containerId = 'schemes-grid', isViewAll = false) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const lang = getLang();
  const list = filteredSchemes || currentSchemes;
  
  // Check if we're on home page and need to limit to 6
  const isHomePage = containerId === 'schemes-grid';
  const isInitialLoad = filteredSchemes === currentSchemes || (Array.isArray(filteredSchemes) && filteredSchemes.length === schemes.length);
  const displayList = isHomePage && isInitialLoad && !isViewAll ? list.slice(0, 6) : list;
  
  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results"><div class="no-results-icon">🔍</div><h3>${lang==='hi'?'कोई योजना नहीं मिली':'No schemes found'}</h3><p>${lang==='hi'?'अपने फ़िल्टर बदलें या खोज शब्द बदलें':'Try changing your filters or search terms'}</p></div>`;
    return;
  }

  grid.innerHTML = displayList.map((s, i) => `
    <div class="scheme-card animate-in" style="animation-delay:${Math.min(i*0.05,0.5)}s" id="scheme-${s.id}">
      <div class="scheme-card-header">
        <span class="scheme-card-ministry">🏛️ ${lang==='hi'? s.ministryHi : s.ministry}</span>
        <span class="scheme-card-type">${s.benefitType[0]}</span>
      </div>
      <div class="scheme-card-body">
        <h3>${lang==='hi'? s.nameHi : s.name}</h3>
        <p>${lang==='hi'? s.descriptionHi : s.description}</p>
        <div class="scheme-card-eligibility">
          ${(lang==='hi'? s.eligibilityHi : s.eligibility).map(e => `<span class="eligibility-tag">${e}</span>`).join('')}
        </div>
      </div>
      <div class="scheme-card-footer">
        <a href="${s.officialUrl}" target="_blank" rel="noopener noreferrer" class="visit-btn" id="visit-${s.id}">${t('visitPortal')}</a>
        <div class="scheme-categories">${s.categories.map(() => '<span class="cat-dot"></span>').join('')}</div>
      </div>
    </div>
  `).join('');

  // Add View All button for home page if there are more than 6 schemes
  if (isHomePage && list.length > 6 && isInitialLoad && !isViewAll) {
    // Remove any existing View All button
    const existingViewAll = grid.parentNode.querySelector('.btn-primary');
    if (existingViewAll) {
      existingViewAll.parentNode.remove();
    }
    
    const viewAllContainer = document.createElement('div');
    viewAllContainer.style.cssText = 'text-align: center; margin-top: var(--sp-8);';
    viewAllContainer.innerHTML = `<button class="btn btn-primary" onclick="viewAllSchemes()">View All Schemes</button>`;
    grid.parentNode.insertBefore(viewAllContainer, grid.nextSibling);
  }
}

export function viewAllSchemes() {
  renderSchemes([...schemes], 'schemes-grid', true);
  const viewAllBtn = document.querySelector('.btn-primary');
  if (viewAllBtn) {
    viewAllBtn.style.display = 'none';
  }
}

export function searchSchemes(query) {
  if (!query || query.trim() === '') {
    currentSchemes = [...schemes];
    return currentSchemes;
  }
  const q = query.toLowerCase();
  currentSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.nameHi.includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.ministry.toLowerCase().includes(q) ||
    s.keywords.some(k => k.includes(q)) ||
    s.categories.some(c => c.toLowerCase().includes(q)) ||
    s.benefitType.some(b => b.toLowerCase().includes(q))
  );
  return currentSchemes;
}

export function getSchemes() { return currentSchemes; }
export function setSchemes(s) { currentSchemes = s; }
export function getAllSchemes() { return schemes; }
