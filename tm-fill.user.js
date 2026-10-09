// ==UserScript==
// @name         เติมทะเบียน PTM จากเว็บคัดกลับรถ
// @namespace    uturn-screener
// @version      0.1
// @description  ปุ่มลอยบนหน้า PTM: อ่านข้อมูลที่คัดลอกจากเว็บ แล้วเติมประเภทรถ/ทะเบียน/จังหวัด และกดตรวจสอบทะเบียนรถ
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const fire=(el,types)=>types.forEach(t=>el.dispatchEvent(new Event(t,{bubbles:true})));
  function setText(el,v){el.focus();el.value=v;fire(el,['input','change','keyup']);el.blur&&el.blur()}
  function toast(t,bad){let d=document.getElementById('uturn-toast');
    if(!d){d=document.createElement('div');d.id='uturn-toast';d.style.cssText='position:fixed;right:16px;bottom:70px;z-index:99999;padding:8px 12px;border-radius:6px;font:14px sans-serif;color:#fff;max-width:320px';document.body.appendChild(d)}
    d.style.background=bad?'#c0392b':'#27ae60';d.textContent=t;clearTimeout(d._t);d._t=setTimeout(()=>d.remove(),6000)}
  async function fill(d){
    const sel=document.getElementById('carTypeTest');
    if(sel&&d.type){const i=[...sel.options].findIndex(o=>o.text.includes(d.type));
      if(i>=0){sel.selectedIndex=i;fire(sel,['input','change'])}else toast('ไม่พบประเภทรถ "'+d.type+'" ในรายการ PTM — เลือกเอง',true);await sleep(300)}
    const p1=document.getElementById('plate1'),p2=document.getElementById('plate2');
    if(!p1||!p2)return toast('ไม่พบช่องทะเบียนในหน้านี้',true);
    setText(p1,d.f||'');setText(p2,d.n||'');await sleep(200);
    const holder=document.getElementById('plateProvSelected'),inp=holder&&holder.querySelector('input');
    if(inp&&d.prov){inp.focus();setText(inp,d.prov);
      let row=null;for(let k=0;k<20&&!row;k++){await sleep(150);row=holder.querySelector('.angucomplete-row')}
      if(row){row.click();await sleep(300)}else{toast('ไม่พบจังหวัด "'+d.prov+'" — เลือกเองแล้วกดตรวจสอบ',true);return}}
    const b=document.getElementById('verify_license');
    if(b){b.click();toast('เติมแล้ว กดตรวจสอบทะเบียนรถให้แล้ว — เทียบรูปกับข้อมูลรถก่อนบันทึก')}
  }
  async function run(){
    let t;try{t=await navigator.clipboard.readText()}catch(e){return toast('อ่านคลิปบอร์ดไม่ได้ (อนุญาตสิทธิ์ให้เว็บนี้ก่อน)',true)}
    let d;try{d=JSON.parse(t)}catch(e){return toast('คลิปบอร์ดไม่ใช่ข้อมูลจากเว็บคัดกลับรถ',true)}
    if(!d||!d._uturn)return toast('คลิปบอร์ดไม่ใช่ข้อมูลจากเว็บคัดกลับรถ',true);
    await fill(d)}
  function addBtn(){if(!document.getElementById('plate1')||document.getElementById('uturn-fill'))return;
    const b=document.createElement('button');b.id='uturn-fill';b.textContent='เติมทะเบียนจากคลิปบอร์ด';
    b.style.cssText='position:fixed;right:16px;bottom:20px;z-index:99999;padding:10px 14px;background:#f5a524;border:0;border-radius:8px;font:600 14px sans-serif;cursor:pointer';
    b.onclick=run;document.body.appendChild(b)}
  setInterval(addBtn,1000);
})();