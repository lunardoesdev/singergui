var Q=Object.defineProperty;var K=(n,e,t)=>e in n?Q(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var h=(n,e,t)=>K(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();function X(n){return window.go.main.App.ActivateProxy(n)}function Y(n,e){return window.go.main.App.AddProxies(n,e)}function J(n,e){return window.go.main.App.AddProxy(n,e)}function Z(n,e){return window.go.main.App.AddSubscription(n,e)}function ee(){return window.go.main.App.ClearSystemProxy()}function te(n){return window.go.main.App.CopyToClipboard(n)}function se(n){return window.go.main.App.CreateGroup(n)}function re(){return window.go.main.App.DeactivateProxy()}function ne(){return window.go.main.App.DeleteDeadProxies()}function ie(n){return window.go.main.App.DeleteGroup(n)}function oe(n){return window.go.main.App.DeleteProxies(n)}function ae(n){return window.go.main.App.DeleteProxy(n)}function le(n){return window.go.main.App.DeleteSubscription(n)}function ce(){return window.go.main.App.GetActiveProxy()}function de(){return window.go.main.App.GetClipboard()}function ue(){return window.go.main.App.GetDeadProxyCount()}function he(){return window.go.main.App.GetGroupCount()}function pe(){return window.go.main.App.GetGroups()}function ge(n,e){return window.go.main.App.GetGroupsPaginated(n,e)}function me(n){return window.go.main.App.GetHealthStats(n)}function ye(){return window.go.main.App.GetListenAddress()}function fe(){return window.go.main.App.GetMeasurementCounts()}function xe(n,e){return window.go.main.App.GetPingHistory(n,e)}function ve(n,e,t){return window.go.main.App.GetProxies(n,e,t)}function be(n){return window.go.main.App.GetProxyCount(n)}function Se(n){return window.go.main.App.GetProxyDetails(n)}function we(n,e,t){return window.go.main.App.GetProxyIDs(n,e,t)}function Ce(n){return window.go.main.App.GetProxyStats(n)}function Pe(){return window.go.main.App.GetSettings()}function Ie(n,e){return window.go.main.App.GetSpeedHistory(n,e)}function Ae(){return window.go.main.App.GetSubscriptions()}function Le(){return window.go.main.App.IsSystemProxySet()}function Me(n,e){return window.go.main.App.MoveProxiesToGroup(n,e)}function Ee(n,e){return window.go.main.App.MoveToGroup(n,e)}function ke(){return window.go.main.App.ParseClipboard()}function Ge(n,e){return window.go.main.App.RenameGroup(n,e)}function $e(n,e,t){return window.go.main.App.SearchGroups(n,e,t)}function Te(n,e,t,s){return window.go.main.App.SearchProxies(n,e,t,s)}function De(n){return window.go.main.App.SetListenAddress(n)}function He(){return window.go.main.App.SetSystemProxy()}function Re(n,e){return window.go.main.App.ToggleSubscription(n,e)}function Fe(n){return window.go.main.App.UpdateSettings(n)}function ze(n){return window.go.main.App.UpdateSubscription(n)}class qe{async getGroups(){console.log("[API] getGroups called");try{const e=await pe();return console.log("[API] getGroups result:",e),e||[]}catch(e){return console.error("[API] Failed to get groups:",e),[]}}async createGroup(e){console.log("[API] createGroup called with:",e);try{const t=await se(e);return console.log("[API] createGroup result:",t),t}catch(t){return console.error("[API] Failed to create group:",t),null}}async getGroupsPaginated(e,t){try{return await ge(e,t)||[]}catch(s){return console.error("[API] Failed to get groups paginated:",s),[]}}async getGroupCount(){try{return await he()}catch(e){return console.error("[API] Failed to get group count:",e),0}}async renameGroup(e,t){try{return await Ge(e,t),!0}catch(s){return console.error("Failed to rename group:",s),!1}}async deleteGroup(e){try{return await ie(e),!0}catch(t){return console.error("Failed to delete group:",t),!1}}async searchGroups(e,t,s){try{return await $e(e,t,s)||{groups:[],totalCount:0}}catch(r){return console.error("Failed to search groups:",r),{groups:[],totalCount:0}}}async getProxies(e,t=0,s=100){try{return await ve(e??0,t,s)||[]}catch(r){return console.error("Failed to get proxies:",r),[]}}async getProxyCount(e){try{return await be(e??0)}catch(t){return console.error("Failed to get proxy count:",t),0}}async getProxyIDs(e,t,s){try{return await we(e??0,t,s)||[]}catch(r){return console.error("Failed to get proxy IDs:",r),[]}}async searchProxies(e,t,s,r){try{return await Te(e??0,t,s,r)||{proxies:[],totalCount:0}}catch(i){return console.error("Failed to search proxies:",i),{proxies:[],totalCount:0}}}async getProxyDetails(e){try{return await Se(e)}catch(t){return console.error("Failed to get proxy details:",t),null}}async addProxy(e,t){try{return await J(e,t),!0}catch(s){return console.error("Failed to add proxy:",s),!1}}async addProxies(e,t){try{return await Y(e,t)}catch(s){return console.error("Failed to add proxies:",s),0}}async deleteProxy(e){try{return await ae(e),!0}catch(t){return console.error("Failed to delete proxy:",t),!1}}async deleteProxies(e){try{return await oe(e),!0}catch(t){return console.error("Failed to delete proxies:",t),!1}}async moveToGroup(e,t){try{return await Ee(e,t),!0}catch(s){return console.error("Failed to move proxy:",s),!1}}async moveProxiesToGroup(e,t){try{return await Me(e,t),!0}catch(s){return console.error("Failed to move proxies:",s),!1}}async activateProxy(e){try{return await X(e),!0}catch(t){return console.error("Failed to activate proxy:",t),!1}}async deactivateProxy(){try{return await re(),!0}catch(e){return console.error("Failed to deactivate proxy:",e),!1}}async getActiveProxy(){try{return await ce()}catch(e){return console.error("Failed to get active proxy:",e),null}}async setSystemProxy(){try{return await He(),!0}catch(e){return console.error("Failed to set system proxy:",e),!1}}async clearSystemProxy(){try{return await ee(),!0}catch(e){return console.error("Failed to clear system proxy:",e),!1}}async isSystemProxySet(){try{return await Le()}catch(e){return console.error("Failed to check system proxy:",e),!1}}async getSubscriptions(){try{return await Ae()||[]}catch(e){return console.error("Failed to get subscriptions:",e),[]}}async addSubscription(e,t){try{return await Z(e,t),!0}catch(s){return console.error("Failed to add subscription:",s),!1}}async deleteSubscription(e){try{return await le(e),!0}catch(t){return console.error("Failed to delete subscription:",t),!1}}async updateSubscription(e){try{return await ze(e),!0}catch(t){return console.error("Failed to update subscription:",t),!1}}async toggleSubscription(e,t){try{return await Re(e,t),!0}catch(s){return console.error("Failed to toggle subscription:",s),!1}}async getSettings(){try{return await Pe()}catch(e){return console.error("Failed to get settings:",e),null}}async updateSettings(e){try{return await Fe(e),!0}catch(t){return console.error("Failed to update settings:",t),!1}}async getListenAddress(){try{return await ye()}catch(e){return console.error("Failed to get listen address:",e),"127.0.0.1:1080"}}async setListenAddress(e){try{return await De(e),!0}catch(t){return console.error("Failed to set listen address:",t),!1}}async getProxyStats(e){try{return await Ce(e)}catch(t){return console.error("Failed to get proxy stats:",t),null}}async getPingHistory(e,t=50){try{return await xe(e,t)||[]}catch(s){return console.error("Failed to get ping history:",s),[]}}async getSpeedHistory(e,t=50){try{return await Ie(e,t)||[]}catch(s){return console.error("Failed to get speed history:",s),[]}}async getHealthStats(e){try{return await me(e)}catch(t){return console.error("Failed to get health stats:",t),null}}async getDeadProxyCount(){try{return await ue()}catch(e){return console.error("Failed to get dead proxy count:",e),0}}async deleteDeadProxies(){try{return await ne()}catch(e){return console.error("Failed to delete dead proxies:",e),0}}async getMeasurementCounts(){try{return await fe()}catch(e){return console.error("Failed to get measurement counts:",e),null}}async copyToClipboard(e){try{return await te(e),!0}catch(t){return console.error("Failed to copy to clipboard:",t),!1}}async getClipboard(){try{return await de()}catch(e){return console.error("Failed to get clipboard:",e),""}}async parseClipboard(){try{return await ke()}catch(e){return console.error("Failed to parse clipboard:",e),{links:[],subscriptionUrl:""}}}}const p=new qe;class Oe{constructor(){h(this,"state",{groups:[],proxies:[],selectedGroupId:null,selectedIndexRanges:[],selectedProxyIds:new Set,activeProxy:null,isSystemProxySet:!1,listenAddress:"127.0.0.1:1080",lastSelectedIndex:null});h(this,"listeners",[])}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e())}setGroups(e){this.state.groups=e,this.notify()}getGroups(){return this.state.groups}setSelectedGroup(e){this.state.selectedGroupId=e,this.clearSelection()}getSelectedGroup(){return this.state.selectedGroupId}setProxies(e){this.state.proxies=e,this.notify()}getProxies(){return this.state.proxies}selectIndex(e,t=!1){t||(this.state.selectedIndexRanges=[],this.state.selectedProxyIds.clear()),this.addIndexToSelection(e),this.state.lastSelectedIndex=e,this.notify()}selectIndexRange(e,t,s=!1){s||(this.state.selectedIndexRanges=[],this.state.selectedProxyIds.clear());const r=Math.min(e,t),i=Math.max(e,t);this.state.selectedIndexRanges.push({start:r,end:i}),this.mergeRanges(),this.state.lastSelectedIndex=t,this.notify()}toggleIndexSelection(e){this.isIndexSelected(e)?this.removeIndexFromSelection(e):this.addIndexToSelection(e),this.state.lastSelectedIndex=e,this.notify()}addIndexToSelection(e){this.state.selectedIndexRanges.push({start:e,end:e}),this.mergeRanges()}removeIndexFromSelection(e){const t=[];for(const s of this.state.selectedIndexRanges)if(e<s.start||e>s.end)t.push(s);else{if(e===s.start&&e===s.end)continue;e===s.start?t.push({start:s.start+1,end:s.end}):e===s.end?t.push({start:s.start,end:s.end-1}):(t.push({start:s.start,end:e-1}),t.push({start:e+1,end:s.end}))}this.state.selectedIndexRanges=t}mergeRanges(){if(this.state.selectedIndexRanges.length<=1)return;this.state.selectedIndexRanges.sort((s,r)=>s.start-r.start);const e=[];let t=this.state.selectedIndexRanges[0];for(let s=1;s<this.state.selectedIndexRanges.length;s++){const r=this.state.selectedIndexRanges[s];r.start<=t.end+1?t={start:t.start,end:Math.max(t.end,r.end)}:(e.push(t),t=r)}e.push(t),this.state.selectedIndexRanges=e}isIndexSelected(e){return this.state.selectedIndexRanges.some(t=>e>=t.start&&e<=t.end)}getSelectedIndexCount(){return this.state.selectedIndexRanges.reduce((e,t)=>e+(t.end-t.start+1),0)}getSelectedIndexRanges(){return[...this.state.selectedIndexRanges]}getLastSelectedIndex(){return this.state.lastSelectedIndex}selectAllIndices(e){e>0&&(this.state.selectedIndexRanges=[{start:0,end:e-1}]),this.notify()}clearSelection(){this.state.selectedIndexRanges=[],this.state.selectedProxyIds.clear(),this.state.lastSelectedIndex=null,this.notify()}addProxyIdToSelection(e){this.state.selectedProxyIds.add(e)}getSelectedProxyIds(){return Array.from(this.state.selectedProxyIds)}setSelectedProxyIds(e){this.state.selectedProxyIds=new Set(e),this.notify()}selectProxy(e,t=!1){t||this.state.selectedProxyIds.clear(),this.state.selectedProxyIds.add(e),this.notify()}toggleProxySelection(e){this.state.selectedProxyIds.has(e)?this.state.selectedProxyIds.delete(e):this.state.selectedProxyIds.add(e),this.notify()}isProxySelected(e){return this.state.selectedProxyIds.has(e)}selectAllProxies(){this.state.selectedProxyIds=new Set(this.state.proxies.map(e=>e.id)),this.notify()}deselectProxy(e){this.state.selectedProxyIds.delete(e),this.notify()}setActiveProxy(e){this.state.activeProxy=e,this.notify()}getActiveProxy(){return this.state.activeProxy}setSystemProxySet(e){this.state.isSystemProxySet=e,this.notify()}isSystemProxySet(){return this.state.isSystemProxySet}setListenAddress(e){this.state.listenAddress=e,this.notify()}getListenAddress(){return this.state.listenAddress}}const f=new Oe;function A(n,e,t){let s=t.initialDeps??[],r,i=!0;function o(){var a,l,c;let d;t.key&&((a=t.debug)!=null&&a.call(t))&&(d=Date.now());const g=n();if(!(g.length!==s.length||g.some((b,y)=>s[y]!==b)))return r;s=g;let x;if(t.key&&((l=t.debug)!=null&&l.call(t))&&(x=Date.now()),r=e(...g),t.key&&((c=t.debug)!=null&&c.call(t))){const b=Math.round((Date.now()-d)*100)/100,y=Math.round((Date.now()-x)*100)/100,S=y/16,w=(v,C)=>{for(v=String(v);v.length<C;)v=" "+v;return v};console.info(`%c⏱ ${w(y,5)} /${w(b,5)} ms`,`
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0,Math.min(120-120*S,120))}deg 100% 31%);`,t==null?void 0:t.key)}return t!=null&&t.onChange&&!(i&&t.skipInitialOnChange)&&t.onChange(r),i=!1,r}return o.updateDeps=a=>{s=a},o}function G(n,e){if(n===void 0)throw new Error("Unexpected undefined");return n}const je=(n,e)=>Math.abs(n-e)<1.01,Ne=(n,e,t)=>{let s;return function(...r){n.clearTimeout(s),s=n.setTimeout(()=>e.apply(this,r),t)}},$=n=>{const{offsetWidth:e,offsetHeight:t}=n;return{width:e,height:t}},Be=n=>n,Ve=n=>{const e=Math.max(n.startIndex-n.overscan,0),t=Math.min(n.endIndex+n.overscan,n.count-1),s=[];for(let r=e;r<=t;r++)s.push(r);return s},T=(n,e)=>{const t=n.scrollElement;if(!t)return;const s=n.targetWindow;if(!s)return;const r=o=>{const{width:a,height:l}=o;e({width:Math.round(a),height:Math.round(l)})};if(r($(t)),!s.ResizeObserver)return()=>{};const i=new s.ResizeObserver(o=>{const a=()=>{const l=o[0];if(l!=null&&l.borderBoxSize){const c=l.borderBoxSize[0];if(c){r({width:c.inlineSize,height:c.blockSize});return}}r($(t))};n.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(a):a()});return i.observe(t,{box:"border-box"}),()=>{i.unobserve(t)}},D={passive:!0},H=typeof window>"u"?!0:"onscrollend"in window,R=(n,e)=>{const t=n.scrollElement;if(!t)return;const s=n.targetWindow;if(!s)return;let r=0;const i=n.options.useScrollendEvent&&H?()=>{}:Ne(s,()=>{e(r,!1)},n.options.isScrollingResetDelay),o=d=>()=>{const{horizontal:g,isRtl:u}=n.options;r=g?t.scrollLeft*(u&&-1||1):t.scrollTop,i(),e(r,d)},a=o(!0),l=o(!1);t.addEventListener("scroll",a,D);const c=n.options.useScrollendEvent&&H;return c&&t.addEventListener("scrollend",l,D),()=>{t.removeEventListener("scroll",a),c&&t.removeEventListener("scrollend",l)}},Ue=(n,e,t)=>{if(e!=null&&e.borderBoxSize){const s=e.borderBoxSize[0];if(s)return Math.round(s[t.options.horizontal?"inlineSize":"blockSize"])}return n[t.options.horizontal?"offsetWidth":"offsetHeight"]},F=(n,{adjustments:e=0,behavior:t},s)=>{var r,i;const o=n+e;(i=(r=s.scrollElement)==null?void 0:r.scrollTo)==null||i.call(r,{[s.options.horizontal?"left":"top"]:o,behavior:t})};class We{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.currentScrollToIndex=null,this.measurementsCache=[],this.itemSizeCache=new Map,this.laneAssignments=new Map,this.pendingMeasuredCacheIndexes=[],this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this.elementsCache=new Map,this.observer=(()=>{let t=null;const s=()=>t||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:t=new this.targetWindow.ResizeObserver(r=>{r.forEach(i=>{const o=()=>{this._measureElement(i.target,i)};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(o):o()})}));return{disconnect:()=>{var r;(r=s())==null||r.disconnect(),t=null},observe:r=>{var i;return(i=s())==null?void 0:i.observe(r,{box:"border-box"})},unobserve:r=>{var i;return(i=s())==null?void 0:i.unobserve(r)}}})(),this.range=null,this.setOptions=t=>{Object.entries(t).forEach(([s,r])=>{typeof r>"u"&&delete t[s]}),this.options={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:Be,rangeExtractor:Ve,onChange:()=>{},measureElement:Ue,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,...t}},this.notify=t=>{var s,r;(r=(s=this.options).onChange)==null||r.call(s,this,t)},this.maybeNotify=A(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),t=>{this.notify(t)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(t=>t()),this.unsubs=[],this.observer.disconnect(),this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var t;const s=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==s){if(this.cleanup(),!s){this.maybeNotify();return}this.scrollElement=s,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((t=this.scrollElement)==null?void 0:t.window)??null,this.elementsCache.forEach(r=>{this.observer.observe(r)}),this.unsubs.push(this.options.observeElementRect(this,r=>{this.scrollRect=r,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(r,i)=>{this.scrollAdjustments=0,this.scrollDirection=i?this.getScrollOffset()<r?"forward":"backward":null,this.scrollOffset=r,this.isScrolling=i,this.maybeNotify()})),this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}},this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(t,s)=>{const r=new Map,i=new Map;for(let o=s-1;o>=0;o--){const a=t[o];if(r.has(a.lane))continue;const l=i.get(a.lane);if(l==null||a.end>l.end?i.set(a.lane,a):a.end<l.end&&r.set(a.lane,!0),r.size===this.options.lanes)break}return i.size===this.options.lanes?Array.from(i.values()).sort((o,a)=>o.end===a.end?o.index-a.index:o.end-a.end)[0]:void 0},this.getMeasurementOptions=A(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes],(t,s,r,i,o,a)=>(this.prevLanes!==void 0&&this.prevLanes!==a&&(this.lanesChangedFlag=!0),this.prevLanes=a,this.pendingMeasuredCacheIndexes=[],{count:t,paddingStart:s,scrollMargin:r,getItemKey:i,enabled:o,lanes:a}),{key:!1}),this.getMeasurements=A(()=>[this.getMeasurementOptions(),this.itemSizeCache],({count:t,paddingStart:s,scrollMargin:r,getItemKey:i,enabled:o,lanes:a},l)=>{if(!o)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>t)for(const u of this.laneAssignments.keys())u>=t&&this.laneAssignments.delete(u);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMeasuredCacheIndexes=[]),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(u=>{this.itemSizeCache.set(u.key,u.size)}));const c=this.lanesSettling?0:this.pendingMeasuredCacheIndexes.length>0?Math.min(...this.pendingMeasuredCacheIndexes):0;this.pendingMeasuredCacheIndexes=[],this.lanesSettling&&this.measurementsCache.length===t&&(this.lanesSettling=!1);const d=this.measurementsCache.slice(0,c),g=new Array(a).fill(void 0);for(let u=0;u<c;u++){const x=d[u];x&&(g[x.lane]=u)}for(let u=c;u<t;u++){const x=i(u),b=this.laneAssignments.get(u);let y,S;if(b!==void 0&&this.options.lanes>1){y=b;const m=g[y],I=m!==void 0?d[m]:void 0;S=I?I.end+this.options.gap:s+r}else{const m=this.options.lanes===1?d[u-1]:this.getFurthestMeasurement(d,u);S=m?m.end+this.options.gap:s+r,y=m?m.lane:u%this.options.lanes,this.options.lanes>1&&this.laneAssignments.set(u,y)}const w=l.get(x),v=typeof w=="number"?w:this.options.estimateSize(u),C=S+v;d[u]={index:u,start:S,size:v,end:C,key:x,lane:y},g[y]=u}return this.measurementsCache=d,d},{key:!1,debug:()=>this.options.debug}),this.calculateRange=A(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(t,s,r,i)=>this.range=t.length>0&&s>0?_e({measurements:t,outerSize:s,scrollOffset:r,lanes:i}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=A(()=>{let t=null,s=null;const r=this.calculateRange();return r&&(t=r.startIndex,s=r.endIndex),this.maybeNotify.updateDeps([this.isScrolling,t,s]),[this.options.rangeExtractor,this.options.overscan,this.options.count,t,s]},(t,s,r,i,o)=>i===null||o===null?[]:t({startIndex:i,endIndex:o,overscan:s,count:r}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=t=>{const s=this.options.indexAttribute,r=t.getAttribute(s);return r?parseInt(r,10):(console.warn(`Missing attribute name '${s}={index}' on measured element.`),-1)},this._measureElement=(t,s)=>{const r=this.indexFromElement(t),i=this.measurementsCache[r];if(!i)return;const o=i.key,a=this.elementsCache.get(o);a!==t&&(a&&this.observer.unobserve(a),this.observer.observe(t),this.elementsCache.set(o,t)),t.isConnected&&this.resizeItem(r,this.options.measureElement(t,s,this))},this.resizeItem=(t,s)=>{const r=this.measurementsCache[t];if(!r)return;const i=this.itemSizeCache.get(r.key)??r.size,o=s-i;o!==0&&((this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(r,o,this):r.start<this.getScrollOffset()+this.scrollAdjustments)&&this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=o,behavior:void 0}),this.pendingMeasuredCacheIndexes.push(r.index),this.itemSizeCache=new Map(this.itemSizeCache.set(r.key,s)),this.notify(!1))},this.measureElement=t=>{if(!t){this.elementsCache.forEach((s,r)=>{s.isConnected||(this.observer.unobserve(s),this.elementsCache.delete(r))});return}this._measureElement(t,void 0)},this.getVirtualItems=A(()=>[this.getVirtualIndexes(),this.getMeasurements()],(t,s)=>{const r=[];for(let i=0,o=t.length;i<o;i++){const a=t[i],l=s[a];r.push(l)}return r},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=t=>{const s=this.getMeasurements();if(s.length!==0)return G(s[N(0,s.length-1,r=>G(s[r]).start,t)])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{const t=this.scrollElement.document.documentElement;return this.options.horizontal?t.scrollWidth-this.scrollElement.innerWidth:t.scrollHeight-this.scrollElement.innerHeight}},this.getOffsetForAlignment=(t,s,r=0)=>{if(!this.scrollElement)return 0;const i=this.getSize(),o=this.getScrollOffset();s==="auto"&&(s=t>=o+i?"end":"start"),s==="center"?t+=(r-i)/2:s==="end"&&(t-=i);const a=this.getMaxScrollOffset();return Math.max(Math.min(a,t),0)},this.getOffsetForIndex=(t,s="auto")=>{t=Math.max(0,Math.min(t,this.options.count-1));const r=this.measurementsCache[t];if(!r)return;const i=this.getSize(),o=this.getScrollOffset();if(s==="auto")if(r.end>=o+i-this.options.scrollPaddingEnd)s="end";else if(r.start<=o+this.options.scrollPaddingStart)s="start";else return[o,s];if(s==="end"&&t===this.options.count-1)return[this.getMaxScrollOffset(),s];const a=s==="end"?r.end+this.options.scrollPaddingEnd:r.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(a,s,r.size),s]},this.isDynamicMode=()=>this.elementsCache.size>0,this.scrollToOffset=(t,{align:s="start",behavior:r}={})=>{r==="smooth"&&this.isDynamicMode()&&console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),this._scrollToOffset(this.getOffsetForAlignment(t,s),{adjustments:void 0,behavior:r})},this.scrollToIndex=(t,{align:s="auto",behavior:r}={})=>{r==="smooth"&&this.isDynamicMode()&&console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),t=Math.max(0,Math.min(t,this.options.count-1)),this.currentScrollToIndex=t;let i=0;const o=10,a=c=>{if(!this.targetWindow)return;const d=this.getOffsetForIndex(t,c);if(!d){console.warn("Failed to get offset for index:",t);return}const[g,u]=d;this._scrollToOffset(g,{adjustments:void 0,behavior:r}),this.targetWindow.requestAnimationFrame(()=>{const x=()=>{if(this.currentScrollToIndex!==t)return;const b=this.getScrollOffset(),y=this.getOffsetForIndex(t,u);if(!y){console.warn("Failed to get offset for index:",t);return}je(y[0],b)||l(u)};this.isDynamicMode()?this.targetWindow.requestAnimationFrame(x):x()})},l=c=>{this.targetWindow&&this.currentScrollToIndex===t&&(i++,i<o?this.targetWindow.requestAnimationFrame(()=>a(c)):console.warn(`Failed to scroll to index ${t} after ${o} attempts.`))};a(s)},this.scrollBy=(t,{behavior:s}={})=>{s==="smooth"&&this.isDynamicMode()&&console.warn("The `smooth` scroll behavior is not fully supported with dynamic size."),this._scrollToOffset(this.getScrollOffset()+t,{adjustments:void 0,behavior:s})},this.getTotalSize=()=>{var t;const s=this.getMeasurements();let r;if(s.length===0)r=this.options.paddingStart;else if(this.options.lanes===1)r=((t=s[s.length-1])==null?void 0:t.end)??0;else{const i=Array(this.options.lanes).fill(null);let o=s.length-1;for(;o>=0&&i.some(a=>a===null);){const a=s[o];i[a.lane]===null&&(i[a.lane]=a.end),o--}r=Math.max(...i.filter(a=>a!==null))}return Math.max(r-this.options.scrollMargin+this.options.paddingEnd,0)},this._scrollToOffset=(t,{adjustments:s,behavior:r})=>{this.options.scrollToFn(t,{behavior:r,adjustments:s},this)},this.measure=()=>{this.itemSizeCache=new Map,this.laneAssignments=new Map,this.notify(!1)},this.setOptions(e)}}const N=(n,e,t,s)=>{for(;n<=e;){const r=(n+e)/2|0,i=t(r);if(i<s)n=r+1;else if(i>s)e=r-1;else return r}return n>0?n-1:0};function _e({measurements:n,outerSize:e,scrollOffset:t,lanes:s}){const r=n.length-1,i=l=>n[l].start;if(n.length<=s)return{startIndex:0,endIndex:r};let o=N(0,r,i,t),a=o;if(s===1)for(;a<r&&n[a].end<t+e;)a++;else if(s>1){const l=Array(s).fill(0);for(;a<r&&l.some(d=>d<t+e);){const d=n[a];l[d.lane]=d.end,a++}const c=Array(s).fill(t+e);for(;o>=0&&c.some(d=>d>=t);){const d=n[o];c[d.lane]=d.start,o--}o=Math.max(0,o-o%s),a=Math.min(r,a+(s-1-a%s))}return{startIndex:o,endIndex:a}}class E{constructor(e){h(this,"config");h(this,"items",new Map);h(this,"scrollContainer",null);h(this,"contentContainer",null);h(this,"virtualizer",null);h(this,"pendingFetches",new Set);h(this,"isDestroyed",!1);this.config=e,this.init()}init(){const{container:e,rowHeight:t,totalCount:s}=this.config;e.innerHTML=`
      <div class="virtual-scroll-container" style="height: 100%; overflow-y: auto;">
        <div class="virtual-scroll-content" style="position: relative; width: 100%;"></div>
      </div>
    `,this.scrollContainer=e.querySelector(".virtual-scroll-container"),this.contentContainer=e.querySelector(".virtual-scroll-content"),!(!this.scrollContainer||!this.contentContainer)&&(this.virtualizer=new We({count:s,getScrollElement:()=>this.scrollContainer,estimateSize:()=>t,overscan:this.config.overscan,observeElementRect:T,observeElementOffset:R,scrollToFn:F,onChange:()=>this.render()}),this.virtualizer._didMount(),requestAnimationFrame(()=>{var r;(r=this.virtualizer)==null||r._willUpdate(),this.render()}))}render(){if(this.isDestroyed||!this.virtualizer||!this.contentContainer)return;const e=this.virtualizer.getVirtualItems(),t=this.virtualizer.getTotalSize();this.contentContainer.style.height=`${t}px`;const s=[];for(const i of e)!this.items.has(i.index)&&!this.pendingFetches.has(i.index)&&s.push(i.index);s.length>0&&this.fetchItems(s);const r=e.map(i=>{const o=this.items.get(i.index),a=o?this.config.renderRow(o,i.index):this.config.renderPlaceholder(i.index);return`
        <div class="virtual-row"
             style="position: absolute; top: 0; left: 0; right: 0; height: ${i.size}px; transform: translateY(${i.start}px);"
             data-index="${i.index}">
          ${a}
        </div>
      `});this.contentContainer.innerHTML=r.join(""),this.evictDistantItems(e)}async fetchItems(e){if(e.length===0||this.isDestroyed)return;e.sort((i,o)=>i-o);const t=[];let s=e[0],r=1;for(let i=1;i<e.length;i++)e[i]===e[i-1]+1?r++:(t.push({start:s,count:r}),s=e[i],r=1);t.push({start:s,count:r});for(const i of t){for(let o=i.start;o<i.start+i.count;o++)this.pendingFetches.add(o);try{const o=await this.config.fetchData(i.start,i.count);if(this.isDestroyed)return;o.forEach((a,l)=>{this.items.set(i.start+l,a)}),this.render()}catch(o){console.error(`Failed to fetch items ${i.start}-${i.start+i.count}:`,o)}finally{for(let o=i.start;o<i.start+i.count;o++)this.pendingFetches.delete(o)}}}evictDistantItems(e){const t=e.length*3;if(this.items.size<=t)return;const s=new Set(e.map(l=>l.index)),r=Math.min(...s),i=Math.max(...s),o=[];for(const l of this.items.keys())if(!s.has(l)){const c=l<r?r-l:l-i;o.push({index:l,distance:c})}o.sort((l,c)=>c.distance-l.distance);const a=this.items.size-t;for(let l=0;l<a&&l<o.length;l++)this.items.delete(o[l].index)}getItem(e){return this.items.get(e)}getItemById(e){for(const t of this.items.values())if(t.id===e)return t}getCachedItems(){return Array.from(this.items.values())}updateTotalCount(e){this.config.totalCount=e,this.virtualizer&&this.scrollContainer&&this.virtualizer.setOptions({count:e,getScrollElement:()=>this.scrollContainer,estimateSize:()=>this.config.rowHeight,overscan:this.config.overscan,observeElementRect:T,observeElementOffset:R,scrollToFn:F})}async invalidate(){this.items.clear(),this.pendingFetches.clear(),this.render()}forceRender(){this.render()}scrollToIndex(e){var t;(t=this.virtualizer)==null||t.scrollToIndex(e)}getScrollContainer(){return this.scrollContainer}getContentContainer(){return this.contentContainer}getMemoryStats(){return{itemsInMemory:this.items.size}}destroy(){this.isDestroyed=!0,this.items.clear(),this.pendingFetches.clear(),this.virtualizer=null}}class k{constructor(e){h(this,"container");h(this,"input");h(this,"clearBtn");h(this,"debounceTimer",null);h(this,"config");this.config={placeholder:e.placeholder??"Search...",debounceMs:e.debounceMs??150,onSearch:e.onSearch,onClear:e.onClear??(()=>{})},this.container=document.createElement("div"),this.render()}render(){this.container.className="relative",this.container.innerHTML=`
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text"
               class="input pl-8 pr-8 py-1.5 text-sm w-full"
               placeholder="${this.config.placeholder}">
        <button type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hidden"
                title="Clear">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `,this.input=this.container.querySelector("input"),this.clearBtn=this.container.querySelector("button"),this.attachListeners()}attachListeners(){this.input.addEventListener("input",()=>{this.updateClearButton(),this.debouncedSearch()}),this.input.addEventListener("keydown",e=>{e.key==="Escape"?(this.clear(),this.input.blur()):e.key==="Enter"&&(this.debounceTimer!==null&&(clearTimeout(this.debounceTimer),this.debounceTimer=null),this.config.onSearch(this.input.value.trim()))}),this.clearBtn.addEventListener("click",()=>{this.clear(),this.input.focus()})}updateClearButton(){this.input.value.length>0?this.clearBtn.classList.remove("hidden"):this.clearBtn.classList.add("hidden")}debouncedSearch(){this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=window.setTimeout(()=>{this.debounceTimer=null,this.config.onSearch(this.input.value.trim())},this.config.debounceMs)}getElement(){return this.container}focus(){this.input.focus()}clear(){this.input.value="",this.updateClearButton(),this.debounceTimer!==null&&(clearTimeout(this.debounceTimer),this.debounceTimer=null),this.config.onSearch(""),this.config.onClear()}getValue(){return this.input.value.trim()}destroy(){this.debounceTimer!==null&&clearTimeout(this.debounceTimer)}}class Qe{constructor(){h(this,"overlay");h(this,"modal");h(this,"onClose");this.overlay=document.createElement("div"),this.overlay.className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",this.overlay.addEventListener("click",t=>{t.target===this.overlay&&this.close()}),this.modal=document.createElement("div"),this.modal.className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden",this.overlay.appendChild(this.modal);const e=t=>{t.key==="Escape"&&(this.close(),document.removeEventListener("keydown",e))};document.addEventListener("keydown",e)}setContent(e){this.modal.innerHTML=e}setOnClose(e){this.onClose=e}show(){document.body.appendChild(this.overlay)}close(e=!0){var t;this.overlay.remove(),e&&((t=this.onClose)==null||t.call(this))}getElement(){return this.modal}}function P(n){const e=new Qe;return e.setContent(n),e.show(),e}function Ke(){return new Promise(n=>{const e=P(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Group</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input type="text" id="group-name" class="input" placeholder="Enter group name" autofocus>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `),t=e.getElement().querySelector("#group-name"),s=e.getElement().querySelector("#add-btn"),r=e.getElement().querySelector("#cancel-btn"),i=()=>{const o=t.value.trim();o&&(e.close(!1),n(o))};s.addEventListener("click",i),r.addEventListener("click",()=>{e.close(),n(null)}),t.addEventListener("keydown",o=>{o.key==="Enter"&&i()}),e.setOnClose(()=>n(null)),setTimeout(()=>t.focus(),100)})}function M(n,e){return new Promise(t=>{const s=P(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">${z(n)}</h2>
        <p class="text-gray-600 mb-6 whitespace-pre-wrap">${z(e)}</p>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="confirm-btn" class="btn btn-danger">Confirm</button>
        </div>
      </div>
    `),r=s.getElement().querySelector("#confirm-btn"),i=s.getElement().querySelector("#cancel-btn");r.addEventListener("click",()=>{s.close(!1),t(!0)}),i.addEventListener("click",()=>{s.close(!1),t(!1)}),s.setOnClose(()=>t(!1))})}function z(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}const Xe=40,Ye=3;class Je{constructor(e){h(this,"container");h(this,"totalProxyCount",0);h(this,"totalGroupCount",0);h(this,"virtualScroller",null);h(this,"searchInput",null);h(this,"currentSearchQuery","");h(this,"onGroupSelected");this.container=e,this.render()}async loadGroups(){this.totalProxyCount=await p.getProxyCount(null),this.totalGroupCount=await p.getGroupCount(),this.currentSearchQuery="";const e=await p.getGroups();f.setGroups(e),this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),this.render()}render(){var s,r;const e=f.getSelectedGroup(),t=((r=(s=this.virtualScroller)==null?void 0:s.getScrollContainer())==null?void 0:r.scrollTop)??0;this.container.innerHTML=`
      <div class="flex flex-col h-full">
        <div class="p-3 border-b border-gray-200">
          <h2 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Groups</h2>
          <div id="group-search-container"></div>
        </div>

        <!-- All Proxies item (always visible) -->
        <div class="p-2 pb-0">
          <div class="group-item ${e===null?"bg-primary-50 border-primary-200":"hover:bg-gray-50"}
                      rounded-lg border border-transparent px-3 py-2 cursor-pointer"
               data-group-id="all">
            <div class="flex items-center justify-between">
              <span class="font-medium ${e===null?"text-primary-700":"text-gray-700"}">All Proxies</span>
              <span class="text-xs ${e===null?"text-primary-600":"text-gray-500"} bg-gray-100 px-2 py-0.5 rounded-full">
                ${this.totalProxyCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <!-- Virtual scrolling group list -->
        <div id="group-scroll" class="flex-1 overflow-hidden px-2">
          ${this.totalGroupCount===0?`
            <div class="text-center text-gray-400 text-sm py-4">${this.currentSearchQuery?"No groups match":"No groups yet"}</div>
          `:""}
        </div>

        <div class="p-3 border-t border-gray-200">
          <button id="add-group-btn" class="w-full btn btn-secondary flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Group
          </button>
        </div>
      </div>
    `,this.initSearch(),this.attachHeaderListeners(),this.totalGroupCount>0&&(this.initVirtualScroller(),t>0&&requestAnimationFrame(()=>{var o;const i=(o=this.virtualScroller)==null?void 0:o.getScrollContainer();i&&(i.scrollTop=t)}))}initSearch(){const e=this.container.querySelector("#group-search-container");e&&(this.searchInput=new k({placeholder:"Search groups...",debounceMs:150,onSearch:t=>this.handleSearch(t)}),e.appendChild(this.searchInput.getElement()))}async handleSearch(e){if(this.currentSearchQuery=e,this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),e){const s=await p.searchGroups(e,0,1);this.totalGroupCount=s.totalCount}else this.totalGroupCount=await p.getGroupCount();const t=this.container.querySelector("#group-scroll");t&&(this.totalGroupCount===0?t.innerHTML=`
          <div class="text-center text-gray-400 text-sm py-4">${e?"No groups match":"No groups yet"}</div>
        `:(t.innerHTML="",this.initVirtualScroller()))}initVirtualScroller(){const e=this.container.querySelector("#group-scroll");!e||this.totalGroupCount===0||(this.virtualScroller=new E({container:e,rowHeight:Xe,overscan:Ye,totalCount:this.totalGroupCount,fetchData:async(t,s)=>this.currentSearchQuery?(await p.searchGroups(this.currentSearchQuery,t,s)).groups:await p.getGroupsPaginated(t,s),renderRow:t=>this.renderGroupItem(t),renderPlaceholder:()=>this.renderPlaceholderItem()}),this.attachGroupListeners())}renderGroupItem(e){const s=f.getSelectedGroup()===e.id;return`
      <div class="group-item ${s?"bg-primary-50 border-primary-200":"hover:bg-gray-50"}
                  rounded-lg border border-transparent px-3 py-2 cursor-pointer group relative h-full"
           data-group-id="${e.id}">
        <div class="flex items-center justify-between h-full">
          <span class="font-medium ${s?"text-primary-700":"text-gray-700"} truncate pr-2">
            ${this.escapeHtml(e.name)}
          </span>
          <div class="flex items-center gap-1">
            <span class="text-xs ${s?"text-primary-600":"text-gray-500"} bg-gray-100 px-2 py-0.5 rounded-full">
              ${e.proxyCount}
            </span>
            <div class="hidden group-hover:flex items-center gap-1">
              <button class="edit-group p-1 text-gray-400 hover:text-primary-600 rounded" title="Rename">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="delete-group p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `}renderPlaceholderItem(){return`
      <div class="rounded-lg px-3 py-2 h-full animate-pulse">
        <div class="flex items-center justify-between h-full">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-5 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    `}attachHeaderListeners(){var e,t;(e=this.container.querySelector('[data-group-id="all"]'))==null||e.addEventListener("click",()=>{var s;(s=this.onGroupSelected)==null||s.call(this,null),this.updateAllProxiesSelectionUI()}),(t=this.container.querySelector("#add-group-btn"))==null||t.addEventListener("click",async()=>{const s=await Ke();s&&(await p.createGroup(s),await this.loadGroups())})}attachGroupListeners(){if(!this.virtualScroller)return;const e=this.virtualScroller.getContentContainer();e&&e.addEventListener("click",async t=>{var a;const s=t.target,r=s.closest(".group-item");if(!r)return;const i=r.getAttribute("data-group-id");if(!i||i==="all")return;const o=parseInt(i,10);if(s.closest(".edit-group")){t.stopPropagation(),await this.handleRename(o,r);return}if(s.closest(".delete-group")){t.stopPropagation(),await this.handleDelete(o,r);return}s.closest("button")||((a=this.onGroupSelected)==null||a.call(this,o),this.updateGroupSelectionUI(o))})}updateGroupSelectionUI(e){var r;const t=this.container.querySelector('[data-group-id="all"]');if(t){t.classList.remove("bg-primary-50","border-primary-200"),t.classList.add("hover:bg-gray-50");const i=t.querySelector("span.font-medium"),o=t.querySelector("span.text-xs");i&&(i.classList.remove("text-primary-700"),i.classList.add("text-gray-700")),o&&(o.classList.remove("text-primary-600"),o.classList.add("text-gray-500"))}const s=(r=this.virtualScroller)==null?void 0:r.getContentContainer();s&&s.querySelectorAll(".group-item").forEach(i=>{const a=parseInt(i.getAttribute("data-group-id")||"0",10)===e,l=i.querySelector("span.font-medium"),c=i.querySelector("span.text-xs");a?(i.classList.add("bg-primary-50","border-primary-200"),i.classList.remove("hover:bg-gray-50"),l&&(l.classList.add("text-primary-700"),l.classList.remove("text-gray-700")),c&&(c.classList.add("text-primary-600"),c.classList.remove("text-gray-500"))):(i.classList.remove("bg-primary-50","border-primary-200"),i.classList.add("hover:bg-gray-50"),l&&(l.classList.remove("text-primary-700"),l.classList.add("text-gray-700")),c&&(c.classList.remove("text-primary-600"),c.classList.add("text-gray-500")))})}updateAllProxiesSelectionUI(){var s;const e=this.container.querySelector('[data-group-id="all"]');if(e){e.classList.add("bg-primary-50","border-primary-200"),e.classList.remove("hover:bg-gray-50");const r=e.querySelector("span.font-medium"),i=e.querySelector("span.text-xs");r&&(r.classList.add("text-primary-700"),r.classList.remove("text-gray-700")),i&&(i.classList.add("text-primary-600"),i.classList.remove("text-gray-500"))}const t=(s=this.virtualScroller)==null?void 0:s.getContentContainer();t&&t.querySelectorAll(".group-item").forEach(r=>{const i=r.querySelector("span.font-medium"),o=r.querySelector("span.text-xs");r.classList.remove("bg-primary-50","border-primary-200"),r.classList.add("hover:bg-gray-50"),i&&(i.classList.remove("text-primary-700"),i.classList.add("text-gray-700")),o&&(o.classList.remove("text-primary-600"),o.classList.add("text-gray-500"))})}async handleRename(e,t){var o;const s=t.querySelector("span.font-medium"),r=((o=s==null?void 0:s.textContent)==null?void 0:o.trim())||"",i=prompt("Enter new group name:",r);i&&i!==r&&(await p.renameGroup(e,i),await this.loadGroups())}async handleDelete(e,t){var o,a;const s=t.querySelector("span.font-medium"),r=((o=s==null?void 0:s.textContent)==null?void 0:o.trim())||"this group";await M("Delete Group",`Are you sure you want to delete "${r}"? Proxies in this group will be moved to "No Group".`)&&(await p.deleteGroup(e),f.getSelectedGroup()===e&&((a=this.onGroupSelected)==null||a.call(this,null)),await this.loadGroups())}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}refresh(){this.loadGroups()}}function B(n){return n==null||n<0?"-":n<1?"<1ms":`${Math.round(n)}ms`}function V(n){return n==null||n<0?"-":n<1024?`${n.toFixed(0)} B/s`:n<1024*1024?`${(n/1024).toFixed(1)} KB/s`:`${(n/(1024*1024)).toFixed(2)} MB/s`}function U(n){return n==null||n<0?"-":`${Math.round(n*100)}%`}function q(n){if(!n)return"never";const e=new Date(n),s=new Date().getTime()-e.getTime(),r=Math.floor(s/1e3),i=Math.floor(r/60),o=Math.floor(i/60),a=Math.floor(o/24);return a>0?`${a}d ago`:o>0?`${o}h ago`:i>0?`${i}m ago`:"just now"}function Ze(n,e){return n.length<=e?n:n.slice(0,e-3)+"..."}function W(n){return{vless:"text-blue-600 bg-blue-50",vmess:"text-purple-600 bg-purple-50",ss:"text-green-600 bg-green-50",trojan:"text-red-600 bg-red-50",socks5:"text-orange-600 bg-orange-50",http:"text-gray-600 bg-gray-50",https:"text-gray-600 bg-gray-50"}[n.toLowerCase()]||"text-gray-600 bg-gray-50"}function et(n,e){return e?"text-green-500":n?"text-red-400":"text-gray-400"}function tt(){return new Promise(n=>{const e=P(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Proxies</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Proxy Links</label>
          <textarea id="proxy-links" class="input h-48 font-mono text-sm"
                    placeholder="Paste proxy links here (one per line)&#10;&#10;Supported formats:&#10;vless://...&#10;vmess://...&#10;ss://...&#10;trojan://...&#10;socks5://...&#10;http://host:port"></textarea>
          <p id="link-count" class="text-sm text-gray-500 mt-1">0 valid links detected</p>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `),t=e.getElement().querySelector("#proxy-links"),s=e.getElement().querySelector("#link-count"),r=e.getElement().querySelector("#add-btn"),i=e.getElement().querySelector("#cancel-btn"),o=["vless://","vmess://","ss://","trojan://","socks://","socks5://"],a=c=>{const d=c.toLowerCase();if(o.some(g=>d.startsWith(g)))return!0;if(d.startsWith("http://")||d.startsWith("https://"))try{const g=new URL(c);return g.port!==""&&(g.pathname===""||g.pathname==="/")}catch{return!1}return!1},l=()=>t.value.split(`
`).map(d=>d.trim()).filter(d=>d&&a(d));t.addEventListener("input",()=>{const c=l();s.textContent=`${c.length} valid link${c.length!==1?"s":""} detected`}),r.addEventListener("click",()=>{const c=l();c.length>0&&(e.close(!1),n(c))}),i.addEventListener("click",()=>{e.close(!1),n(null)}),e.setOnClose(()=>n(null)),setTimeout(()=>t.focus(),100)})}function st(){return new Promise(n=>{const e=P(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Subscription</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subscription URL</label>
            <input type="url" id="sub-url" class="input"
                   placeholder="https://example.com/subscription.txt" autofocus>
            <p class="text-sm text-gray-500 mt-1">URL to a subscription file containing proxy links</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
            <input type="text" id="sub-name" class="input" placeholder="My Subscription">
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `),t=e.getElement().querySelector("#sub-url"),s=e.getElement().querySelector("#sub-name"),r=e.getElement().querySelector("#add-btn"),i=e.getElement().querySelector("#cancel-btn"),o=l=>{try{const c=new URL(l);return c.protocol!=="http:"&&c.protocol!=="https:"?!1:c.pathname!==""&&c.pathname!=="/"}catch{return!1}},a=()=>{const l=t.value.trim(),c=s.value.trim();if(!o(l)){t.classList.add("border-red-500");return}e.close(!1),n({url:l,name:c})};t.addEventListener("input",()=>{t.classList.remove("border-red-500")}),r.addEventListener("click",a),i.addEventListener("click",()=>{e.close(!1),n(null)}),t.addEventListener("keydown",l=>{l.key==="Enter"&&a()}),e.setOnClose(()=>n(null)),setTimeout(()=>t.focus(),100)})}class O{constructor(e,t={}){h(this,"canvas");h(this,"ctx");h(this,"options");this.canvas=document.createElement("canvas"),e.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.options={width:t.width??400,height:t.height??200,padding:t.padding??40,lineColor:t.lineColor??"#0ea5e9",fillColor:t.fillColor??"rgba(14, 165, 233, 0.1)",gridColor:t.gridColor??"#e5e7eb",textColor:t.textColor??"#6b7280",showGrid:t.showGrid??!0,showPoints:t.showPoints??!1,yMin:t.yMin??0,yMax:t.yMax??100},this.canvas.width=this.options.width,this.canvas.height=this.options.height}draw(e){const{width:t,height:s,padding:r,lineColor:i,fillColor:o,gridColor:a,textColor:l,showGrid:c,showPoints:d,yMin:g}=this.options,u=this.ctx;if(u.clearRect(0,0,t,s),e.length===0){u.fillStyle=l,u.textAlign="center",u.font="14px sans-serif",u.fillText("No data",t/2,s/2);return}const x=t-r*2,b=s-r*2,y=Math.min(...e.map(m=>m.x)),S=Math.max(...e.map(m=>m.x)),w=Math.max(...e.map(m=>m.y),this.options.yMax),v=m=>r+(m-y)/(S-y||1)*x,C=m=>s-r-(m-g)/(w-g||1)*b;if(c){u.strokeStyle=a,u.lineWidth=1;for(let m=0;m<=4;m++){const I=r+b/4*m;u.beginPath(),u.moveTo(r,I),u.lineTo(t-r,I),u.stroke();const _=w-(w-g)/4*m;u.fillStyle=l,u.textAlign="right",u.font="10px sans-serif",u.fillText(this.formatValue(_),r-5,I+3)}}u.beginPath(),u.moveTo(v(e[0].x),C(e[0].y));for(let m=1;m<e.length;m++)u.lineTo(v(e[m].x),C(e[m].y));u.lineTo(v(e[e.length-1].x),s-r),u.lineTo(v(e[0].x),s-r),u.closePath(),u.fillStyle=o,u.fill(),u.beginPath(),u.moveTo(v(e[0].x),C(e[0].y));for(let m=1;m<e.length;m++)u.lineTo(v(e[m].x),C(e[m].y));if(u.strokeStyle=i,u.lineWidth=2,u.stroke(),d){u.fillStyle=i;for(const m of e)u.beginPath(),u.arc(v(m.x),C(m.y),3,0,Math.PI*2),u.fill()}}formatValue(e){return e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:e.toFixed(0)}resize(e,t){this.options.width=e,this.options.height=t,this.canvas.width=e,this.canvas.height=t}}class rt{constructor(e,t={}){h(this,"canvas");h(this,"ctx");h(this,"options");this.canvas=document.createElement("canvas"),e.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.options={width:t.width??400,height:t.height??200,padding:t.padding??40,lineColor:t.lineColor??"#0ea5e9",fillColor:t.fillColor??"#0ea5e9",gridColor:t.gridColor??"#e5e7eb",textColor:t.textColor??"#6b7280",showGrid:t.showGrid??!0,showPoints:t.showPoints??!1,yMin:t.yMin??0,yMax:t.yMax??100},this.canvas.width=this.options.width,this.canvas.height=this.options.height}draw(e){const{width:t,height:s,padding:r,gridColor:i,textColor:o,showGrid:a,yMin:l}=this.options,c=this.ctx;if(c.clearRect(0,0,t,s),e.length===0){c.fillStyle=o,c.textAlign="center",c.font="14px sans-serif",c.fillText("No data",t/2,s/2);return}const d=t-r*2,g=s-r*2,u=Math.max(...e.map(y=>y.value),this.options.yMax),x=d/e.length*.7,b=d/e.length*.3;if(a){c.strokeStyle=i,c.lineWidth=1;for(let y=0;y<=4;y++){const S=r+g/4*y;c.beginPath(),c.moveTo(r,S),c.lineTo(t-r,S),c.stroke()}}e.forEach((y,S)=>{const w=r+d/e.length*S+b/2,v=(y.value-l)/(u-l)*g,C=s-r-v;c.fillStyle=y.color||this.options.fillColor,c.fillRect(w,C,x,v),c.fillStyle=o,c.textAlign="center",c.font="10px sans-serif",c.fillText(y.label,w+x/2,s-r+15)})}}async function nt(n){var g,u,x;const e=await p.getProxyDetails(n);if(!e)return;const t=await p.getPingHistory(n,50),s=await p.getSpeedHistory(n,50),r=await p.getHealthStats(n),i=W(e.protocol),o=P(`
    <div class="p-6 max-h-[80vh] overflow-y-auto">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">${L(e.name||e.server)}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${i}">
              ${e.protocol}
            </span>
            <span class="text-sm text-gray-500">${L(e.server)}:${e.port}</span>
          </div>
        </div>
        <button id="close-btn" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Stats summary -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${B(e.avgLatency)}</div>
          <div class="text-xs text-gray-500">Avg Latency</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${V(e.avgSpeed)}</div>
          <div class="text-xs text-gray-500">Avg Speed</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold ${r&&r.successRate>.8?"text-green-600":r&&r.successRate>.5?"text-yellow-600":"text-red-600"}">
            ${r?U(r.successRate):"-"}
          </div>
          <div class="text-xs text-gray-500">Success Rate</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${e.totalRequests}</div>
          <div class="text-xs text-gray-500">Total Requests</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6 mb-6">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Latency History</h3>
          <div id="latency-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Speed History</h3>
          <div id="speed-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Health (Success/Fail)</h3>
          <div id="health-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
      </div>

      <!-- Details -->
      <div class="border-t border-gray-200 pt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Details</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">Group:</div>
          <div class="text-gray-900">${e.groupName?L(e.groupName):"No Group"}</div>
          <div class="text-gray-500">Subscription:</div>
          <div class="text-gray-900">${e.subscriptionName?L(e.subscriptionName):"Manual"}</div>
          <div class="text-gray-500">Created:</div>
          <div class="text-gray-900">${q(e.createdAt)}</div>
          <div class="text-gray-500">Last Measured:</div>
          <div class="text-gray-900">${q(e.lastMeasured)}</div>
        </div>
      </div>

      <!-- Link -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Proxy Link</h3>
        <div class="flex gap-2">
          <input type="text" readonly value="${L(e.link)}"
                 class="input flex-1 font-mono text-xs bg-gray-50">
          <button id="copy-btn" class="btn btn-secondary">Copy</button>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button id="close-btn-2" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `),a=o.getElement(),l=a.querySelector("#latency-chart"),c=a.querySelector("#speed-chart"),d=a.querySelector("#health-chart");t.length>0?new O(l,{width:450,height:150,lineColor:"#0ea5e9",fillColor:"rgba(14, 165, 233, 0.1)"}).draw(t.map((y,S)=>({x:S,y:y.latency}))):l.innerHTML='<div class="text-center text-gray-400 py-8">No latency data</div>',s.length>0?new O(c,{width:450,height:150,lineColor:"#22c55e",fillColor:"rgba(34, 197, 94, 0.1)"}).draw(s.map((y,S)=>({x:S,y:y.speed}))):c.innerHTML='<div class="text-center text-gray-400 py-8">No speed data</div>',r?new rt(d,{width:450,height:120}).draw([{label:"Success",value:r.successCount,color:"#22c55e"},{label:"Failed",value:r.failCount,color:"#ef4444"}]):d.innerHTML='<div class="text-center text-gray-400 py-8">No health data</div>',(g=a.querySelector("#close-btn"))==null||g.addEventListener("click",()=>o.close()),(u=a.querySelector("#close-btn-2"))==null||u.addEventListener("click",()=>o.close()),(x=a.querySelector("#copy-btn"))==null||x.addEventListener("click",async()=>{await p.copyToClipboard(e.link);const b=a.querySelector("#copy-btn");b.textContent="Copied!",setTimeout(()=>{b.textContent="Copy"},2e3)})}function L(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}const it=40,ot=3;class at{constructor(e){h(this,"container");h(this,"config");h(this,"searchInput",null);h(this,"virtualScroller",null);h(this,"selectedGroupId");h(this,"currentSearchQuery","");h(this,"totalGroupCount",0);this.config=e,this.container=e.container,this.selectedGroupId=e.selectedGroupId??null}async loadGroups(){const e=await p.searchGroups("",0,1);this.totalGroupCount=e.totalCount,this.currentSearchQuery="",this.render()}render(){const e=this.config.maxHeight??"256px";this.container.innerHTML=`
      <div class="flex flex-col h-full">
        <div class="p-2 border-b border-gray-200">
          <div id="group-search-input"></div>
        </div>
        ${this.config.showNoGroupOption?`
          <div class="px-2 pt-2">
            ${this.renderNoGroupItem()}
          </div>
        `:""}
        <div id="group-list" class="flex-1 overflow-hidden" style="max-height: ${e}">
          ${this.totalGroupCount===0?`
            <div class="px-3 py-4 text-center text-gray-500 text-sm">
              ${this.currentSearchQuery?"No groups match":"No groups yet"}
            </div>
          `:""}
        </div>
      </div>
    `;const t=this.container.querySelector("#group-search-input");this.searchInput=new k({placeholder:"Search groups...",debounceMs:150,onSearch:s=>this.handleSearch(s)}),t.appendChild(this.searchInput.getElement()),this.attachNoGroupListener(),this.totalGroupCount>0&&this.initVirtualScroller()}renderNoGroupItem(){const e=this.selectedGroupId===0||this.selectedGroupId===null;return`
      <div class="group-item no-group-item ${e?"bg-primary-50 border-primary-200":"hover:bg-gray-50"} border border-transparent rounded-lg px-3 py-2 cursor-pointer transition-colors"
           data-group-id="0">
        <div class="flex items-center justify-between">
          <span class="font-medium ${e?"text-primary-700":"text-gray-700"}">No Group</span>
        </div>
      </div>
    `}renderGroupItem(e){const t=this.selectedGroupId===e.id,s=t?"bg-primary-50 border-primary-200":"hover:bg-gray-50",r=t?"text-primary-700":"text-gray-700",i=t?"text-primary-600":"text-gray-500";return`
      <div class="group-item ${s} border border-transparent rounded-lg mx-2 my-1 px-3 py-2 cursor-pointer transition-colors h-full"
           data-group-id="${e.id}">
        <div class="flex items-center justify-between h-full">
          <span class="font-medium ${r} truncate">${this.escapeHtml(e.name)}</span>
          <span class="text-xs ${i} bg-gray-100 px-2 py-0.5 rounded-full ml-2">
            ${e.proxyCount}
          </span>
        </div>
      </div>
    `}renderPlaceholderItem(){return`
      <div class="rounded-lg mx-2 my-1 px-3 py-2 h-full animate-pulse">
        <div class="flex items-center justify-between h-full">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-5 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    `}initVirtualScroller(){const e=this.container.querySelector("#group-list");!e||this.totalGroupCount===0||(this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),this.virtualScroller=new E({container:e,rowHeight:it,overscan:ot,totalCount:this.totalGroupCount,fetchData:async(t,s)=>(await p.searchGroups(this.currentSearchQuery,t,s)).groups,renderRow:t=>this.renderGroupItem(t),renderPlaceholder:()=>this.renderPlaceholderItem()}),this.attachGroupListeners())}async handleSearch(e){this.currentSearchQuery=e;const t=await p.searchGroups(e,0,1);this.totalGroupCount=t.totalCount;const s=this.container.querySelector("#group-list");s&&(this.totalGroupCount===0?(this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),s.innerHTML=`
          <div class="px-3 py-4 text-center text-gray-500 text-sm">
            ${e?"No groups match":"No groups yet"}
          </div>
        `):(s.innerHTML="",this.initVirtualScroller()))}attachNoGroupListener(){const e=this.container.querySelector(".no-group-item");e==null||e.addEventListener("click",()=>{this.selectGroup(null)})}attachGroupListeners(){if(!this.virtualScroller)return;const e=this.virtualScroller.getContentContainer();e&&e.addEventListener("click",t=>{const r=t.target.closest(".group-item");if(!r)return;const i=r.getAttribute("data-group-id");if(i===null||i==="0")return;const o=parseInt(i,10);this.selectGroup(o)})}selectGroup(e){this.selectedGroupId=e===null?0:e,this.updateSelectionUI(),this.config.onSelect(e)}updateSelectionUI(){var t;const e=this.container.querySelector(".no-group-item");if(e){const s=this.selectedGroupId===0||this.selectedGroupId===null,r=e.querySelector("span.font-medium");s?(e.classList.add("bg-primary-50","border-primary-200"),e.classList.remove("hover:bg-gray-50"),r==null||r.classList.add("text-primary-700"),r==null||r.classList.remove("text-gray-700")):(e.classList.remove("bg-primary-50","border-primary-200"),e.classList.add("hover:bg-gray-50"),r==null||r.classList.remove("text-primary-700"),r==null||r.classList.add("text-gray-700"))}(t=this.virtualScroller)==null||t.forceRender()}focusSearch(){var e;(e=this.searchInput)==null||e.focus()}getSelectedGroupId(){return this.selectedGroupId===0?null:this.selectedGroupId}destroy(){var e,t;(e=this.searchInput)==null||e.destroy(),(t=this.virtualScroller)==null||t.destroy()}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}function j(){return new Promise(n=>{let e=null,t=null;const s=P(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Move to Group</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
          <div id="group-list-container" class="border border-gray-300 rounded-md overflow-hidden" style="height: 280px;">
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="move-btn" class="btn btn-primary">Move</button>
        </div>
      </div>
    `),r=s.getElement().querySelector("#group-list-container"),i=s.getElement().querySelector("#move-btn"),o=s.getElement().querySelector("#cancel-btn");t=new at({container:r,showNoGroupOption:!0,selectedGroupId:0,maxHeight:"220px",onSelect:a=>{e=a}}),t.loadGroups().then(()=>{requestAnimationFrame(()=>{t==null||t.focusSearch()})}),i.addEventListener("click",()=>{t==null||t.destroy(),s.close(!1),n(e===null?0:e)}),o.addEventListener("click",()=>{t==null||t.destroy(),s.close(!1),n(void 0)}),s.setOnClose(()=>{t==null||t.destroy(),n(void 0)})})}const lt=72,ct=3;class dt{constructor(e){h(this,"container");h(this,"currentGroupId",null);h(this,"totalCount",0);h(this,"virtualScroller",null);h(this,"searchInput",null);h(this,"currentSearchQuery","");h(this,"onDataChanged");this.container=e,this.render()}async loadProxies(e){this.currentGroupId=e,this.currentSearchQuery="",this.totalCount=await p.getProxyCount(e),this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),this.render()}refresh(){this.currentSearchQuery?this.handleSearch(this.currentSearchQuery):this.loadProxies(this.currentGroupId)}notifyDataChanged(){var e;(e=this.onDataChanged)==null||e.call(this)}render(){const e=f.getSelectedIndexCount();this.container.innerHTML=`
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Proxies</h2>
            <span id="proxy-count" class="text-xs text-gray-500">(${this.totalCount.toLocaleString()})</span>
          </div>
          <div class="flex items-center gap-2">
            <div id="proxy-search-container" class="w-48"></div>
            <button id="add-proxy-btn" class="btn btn-primary btn-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Proxy
            </button>
            <button id="add-sub-btn" class="btn btn-secondary btn-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Subscription
            </button>
          </div>
        </div>

        <!-- Proxy list wrapper with selection toolbar overlay -->
        <div class="flex-1 overflow-hidden relative">
          <!-- Selection toolbar (floating overlay at top) -->
          <div id="selection-toolbar" class="${e>0?"":"hidden"} absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-primary-50/95 backdrop-blur-sm border-b border-primary-100 shadow-sm">
            <span class="text-sm text-primary-700"><span id="selected-count">${e.toLocaleString()}</span> selected</span>
            <div class="flex items-center gap-2">
              <button id="move-selected-btn" class="btn btn-secondary btn-sm">Move to Group</button>
              <button id="delete-selected-btn" class="btn btn-danger btn-sm">Delete</button>
              <button id="clear-selection-btn" class="text-sm text-primary-600 hover:text-primary-800">Clear</button>
            </div>
          </div>
          <!-- Actual scroll container -->
          <div id="proxy-scroll" class="h-full overflow-hidden">
          ${this.totalCount===0?`
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
              <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
              </svg>
              <p class="text-lg font-medium">${this.currentSearchQuery?"No proxies match":"No proxies yet"}</p>
              <p class="text-sm">${this.currentSearchQuery?"Try a different search":"Add a proxy or subscription to get started"}</p>
            </div>
          `:""}
          </div>
        </div>
      </div>
    `,this.initSearch(),this.attachHeaderListeners(),this.totalCount>0&&this.initVirtualScroller()}initSearch(){const e=this.container.querySelector("#proxy-search-container");e&&(this.searchInput=new k({placeholder:"Search proxies...",debounceMs:300,onSearch:t=>this.handleSearch(t)}),e.appendChild(this.searchInput.getElement()))}async handleSearch(e){if(this.currentSearchQuery=e,f.clearSelection(),this.updateSelectionUI(),this.virtualScroller&&(this.virtualScroller.destroy(),this.virtualScroller=null),e){const s=await p.searchProxies(this.currentGroupId,e,0,1);this.totalCount=s.totalCount}else this.totalCount=await p.getProxyCount(this.currentGroupId);this.updateCountDisplay();const t=this.container.querySelector("#proxy-scroll");t&&(this.totalCount===0?t.innerHTML=`
          <div class="flex flex-col items-center justify-center h-full text-gray-500">
            <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
            </svg>
            <p class="text-lg font-medium">${e?"No proxies match":"No proxies yet"}</p>
            <p class="text-sm">${e?"Try a different search":"Add a proxy or subscription to get started"}</p>
          </div>
        `:(t.innerHTML="",this.initVirtualScroller()))}updateCountDisplay(){const e=this.container.querySelector("#proxy-count");e&&(e.textContent=`(${this.totalCount.toLocaleString()})`)}initVirtualScroller(){const e=this.container.querySelector("#proxy-scroll");e&&(this.virtualScroller=new E({container:e,rowHeight:lt,overscan:ct,totalCount:this.totalCount,fetchData:async(t,s)=>this.currentSearchQuery?(await p.searchProxies(this.currentGroupId,this.currentSearchQuery,t,s)).proxies:await p.getProxies(this.currentGroupId,t,s),renderRow:(t,s)=>this.renderProxyItem(t,s),renderPlaceholder:()=>this.renderPlaceholderItem()}),this.attachProxyListeners())}renderProxyItem(e,t){const s=f.isIndexSelected(t),r=et(e.isDead,e.isActive),i=W(e.protocol);return`
      <div class="proxy-item ${s?"bg-primary-50":"hover:bg-gray-50"} px-4 py-3 cursor-pointer transition-colors h-full border-b border-gray-100"
           data-proxy-id="${e.id}" data-index="${t}">
        <div class="flex items-center gap-3 h-full">
          <!-- Checkbox -->
          <input type="checkbox"
                 class="proxy-checkbox w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                 ${s?"checked":""}>

          <!-- Status indicator -->
          <div class="flex-shrink-0">
            <span class="inline-block w-2.5 h-2.5 rounded-full ${r} ${e.isActive?"animate-pulse bg-green-500":e.isDead?"bg-red-400":"bg-gray-400"}"></span>
          </div>

          <!-- Main content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 truncate">${this.escapeHtml(Ze(e.name||e.server,40))}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${i}">
                ${e.protocol}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span class="truncate">${this.escapeHtml(e.server)}:${e.port}</span>
              ${e.latency!=null?`<span class="text-gray-400">|</span><span>${B(e.latency)}</span>`:""}
              ${e.speed!=null?`<span class="text-gray-400">|</span><span>${V(e.speed)}</span>`:""}
              ${e.successRate!=null?`<span class="text-gray-400">|</span><span class="${(e.successRate??0)>.8?"text-green-600":(e.successRate??0)>.5?"text-yellow-600":"text-red-600"}">${U(e.successRate)}</span>`:""}
              ${e.isDead?'<span class="text-red-500 font-medium">DEAD</span>':""}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button class="move-btn p-2 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100" title="Move to group">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </button>
            <button class="info-btn p-2 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100" title="Details">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
            <button class="activate-btn p-2 ${e.isActive?"text-green-600":"text-gray-400 hover:text-green-600"} rounded hover:bg-gray-100"
                    title="${e.isActive?"Deactivate":"Activate"}">
              ${e.isActive?`
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
              `:`
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              `}
            </button>
          </div>
        </div>
      </div>
    `}attachHeaderListeners(){var e,t,s,r,i;(e=this.container.querySelector("#add-proxy-btn"))==null||e.addEventListener("click",async()=>{const o=await tt();o&&o.length>0&&await p.addProxies(o,this.currentGroupId)>0&&(this.refresh(),this.notifyDataChanged())}),(t=this.container.querySelector("#add-sub-btn"))==null||t.addEventListener("click",async()=>{const o=await st();o&&await p.addSubscription(o.url,o.name)}),(s=this.container.querySelector("#move-selected-btn"))==null||s.addEventListener("click",()=>this.moveSelected()),(r=this.container.querySelector("#delete-selected-btn"))==null||r.addEventListener("click",()=>this.deleteSelected()),(i=this.container.querySelector("#clear-selection-btn"))==null||i.addEventListener("click",()=>this.clearSelection())}attachProxyListeners(){if(!this.virtualScroller)return;const e=this.virtualScroller.getContentContainer();e&&e.addEventListener("click",async t=>{var a;const s=t.target,r=s.closest(".proxy-item");if(!r)return;const i=parseInt(r.getAttribute("data-proxy-id")||"0",10),o=parseInt(r.getAttribute("data-index")||"0",10);if(s.classList.contains("proxy-checkbox")||s.closest(".proxy-checkbox")){t.stopPropagation(),t.preventDefault(),f.toggleIndexSelection(o),this.updateSelectionUI(),this.rerenderVisibleRows();return}if(s.closest(".move-btn")){t.stopPropagation();const l=await j();l!==void 0&&(await p.moveToGroup(i,l),this.refresh(),this.notifyDataChanged());return}if(s.closest(".info-btn")){t.stopPropagation(),await nt(i);return}if(s.closest(".activate-btn")){t.stopPropagation();const l=(a=this.virtualScroller)==null?void 0:a.getItemById(i);l!=null&&l.isActive?await p.deactivateProxy():await p.activateProxy(i),this.refresh();return}if(!s.closest("button")&&!s.closest("input")){if(t.shiftKey){const d=f.getLastSelectedIndex();d!==null?f.selectIndexRange(d,o,!0):f.toggleIndexSelection(o)}else f.toggleIndexSelection(o);this.updateSelectionUI(),this.rerenderVisibleRows()}})}updateSelectionUI(){const e=f.getSelectedIndexCount(),t=this.container.querySelector("#selection-toolbar"),s=this.container.querySelector("#selected-count");t&&(e>0?t.classList.remove("hidden"):t.classList.add("hidden")),s&&(s.textContent=e.toLocaleString())}rerenderVisibleRows(){var e;(e=this.virtualScroller)==null||e.forceRender()}selectAll(){f.selectAllIndices(this.totalCount),this.updateSelectionUI(),this.rerenderVisibleRows()}clearSelection(){f.clearSelection(),this.updateSelectionUI(),this.rerenderVisibleRows()}async copySelected(){if(f.getSelectedIndexCount()===0)return;const t=await this.getSelectedProxyIds();if(t.length===0)return;const s=[];for(const r of t){const i=await p.getProxyDetails(r);i!=null&&i.link&&s.push(i.link)}s.length>0&&await p.copyToClipboard(s.join(`
`))}async getSelectedProxyIds(){const e=f.getSelectedIndexRanges();if(e.length===0)return[];const t=[];for(const s of e){const r=s.end-s.start+1,i=await p.getProxyIDs(this.currentGroupId,s.start,r);t.push(...i)}return t}async handlePaste(){const e=await p.parseClipboard();e.links.length>0?await p.addProxies(e.links,this.currentGroupId)>0&&(this.refresh(),this.notifyDataChanged()):e.subscriptionUrl&&await M("Add Subscription?",`Do you want to add this subscription?
${e.subscriptionUrl}`)&&await p.addSubscription(e.subscriptionUrl,"")}async deleteSelected(){const e=f.getSelectedIndexCount();if(e===0)return;if(await M("Delete Proxies",`Are you sure you want to delete ${e.toLocaleString()} selected proxies?`)){const s=await this.getSelectedProxyIds();s.length>0&&await p.deleteProxies(s),f.clearSelection(),this.refresh(),this.notifyDataChanged()}}async moveSelected(){if(f.getSelectedIndexCount()===0)return;const t=await j();if(t!==void 0){const s=await this.getSelectedProxyIds();s.length>0&&await p.moveProxiesToGroup(s,t),this.refresh(),this.notifyDataChanged()}}renderPlaceholderItem(){return`
      <div class="proxy-item px-4 py-3 h-full border-b border-gray-100 animate-pulse">
        <div class="flex items-center gap-3 h-full">
          <div class="w-4 h-4 bg-gray-200 rounded"></div>
          <div class="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="flex gap-1">
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    `}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}async function ut(){var o,a,l,c;const n=await p.getSettings(),e=await p.getSubscriptions(),t=await p.getDeadProxyCount(),s=await p.getMeasurementCounts();if(!n)return;const r=P(`
    <div class="max-h-[80vh] overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Settings</h2>
        <button id="close-btn" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button class="tab-btn active px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600" data-tab="general">General</button>
        <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="subscriptions">Subscriptions</button>
        <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="maintenance">Maintenance</button>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- General tab -->
        <div id="tab-general" class="tab-content">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Measurement History Limit</label>
              <input type="number" id="history-limit" class="input" value="${n.measurementHistoryLimit}" min="10" max="1000">
              <p class="text-xs text-gray-500 mt-1">Maximum number of measurements to keep per proxy</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dead Proxy Threshold (days)</label>
              <input type="number" id="dead-threshold" class="input" value="${n.deadProxyThresholdDays}" min="1" max="30">
              <p class="text-xs text-gray-500 mt-1">Mark proxy as dead after this many days of failures</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Requests Per Hour</label>
              <input type="number" id="requests-limit" class="input" value="${n.requestsPerHour}" min="1" max="100">
              <p class="text-xs text-gray-500 mt-1">Maximum measurement requests per hour</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Speed Limit (KB/s)</label>
              <input type="number" id="speed-limit" class="input" value="${n.subscriptionSpeedLimit}" min="0" max="10000">
              <p class="text-xs text-gray-500 mt-1">Speed limit for subscription downloads (0 = unlimited)</p>
            </div>
          </div>
        </div>

        <!-- Subscriptions tab -->
        <div id="tab-subscriptions" class="tab-content hidden">
          ${e.length===0?`
            <div class="text-center text-gray-500 py-8">No subscriptions</div>
          `:`
            <div class="space-y-2">
              ${e.map(d=>ht(d)).join("")}
            </div>
          `}
        </div>

        <!-- Maintenance tab -->
        <div id="tab-maintenance" class="tab-content hidden">
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Dead Proxies</h3>
              <p class="text-sm text-gray-600 mb-3">Found <span class="font-bold text-red-600">${t}</span> dead proxies</p>
              <button id="delete-dead-btn" class="btn btn-danger btn-sm" ${t===0?"disabled":""}>
                Delete Dead Proxies
              </button>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Measurement Statistics</h3>
              ${s?`
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${s.total}</div>
                    <div class="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${s.last24h}</div>
                    <div class="text-xs text-gray-500">Last 24h</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${s.last7d}</div>
                    <div class="text-xs text-gray-500">Last 7 days</div>
                  </div>
                </div>
              `:'<p class="text-sm text-gray-500">No data</p>'}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
        <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
        <button id="save-btn" class="btn btn-primary">Save</button>
      </div>
    </div>
  `),i=r.getElement();i.querySelectorAll(".tab-btn").forEach(d=>{d.addEventListener("click",()=>{var u;const g=d.getAttribute("data-tab");i.querySelectorAll(".tab-btn").forEach(x=>{x.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),x.classList.add("text-gray-500")}),d.classList.add("active","text-primary-600","border-primary-600","border-b-2"),d.classList.remove("text-gray-500"),i.querySelectorAll(".tab-content").forEach(x=>{x.classList.add("hidden")}),(u=i.querySelector(`#tab-${g}`))==null||u.classList.remove("hidden")})}),i.querySelectorAll(".update-sub-btn").forEach(d=>{d.addEventListener("click",async()=>{const g=parseInt(d.getAttribute("data-id")||"0",10);d.textContent="Updating...",d.disabled=!0,await p.updateSubscription(g),d.textContent="Update",d.disabled=!1})}),i.querySelectorAll(".delete-sub-btn").forEach(d=>{d.addEventListener("click",async()=>{var u;const g=parseInt(d.getAttribute("data-id")||"0",10);confirm("Delete this subscription?")&&(await p.deleteSubscription(g),(u=d.closest(".sub-item"))==null||u.remove())})}),i.querySelectorAll(".toggle-sub-checkbox").forEach(d=>{d.addEventListener("change",async g=>{const u=parseInt(d.getAttribute("data-id")||"0",10),x=g.target.checked;await p.toggleSubscription(u,x)})}),(o=i.querySelector("#delete-dead-btn"))==null||o.addEventListener("click",async()=>{const d=i.querySelector("#delete-dead-btn");d.textContent="Deleting...",d.disabled=!0;const g=await p.deleteDeadProxies();d.textContent=`Deleted ${g}`,setTimeout(()=>{d.textContent="Delete Dead Proxies",d.disabled=!0},2e3)}),(a=i.querySelector("#close-btn"))==null||a.addEventListener("click",()=>r.close(!1)),(l=i.querySelector("#cancel-btn"))==null||l.addEventListener("click",()=>r.close(!1)),(c=i.querySelector("#save-btn"))==null||c.addEventListener("click",async()=>{const d={proxyListenAddr:n.proxyListenAddr,measurementHistoryLimit:parseInt(i.querySelector("#history-limit").value,10),deadProxyThresholdDays:parseInt(i.querySelector("#dead-threshold").value,10),requestsPerHour:parseInt(i.querySelector("#requests-limit").value,10),subscriptionSpeedLimit:parseInt(i.querySelector("#speed-limit").value,10)};await p.updateSettings(d)&&r.close(!1)})}function ht(n){return`
    <div class="sub-item flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-3">
        <input type="checkbox" class="toggle-sub-checkbox" data-id="${n.id}" ${n.enabled?"checked":""}>
        <div>
          <div class="font-medium text-gray-900">${pt(n.name||n.url)}</div>
          <div class="text-xs text-gray-500">${n.proxyCount} proxies | Updated: ${n.lastUpdate||"never"}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="update-sub-btn btn btn-secondary btn-sm" data-id="${n.id}">Update</button>
        <button class="delete-sub-btn btn btn-danger btn-sm" data-id="${n.id}">Delete</button>
      </div>
    </div>
  `}function pt(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}class gt{constructor(e){h(this,"container");h(this,"listenAddress","127.0.0.1:1080");h(this,"isSystemProxySet",!1);this.container=e,this.render()}async initialize(){this.listenAddress=await p.getListenAddress(),this.isSystemProxySet=await p.isSystemProxySet(),f.setListenAddress(this.listenAddress),f.setSystemProxySet(this.isSystemProxySet),this.render()}updateActiveProxy(e){this.render()}render(){const e=f.getActiveProxy();this.container.innerHTML=`
      <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <!-- Left side - App info -->
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-gray-800">SingerGUI</h1>
          <div class="h-6 w-px bg-gray-200"></div>
          <button id="settings-btn" class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>

        <!-- Right side - Proxy controls -->
        <div class="flex items-center gap-4">
          <!-- Listen address -->
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500">Listen:</span>
            <code class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">${this.escapeHtml(this.listenAddress)}</code>
            <button id="change-addr-btn" class="text-primary-600 hover:text-primary-800 font-medium">Change</button>
          </div>

          <div class="h-6 w-px bg-gray-200"></div>

          <!-- System proxy toggle -->
          <button id="sysproxy-btn" class="btn ${this.isSystemProxySet?"btn-primary":"btn-secondary"} btn-sm">
            ${this.isSystemProxySet?"Clear System Proxy":"Set System Proxy"}
          </button>

          <!-- Active proxy indicator -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg ${e?"bg-green-50 border border-green-200":"bg-gray-50 border border-gray-200"}">
            <span class="w-2 h-2 rounded-full ${e?"bg-green-500 animate-pulse":"bg-gray-400"}"></span>
            <span class="text-sm ${e?"text-green-700":"text-gray-500"}">
              ${e?`Active: ${this.escapeHtml(e.listenAddress)}`:"No Active Proxy"}
            </span>
          </div>
        </div>
      </div>
    `,this.attachEventListeners()}attachEventListeners(){var e,t,s;(e=this.container.querySelector("#settings-btn"))==null||e.addEventListener("click",()=>{ut()}),(t=this.container.querySelector("#change-addr-btn"))==null||t.addEventListener("click",async()=>{const r=prompt("Enter listen address (host:port):",this.listenAddress);r&&r!==this.listenAddress&&await p.setListenAddress(r)&&(this.listenAddress=r,f.setListenAddress(r),this.render())}),(s=this.container.querySelector("#sysproxy-btn"))==null||s.addEventListener("click",async()=>{if(this.isSystemProxySet)await p.clearSystemProxy()&&(this.isSystemProxySet=!1,f.setSystemProxySet(!1),this.render());else{if(!f.getActiveProxy()){alert("Please activate a proxy first");return}await p.setSystemProxy()&&(this.isSystemProxySet=!0,f.setSystemProxySet(!0),this.render())}})}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}class mt{constructor(e){h(this,"container");h(this,"message","Ready");this.container=e,this.render()}setMessage(e){this.message=e,this.render()}render(){this.container.innerHTML=`
      <div class="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 text-sm">
        <span class="text-gray-600">${this.escapeHtml(this.message)}</span>
        <div class="flex items-center gap-4 text-gray-400">
          <span>Ctrl+C: Copy</span>
          <span>Ctrl+V: Paste</span>
          <span>Del: Delete</span>
        </div>
      </div>
    `}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}function yt(n){const e=window.runtime;if(!e){console.warn("Wails runtime not available");return}n.onProxyActivated&&e.EventsOn("proxy:activated",t=>{n.onProxyActivated(t)}),n.onProxyDeactivated&&e.EventsOn("proxy:deactivated",()=>{n.onProxyDeactivated()}),n.onProxyUpdated&&e.EventsOn("proxy:updated",t=>{const{id:s}=t;n.onProxyUpdated(s)}),n.onSubscriptionImporting&&e.EventsOn("subscription:importing",t=>{n.onSubscriptionImporting(t)}),n.onSubscriptionComplete&&e.EventsOn("subscription:complete",t=>{n.onSubscriptionComplete(t)}),n.onSysProxyChanged&&e.EventsOn("sysproxy:changed",t=>{const{enabled:s}=t;n.onSysProxyChanged(s)}),n.onStatusMessage&&e.EventsOn("status:message",t=>{n.onStatusMessage(t)})}function ft(n){n.innerHTML=`
    <div id="toolbar" class="flex-shrink-0"></div>
    <div class="flex flex-1 overflow-hidden">
      <div id="sidebar" class="w-64 flex-shrink-0 border-r border-gray-200 bg-white"></div>
      <div id="proxy-list" class="flex-1 bg-gray-50 overflow-hidden"></div>
    </div>
    <div id="status-bar" class="flex-shrink-0"></div>
  `;const e=document.getElementById("toolbar"),t=document.getElementById("sidebar"),s=document.getElementById("proxy-list"),r=document.getElementById("status-bar"),i=new gt(e),o=new Je(t),a=new dt(s),l=new mt(r);o.onGroupSelected=c=>{f.setSelectedGroup(c),a.loadProxies(c)},a.onDataChanged=()=>{o.loadGroups()},yt({onProxyActivated:c=>{const d={id:c.id,name:"",listenAddress:c.address};f.setActiveProxy(d),i.updateActiveProxy(d),l.setMessage(`Proxy active on ${c.address}`)},onProxyDeactivated:()=>{f.setActiveProxy(null),i.updateActiveProxy(null),l.setMessage("Proxy deactivated")},onSubscriptionComplete:c=>{l.setMessage(`Imported ${c.count} proxies`),a.refresh(),o.loadGroups()},onStatusMessage:c=>{l.setMessage(c.text)}}),o.loadGroups(),a.loadProxies(null),i.initialize(),l.setMessage("Ready"),xt(a)}function xt(n){document.addEventListener("keydown",e=>{const t=e.target;t.tagName==="INPUT"||t.tagName==="TEXTAREA"||(e.ctrlKey&&e.key==="c"&&(n.copySelected(),e.preventDefault()),e.ctrlKey&&e.key==="v"&&(n.handlePaste(),e.preventDefault()),e.ctrlKey&&e.key==="a"&&(n.selectAll(),e.preventDefault()),e.key==="Delete"&&(n.deleteSelected(),e.preventDefault()),e.key==="Escape"&&n.clearSelection())})}document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("app");n&&ft(n)});
