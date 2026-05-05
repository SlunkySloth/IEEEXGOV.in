// IEEExGOV.in — AI Chatbot & Scheme Matcher
import { schemes } from './data/schemes-data.js';
import { getLang } from './i18n.js';

let chatHistory = [];
let isProcessing = false;
let geminiApiKey = null;

// Try loading API key from localStorage
try { geminiApiKey = localStorage.getItem('gemini-api-key'); } catch(e) {}

export function initChatbot() {
  const fab = document.getElementById('chatbot-fab');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const msgContainer = document.getElementById('chat-messages');

  fab?.addEventListener('click', () => {
    panel.classList.toggle('open');
    fab.classList.toggle('open');
    if (panel.classList.contains('open') && chatHistory.length === 0) {
      const lang = getLang();
      addMessage('bot', lang === 'hi' 
        ? '👋 नमस्ते! मैं आपका सरकारी योजना सलाहकार हूं। मुझे अपने बारे में बताएं — उम्र, शिक्षा, रोजगार, स्थान — और मैं सबसे अच्छी योजनाओं का सुझाव दूंगा।'
        : '👋 Hello! I\'m your Government Scheme Advisor. Tell me about yourself — age, education, employment status, location — and I\'ll suggest the best schemes for you.');
    }
  });

  closeBtn?.addEventListener('click', () => { panel.classList.remove('open'); fab.classList.remove('open'); });

  sendBtn?.addEventListener('click', () => sendMessage());
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      sendMessage();
    });
  });
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || isProcessing) return;
  
  input.value = '';
  addMessage('user', text);
  
  // Hide suggestions after first message
  const sugBox = document.querySelector('.chatbot-suggestions');
  if (sugBox) sugBox.style.display = 'none';

  processQuery(text);
}

export function sendVoiceMessage(text) {
  if (!text || isProcessing) return;
  addMessage('user', text);
  const sugBox = document.querySelector('.chatbot-suggestions');
  if (sugBox) sugBox.style.display = 'none';
  processQuery(text);
}

function addMessage(type, content) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = content;
  container.appendChild(msg);
  chatHistory.push({ type, content });
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  document.getElementById('typing-indicator')?.remove();
}

async function processQuery(text) {
  isProcessing = true;
  showTyping();

  // Small delay for UX
  await new Promise(r => setTimeout(r, 800));

  if (geminiApiKey) {
    try {
      const response = await callGemini(text);
      hideTyping();
      addMessage('bot', response);
    } catch(err) {
      hideTyping();
      // Fallback to rule-based
      const response = ruleBasedMatch(text);
      addMessage('bot', response);
    }
  } else {
    const response = ruleBasedMatch(text);
    hideTyping();
    addMessage('bot', response);
  }
  isProcessing = false;
}

