"use strict";var vernel=(()=>{var W=Object.defineProperty;var Ze=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames;var et=Object.prototype.hasOwnProperty;var tt=(t,e)=>{for(var o in e)W(t,o,{get:e[o],enumerable:!0})},nt=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Je(e))!et.call(t,r)&&r!==o&&W(t,r,{get:()=>e[r],enumerable:!(n=Ze(e,r))||n.enumerable});return t};var ot=t=>nt(W({},"__esModule",{value:!0}),t);var Vt={};tt(Vt,{default:()=>jt,readFont:()=>de,readRole:()=>he,readSpacing:()=>pe,readType:()=>ue,vernel:()=>Ue});function ie(){return typeof navigator>"u"?!1:/mac|iphone|ipad|ipod/i.test(navigator.userAgent)}function rt(t){let e=t.split("+").map(i=>i.trim().toLowerCase()).filter(Boolean),o=e.pop();if(o===void 0)return null;let n=new Set(e),r=n.has("mod");return{key:o,alt:n.has("alt")||n.has("option"),ctrl:n.has("ctrl")||n.has("control")||r&&!ie(),meta:n.has("meta")||n.has("cmd")||n.has("command")||r&&ie(),shift:n.has("shift")}}function it(t,e){return t.altKey!==e.alt||t.ctrlKey!==e.ctrl||t.metaKey!==e.meta||t.shiftKey!==e.shift?!1:t.key.toLowerCase()===e.key?!0:e.key.length!==1?!1:e.key>="a"&&e.key<="z"?t.code===`Key${e.key.toUpperCase()}`:e.key>="0"&&e.key<="9"?t.code===`Digit${e.key}`:!1}function at(t){let e=t.composedPath()[0]??t.target;if(!(e instanceof HTMLElement))return!1;if(e.isContentEditable)return!0;let o=e.tagName;return o==="INPUT"||o==="TEXTAREA"||o==="SELECT"}function ae(t,e){let o=rt(t);if(o===null)return null;let n=r=>{at(r)||!it(r,o)||(r.preventDefault(),e())};return window.addEventListener("keydown",n,!0),()=>window.removeEventListener("keydown",n,!0)}var lt=new Set(["serif","sans-serif","monospace","cursive","fantasy","system-ui","ui-serif","ui-sans-serif","ui-monospace","ui-rounded","math","emoji","fangsong"]),st="mmmmmmmmmmlliWWWWOO0123",dt=72,ct=["monospace","serif"],z;function ut(){return z===void 0&&(z=document.createElement("canvas").getContext("2d")),z}var j=new Map;function le(t,e){return t.font=`${dt}px ${e}`,t.measureText(st).width}function pt(t){let e=j.get(t);if(e!==void 0)return e;let o=ut();if(o===null)return!1;let n=`"${t.replace(/"/g,"")}"`,r=ct.some(i=>le(o,`${n}, ${i}`)!==le(o,i));return j.set(t,r),r}function se(){j.clear()}function V(t){let e=t.split(",").map(n=>n.trim().replace(/^["']|["']$/g,"")).filter(Boolean),o=e[0]??"unknown";for(let n of e)if(lt.has(n.toLowerCase())||pt(n))return{declared:e,rendered:n,fallback:n!==o};return{declared:e,rendered:o,fallback:!1}}function de(t){return V(getComputedStyle(t).fontFamily)}function w(t){let e=Number.parseFloat(t);return Number.isFinite(e)?e:0}var mt={normal:400,bold:700};function K(t,e,o=""){return{top:w(t.getPropertyValue(`${e}-top${o}`)),right:w(t.getPropertyValue(`${e}-right${o}`)),bottom:w(t.getPropertyValue(`${e}-bottom${o}`)),left:w(t.getPropertyValue(`${e}-left${o}`))}}function $(t){let e=w(t.fontSize),o=t.lineHeight==="normal"?null:w(t.lineHeight),n=w(t.letterSpacing);return{fontFamily:t.fontFamily,fontSize:e,fontWeight:mt[t.fontWeight]??w(t.fontWeight),lineHeight:o,leading:o===null||e===0?null:o/e,letterSpacing:n,tracking:e===0?0:n/e*1e3}}function B(t){return{margin:K(t,"margin"),padding:K(t,"padding"),rowGap:w(t.rowGap),columnGap:w(t.columnGap)}}function ce(t){return K(t,"border","-width")}function ue(t){return $(getComputedStyle(t))}function pe(t){return B(getComputedStyle(t))}function H(t){for(let e of t.childNodes)if(e.nodeType===Node.TEXT_NODE&&e.nodeValue!==null&&e.nodeValue.trim()!=="")return!0;return!1}var ft=new Set(["script","style","link","meta","title","template","noscript","br"]);function me(t){return ft.has(t.tagName.toLowerCase())?!1:t.getClientRects().length>0}function fe(t){return t.position!=="absolute"&&t.position!=="fixed"&&t.float==="none"}var gt={radio:"Radio Input",checkbox:"Checkbox Input",range:"Range Input",color:"Color Input",file:"File Input",date:"Date Input","datetime-local":"Date Time Input",month:"Month Input",week:"Week Input",time:"Time Input",email:"Email Input",password:"Password Input",search:"Search Input",tel:"Phone Input",url:"URL Input",number:"Number Input",hidden:"Hidden Input",submit:"Button",button:"Button",reset:"Button",image:"Image Button"},ht={h1:"Headline Block",h2:"Headline Block",h3:"Subhead Block",h4:"Subhead Block",h5:"Subhead Block",h6:"Subhead Block",p:"Narrative Text",li:"List Item Text",dt:"Term Text",dd:"Definition Text",blockquote:"Quote Block",q:"Quote Text",cite:"Citation Text",figcaption:"Caption Text",caption:"Caption Text",small:"Caption Text",label:"Label Text",legend:"Legend Text",a:"Link Text",button:"Button",summary:"Summary Text",th:"Table Head Cell",td:"Table Cell",strong:"Strong Text",b:"Strong Text",em:"Italic Text",i:"Italic Text",code:"Code Text",kbd:"Code Text",samp:"Code Text",pre:"Code Block",textarea:"Text Area",select:"Select Input",option:"Option Text",progress:"Progress Bar",meter:"Meter Bar",img:"Image",picture:"Image",svg:"Vector",canvas:"Canvas",video:"Video",audio:"Audio",iframe:"Frame",hr:"Divider",ul:"List Group",ol:"List Group",dl:"List Group",nav:"Nav Group",header:"Header Group",footer:"Footer Group",main:"Main Group",section:"Section Group",article:"Article Group",aside:"Aside Group",form:"Form Group",fieldset:"Field Group",table:"Table Group",thead:"Table Head Group",tbody:"Table Body Group",tfoot:"Table Foot Group",tr:"Table Row",figure:"Figure Group",dialog:"Dialog Group",details:"Disclosure Group",html:"Root Block",body:"Page Block"},bt={heading:"Headline Block",paragraph:"Narrative Text",button:"Button",link:"Link Text",listitem:"List Item Text",textbox:"Text Input",searchbox:"Search Input",checkbox:"Checkbox Input",radio:"Radio Input",switch:"Switch Input",slider:"Range Input",combobox:"Select Input",option:"Option Text",img:"Image",separator:"Divider",list:"List Group",navigation:"Nav Group",banner:"Header Group",contentinfo:"Footer Group",main:"Main Group",complementary:"Aside Group",region:"Section Group",dialog:"Dialog Group",alertdialog:"Dialog Group",tablist:"Tab Group",tab:"Tab Text",tabpanel:"Tab Panel Group",menu:"Menu Group",menuitem:"Menu Item Text",table:"Table Group",row:"Table Row",cell:"Table Cell",columnheader:"Table Head Cell",rowheader:"Table Head Cell"};function yt(t){return t.replace(/(^|[\s-])([a-z])/g,(e,o,n)=>o+n.toUpperCase())}var xt=new Set(["p","span","div","li","h1","h2","h3","h4","h5","h6","strong","em","small"]);function ge(t,e){let o=$(t).fontSize;return e===0?o/16:o/e}function vt(t,e){return t.textTransform!=="uppercase"?!1:$(t).tracking/1e3>=.04&&ge(t,e)<=1.05}function St(t,e){let o=ge(t,e);return o>=2?"Display Text":o<=.8?"Caption Text":"Body Text"}function he(t){let e=t.ownerDocument.documentElement,o=Number.parseFloat(getComputedStyle(e).fontSize)||16;return Y(t,getComputedStyle(t),o)}function Y(t,e,o){if(t instanceof HTMLElement&&t.isContentEditable)return"Editable Text";if(t instanceof HTMLInputElement)return gt[t.type]??"Text Input";let n=t.getAttribute("role");if(n!==null&&n!==""){let u=n.trim().split(/\s+/)[0]??"";return bt[u]??`${yt(u)} Element`}let r=t.tagName.toLowerCase(),i=H(t);if(i&&xt.has(r)&&vt(e,o))return"Eyebrow Label";let l=ht[r];if(l!==void 0)return l;if(i)return St(e,o);let a=e.display;return a.includes("flex")||a.includes("grid")?"Layout Block":a.startsWith("inline")?"Inline Group":"Container Block"}var U;function be(){return U===void 0&&(U=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),U}function X(t){let e=be();if(e===null||t==="")return null;e.fillStyle="#000000",e.fillStyle=t;let o=e.fillStyle;if(e.fillStyle="#ffffff",e.fillStyle=t,e.fillStyle!==o)return null;e.clearRect(0,0,1,1),e.fillRect(0,0,1,1);let[n=0,r=0,i=0,l=0]=e.getImageData(0,0,1,1).data;return[n,r,i,l]}function q(t){let e=X(t);return e===null?null:e.join(",")}function ye(t){let e=be();return e===null?t:(e.fillStyle="#000000",e.fillStyle=t,typeof e.fillStyle=="string"?e.fillStyle:t)}function xe([t,e,o]){let n=r=>{let i=r/255;return i<=.03928?i/12.92:((i+.055)/1.055)**2.4};return .2126*n(t)+.7152*n(e)+.0722*n(o)}var wt=.5;function Tt(t){let e=t;for(;e!==null;){let o=X(getComputedStyle(e).backgroundColor);if(o!==null&&o[3]/255>=wt)return xe(o)>.35?"light":"dark";e=e.parentElement}return null}function Et(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function ve(t,e){return t!=="auto"?t:(e===null?null:Tt(e))??Et()}var kt=1e3,L=null,Se=0;function Rt(){if(L!==null&&performance.now()-Se<kt)return L;let t=new Map,e=getComputedStyle(document.documentElement);for(let o=0;o<e.length;o+=1){let n=e.item(o);if(!n.startsWith("--"))continue;let r=q(e.getPropertyValue(n).trim());if(r===null)continue;let i=t.get(r);i===void 0?t.set(r,[n.slice(2)]):i.push(n.slice(2))}return L=t,Se=performance.now(),t}function Q(){L=null}var Ct=["text","fg","foreground","ink","content","copy"];function Mt(t){let e=t.filter(r=>Ct.some(i=>r.toLowerCase().includes(i)));return[...e.length>0?e:t].sort((r,i)=>r.length-i.length||(r<i?-1:1))[0]??null}function we(t){let e=q(t);if(e===null)return null;let o=Rt().get(e);return o===void 0?null:Mt(o)}var $t="vernel-overlay",Bt=["position: fixed !important","inset: 0 !important","margin: 0 !important","padding: 0 !important","border: 0 !important","pointer-events: none !important","z-index: 2147483647 !important","display: block !important","overflow: hidden !important","contain: layout style paint"].join("; "),Gt="'Geist Mono', 'GeistMono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",Ht=`
  --accent: #e2603c;
  --accent-dim: rgba(226, 96, 60, 0.62);
  --chip-bg: rgba(72, 26, 17, 0.94);
  --chip-edge: rgba(226, 96, 60, 0.24);
  --chip-note: rgba(255, 255, 255, 0.42);
  --role-ink: #f2a189;
  --warn: #f0b429;
  --margin-fill: rgba(246, 173, 85, 0.3);
  --padding-fill: rgba(104, 211, 145, 0.3);
  --content-fill: rgba(255, 255, 255, 0.06);
  --pad-ink: #6fd39b;
  --pad-chip-bg: rgba(13, 43, 29, 0.94);
  --pad-chip-edge: rgba(111, 211, 155, 0.28);
  --gap-ink: #85c9ee;
  --gap-fill: rgba(78, 163, 217, 0.18);
  --gap-edge: rgba(133, 201, 238, 0.5);
  --gap-chip-bg: rgba(13, 34, 47, 0.94);
  --gap-chip-edge: rgba(133, 201, 238, 0.28);
  --rule: rgba(236, 72, 153, 0.18);
  --baseline-ink: rgba(236, 72, 153, 0.65);
  --handle-fill: #17100e;
`,Lt=`
  --accent: #b8431f;
  --accent-dim: rgba(184, 67, 31, 0.6);
  --chip-bg: rgba(253, 232, 223, 0.96);
  --chip-edge: rgba(184, 67, 31, 0.2);
  --chip-note: rgba(61, 41, 33, 0.5);
  --role-ink: #8f3315;
  --warn: #a35a06;
  --margin-fill: rgba(230, 145, 40, 0.28);
  --padding-fill: rgba(22, 150, 90, 0.24);
  --content-fill: rgba(22, 22, 32, 0.05);
  --pad-ink: #12704a;
  --pad-chip-bg: rgba(224, 246, 233, 0.96);
  --pad-chip-edge: rgba(18, 112, 74, 0.22);
  --gap-ink: #1f6d9e;
  --gap-fill: rgba(56, 145, 205, 0.16);
  --gap-edge: rgba(31, 109, 158, 0.42);
  --gap-chip-bg: rgba(223, 239, 250, 0.96);
  --gap-chip-edge: rgba(31, 109, 158, 0.24);
  --rule: rgba(190, 24, 93, 0.08);
  --baseline-ink: rgba(190, 24, 93, 0.5);
  --handle-fill: #fffaf7;
`,Ft=`
:host {
  all: initial;
  --mono: ${Gt};
${Ht}}
/* Namespaced, so a page that styles [data-theme] itself cannot reach in. */
:host([data-vernel-theme='light']) {
${Lt}}
* { box-sizing: border-box; }

.grid {
  position: absolute;
  inset: 0;
  display: none;
}

.gap, .band, .box, .outline, .handle, .baseline-mark, .measure, .chips, .chip--gap, .chip--pad {
  position: absolute;
  top: 0;
  left: 0;
  display: none;
}

.gap { background: var(--gap-fill); }
.gap--y { box-shadow: inset 0 1px 0 var(--gap-edge), inset 0 -1px 0 var(--gap-edge); }
.gap--x { box-shadow: inset 1px 0 0 var(--gap-edge), inset -1px 0 0 var(--gap-edge); }

.band {
  border-style: solid;
  border-color: transparent;
  border-width: 0;
}
.band--margin { border-color: var(--margin-fill); }
.band--padding { border-color: var(--padding-fill); }
.box--content { background: var(--content-fill); }
.outline { border: 1px solid var(--accent-dim); }

.handle {
  width: 7px;
  height: 7px;
  background: var(--handle-fill);
  border: 1.5px solid var(--accent);
}

.baseline-mark { border-top: 1px dashed var(--baseline-ink); }

/* A spacing line with end caps, the way a spec sheet draws a distance. */
.measure { background: var(--pad-ink); }
.measure::before, .measure::after {
  content: '';
  position: absolute;
  background: var(--pad-ink);
}
.measure--y::before, .measure--y::after { left: -3px; width: 7px; height: 1px; }
.measure--y::before { top: 0; }
.measure--y::after { bottom: 0; }
.measure--x::before, .measure--x::after { top: -3px; width: 1px; height: 7px; }
.measure--x::before { left: 0; }
.measure--x::after { right: 0; }

.chips {
  gap: 5px;
  align-items: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--chip-edge);
  border-radius: 5px;
  background: var(--chip-bg);
  color: var(--accent);
  font: 12px/1 var(--mono);
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.chip__icon { color: var(--accent-dim); }
.chip__icon:empty { display: none; }
.chip__note { color: var(--chip-note); }
.chip__note:empty { display: none; }
/* The role names the thing, so it reads a step brighter than the numbers. */
.chip--role { color: var(--role-ink); }
.chip--color .chip__icon { border-bottom: 2px solid currentColor; }
.chip--off .chip__value { color: var(--warn); }
/* The declared face is not the one drawing: say so where the name is shown. */
.chip--fallback .chip__icon { color: var(--warn); }
.chip--gap {
  color: var(--gap-ink);
  background: var(--gap-chip-bg);
  border-color: var(--gap-chip-edge);
}
.chip--pad {
  color: var(--pad-ink);
  background: var(--pad-chip-bg);
  border-color: var(--pad-chip-edge);
}
`;function Te(){let t=document.createElement($t);t.style.cssText=Bt,t.setAttribute("aria-hidden","true");let e=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=Ft,e.append(o);let n=!1;return{element:t,shadow:e,get mounted(){return n},mount(){n||((document.body??document.documentElement).append(t),n=!0)},unmount(){n&&(t.remove(),n=!1)}}}function c(...t){let e=document.createElement("div");return e.className=t.join(" "),e}var Ee="rgba(236, 72, 153, 0.18)";function ke(t){let e=c("grid");t.append(e);let o=0;return{update(n,r){n!==o&&(e.style.backgroundImage=`repeating-linear-gradient(to bottom, ${Ee} 0, ${Ee} 1px, transparent 1px, transparent ${n}px)`,o=n);let i=(r%n+n)%n;e.style.backgroundPosition=`0 ${i}px`,e.style.display="block"},hide(){e.style.display="none"}}}var J=new Map,Z;function It(){return Z===void 0&&(Z=document.createElement("canvas").getContext("2d")),Z}function Dt(t,e){let o={ascent:e.fontSize*.8,descent:e.fontSize*.2};if(e.fontSize===0)return o;let n=`${t.fontStyle} ${e.fontWeight} ${e.fontSize}px ${e.fontFamily}`,r=J.get(n);if(r)return r;let i=It();if(!i)return o;i.font=n;let l=i.measureText("Hxp"),a={ascent:Number.isFinite(l.fontBoundingBoxAscent)?l.fontBoundingBoxAscent:o.ascent,descent:Number.isFinite(l.fontBoundingBoxDescent)?l.fontBoundingBoxDescent:o.descent};return J.set(n,a),a}function Re(){J.clear()}function Ce(t,e,o,n){if(!H(t))return null;let{ascent:r,descent:i}=Dt(o,n),a=((n.lineHeight??r+i)-(r+i))/2;return e.content.y+a+r}function Me(t,e,o){if(!(o>0))return null;let r=((t-e)%o+o)%o,i=r<=o/2?r:r-o;return{interval:o,delta:i,onGrid:Math.abs(i)<.5}}function $e(t){let e=c("baseline-mark");return t.append(e),{update(o,n){e.style.transform=`translate(${o.x}px, ${n}px)`,e.style.width=`${o.width}px`,e.style.display="block"},hide(){e.style.display="none"}}}function F(t,e){t.style.transform=`translate(${e.x}px, ${e.y}px)`,t.style.width=`${e.width}px`,t.style.height=`${e.height}px`}var Be=3.5;function Ge(t){let e=c("band","band--margin"),o=c("band","band--padding"),n=c("box","box--content"),r=c("outline"),i=[c("handle"),c("handle"),c("handle"),c("handle")];t.append(e,o,n,r,...i);let l=[e,o,n,r,...i];return{update(a,u){let d={top:u.has("top")?0:a.sides.margin.top,right:u.has("right")?0:a.sides.margin.right,bottom:u.has("bottom")?0:a.sides.margin.bottom,left:u.has("left")?0:a.sides.margin.left};F(e,{x:a.border.x-d.left,y:a.border.y-d.top,width:a.border.width+d.left+d.right,height:a.border.height+d.top+d.bottom}),e.style.borderWidth=`${d.top}px ${d.right}px ${d.bottom}px ${d.left}px`,F(o,a.padding),o.style.borderWidth=`${a.sides.padding.top}px ${a.sides.padding.right}px ${a.sides.padding.bottom}px ${a.sides.padding.left}px`,F(n,a.content),F(r,a.border);let g=a.border.x+a.border.width,b=a.border.y+a.border.height,v=[[a.border.x,a.border.y],[g,a.border.y],[g,b],[a.border.x,b]];i.forEach((h,p)=>{let R=v[p];R!==void 0&&(h.style.transform=`translate(${R[0]-Be}px, ${R[1]-Be}px)`)});for(let h of l)h.style.display="block"},hide(){for(let a of l)a.style.display="none"}}}function T(t,e=2){let o=Number(t.toFixed(e));return Object.is(o,-0)?"0":String(o)}function f(t,e=2){return`${T(t,e)}px`}function He(t,e=2){let o=T(t,e);return t>0?`+${o}`:o}function I(t){let{top:e,right:o,bottom:n,left:r}=t;return r!==o?`${f(e)} ${f(o)} ${f(n)} ${f(r)}`:e!==n?`${f(e)} ${f(o)} ${f(n)}`:e!==o?`${f(e)} ${f(o)}`:f(e)}function D(t,e){return e===0?f(t,2):`${T(t/e,3)}rem`}function Le(t){return`${T(t/1e3,3)}em`}function Fe(t){let e=t.tagName.toLowerCase(),o=t.id?`#${t.id}`:"",n=typeof t.className=="string"?t.className.trim().split(/\s+/).filter(Boolean).slice(0,2).map(r=>`.${r}`).join(""):"";return`${e}${o}${n}`}var Ie=.5;function ee(t){let{x:e,y:o,width:n,height:r}=t.getBoundingClientRect();return{x:e,y:o,width:n,height:r}}function De(t,e,o){let n=o?t.nextElementSibling:t.previousElementSibling;for(;n!==null;){if(n!==e&&me(n)&&fe(getComputedStyle(n)))return n;n=o?n.nextElementSibling:n.previousElementSibling}return null}function _e(t,e,o){let n=e.y-(t.y+t.height),r=e.x-(t.x+t.width);if(n>=Ie&&n>=r){let i=Math.max(t.x,e.x),l=Math.min(t.x+t.width,e.x+e.width),a=l-i>1;return{rect:{x:a?i:Math.min(t.x,e.x),y:t.y+t.height,width:a?l-i:Math.max(t.width,e.width),height:n},distance:n,axis:"y",side:o?"top":"bottom"}}if(r>=Ie){let i=Math.max(t.y,e.y),l=Math.min(t.y+t.height,e.y+e.height),a=l-i>1;return{rect:{x:t.x+t.width,y:a?i:Math.min(t.y,e.y),width:r,height:a?l-i:Math.max(t.height,e.height)},distance:r,axis:"x",side:o?"left":"right"}}return null}function Oe(t,e){let o=ee(t),n=[],r=De(t,e,!1);if(r!==null){let l=_e(ee(r),o,!0);l!==null&&n.push(l)}let i=De(t,e,!0);if(i!==null){let l=_e(o,ee(i),!1);l!==null&&n.push(l)}return n}var Ne=6;function Ae(t){let e=[0,1].map(()=>{let n=c("gap"),r=c("chip","chip--gap"),i=c("chip__icon"),l=c("chip__value");return r.append(i,l),t.append(n,r),{band:n,label:r,icon:i,value:l}});function o(n){for(let r=n;r<e.length;r+=1){let i=e[r];i!==void 0&&(i.band.style.display="none",i.label.style.display="none")}}return{update(n,r){n.forEach((i,l)=>{let a=e[l];if(a===void 0)return;a.band.className=i.axis==="y"?"gap gap--y":"gap gap--x",a.band.style.transform=`translate(${i.rect.x}px, ${i.rect.y}px)`,a.band.style.width=`${i.rect.width}px`,a.band.style.height=`${i.rect.height}px`,a.band.style.display="block",a.icon.textContent=i.axis==="y"?"\u2195":"\u2194",a.value.textContent=D(i.distance,r),a.label.style.display="flex";let u=a.label.offsetWidth,d=a.label.offsetHeight,g=i.axis==="y"?Math.max(Ne,i.rect.x-u-Ne):i.rect.x+i.rect.width/2-u/2,b=i.rect.y+i.rect.height/2-d/2;a.label.style.transform=`translate(${Math.round(g)}px, ${Math.round(b)}px)`}),o(n.length)},hide(){o(0)}}}function E(t,e,o,n=4){return Math.max(n,Math.min(t,o-e-n))}function _t(t,e){return{x:t.x-e.left,y:t.y-e.top,width:Math.max(0,t.width+e.left+e.right),height:Math.max(0,t.height+e.top+e.bottom)}}function Pe(t,e){return{x:t.x+e.left,y:t.y+e.top,width:Math.max(0,t.width-e.left-e.right),height:Math.max(0,t.height-e.top-e.bottom)}}function We(t,e){let o=t.getBoundingClientRect(),n={x:o.x,y:o.y,width:o.width,height:o.height},r=B(e),i=ce(e),l=Pe(n,i);return{margin:_t(n,r.margin),border:n,padding:l,content:Pe(l,r.padding),sides:r,borders:i}}function Nt(t,e){let o=document.elementFromPoint(t,e);for(let n=0;n<16;n+=1){let r=o?.shadowRoot;if(!r)break;let i=r.elementFromPoint(t,e);if(!i||i===o)break;o=i}return o}function ze({host:t,root:e,onFrame:o}){let n=null,r=null,i=0,l=!1,a=null,u=typeof ResizeObserver>"u"?null:new ResizeObserver(()=>d());function d(){!l||i!==0||(i=requestAnimationFrame(g))}function g(){if(i=0,!l)return;if(n===null||r===null){o({element:null,x:0,y:0});return}let h=Nt(n,r),p=h===null||h===t||h.getRootNode()===t.shadowRoot?null:h;u&&p!==a&&(a&&a!==e&&u.unobserve(a),p&&p!==e&&u.observe(p),a=p),o({element:p,x:n,y:r})}function b(h){n=h.clientX,r=h.clientY,d()}function v(){n=null,r=null,d()}return{start(){l||(l=!0,window.addEventListener("pointermove",b,{capture:!0,passive:!0}),document.addEventListener("scroll",d,{capture:!0,passive:!0}),window.addEventListener("resize",d,{passive:!0}),document.addEventListener("pointerleave",v),u?.observe(e),d())},stop(){l&&(l=!1,window.removeEventListener("pointermove",b,{capture:!0}),document.removeEventListener("scroll",d,{capture:!0}),window.removeEventListener("resize",d),document.removeEventListener("pointerleave",v),u?.disconnect(),a=null,i!==0&&(cancelAnimationFrame(i),i=0))},schedule:d}}var Ot=["top","right","bottom","left"],je=6;function At(t,e){let{padding:o,content:n}=e,r=n.x+n.width/2,i=n.y+n.height/2;switch(t){case"top":return{line:{x:r,y:o.y,width:0,height:n.y-o.y},vertical:!0};case"bottom":{let l=n.y+n.height;return{line:{x:r,y:l,width:0,height:o.y+o.height-l},vertical:!0}}case"left":return{line:{x:o.x,y:i,width:n.x-o.x,height:0},vertical:!1};case"right":{let l=n.x+n.width;return{line:{x:l,y:i,width:o.x+o.width-l,height:0},vertical:!1}}}}function Ve(t){let e=Ot.map(n=>{let r=c("measure",`measure--${n}`),i=c("chip","chip--pad"),l=c("chip__value"),a=c("chip__note");return i.append(l,a),t.append(r,i),{side:n,line:r,label:i,value:l,note:a}});function o(){for(let n of e)n.line.style.display="none",n.label.style.display="none"}return{update(n){for(let r of e){let i=n.sides.padding[r.side];if(i<.5){r.line.style.display="none",r.label.style.display="none";continue}let{line:l,vertical:a}=At(r.side,n);r.line.className=`measure ${a?"measure--y":"measure--x"}`,r.line.style.transform=`translate(${l.x}px, ${l.y}px)`,r.line.style.width=`${a?1:l.width}px`,r.line.style.height=`${a?l.height:1}px`,r.line.style.display="block";let u=n.borders[r.side];r.value.textContent=`${T(i,1)}px`,r.note.textContent=u>0?`+${T(u,1)} border`:"",r.label.style.display="flex";let d=r.label.offsetWidth,g=r.label.offsetHeight,b=E(a?l.x+je:l.x+l.width/2-d/2,d,document.documentElement.clientWidth),v=E(a?l.y+l.height/2-g/2:l.y-g-je,g,document.documentElement.clientHeight);r.label.style.transform=`translate(${Math.round(b)}px, ${Math.round(v)}px)`}},hide:o}}var te=8,Pt=4;function x(t,e,o){let n=c(o===void 0?"chip":`chip ${o}`),r=c("chip__icon");r.textContent=e;let i=c("chip__value"),l=c("chip__note");return n.append(r,i,l),t.append(n),{el:n,icon:r,note:l,set(a){n.style.display=a===null?"none":"flex",a!==null&&(i.textContent=a)}}}function ne(t,e,o){t.style.transform=`translate(${Math.round(e)}px, ${Math.round(o)}px)`}function Ke(t){let e=c("chips"),o=c("chips"),n=c("chips");t.append(e,o,n);let r=x(e,"","chip--role"),i=x(o,""),l=x(o,"Aa"),a=x(o,"\u2195"),u=x(o,"\u2194"),d=x(o,"A","chip--color"),g=x(n,"W"),b=x(n,"H"),v=x(n,"M"),h=x(n,"P"),p=x(n,"B"),R=x(n,"G"),S=x(n,"\u23AF");return{update(s){let{type:k,spacing:m,box:y,rootFontSize:_}=s;r.set(s.role),r.note.textContent=s.selector,i.set(`${s.font.rendered} ${T(k.fontWeight,0)}`),i.icon.textContent=s.font.fallback?"\u21B3":"",i.el.classList.toggle("chip--fallback",s.font.fallback),l.set(D(k.fontSize,_)),a.set(k.leading===null?"normal":T(k.leading,2)),u.set(Le(k.tracking)),d.set(s.colorToken??ye(s.color)),d.icon.style.borderBottomColor=s.color,g.set(f(y.width,1)),b.set(f(y.height,1));let M=m.margin.top!==0||m.margin.right!==0||m.margin.bottom!==0||m.margin.left!==0;v.set(M?I(m.margin):null);let C=m.padding.top!==0||m.padding.right!==0||m.padding.bottom!==0||m.padding.left!==0;h.set(C?I(m.padding):null);let Xe=s.borders.top!==0||s.borders.right!==0||s.borders.bottom!==0||s.borders.left!==0;p.set(Xe?I(s.borders):null),R.set(m.rowGap===0&&m.columnGap===0?null:`${f(m.rowGap,1)} / ${f(m.columnGap,1)}`),S.set(s.baseline===null?null:s.baseline.onGrid?`on ${f(s.baseline.interval,0)} grid`:`${He(s.baseline.delta,1)}px off grid`),S.el.classList.toggle("chip--off",s.baseline!==null&&!s.baseline.onGrid);for(let Qe of[e,o,n])Qe.style.display="flex";let N=document.documentElement.clientWidth,O=document.documentElement.clientHeight,G=e.offsetHeight,oe=e.offsetWidth,A=o.offsetWidth,re=y.x+y.width,P=E(s.bounds.top-G-te,G,O),qe=y.x+oe+te>re-A?E(P-G-Pt,G,O):P;ne(e,E(y.x,oe,N),P),ne(o,E(re-A,A,N),qe),ne(n,E(y.x+y.width/2-n.offsetWidth/2,n.offsetWidth,N),E(s.bounds.bottom+te,n.offsetHeight,O))},hide(){for(let s of[e,o,n])s.style.display="none"}}}function Ye(t){let e=Te(),o=ke(e.shadow),n=Ae(e.shadow),r=Ge(e.shadow),i=Ve(e.shadow),l=$e(e.shadow),a=Ke(e.shadow),u=!1;function d(v){let h=t.baseline>0?t.root.getBoundingClientRect().top:0;t.baseline>0?o.update(t.baseline,h):o.hide();let p=v.element,R=ve(t.theme,p);if(e.element.getAttribute("data-vernel-theme")!==R&&(e.element.setAttribute("data-vernel-theme",R),Q()),p===null){n.hide(),r.hide(),i.hide(),l.hide(),a.hide();return}let S=getComputedStyle(p),s=We(p,S),k=$(S),m=Number.parseFloat(getComputedStyle(t.root).fontSize)||16,y=Oe(p,e.element),_=new Set(y.map(C=>C.side));r.update(s,_),i.update(s),n.update(y,m);let M=Ce(p,s,S,k);M===null?l.hide():l.update(s.content,M),a.update({role:Y(p,S,m),selector:Fe(p),box:s.border,bounds:{top:Math.min(s.border.y,...y.map(C=>C.rect.y)),bottom:Math.max(s.border.y+s.border.height,...y.map(C=>C.rect.y+C.rect.height))},type:k,font:V(k.fontFamily),spacing:B(S),borders:s.borders,color:S.color,colorToken:we(S.color),baseline:M===null?null:Me(M,h,t.baseline),rootFontSize:m})}let g=ze({host:e.element,root:t.root,onFrame:d});function b(){Re(),se(),g.schedule()}return{get enabled(){return u},enable(){u||(u=!0,Q(),e.mount(),g.start(),document.fonts?.addEventListener("loadingdone",b))},disable(){u&&(u=!1,g.stop(),document.fonts?.removeEventListener("loadingdone",b),o.hide(),n.hide(),r.hide(),i.hide(),l.hide(),a.hide(),e.unmount())},destroy(){this.disable()}}}var Wt="Alt+V",zt={enabled:!1,enable:()=>{},disable:()=>{},toggle:()=>{},destroy:()=>{}};function Ue(t={}){if(typeof document>"u")return zt;let e={baseline:t.baseline??0,root:t.root??document.documentElement,theme:t.theme??"auto"},o=t.hotkey===void 0?Wt:t.hotkey,n=null;function r(){(n??=Ye(e)).enable()}function i(){n?.disable()}function l(){n?.enabled===!0?i():r()}let a=o===null?null:ae(o,l);return{get enabled(){return n?.enabled??!1},enable:r,disable:i,toggle:l,destroy(){a?.(),n?.destroy(),n=null}}}var jt=Ue;return ot(Vt);})();

/* vernel — paste-into-console build. Alt+V toggles; vernelInstance.destroy() removes it. */
globalThis.vernelInstance?.destroy();
globalThis.vernelInstance = vernel.default({ baseline: 8 });
globalThis.vernelInstance.enable();

