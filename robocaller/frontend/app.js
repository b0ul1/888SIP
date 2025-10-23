// frontend/app.js
const API_BASE = (location.origin || "").replace(":8080", ":8000") || "http://localhost:8000";
let token = localStorage.getItem("token") || null;

function $(id){ return document.getElementById(id); }

function setToken(t){
  token = t;
  if (t) localStorage.setItem("token", t);
}

async function api(path, opts = {}){
  const url = API_BASE + path;
  const headers = Object.assign({"Content-Type":"application/json"}, opts.headers || {});
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// === UI actions ===
async function login(){
  const email = $("email").value;
  const password = $("password").value;
  try {
    const j = await api("/auth/login",{ method:"POST", body: JSON.stringify({email,password}) });
    setToken(j.token);
    $("role").innerText = "Role: " + j.role;
  } catch (e){
    $("role").innerText = "Login échec";
    console.error(e);
  }
}

async function createCampaign(){
  const name = $("cname").value;
  const caller_id = $("clid").value;
  const concurrent_limit = parseInt($("concur").value || "1", 10);
  const pace_per_minute = parseInt($("pace").value || "30", 10);
  try {
    await api("/campaigns",{ method:"POST", body: JSON.stringify({name,caller_id,concurrent_limit,pace_per_minute}) });
    await listCampaigns();
  } catch(e){ console.error(e); }
}

async function listCampaigns(){
  try {
    const j = await api("/campaigns");
    $("campaigns").innerText = JSON.stringify(j, null, 2);
  } catch(e){ console.error(e); }
}

async function start(){
  const cid = parseInt($("cid").value, 10);
  if (!cid) return;
  try { await api(`/campaigns/${cid}/start`, { method:"POST" }); } catch(e){ console.error(e); }
}

async function pause(){
  const cid = parseInt($("cid").value, 10);
  if (!cid) return;
  try { await api(`/campaigns/${cid}/pause`, { method:"POST" }); } catch(e){ console.error(e); }
}

function ws(){
  const cid = parseInt($("cid").value, 10);
  if (!cid) return;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const base = API_BASE.replace("http://","").replace("https://","");
  const sock = new WebSocket(`${proto}://${base}/ws/campaigns/${cid}`);
  sock.onopen = () => appendFeed(`WS ouvert pour campagne ${cid}`);
  sock.onmessage = (ev) => appendFeed(ev.data);
  sock.onerror = (e) => appendFeed("WS erreur");
  sock.onclose = () => appendFeed("WS fermé");
}

function appendFeed(line){
  const el = $("feed");
  el.innerText = (el.innerText ? el.innerText + "\n" : "") + line;
}

// Expose global (index.html appelle ces fonctions)
window.login = login;
window.createCampaign = createCampaign;
window.listCampaigns = listCampaigns;
window.start = start;
window.pause = pause;
window.ws = ws;