async function callGemini(userText) {
  const lang = getLang();
  const schemeContext = schemes.map(s => `${s.name}: ${s.description} | Categories: ${s.categories.join(',')} | Eligibility: ${s.eligibility.join('; ')} | URL: ${s.officialUrl}`).join('\n');

  const prompt = `You are a helpful Indian government scheme advisor. Based on the user's situation, suggest the top 5 most relevant government schemes from this list:\n\n${schemeContext}\n\nUser says: "${userText}"\n\nRespond in ${lang === 'hi' ? 'Hindi' : 'English'}. For each scheme, give:\n1. Scheme name\n2. One-line why it's relevant\n3. Official URL\n\nFormat as HTML with scheme-suggestion divs. Be concise and helpful.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';
}

function ruleBasedMatch(text) {
  const lower = text.toLowerCase();
  const lang = getLang();
  const profile = extractProfile(lower);
  const scored = schemes.map(s => ({ scheme: s, score: scoreScheme(s, profile, lower) }))
    .sort((a, b) => b.score - a.score)
    .filter(x => x.score > 0)
    .slice(0, 5);

  if (scored.length === 0) {
    return lang === 'hi'
      ? 'मुझे आपकी स्थिति के लिए कोई विशिष्ट योजना नहीं मिली। कृपया अपनी उम्र, शिक्षा, रोजगार की स्थिति और श्रेणी के बारे में अधिक जानकारी दें।'
      : 'I couldn\'t find specific schemes for your situation. Please provide more details about your age, education, employment status, and category.';
  }

  const header = lang === 'hi'
    ? `<strong>आपकी स्थिति के आधार पर, यहां शीर्ष ${scored.length} योजनाएं हैं:</strong>`
    : `<strong>Based on your situation, here are the top ${scored.length} schemes:</strong>`;

  const cards = scored.map(({ scheme: s }) => `
    <div class="scheme-suggestion">
      <h5>🏛️ ${lang === 'hi' ? s.nameHi : s.name}</h5>
      <p>${lang === 'hi' ? s.descriptionHi.substring(0, 100) + '...' : s.description.substring(0, 100) + '...'}</p>
      <a href="${s.officialUrl}" target="_blank" rel="noopener">→ ${lang === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}</a>
    </div>
  `).join('');

  return header + cards;
}

function extractProfile(text) {
  const profile = { age: null, education: null, employment: null, gender: null, category: null };

  // Age
  const ageMatch = text.match(/(\d{1,2})\s*(year|yr|sal|वर्ष|साल)/i) || text.match(/age\s*(\d{1,2})/i);
  if (ageMatch) profile.age = parseInt(ageMatch[1]);

  // Education
  if (/graduate|degree|ba |bsc|btech|be |bcom|mba|mca|engineering|pg|post.?grad/i.test(text)) profile.education = 'graduate';
  else if (/12th|12वी|inter|hsc|plus.?two/i.test(text)) profile.education = '12th';
  else if (/10th|10वी|matric|ssc/i.test(text)) profile.education = '10th';
  else if (/phd|doctorate|research/i.test(text)) profile.education = 'phd';
  else if (/diploma|iti|polytechnic/i.test(text)) profile.education = 'diploma';

  // Employment
  if (/unemploy|jobless|no job|बेरोजगार|வேலை இல்லை|నిరుద్యోగ|work nahi|kaam nahi|berozgar/i.test(text)) profile.employment = 'unemployed';
  else if (/student|studying|padh|पढ़|छात्र/i.test(text)) profile.employment = 'student';
  else if (/farmer|kisan|खेती|किसान|agriculture|farming/i.test(text)) profile.employment = 'farmer';
  else if (/business|startup|udyam|व्यवसाय|entrepreneur|self.?employ|shop|vendor/i.test(text)) profile.employment = 'entrepreneur';

  // Gender
  if (/woman|women|female|lady|महिला|लड़की|girl|beti|daughter|wife/i.test(text)) profile.gender = 'female';

  // Category
  if (/sc |dalit|अनुसूचित जाति/i.test(text)) profile.category = 'SC';
  if (/st |tribal|जनजाति|adivasi/i.test(text)) profile.category = 'ST';
  if (/obc|अन्य पिछड़ा/i.test(text)) profile.category = 'OBC';
  if (/disab|divyang|विकलांग|handicap|PwD|differently/i.test(text)) profile.category = 'disabled';

  return profile;
}

function scoreScheme(scheme, profile, text) {
  let score = 0;

  // Keyword matching
  scheme.keywords.forEach(kw => { if (text.includes(kw)) score += 3; });

  // Category matching
  if (profile.employment === 'unemployed' && scheme.categories.includes('Unemployed')) score += 10;
  if (profile.employment === 'student' && scheme.categories.includes('Student')) score += 10;
  if (profile.employment === 'farmer' && scheme.categories.includes('Farmer')) score += 10;
  if (profile.employment === 'entrepreneur' && scheme.categories.includes('Entrepreneur')) score += 10;
  if (profile.gender === 'female' && scheme.categories.includes('Women')) score += 8;
  if (profile.category === 'disabled' && scheme.categories.includes('Differently-abled')) score += 10;

  // Age matching
  if (profile.age) {
    if (profile.age >= 17 && profile.age <= 24 && scheme.id === 'agnipath') score += 5;
    if (profile.age >= 21 && profile.age <= 24 && scheme.id === 'pm-internship') score += 8;
    if (profile.age >= 15 && profile.age <= 45 && scheme.id === 'pmkvy') score += 3;
  }

  // Education
  if (profile.education === 'graduate' && ['pm-internship', 'ncs', 'startup-india'].includes(scheme.id)) score += 5;

  // SC/ST specific
  if ((profile.category === 'SC' || profile.category === 'ST') && scheme.id === 'stand-up-india') score += 8;
  if ((profile.category === 'SC' || profile.category === 'OBC') && scheme.id === 'pm-daksh') score += 8;

  return score;
}

export function setApiKey(key) {
  geminiApiKey = key;
  localStorage.setItem('gemini-api-key', key);
}
