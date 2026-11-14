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
export const TYPES = ["Homework","Classwork","Quiz","Test","Project"];
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
