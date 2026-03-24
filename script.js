/* ─── SYMPTOMS STATE ─── */
const selSym = new Set();
let severity = '';

/* ─── HELPER FUNCTIONS ─── */
function togSym(btn) {
  const s = btn.dataset.s;
  if (selSym.has(s)) {
    selSym.delete(s);
    btn.classList.remove('on');
  } else {
    selSym.add(s);
    btn.classList.add('on');
  }
  renderTags();
}

function renderTags() {
  const box = document.getElementById('tagsBox');
  if (!selSym.size) {
    box.innerHTML = `<span class="tags-empty">No symptoms selected yet</span>`;
    return;
  }
  box.innerHTML = [...selSym].map(s => `<span class="tag">${s}<span class="tag-x" onclick="remTag('${s}')">✕</span></span>`).join('');
}

function remTag(s) {
  selSym.delete(s);
  const b = document.querySelector(`.sym-btn[data-s="${s}"]`);
  if (b) b.classList.remove('on');
  renderTags();
}

function setSev(el) {
  document.querySelectorAll('.sev-opt').forEach(e => e.classList.remove('on'));
  el.classList.add('on');
  severity = el.getAttribute('data-sev');
}

function goPanel(n) {
  document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === n - 1));
  document.querySelectorAll('.wizard-steps .step').forEach((s, i) => {
    s.classList.toggle('active', i === n - 1);
    s.classList.toggle('done', i < n - 1);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goStep2() {
  const extra = document.getElementById('extraSym').value;
  if (extra.trim()) extra.split(',').map(s => s.trim()).filter(Boolean).forEach(s => selSym.add(s));
  if (!selSym.size) {
    alert('Please select at least one symptom.');
    return;
  }
  renderTags();
  goPanel(2);
}

function resetForm() {
  selSym.clear();
  severity = '';
  document.querySelectorAll('.sym-btn').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.sev-opt').forEach(b => b.classList.remove('on'));
  ['age', 'weight', 'extraSym'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['gender', 'dur'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('cond').value = '';
  renderTags();
  goPanel(1);
}

/* ─── KNOWLEDGE BASE (Rule-Based Advice) ─── */
function getAdvice(symptoms, age, gender, conditions, severityLevel) {
  const symSet = new Set(symptoms.map(s => s.toLowerCase()));
  const isEmergency = symSet.has('chest tightness') ||
                      (symSet.has('dizziness') && severityLevel === 'Severe') ||
                      (symSet.has('mild fever') && severityLevel === 'Severe');
 
  let headline = "General Health Guidance";
  let cause = "Based on your symptoms, this could be related to common viral infections, stress, or minor physical strain.";
  let selfCare = "<ul><li>Get adequate rest (7-9 hours of sleep)</li><li>Stay hydrated with water and clear fluids</li><li>Avoid strenuous activities</li><li>Monitor your symptoms for changes</li></ul>";
  let homeRemedies = "<ul><li>Warm salt water gargle for throat discomfort</li><li>Honey and ginger tea for soothing effects</li><li>Apply warm compress to affected areas</li><li>Practice deep breathing exercises</li></ul>";
  let seeDoctor = "<ul><li>Symptoms persist beyond 5-7 days</li><li>Fever exceeds 101°F (38.3°C)</li><li>Symptoms suddenly worsen</li><li>Difficulty breathing or chest pain develops</li></ul>";
  let medicines = [];

  // Cold/Flu symptoms
  if (symSet.has('common cold') || symSet.has('runny nose') || symSet.has('sneezing') || symSet.has('cough') || symSet.has('sore throat')) {
    headline = "Upper Respiratory Infection (Common Cold)";
    cause = "Viral infection affecting the upper respiratory tract. Common during seasonal changes and typically self-limiting.";
    selfCare = "<ul><li>Rest and allow your body to recover</li><li>Drink warm fluids like herbal tea or soup</li><li>Use a humidifier to ease congestion</li><li>Avoid cold beverages and smoking</li></ul>";
    homeRemedies = "<ul><li>Steam inhalation with eucalyptus oil</li><li>Warm turmeric milk before bedtime</li><li>Ginger and honey infusion</li><li>Nasal saline rinse for congestion</li></ul>";
    medicines = [
      { name: "Cetirizine", type: "Antihistamine", purpose: "Relieves runny nose and sneezing", dosage: "10mg once daily", caution: "May cause drowsiness. Avoid alcohol." },
      { name: "Dextromethorphan", type: "Cough Suppressant", purpose: "Controls dry cough", dosage: "10-20mg every 4 hours as needed", caution: "Not for wet cough with phlegm." }
    ];
  }
 
  // Headache/Body pain
  if (symSet.has('headache') || symSet.has('body pain') || symSet.has('back pain')) {
    headline = "Tension-Type Headache / Myalgia";
    cause = "Muscle tension, stress, dehydration, or lack of sleep. Often benign and responds well to rest and hydration.";
    selfCare = "<ul><li>Apply cold or warm compress to affected area</li><li>Practice relaxation techniques</li><li>Maintain regular meal times</li><li>Gentle stretching exercises</li></ul>";
    homeRemedies = "<ul><li>Peppermint oil massage on temples</li><li>Epsom salt bath for muscle relaxation</li><li>Hydration with electrolyte water</li><li>Lavender aromatherapy</li></ul>";
    medicines = [
      { name: "Paracetamol (Acetaminophen)", type: "Analgesic", purpose: "Pain relief and fever reduction", dosage: "500mg every 6 hours as needed", caution: "Do not exceed 3000mg per day." },
      { name: "Ibuprofen", type: "NSAID", purpose: "Anti-inflammatory and pain relief", dosage: "200-400mg every 6-8 hours with food", caution: "Avoid if you have stomach ulcers or kidney issues." }
    ];
  }
 
  // Stomach issues
  if (symSet.has('stomach pain') || symSet.has('indigestion') || symSet.has('nausea')) {
    headline = "Gastric Distress / Indigestion";
    cause = "Dietary factors, stress, or mild gastroenteritis. Usually resolves with dietary adjustments and rest.";
    selfCare = "<ul><li>Eat small, bland meals (BRAT diet)</li><li>Avoid spicy, fatty, or fried foods</li><li>Sit upright after meals</li><li>Gentle abdominal massage clockwise</li></ul>";
    homeRemedies = "<ul><li>Ginger tea or fresh ginger slices</li><li>Fennel seeds after meals</li><li>Peppermint tea for nausea</li><li>Cumin water for digestion</li></ul>";
    medicines = [
      { name: "Antacid (Calcium Carbonate)", type: "Antacid", purpose: "Neutralizes stomach acid", dosage: "As directed on label", caution: "Avoid within 2 hours of other medications." },
      { name: "Simethicone", type: "Anti-gas", purpose: "Relieves bloating and gas", dosage: "80mg as needed", caution: "Safe for most adults." }
    ];
  }

  // Fever
  if (symSet.has('mild fever')) {
    if (!medicines.some(m => m.name.includes("Paracetamol"))) {
      medicines.unshift({ name: "Paracetamol (Acetaminophen)", type: "Antipyretic", purpose: "Reduces fever and provides pain relief", dosage: "500mg every 6 hours", caution: "Do not exceed 3000mg per day." });
    }
  }

  // Age-specific warnings
  const ageNum = parseInt(age);
  if (ageNum < 12) {
    seeDoctor = "<ul><li>Any fever in infants under 3 months</li><li>Persistent vomiting or diarrhea</li><li>Unusual drowsiness or irritability</li><li>Symptoms lasting more than 48 hours</li></ul>";
  }
  if (ageNum > 65) {
    seeDoctor = "<ul><li>Confusion or disorientation</li><li>Difficulty walking or speaking</li><li>Chest pain or pressure</li><li>Dehydration signs (dry mouth, low urine output)</li></ul>";
  }

  // Condition-specific warnings
  const condLower = conditions.toLowerCase();
  if (condLower.includes('diabetes')) {
    medicines = medicines.map(m => ({ ...m, caution: m.caution + " Monitor blood sugar levels if diabetic." }));
  }
  if (condLower.includes('pregnancy')) {
    medicines = medicines.filter(m => m.name !== "Ibuprofen");
    if (!medicines.some(m => m.name.includes("Paracetamol"))) {
      medicines.push({ name: "Paracetamol (Acetaminophen)", type: "Analgesic", purpose: "Pain relief (pregnancy-safe)", dosage: "500mg as needed", caution: "Consult doctor before use during pregnancy." });
    }
  }
  if (condLower.includes('hypertension')) {
    medicines = medicines.map(m => ({ ...m, caution: m.caution + " Consult doctor if you have high blood pressure." }));
  }

  if (medicines.length === 0) {
    medicines = [{ name: "Consult Pharmacist", type: "Advice", purpose: "Professional consultation recommended", dosage: "As prescribed", caution: "Always seek professional medical advice for accurate treatment." }];
  }

  return { isEmergency, headline, cause, selfCare, homeRemedies, seeDoctor, medicines };
}

function submitAndGetAdvice() {
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  if (!age) { alert('Please enter your age.'); return; }
  if (!gender) { alert('Please select your gender.'); return; }
 
  goPanel(3);
  document.getElementById('loader').style.display = 'block';
  document.getElementById('results').style.display = 'none';
 
  setTimeout(() => {
    const symptoms = [...selSym];
    const conditions = document.getElementById('cond').value;
    const advice = getAdvice(symptoms, age, gender, conditions, severity);
   
    renderResults(advice, symptoms, age, gender);
    saveHistory(advice, symptoms, age, gender);
    document.getElementById('loader').style.display = 'none';
  }, 600);
}

function renderResults(r, syms, age, gender) {
  const emg = document.getElementById('emgBanner');
  if (r.isEmergency) {
    emg.classList.remove('hidden');
    document.getElementById('emgText').textContent = "You have reported symptoms that require immediate medical attention. Please seek emergency care right away.";
  } else {
    emg.classList.add('hidden');
  }

  document.getElementById('resultHeadline').textContent = r.headline;
  document.getElementById('resultSub').textContent = `${syms.join(', ')} · Age ${age} · ${gender}`;
  document.getElementById('causeBlock').innerHTML = r.cause;
  document.getElementById('careBlock').innerHTML = r.selfCare;
  document.getElementById('remedyBlock').innerHTML = r.homeRemedies;
  document.getElementById('docBlock').innerHTML = r.seeDoctor;

  const grid = document.getElementById('medGrid');
  if (r.medicines?.length) {
    grid.innerHTML = r.medicines.map(m => `
      <div class="med-card">
        <div class="med-top">
          <span class="med-name">💊 ${m.name}</span>
          <span class="med-badge">${m.type || 'OTC'}</span>
        </div>
        <div class="med-body">
          <div class="med-row"><span class="med-lbl">Purpose</span><span class="med-val">${m.purpose}</span></div>
          <div class="med-row"><span class="med-lbl">Dosage</span><span class="med-val">${m.dosage}</span></div>
          <div class="med-warn">⚠️ ${m.caution}</div>
        </div>
      </div>`).join('');
  } else {
    grid.innerHTML = '<p style="color:var(--text3);font-size:.83rem">No OTC medicines suggested. Please consult a pharmacist or doctor.</p>';
  }

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveHistory(r, syms, age, gender) {
  const hist = JSON.parse(localStorage.getItem('mg_hist') || '[]');
  hist.unshift({
    date: new Date().toLocaleString(),
    symptoms: syms.join(', '),
    age, gender,
    headline: r.headline,
    isEmg: r.isEmergency
  });
  localStorage.setItem('mg_hist', JSON.stringify(hist.slice(0, 20)));
}

function openHistory() {
  const hist = JSON.parse(localStorage.getItem('mg_hist') || '[]');
  const body = document.getElementById('histBody');
  if (!hist.length) {
    body.innerHTML = '<div class="hist-empty">No history yet. Complete a symptom check to see your records here.</div>';
  } else {
    body.innerHTML = hist.map(h => `
      <div class="hist-item">
        <div class="hist-date">🕐 ${h.date}${h.isEmg ? ' &nbsp;<span style="color:var(--red);font-weight:700">⚠ Emergency</span>' : ''}</div>
        <div class="hist-symptoms">${h.symptoms}</div>
        <div class="hist-info">Age ${h.age} · ${h.gender} · ${h.headline}</div>
      </div>`).join('');
  }
  document.getElementById('histModal').classList.add('open');
}

function closeHistory() { document.getElementById('histModal').classList.remove('open'); }

/* ─── CHATBOT (Simple Q&A) ─── */
let chatOpen = false;
function toggleChat() {
  chatOpen = !chatOpen;
  const bub = document.getElementById('chatBubble');
  bub.classList.toggle('open', chatOpen);
  document.getElementById('chatFab').textContent = chatOpen ? '✕' : '💬';
  if (chatOpen && document.getElementById('chatMsgs').children.length === 0) {
    addMsg('bot', '👋 Hi! I\'m MediBot. Ask me about symptoms, medicines, or when to see a doctor.');
  }
}

function addMsg(from, text) {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = `msg msg-${from}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function sendChat() {
  const inp = document.getElementById('chatIn');
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';
  addMsg('user', q);
 
  setTimeout(() => {
    const lowerQ = q.toLowerCase();
    let reply = "I'm here to help! For specific medical concerns, please consult a doctor. I can provide general guidance on common symptoms.";
    if (lowerQ.includes('headache')) reply = "For headaches, try resting in a dark room, staying hydrated, and using a cold compress. Over-the-counter pain relievers like paracetamol may help. If severe or persistent, see a doctor.";
    else if (lowerQ.includes('cold') || lowerQ.includes('cough')) reply = "For cold and cough, rest well, drink warm fluids, use honey for soothing, and consider steam inhalation. Most colds resolve in 7-10 days.";
    else if (lowerQ.includes('fever')) reply = "For fever, stay hydrated, rest, and use paracetamol if needed. Seek medical care if fever exceeds 103°F (39.4°C) or lasts more than 3 days.";
    else if (lowerQ.includes('stomach') || lowerQ.includes('indigestion')) reply = "For indigestion, eat small bland meals, avoid spicy foods, and try ginger tea. If pain is severe or persistent, consult a doctor.";
    else if (lowerQ.includes('doctor')) reply = "See a doctor if symptoms are severe, persistent beyond 5-7 days, or if you have chest pain, difficulty breathing, or severe headache.";
    addMsg('bot', reply);
  }, 300);
}

/* ─── EVENT LISTENERS & INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('historyBtn').addEventListener('click', openHistory);
  document.getElementById('viewHistoryFromResultsBtn').addEventListener('click', openHistory);
  document.getElementById('modalCloseBtn').addEventListener('click', closeHistory);
  document.getElementById('histModal').addEventListener('click', (e) => { if (e.target === document.getElementById('histModal')) closeHistory(); });
  document.getElementById('toStep2Btn').addEventListener('click', goStep2);
  document.getElementById('backToStep1Btn').addEventListener('click', () => goPanel(1));
  document.getElementById('submitBtn').addEventListener('click', submitAndGetAdvice);
  document.getElementById('resetBtn').addEventListener('click', resetForm);
  document.getElementById('chatFab').addEventListener('click', toggleChat);
  document.getElementById('chatCloseBtn').addEventListener('click', toggleChat);
  document.getElementById('chatSendBtn').addEventListener('click', sendChat);
  document.getElementById('chatIn').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChat(); });
 
  document.querySelectorAll('.sym-btn').forEach(btn => btn.addEventListener('click', () => togSym(btn)));
  document.querySelectorAll('.sev-opt').forEach(opt => opt.addEventListener('click', () => setSev(opt)));
 
  renderTags();
});


