// IEEExGOV.in — Multilingual Voice Input
import { sendVoiceMessage } from './chatbot.js';

const LANGUAGES = {
  'en-IN': 'English',
  'hi-IN': 'हिंदी',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
  'mr-IN': 'मराठी',
  'bn-IN': 'বাংলা',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'gu-IN': 'ગુજરાતી'
};

let recognition = null;
let isRecording = false;

export function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) { voiceBtn.style.display = 'none'; }
    const langSelect = document.getElementById('voice-lang');
    if (langSelect) langSelect.style.display = 'none';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // Populate language selector
  const langSelect = document.getElementById('voice-lang');
  if (langSelect) {
    langSelect.innerHTML = Object.entries(LANGUAGES).map(([code, name]) =>
      `<option value="${code}">${name}</option>`
    ).join('');
  }

  const voiceBtn = document.getElementById('voice-btn');
  voiceBtn?.addEventListener('click', toggleRecording);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) input.value = transcript;
    sendVoiceMessage(transcript);
    stopRecording();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopRecording();
  };

  recognition.onend = () => { stopRecording(); };
}

function toggleRecording() {
  if (isRecording) stopRecording();
  else startRecording();
}

function startRecording() {
  if (!recognition) return;
  const langSelect = document.getElementById('voice-lang');
  recognition.lang = langSelect?.value || 'en-IN';
  
  try {
    recognition.start();
    isRecording = true;
    const btn = document.getElementById('voice-btn');
    if (btn) btn.classList.add('recording');
  } catch (e) {
    console.error('Failed to start recognition:', e);
  }
}

function stopRecording() {
  if (!recognition) return;
  try { recognition.stop(); } catch(e) {}
  isRecording = false;
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.remove('recording');
}
