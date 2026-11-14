import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const app = initializeApp({
  apiKey: "AIzaSyDOs3pjS6luZ6YF2dStZPT3-hTlcN_gO2M",
  authDomain: "mr-young-class.firebaseapp.com",
  projectId: "mr-young-class",
  storageBucket: "mr-young-class.firebasestorage.app",
  messagingSenderId: "1017724002400",
  appId: "1:1017724002400:web:37d8cae8c9a2d0fb9aa305"
});
export const db = getFirestore(app);
export const TEACHER = "roderek.young@gmail.com";
export const TYPES = ["Classwork","Homework","Quiz","Test","Project"];
export const QUARTERS = ["1st Nine Weeks","2nd Nine Weeks","3rd Nine Weeks","4th Nine Weeks"];
export async function loadAssignments(){
  const snap = await getDocs(query(collection(db,"assignments"), orderBy("due")));
  return snap.docs.map(d => ({id:d.id, ...d.data()}));
}
export async function loadSettings(){
  const s = await getDoc(doc(db,"settings","home"));
  return s.exists() ? s.data() : {};
}
export function todayStr(){ const t=new Date(); return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); }
export function fmtDue(due){
  if(!due) return "";
  const [y,m,d]=due.split("-").map(Number); const dt=new Date(y,m-1,d);
  return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
}
export function dueClass(due){
  const t=todayStr(); if(due<t) return "past";
  const [y,m,d]=due.split("-").map(Number); const diff=(new Date(y,m-1,d)-new Date())/864e5;
  return diff<=3 ? "soon" : "";
}
export function esc(s){ return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
export function cardHTML(a){
  const isImg = a.fileType && a.fileType.startsWith("image/");
  return `<article class="acard">
    <div class="meta"><span class="badge b-${esc(a.type)}">${esc(a.type)}</span><span class="due ${dueClass(a.due)}">Due ${fmtDue(a.due)}</span></div>
    <h3>${esc(a.title)}</h3>
    ${a.details?`<p>${esc(a.details)}</p>`:""}
    ${a.fileUrl && isImg?`<img class="prev" src="${esc(a.imageUrl||a.fileUrl)}" alt="Example for ${esc(a.title)}">`:""}
    ${a.fileUrl?`<a class="file" href="${esc(a.fileUrl)}" target="_blank" rel="noopener">📎 See an example</a>`:""}
  </article>`;
}

export async function loadNews(){
  const snap = await getDocs(query(collection(db,"news"), orderBy("week","desc")));
  return snap.docs.map(d => ({id:d.id, ...d.data()}));
}
export function newsHTML(n){
  const isImg = n.fileType && n.fileType.startsWith("image/");
  return `<article class="ncard">
    <div class="meta"><span class="badge b-Homework">Week of ${fmtDue(n.week)}</span></div>
    <h3>${esc(n.title)}</h3>
    ${n.body?`<p>${esc(n.body)}</p>`:""}
    ${n.fileUrl && isImg?`<img class="prev" src="${esc(n.imageUrl||n.fileUrl)}" alt="${esc(n.title)}">`:""}
    ${n.fileUrl && !isImg?`<a class="file" href="${esc(n.fileUrl)}" target="_blank" rel="noopener">📎 ${esc(n.fileName||"Attachment")}</a>`:""}
  </article>`;
}

export function tileHTML(a){
  return `<button class="tile" style="--tc:var(--c-${esc(a.type)})" data-id="${esc(a.id)}">
    <div class="meta"><span class="badge b-${esc(a.type)}">${esc(a.type)}</span>${a.points?`<span class="pts">${esc(a.points)} pts</span>`:""}</div>
    <h3>${esc(a.title)}</h3>
    <span class="due ${dueClass(a.due)}">Due ${fmtDue(a.due)}</span>
  </button>`;
}
export function modalHTML(a){
  return `<div class="modal-bg" id="mbg"><div class="modal" role="dialog" aria-modal="true" style="--tc:var(--c-${esc(a.type)})">
    <div class="mh"><div><span class="badge b-${esc(a.type)}">${esc(a.type)}</span><h2 style="margin-top:10px">${esc(a.title)}</h2></div><button class="x" aria-label="Close" id="mx">×</button></div>
    <div class="facts"><div><small>Due</small><b>${fmtDue(a.due)}</b></div><div><small>Points</small><b>${a.points?esc(a.points):"—"}</b></div><div><small>Grading period</small><b>${esc((a.quarter||1))}${["","st","nd","rd","th"][a.quarter||1]} Nine Weeks</b></div></div>
    ${a.details?`<div class="about"><h4>What it's about</h4><p>${esc(a.details)}</p></div>`:""}
    ${a.fileUrl?`<a class="dl" href="${esc(a.fileUrl)}" target="_blank" rel="noopener">📄 Download blank copy</a>`:'<div style="height:20px"></div>'}
  </div></div>`;
}

export function rowHTML(a){
  return `<tr class="r r-${esc(a.type)}" data-id="${esc(a.id)}" tabindex="0"><td>${esc(a.title)}</td><td><span class="badge b-${esc(a.type)}">${esc(a.type)}</span></td><td><span class="due ${dueClass(a.due)}">${fmtDue(a.due)}</span></td><td class="pts">${a.points?esc(a.points):"—"}</td></tr>`;
}
function previewUrl(u){ const m=String(u||"").match(/\/file\/d\/([^/]+)/); return m?`https://drive.google.com/file/d/${m[1]}/preview`:u; }
export function detailHTML(a){
  const q=a.quarter||1;
  return `<div class="modal-bg" id="mbg"><div class="modal wide" role="dialog" aria-modal="true" style="--tc:var(--c-${esc(a.type)})">
    <div class="mh"><div><span class="badge b-${esc(a.type)}">${esc(a.type)}</span><h2 style="margin-top:10px">${esc(a.title)}</h2></div><button class="x" aria-label="Close" id="mx">×</button></div>
    <div class="mbody">
      <div class="doc">${a.fileUrl?`<iframe src="${esc(previewUrl(a.fileUrl))}" title="Blank copy of ${esc(a.title)}"></iframe><a href="${esc(a.fileUrl)}" target="_blank" rel="noopener">📄 Open / download blank copy</a>`:'<div class="none">No blank copy posted for this assignment.</div>'}</div>
      <div class="side">
        <div class="facts"><div><small>Due</small><b>${fmtDue(a.due)}</b></div><div><small>Points</small><b>${a.points?esc(a.points):"—"}</b></div><div><small>Type</small><b>${esc(a.type)}</b></div><div><small>Grading period</small><b>${q}${["","st","nd","rd","th"][q]} Nine Weeks</b></div></div>
        <div class="about"><h4>What it's about</h4><p>${a.details?esc(a.details):"Details coming soon."}</p></div>
      </div>
    </div>
  </div></div>`;
}
