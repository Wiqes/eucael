import{a as Dt,b as Pt,c as zt}from"./23.js";import{a as At}from"./30.js";import"./9.js";import{a as xt,b as Ct,c as Mt,e as Et,g as $t}from"./17.js";import{a as Vt,c as Ft}from"./36.js";import"./21.js";import"./24.js";import{a as Oe}from"./15.js";import{a as se,d as kt,e as ge,i as fe,o as be}from"./27.js";import{a as vt}from"./44.js";import{a as Lt}from"./25.js";import"./28.js";import{a as wt}from"./38.js";import"./26.js";import{b as Me}from"./14.js";import{a as Tt,e as Ot}from"./52.js";import{a as yt}from"./40.js";import{b as nt,c as ot,d as lt}from"./18.js";import"./43.js";import{b as It,c as St}from"./39.js";import"./49.js";import{Aa as gt,Ba as ft,Ca as bt,Da as le,Ea as q,Fa as _e,G as me,Ha as ae,K as at,Ka as X,W as Te,X as Z,Y as st,Z as rt,aa as ct,ha as Qe,j as K,k as it,l as ke,m as de,oa as pt,pa as G,q as ue,qa as W,r as U,ra as Y,sa as dt,ta as he,u as H,ua as ut,wa as mt,xa as ht,ya as _t}from"./41.js";import{$b as ne,Ab as We,Ac as Re,Bb as Ye,Cb as d,Db as m,Eb as k,Fb as w,Gb as I,Hb as T,Ib as M,Mb as v,Nb as r,Ob as Xe,Pb as Ae,R as $e,Rb as C,S as te,Sb as L,T as ie,Ta as c,Tb as h,U as ve,Ub as _,Ya as Ie,Yb as re,Z as E,Zb as D,_b as j,a as J,b as ee,bc as Je,cc as et,da as He,dc as tt,ea as qe,ec as oe,fa as f,fb as $,fc as ce,ga as b,gb as Se,gc as O,ha as je,hc as pe,ia as P,ic as De,jb as Q,kb as p,la as Le,lc as Pe,mc as ze,oa as S,oc as A,pa as Ge,rb as x,sa as we,sb as s,tb as Ue,ua as V,ub as Ze,vb as N,wb as z,wc as y,xc as B,yb as R,zc as F}from"./34.js";function Ne(t,l){let e=!l?.manualCleanup;e&&!l?.injector&&He(Ne);let n=e?l?.injector?.get(Le)??E(Le):null,i=Zt(l?.equal),o;l?.requireSync?o=V({kind:0},{equal:i}):o=V({kind:1,value:l?.initialValue},{equal:i});let a,u=t.subscribe({next:g=>o.set({kind:1,value:g}),error:g=>{if(l?.rejectErrors)throw g;o.set({kind:2,error:g})},complete:()=>{a?.()}});if(l?.requireSync&&o().kind===0)throw new $e(601,!1);return a=n?.onDestroy(u.unsubscribe.bind(u)),F(()=>{let g=o();switch(g.kind){case 1:return g.value;case 2:throw g.error;case 0:throw new $e(601,!1)}},{equal:l?.equal})}function Zt(t=Object.is){return(l,e)=>l.kind===1&&e.kind===1&&t(l.value,e.value)}var Wt=["handle"],Yt=["input"],Xt=t=>({checked:t});function Jt(t,l){t&1&&T(0)}function ei(t,l){if(t&1&&p(0,Jt,1,0,"ng-container",4),t&2){let e=r();s("ngTemplateOutlet",e.handleTemplate||e._handleTemplate)("ngTemplateOutletContext",O(2,Xt,e.checked()))}}var ti=({dt:t})=>`
.p-toggleswitch {
    display: inline-block;
    width: ${t("toggleswitch.width")};
    height: ${t("toggleswitch.height")};
}

.p-toggleswitch-input {
    cursor: pointer;
    appearance: none;
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border-radius: ${t("toggleswitch.border.radius")};
}

.p-toggleswitch-slider {
    display: inline-block;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border-width: ${t("toggleswitch.border.width")};
    border-style: solid;
    border-color: ${t("toggleswitch.border.color")};
    background: ${t("toggleswitch.background")};
    transition: background ${t("toggleswitch.transition.duration")}, color ${t("toggleswitch.transition.duration")}, border-color ${t("toggleswitch.transition.duration")}, outline-color ${t("toggleswitch.transition.duration")}, box-shadow ${t("toggleswitch.transition.duration")};
    border-radius: ${t("toggleswitch.border.radius")};
    outline-color: transparent;
    box-shadow: ${t("toggleswitch.shadow")};
}

.p-toggleswitch-handle {
    position: absolute;
    top: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${t("toggleswitch.handle.background")};
    color: ${t("toggleswitch.handle.color")};
    width: ${t("toggleswitch.handle.size")};
    height: ${t("toggleswitch.handle.size")};
    inset-inline-start: ${t("toggleswitch.gap")};
    margin-block-start: calc(-1 * calc(${t("toggleswitch.handle.size")} / 2));
    border-radius: ${t("toggleswitch.handle.border.radius")};
    transition: background ${t("toggleswitch.transition.duration")}, color ${t("toggleswitch.transition.duration")}, inset-inline-start ${t("toggleswitch.slide.duration")}, box-shadow ${t("toggleswitch.slide.duration")};
}

.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
    background: ${t("toggleswitch.checked.background")};
    border-color: ${t("toggleswitch.checked.border.color")};
}

.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
    background: ${t("toggleswitch.handle.checked.background")};
    color: ${t("toggleswitch.handle.checked.color")};
    inset-inline-start: calc(${t("toggleswitch.width")} - calc(${t("toggleswitch.handle.size")} + ${t("toggleswitch.gap")}));
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
    background: ${t("toggleswitch.hover.background")};
    border-color: ${t("toggleswitch.hover.border.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
    background: ${t("toggleswitch.handle.hover.background")};
    color: ${t("toggleswitch.handle.hover.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
    background: ${t("toggleswitch.checked.hover.background")};
    border-color: ${t("toggleswitch.checked.hover.border.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
    background: ${t("toggleswitch.handle.checked.hover.background")};
    color: ${t("toggleswitch.handle.checked.hover.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
    box-shadow: ${t("toggleswitch.focus.ring.shadow")};
    outline: ${t("toggleswitch.focus.ring.width")} ${t("toggleswitch.focus.ring.style")} ${t("toggleswitch.focus.ring.color")};
    outline-offset: ${t("toggleswitch.focus.ring.offset")};
}

.p-toggleswitch.p-invalid > .p-toggleswitch-slider {
    border-color: ${t("toggleswitch.invalid.border.color")};
}

.p-toggleswitch.p-disabled {
    opacity: 1;
}

.p-toggleswitch.p-disabled .p-toggleswitch-slider {
    background: ${t("toggleswitch.disabled.background")};
}

.p-toggleswitch.p-disabled .p-toggleswitch-handle {
    background: ${t("toggleswitch.handle.disabled.background")};
}

/* For PrimeNG */

p-toggleSwitch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider,
p-toggle-switch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider,
p-toggleswitch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider {
    border-color: ${t("toggleswitch.invalid.border.color")};
}`,ii={root:{position:"relative"}},ni={root:({instance:t})=>({"p-toggleswitch p-component":!0,"p-toggleswitch-checked":t.checked(),"p-disabled":t.disabled,"p-invalid":t.invalid}),input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},Rt=(()=>{class t extends ae{name="toggleswitch";theme=ti;classes=ni;inlineStyles=ii;static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275prov=ie({token:t,factory:t.\u0275fac})}return t})();var oi={provide:se,useExisting:te(()=>Ke),multi:!0},Ke=(()=>{class t extends X{style;styleClass;tabindex;inputId;name;disabled;readonly;trueValue=!0;falseValue=!1;ariaLabel;ariaLabelledBy;autofocus;onChange=new S;input;handleTemplate;_handleTemplate;modelValue=!1;focused=!1;onModelChange=()=>{};onModelTouched=()=>{};_componentStyle=E(Rt);templates;ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"handle":this._handleTemplate=e.template;break;default:this._handleTemplate=e.template;break}})}onClick(e){!this.disabled&&!this.readonly&&(this.modelValue=this.checked()?this.falseValue:this.trueValue,this.onModelChange(this.modelValue),this.onChange.emit({originalEvent:e,checked:this.modelValue}),this.input.nativeElement.focus())}onFocus(){this.focused=!0}onBlur(){this.focused=!1,this.onModelTouched()}writeValue(e){this.modelValue=e,this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.disabled=e,this.cd.markForCheck()}checked(){return this.modelValue===this.trueValue}static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275cmp=$({type:t,selectors:[["p-toggleswitch"],["p-toggleSwitch"],["p-toggle-switch"]],contentQueries:function(n,i,o){if(n&1&&(C(o,Wt,4),C(o,le,4)),n&2){let a;h(a=_())&&(i.handleTemplate=a.first),h(a=_())&&(i.templates=a)}},viewQuery:function(n,i){if(n&1&&L(Yt,5),n&2){let o;h(o=_())&&(i.input=o.first)}},inputs:{style:"style",styleClass:"styleClass",tabindex:[2,"tabindex","tabindex",B],inputId:"inputId",name:"name",disabled:[2,"disabled","disabled",y],readonly:[2,"readonly","readonly",y],trueValue:"trueValue",falseValue:"falseValue",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy",autofocus:[2,"autofocus","autofocus",y]},outputs:{onChange:"onChange"},features:[oe([oi,Rt]),Q],decls:6,vars:23,consts:[["input",""],[3,"click","ngClass","ngStyle"],["type","checkbox","role","switch",3,"focus","blur","ngClass","checked","disabled","pAutoFocus"],[3,"ngClass"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(n,i){if(n&1){let o=M();d(0,"div",1),v("click",function(u){return f(o),b(i.onClick(u))}),d(1,"input",2,0),v("focus",function(){return f(o),b(i.onFocus())})("blur",function(){return f(o),b(i.onBlur())}),m(),d(3,"span",3)(4,"div",3),p(5,ei,1,4,"ng-container"),m()()()}n&2&&(N(i.sx("root")),z(i.styleClass),s("ngClass",i.cx("root"))("ngStyle",i.style),x("data-pc-name","toggleswitch")("data-pc-section","root"),c(),s("ngClass",i.cx("input"))("checked",i.checked())("disabled",i.disabled)("pAutoFocus",i.autofocus),x("id",i.inputId)("aria-checked",i.checked())("aria-labelledby",i.ariaLabelledBy)("aria-label",i.ariaLabel)("name",i.name)("tabindex",i.tabindex)("data-pc-section","hiddenInput"),c(2),s("ngClass",i.cx("slider")),x("data-pc-section","slider"),c(),s("ngClass",i.cx("handle")),c(),R(i.handleTemplate||i._handleTemplate?5:-1))},dependencies:[H,K,U,ue,Me,q],encapsulation:2,changeDetection:0})}return t})();var Qt=(()=>{class t extends yt{static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275cmp=$({type:t,selectors:[["MinusIcon"]],features:[Q],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z","fill","currentColor"]],template:function(n,i){n&1&&(je(),d(0,"svg",0),k(1,"path",1),m()),n&2&&(z(i.getClassNames()),x("aria-label",i.ariaLabel)("aria-hidden",i.ariaHidden)("role",i.role))},encapsulation:2})}return t})();var li=["checkboxicon"],ai=["input"],si=()=>({"p-checkbox-input":!0}),ri=t=>({checked:t,class:"p-checkbox-icon"});function ci(t,l){if(t&1&&k(0,"span",8),t&2){let e=r(3);s("ngClass",e.checkboxIcon),x("data-pc-section","icon")}}function pi(t,l){t&1&&k(0,"CheckIcon",9),t&2&&(s("styleClass","p-checkbox-icon"),x("data-pc-section","icon"))}function di(t,l){if(t&1&&(w(0),p(1,ci,1,2,"span",7)(2,pi,1,2,"CheckIcon",6),I()),t&2){let e=r(2);c(),s("ngIf",e.checkboxIcon),c(),s("ngIf",!e.checkboxIcon)}}function ui(t,l){t&1&&k(0,"MinusIcon",9),t&2&&(s("styleClass","p-checkbox-icon"),x("data-pc-section","icon"))}function mi(t,l){if(t&1&&(w(0),p(1,di,3,2,"ng-container",4)(2,ui,1,2,"MinusIcon",6),I()),t&2){let e=r();c(),s("ngIf",e.checked),c(),s("ngIf",e._indeterminate())}}function hi(t,l){}function _i(t,l){t&1&&p(0,hi,0,0,"ng-template")}var gi=({dt:t})=>`
.p-checkbox {
    position: relative;
    display: inline-flex;
    user-select: none;
    vertical-align: bottom;
    width: ${t("checkbox.width")};
    height: ${t("checkbox.height")};
}

.p-checkbox-input {
    cursor: pointer;
    appearance: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border: 1px solid transparent;
    border-radius: ${t("checkbox.border.radius")};
}

.p-checkbox-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${t("checkbox.border.radius")};
    border: 1px solid ${t("checkbox.border.color")};
    background: ${t("checkbox.background")};
    width: ${t("checkbox.width")};
    height: ${t("checkbox.height")};
    transition: background ${t("checkbox.transition.duration")}, color ${t("checkbox.transition.duration")}, border-color ${t("checkbox.transition.duration")}, box-shadow ${t("checkbox.transition.duration")}, outline-color ${t("checkbox.transition.duration")};
    outline-color: transparent;
    box-shadow: ${t("checkbox.shadow")};
}

.p-checkbox-icon {
    transition-duration: ${t("checkbox.transition.duration")};
    color: ${t("checkbox.icon.color")};
    font-size: ${t("checkbox.icon.size")};
    width: ${t("checkbox.icon.size")};
    height: ${t("checkbox.icon.size")};
}

.p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    border-color: ${t("checkbox.hover.border.color")};
}

.p-checkbox-checked .p-checkbox-box {
    border-color: ${t("checkbox.checked.border.color")};
    background: ${t("checkbox.checked.background")};
}

.p-checkbox-checked .p-checkbox-icon {
    color: ${t("checkbox.icon.checked.color")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    background: ${t("checkbox.checked.hover.background")};
    border-color: ${t("checkbox.checked.hover.border.color")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
    color: ${t("checkbox.icon.checked.hover.color")};
}

.p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
    border-color: ${t("checkbox.focus.border.color")};
    box-shadow: ${t("checkbox.focus.ring.shadow")};
    outline: ${t("checkbox.focus.ring.width")} ${t("checkbox.focus.ring.style")} ${t("checkbox.focus.ring.color")};
    outline-offset: ${t("checkbox.focus.ring.offset")};
}

.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
    border-color: ${t("checkbox.checked.focus.border.color")};
}

p-checkBox.ng-invalid.ng-dirty .p-checkbox-box,
p-check-box.ng-invalid.ng-dirty .p-checkbox-box,
p-checkbox.ng-invalid.ng-dirty .p-checkbox-box {
    border-color: ${t("checkbox.invalid.border.color")};
}

.p-checkbox.p-variant-filled .p-checkbox-box {
    background: ${t("checkbox.filled.background")};
}

.p-checkbox-checked.p-variant-filled .p-checkbox-box {
    background: ${t("checkbox.checked.background")};
}

.p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
    background: ${t("checkbox.checked.hover.background")};
}

.p-checkbox.p-disabled {
    opacity: 1;
}

.p-checkbox.p-disabled .p-checkbox-box {
    background: ${t("checkbox.disabled.background")};
    border-color: ${t("checkbox.checked.disabled.border.color")};
}

.p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
    color: ${t("checkbox.icon.disabled.color")};
}

.p-checkbox-sm,
.p-checkbox-sm .p-checkbox-box {
    width: ${t("checkbox.sm.width")};
    height: ${t("checkbox.sm.height")};
}

.p-checkbox-sm .p-checkbox-icon {
    font-size: ${t("checkbox.icon.sm.size")};
    width: ${t("checkbox.icon.sm.size")};
    height: ${t("checkbox.icon.sm.size")};
}

.p-checkbox-lg,
.p-checkbox-lg .p-checkbox-box {
    width: ${t("checkbox.lg.width")};
    height: ${t("checkbox.lg.height")};
}

.p-checkbox-lg .p-checkbox-icon {
    font-size: ${t("checkbox.icon.lg.size")};
    width: ${t("checkbox.icon.lg.size")};
    height: ${t("checkbox.icon.lg.size")};
}
`,fi={root:({instance:t,props:l})=>["p-checkbox p-component",{"p-checkbox-checked":t.checked,"p-disabled":l.disabled,"p-invalid":l.invalid,"p-variant-filled":l.variant?l.variant==="filled":t.config.inputStyle==="filled"||t.config.inputVariant==="filled"}],box:"p-checkbox-box",input:"p-checkbox-input",icon:"p-checkbox-icon"},Nt=(()=>{class t extends ae{name="checkbox";theme=gi;classes=fi;static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275prov=ie({token:t,factory:t.\u0275fac})}return t})();var bi={provide:se,useExisting:te(()=>Ve),multi:!0},Ve=(()=>{class t extends X{value;name;disabled;binary;ariaLabelledBy;ariaLabel;tabindex;inputId;style;inputStyle;styleClass;inputClass;indeterminate=!1;size;formControl;checkboxIcon;readonly;required;autofocus;trueValue=!0;falseValue=!1;variant;onChange=new S;onFocus=new S;onBlur=new S;inputViewChild;get checked(){return this._indeterminate()?!1:this.binary?this.model===this.trueValue:dt(this.value,this.model)}get containerClass(){return{"p-checkbox p-component":!0,"p-checkbox-checked p-highlight":this.checked,"p-disabled":this.disabled,"p-variant-filled":this.variant==="filled"||this.config.inputStyle()==="filled"||this.config.inputVariant()==="filled","p-checkbox-sm p-inputfield-sm":this.size==="small","p-checkbox-lg p-inputfield-lg":this.size==="large"}}_indeterminate=V(void 0);checkboxIconTemplate;templates;_checkboxIconTemplate;model;onModelChange=()=>{};onModelTouched=()=>{};focused=!1;_componentStyle=E(Nt);ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"icon":this._checkboxIconTemplate=e.template;break;case"checkboxicon":this._checkboxIconTemplate=e.template;break}})}ngOnChanges(e){super.ngOnChanges(e),e.indeterminate&&this._indeterminate.set(e.indeterminate.currentValue)}updateModel(e){let n,i=this.injector.get(kt,null,{optional:!0,self:!0}),o=i&&!this.formControl?i.value:this.model;this.binary?(n=this._indeterminate()?this.trueValue:this.checked?this.falseValue:this.trueValue,this.model=n,this.onModelChange(n)):(this.checked||this._indeterminate()?n=o.filter(a=>!Y(a,this.value)):n=o?[...o,this.value]:[this.value],this.onModelChange(n),this.model=n,this.formControl&&this.formControl.setValue(n)),this._indeterminate()&&this._indeterminate.set(!1),this.onChange.emit({checked:n,originalEvent:e})}handleChange(e){this.readonly||this.updateModel(e)}onInputFocus(e){this.focused=!0,this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.onBlur.emit(e),this.onModelTouched()}focus(){this.inputViewChild.nativeElement.focus()}writeValue(e){this.model=e,this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){setTimeout(()=>{this.disabled=e,this.cd.markForCheck()})}static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275cmp=$({type:t,selectors:[["p-checkbox"],["p-checkBox"],["p-check-box"]],contentQueries:function(n,i,o){if(n&1&&(C(o,li,4),C(o,le,4)),n&2){let a;h(a=_())&&(i.checkboxIconTemplate=a.first),h(a=_())&&(i.templates=a)}},viewQuery:function(n,i){if(n&1&&L(ai,5),n&2){let o;h(o=_())&&(i.inputViewChild=o.first)}},inputs:{value:"value",name:"name",disabled:[2,"disabled","disabled",y],binary:[2,"binary","binary",y],ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",tabindex:[2,"tabindex","tabindex",B],inputId:"inputId",style:"style",inputStyle:"inputStyle",styleClass:"styleClass",inputClass:"inputClass",indeterminate:[2,"indeterminate","indeterminate",y],size:"size",formControl:"formControl",checkboxIcon:"checkboxIcon",readonly:[2,"readonly","readonly",y],required:[2,"required","required",y],autofocus:[2,"autofocus","autofocus",y],trueValue:"trueValue",falseValue:"falseValue",variant:"variant"},outputs:{onChange:"onChange",onFocus:"onFocus",onBlur:"onBlur"},features:[oe([bi,Nt]),Q,qe],decls:6,vars:29,consts:[["input",""],[3,"ngClass"],["type","checkbox",3,"focus","blur","change","value","checked","disabled","readonly","ngClass"],[1,"p-checkbox-box"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"styleClass",4,"ngIf"],["class","p-checkbox-icon",3,"ngClass",4,"ngIf"],[1,"p-checkbox-icon",3,"ngClass"],[3,"styleClass"]],template:function(n,i){if(n&1){let o=M();d(0,"div",1)(1,"input",2,0),v("focus",function(u){return f(o),b(i.onInputFocus(u))})("blur",function(u){return f(o),b(i.onInputBlur(u))})("change",function(u){return f(o),b(i.handleChange(u))}),m(),d(3,"div",3),p(4,mi,3,2,"ng-container",4)(5,_i,1,0,null,5),m()()}n&2&&(N(i.style),z(i.styleClass),s("ngClass",i.containerClass),x("data-p-highlight",i.checked)("data-p-checked",i.checked)("data-p-disabled",i.disabled),c(),N(i.inputStyle),z(i.inputClass),s("value",i.value)("checked",i.checked)("disabled",i.disabled)("readonly",i.readonly)("ngClass",ce(26,si)),x("id",i.inputId)("name",i.name)("tabindex",i.tabindex)("required",i.required?!0:null)("aria-labelledby",i.ariaLabelledBy)("aria-label",i.ariaLabel),c(3),s("ngIf",!i.checkboxIconTemplate&&!i._checkboxIconTemplate),c(),s("ngTemplateOutlet",i.checkboxIconTemplate||i._checkboxIconTemplate)("ngTemplateOutletContext",O(27,ri,i.checked)))},dependencies:[H,K,de,U,Oe,Qt,q],encapsulation:2,changeDetection:0})}return t})();var xe=t=>({height:t}),xi=(t,l,e)=>({"p-multiselect-option-selected":t,"p-disabled":l,"p-focus":e}),Kt=t=>({$implicit:t}),Ci=(t,l)=>({checked:t,class:l});function vi(t,l){}function wi(t,l){t&1&&p(0,vi,0,0,"ng-template")}function Ii(t,l){if(t&1&&p(0,wi,1,0,null,4),t&2){let e=l.class,n=r(2);s("ngTemplateOutlet",n.itemCheckboxIconTemplate)("ngTemplateOutletContext",pe(2,Ci,n.selected,e))}}function Si(t,l){t&1&&(w(0),p(1,Ii,1,5,"ng-template",null,0,A),I())}function ki(t,l){if(t&1&&(d(0,"span"),D(1),m()),t&2){let e,n=r();c(),j((e=n.label)!==null&&e!==void 0?e:"empty")}}function Ti(t,l){t&1&&T(0)}var Oi=["item"],Mi=["group"],Vi=["loader"],Fi=["header"],Ei=["filter"],$i=["footer"],Li=["emptyfilter"],Ai=["empty"],Di=["selecteditems"],Pi=["checkicon"],zi=["loadingicon"],Ri=["filtericon"],Qi=["removetokenicon"],Ni=["chipicon"],Bi=["clearicon"],Ki=["dropdownicon"],Hi=["itemcheckboxicon"],qi=["headercheckboxicon"],ji=["overlay"],Gi=["filterInput"],Ui=["focusInput"],Zi=["items"],Wi=["scroller"],Yi=["lastHiddenFocusableEl"],Xi=["firstHiddenFocusableEl"],Ji=["headerCheckbox"],en=[[["p-header"]],[["p-footer"]]],tn=["p-header","p-footer"],nn=()=>({class:"p-multiselect-chip-icon"}),on=(t,l)=>({$implicit:t,removeChip:l}),Ht=t=>({options:t}),ln=(t,l,e)=>({checked:t,partialSelected:l,class:e}),qt=(t,l)=>({$implicit:t,options:l}),an=()=>({});function sn(t,l){if(t&1&&(w(0),D(1),I()),t&2){let e=r(2);c(),j(e.label()||"empty")}}function rn(t,l){if(t&1&&D(0),t&2){let e=r(3);ne(" ",e.getSelectedItemsLabel()," ")}}function cn(t,l){t&1&&T(0)}function pn(t,l){if(t&1){let e=M();d(0,"span",28),v("click",function(i){f(e);let o=r(4).$implicit,a=r(4);return b(a.removeOption(o,i))}),p(1,cn,1,0,"ng-container",29),m()}if(t&2){let e=r(8);x("data-pc-section","clearicon")("aria-hidden",!0),c(),s("ngTemplateOutlet",e.chipIconTemplate||e._chipIconTemplate||e.removeTokenIconTemplate||e._removeTokenIconTemplate)("ngTemplateOutletContext",ce(4,nn))}}function dn(t,l){if(t&1&&(w(0),p(1,pn,2,5,"span",27),I()),t&2){let e=r(7);c(),s("ngIf",e.chipIconTemplate||e._chipIconTemplate||e.removeTokenIconTemplate||e._removeTokenIconTemplate)}}function un(t,l){if(t&1&&p(0,dn,2,1,"ng-container",20),t&2){let e=r(6);s("ngIf",!e.disabled&&!e.readonly)}}function mn(t,l){t&1&&(w(0),p(1,un,1,1,"ng-template",null,5,A),I())}function hn(t,l){if(t&1){let e=M();d(0,"div",24,4)(2,"p-chip",26),v("onRemove",function(i){let o=f(e).$implicit,a=r(4);return b(a.removeOption(o,i))}),p(3,mn,3,0,"ng-container",20),m()()}if(t&2){let e=l.$implicit,n=r(4);c(2),s("label",n.getLabelByValue(e))("removable",!n.disabled&&!n.readonly)("removeIcon",n.chipIcon),c(),s("ngIf",n.chipIconTemplate||n._chipIconTemplate||n.removeTokenIconTemplate||n._removeTokenIconTemplate)}}function _n(t,l){if(t&1&&p(0,hn,4,4,"div",25),t&2){let e=r(3);s("ngForOf",e.chipSelectedItems())}}function gn(t,l){if(t&1&&(w(0),D(1),I()),t&2){let e=r(3);c(),j(e.placeholder()||e.defaultLabel||"empty")}}function fn(t,l){if(t&1&&(w(0),p(1,rn,1,1)(2,_n,1,1,"div",24)(3,gn,2,1,"ng-container",20),I()),t&2){let e=r(2);c(),R(e.chipSelectedItems()&&e.chipSelectedItems().length===e.maxSelectedLabels?1:2),c(2),s("ngIf",!e.modelValue()||e.modelValue().length===0)}}function bn(t,l){if(t&1&&(w(0),p(1,sn,2,1,"ng-container",20)(2,fn,4,2,"ng-container",20),I()),t&2){let e=r();c(),s("ngIf",e.display==="comma"),c(),s("ngIf",e.display==="chip")}}function yn(t,l){t&1&&T(0)}function xn(t,l){if(t&1&&(w(0),D(1),I()),t&2){let e=r(2);c(),j(e.placeholder()||e.defaultLabel||"empty")}}function Cn(t,l){if(t&1&&(w(0),p(1,yn,1,0,"ng-container",29)(2,xn,2,1,"ng-container",20),I()),t&2){let e=r();c(),s("ngTemplateOutlet",e.selectedItemsTemplate||e._selectedItemsTemplate)("ngTemplateOutletContext",pe(3,on,e.selectedOptions,e.removeOption.bind(e))),c(),s("ngIf",!e.modelValue()||e.modelValue().length===0)}}function vn(t,l){if(t&1){let e=M();d(0,"TimesIcon",31),v("click",function(i){f(e);let o=r(2);return b(o.clear(i))}),m()}t&2&&x("data-pc-section","clearicon")("aria-hidden",!0)}function wn(t,l){}function In(t,l){t&1&&p(0,wn,0,0,"ng-template")}function Sn(t,l){if(t&1){let e=M();d(0,"span",31),v("click",function(i){f(e);let o=r(2);return b(o.clear(i))}),p(1,In,1,0,null,32),m()}if(t&2){let e=r(2);x("data-pc-section","clearicon")("aria-hidden",!0),c(),s("ngTemplateOutlet",e.clearIconTemplate||e._clearIconTemplate)}}function kn(t,l){if(t&1&&(w(0),p(1,vn,1,2,"TimesIcon",30)(2,Sn,2,3,"span",30),I()),t&2){let e=r();c(),s("ngIf",!e.clearIconTemplate&&!e._clearIconTemplate),c(),s("ngIf",e.clearIconTemplate||e._clearIconTemplate)}}function Tn(t,l){t&1&&T(0)}function On(t,l){if(t&1&&(w(0),p(1,Tn,1,0,"ng-container",32),I()),t&2){let e=r(2);c(),s("ngTemplateOutlet",e.loadingIconTemplate||e._loadingIconTemplate)}}function Mn(t,l){if(t&1&&k(0,"span",35),t&2){let e=r(3);s("ngClass","p-multiselect-loading-icon pi-spin "+e.loadingIcon)}}function Vn(t,l){t&1&&k(0,"span",36),t&2&&z("p-multiselect-loading-icon pi pi-spinner pi-spin")}function Fn(t,l){if(t&1&&(w(0),p(1,Mn,1,1,"span",33)(2,Vn,1,2,"span",34),I()),t&2){let e=r(2);c(),s("ngIf",e.loadingIcon),c(),s("ngIf",!e.loadingIcon)}}function En(t,l){if(t&1&&(w(0),p(1,On,2,1,"ng-container",20)(2,Fn,3,2,"ng-container",20),I()),t&2){let e=r();c(),s("ngIf",e.loadingIconTemplate||e._loadingIconTemplate),c(),s("ngIf",!e.loadingIconTemplate&&!e._loadingIconTemplate)}}function $n(t,l){if(t&1&&k(0,"span",40),t&2){let e=r(3);s("ngClass",e.dropdownIcon),x("data-pc-section","triggericon")("aria-hidden",!0)}}function Ln(t,l){t&1&&k(0,"ChevronDownIcon",41),t&2&&(s("styleClass","p-multiselect-dropdown-icon"),x("data-pc-section","triggericon")("aria-hidden",!0))}function An(t,l){if(t&1&&(w(0),p(1,$n,1,3,"span",38)(2,Ln,1,3,"ChevronDownIcon",39),I()),t&2){let e=r(2);c(),s("ngIf",e.dropdownIcon),c(),s("ngIf",!e.dropdownIcon)}}function Dn(t,l){}function Pn(t,l){t&1&&p(0,Dn,0,0,"ng-template")}function zn(t,l){if(t&1&&(d(0,"span",42),p(1,Pn,1,0,null,32),m()),t&2){let e=r(2);x("data-pc-section","triggericon")("aria-hidden",!0),c(),s("ngTemplateOutlet",e.dropdownIconTemplate||e._dropdownIconTemplate)}}function Rn(t,l){if(t&1&&p(0,An,3,2,"ng-container",20)(1,zn,2,3,"span",37),t&2){let e=r();s("ngIf",!e.dropdownIconTemplate&&!e._dropdownIconTemplate),c(),s("ngIf",e.dropdownIconTemplate||e._dropdownIconTemplate)}}function Qn(t,l){t&1&&T(0)}function Nn(t,l){t&1&&T(0)}function Bn(t,l){if(t&1&&(w(0),p(1,Nn,1,0,"ng-container",29),I()),t&2){let e=r(3);c(),s("ngTemplateOutlet",e.filterTemplate||e._filterTemplate)("ngTemplateOutletContext",O(2,Ht,e.filterOptions))}}function Kn(t,l){if(t&1&&k(0,"CheckIcon",41),t&2){let e=r().class;s("styleClass",e),x("data-pc-section","icon")}}function Hn(t,l){}function qn(t,l){t&1&&p(0,Hn,0,0,"ng-template")}function jn(t,l){if(t&1&&p(0,Kn,1,2,"CheckIcon",39)(1,qn,1,0,null,29),t&2){let e=l.class,n=r(5);s("ngIf",!n.headerCheckboxIconTemplate&&!n._headerCheckboxIconTemplate&&n.allSelected()),c(),s("ngTemplateOutlet",n.headerCheckboxIconTemplate||n._headerCheckboxIconTemplate)("ngTemplateOutletContext",De(3,ln,n.allSelected(),n.partialSelected(),e))}}function Gn(t,l){if(t&1){let e=M();d(0,"p-checkbox",51,10),v("onChange",function(i){f(e);let o=r(4);return b(o.onToggleAll(i))}),p(2,jn,2,7,"ng-template",null,11,A),m()}if(t&2){let e=r(4);s("ngModel",e.allSelected())("ariaLabel",e.toggleAllAriaLabel)("binary",!0)("variant",e.variant)("disabled",e.disabled)}}function Un(t,l){t&1&&k(0,"SearchIcon",41),t&2&&s("styleClass","p-multiselect-filter-icon")}function Zn(t,l){}function Wn(t,l){t&1&&p(0,Zn,0,0,"ng-template")}function Yn(t,l){if(t&1&&(d(0,"span",55),p(1,Wn,1,0,null,32),m()),t&2){let e=r(5);c(),s("ngTemplateOutlet",e.filterIconTemplate||e._filterIconTemplate)}}function Xn(t,l){if(t&1){let e=M();d(0,"div",52)(1,"p-iconfield")(2,"input",53,12),v("input",function(i){f(e);let o=r(4);return b(o.onFilterInputChange(i))})("keydown",function(i){f(e);let o=r(4);return b(o.onFilterKeyDown(i))})("click",function(i){f(e);let o=r(4);return b(o.onInputClick(i))})("blur",function(i){f(e);let o=r(4);return b(o.onFilterBlur(i))}),m(),d(4,"p-inputicon"),p(5,Un,1,1,"SearchIcon",39)(6,Yn,2,1,"span",54),m()()()}if(t&2){let e=r(4);c(2),s("variant",e.variant)("value",e._filterValue()||"")("disabled",e.disabled),x("autocomplete",e.autocomplete)("aria-owns",e.id+"_list")("aria-activedescendant",e.focusedOptionId)("placeholder",e.filterPlaceHolder)("aria-label",e.ariaFilterLabel),c(3),s("ngIf",!e.filterIconTemplate&&!e._filterIconTemplate),c(),s("ngIf",e.filterIconTemplate||e._filterIconTemplate)}}function Jn(t,l){if(t&1&&p(0,Gn,4,5,"p-checkbox",49)(1,Xn,7,10,"div",50),t&2){let e=r(3);s("ngIf",e.showToggleAll&&!e.selectionLimit),c(),s("ngIf",e.filter)}}function eo(t,l){if(t&1&&(d(0,"div",48),Ae(1),p(2,Bn,2,4,"ng-container",22)(3,Jn,2,2,"ng-template",null,9,A),m()),t&2){let e=re(4),n=r(2);c(2),s("ngIf",n.filterTemplate||n._filterTemplate)("ngIfElse",e)}}function to(t,l){t&1&&T(0)}function io(t,l){if(t&1&&p(0,to,1,0,"ng-container",29),t&2){let e=l.$implicit,n=l.options;r(2);let i=re(9);s("ngTemplateOutlet",i)("ngTemplateOutletContext",pe(2,qt,e,n))}}function no(t,l){t&1&&T(0)}function oo(t,l){if(t&1&&p(0,no,1,0,"ng-container",29),t&2){let e=l.options,n=r(4);s("ngTemplateOutlet",n.loaderTemplate||n._loaderTemplate)("ngTemplateOutletContext",O(2,Ht,e))}}function lo(t,l){t&1&&(w(0),p(1,oo,1,4,"ng-template",null,14,A),I())}function ao(t,l){if(t&1){let e=M();d(0,"p-scroller",56,13),v("onLazyLoad",function(i){f(e);let o=r(2);return b(o.onLazyLoad.emit(i))}),p(2,io,1,5,"ng-template",null,3,A)(4,lo,3,0,"ng-container",20),m()}if(t&2){let e=r(2);N(O(9,xe,e.scrollHeight)),s("items",e.visibleOptions())("itemSize",e.virtualScrollItemSize||e._itemSize)("autoSize",!0)("tabindex",-1)("lazy",e.lazy)("options",e.virtualScrollOptions),c(4),s("ngIf",e.loaderTemplate||e._loaderTemplate)}}function so(t,l){t&1&&T(0)}function ro(t,l){if(t&1&&(w(0),p(1,so,1,0,"ng-container",29),I()),t&2){r();let e=re(9),n=r();c(),s("ngTemplateOutlet",e)("ngTemplateOutletContext",pe(3,qt,n.visibleOptions(),ce(2,an)))}}function co(t,l){if(t&1&&(d(0,"span"),D(1),m()),t&2){let e=r(2).$implicit,n=r(3);c(),j(n.getOptionGroupLabel(e.optionGroup))}}function po(t,l){t&1&&T(0)}function uo(t,l){if(t&1&&(w(0),d(1,"li",60),p(2,co,2,1,"span",20)(3,po,1,0,"ng-container",29),m(),I()),t&2){let e=r(),n=e.$implicit,i=e.index,o=r().options,a=r(2);c(),s("ngStyle",O(5,xe,o.itemSize+"px")),x("id",a.id+"_"+a.getOptionIndex(i,o)),c(),s("ngIf",!a.groupTemplate),c(),s("ngTemplateOutlet",a.groupTemplate)("ngTemplateOutletContext",O(7,Kt,n.optionGroup))}}function mo(t,l){if(t&1){let e=M();w(0),d(1,"p-multiselect-item",61),v("onClick",function(i){f(e);let o=r().index,a=r().options,u=r(2);return b(u.onOptionSelect(i,!1,u.getOptionIndex(o,a)))})("onMouseEnter",function(i){f(e);let o=r().index,a=r().options,u=r(2);return b(u.onOptionMouseEnter(i,u.getOptionIndex(o,a)))}),m(),I()}if(t&2){let e=r(),n=e.$implicit,i=e.index,o=r().options,a=r(2);c(),s("id",a.id+"_"+a.getOptionIndex(i,o))("option",n)("selected",a.isSelected(n))("label",a.getOptionLabel(n))("disabled",a.isOptionDisabled(n))("template",a.itemTemplate||a._itemTemplate)("checkIconTemplate",a.checkIconTemplate||a._checkIconTemplate)("itemCheckboxIconTemplate",a.itemCheckboxIconTemplate||a._itemCheckboxIconTemplate)("itemSize",o.itemSize)("focused",a.focusedOptionIndex()===a.getOptionIndex(i,o))("ariaPosInset",a.getAriaPosInset(a.getOptionIndex(i,o)))("ariaSetSize",a.ariaSetSize)("variant",a.variant)("highlightOnSelect",a.highlightOnSelect)}}function ho(t,l){if(t&1&&p(0,uo,4,9,"ng-container",20)(1,mo,2,14,"ng-container",20),t&2){let e=l.$implicit,n=r(3);s("ngIf",n.isOptionGroup(e)),c(),s("ngIf",!n.isOptionGroup(e))}}function _o(t,l){if(t&1&&D(0),t&2){let e=r(4);ne(" ",e.emptyFilterMessageLabel," ")}}function go(t,l){t&1&&T(0)}function fo(t,l){if(t&1&&p(0,go,1,0,"ng-container",32),t&2){let e=r(4);s("ngTemplateOutlet",e.emptyFilterTemplate||e._emptyFilterTemplate||e.emptyTemplate||e._emptyFilterTemplate)}}function bo(t,l){if(t&1&&(d(0,"li",62),p(1,_o,1,1)(2,fo,1,1,"ng-container"),m()),t&2){let e=r().options,n=r(2);s("ngStyle",O(2,xe,e.itemSize+"px")),c(),R(!n.emptyFilterTemplate&&!n._emptyFilterTemplate&&!n.emptyTemplate&&!n._emptyTemplate?1:2)}}function yo(t,l){if(t&1&&D(0),t&2){let e=r(4);ne(" ",e.emptyMessageLabel," ")}}function xo(t,l){t&1&&T(0)}function Co(t,l){if(t&1&&p(0,xo,1,0,"ng-container",32),t&2){let e=r(4);s("ngTemplateOutlet",e.emptyTemplate||e._emptyTemplate)}}function vo(t,l){if(t&1&&(d(0,"li",62),p(1,yo,1,1)(2,Co,1,1,"ng-container"),m()),t&2){let e=r().options,n=r(2);s("ngStyle",O(2,xe,e.itemSize+"px")),c(),R(!n.emptyTemplate&&!n._emptyTemplate?1:2)}}function wo(t,l){if(t&1&&(d(0,"ul",57,15),p(2,ho,2,2,"ng-template",58)(3,bo,3,4,"li",59)(4,vo,3,4,"li",59),m()),t&2){let e=l.$implicit,n=l.options,i=r(2);N(n.contentStyle),s("ngClass",n.contentStyleClass),x("aria-label",i.listLabel),c(2),s("ngForOf",e),c(),s("ngIf",i.hasFilter()&&i.isEmpty()),c(),s("ngIf",!i.hasFilter()&&i.isEmpty())}}function Io(t,l){t&1&&T(0)}function So(t,l){if(t&1&&(d(0,"div"),Ae(1,1),p(2,Io,1,0,"ng-container",32),m()),t&2){let e=r(2);c(2),s("ngTemplateOutlet",e.footerTemplate||e._footerTemplate)}}function ko(t,l){if(t&1){let e=M();d(0,"div",43)(1,"span",44,6),v("focus",function(i){f(e);let o=r();return b(o.onFirstHiddenFocus(i))}),m(),p(3,Qn,1,0,"ng-container",32)(4,eo,5,2,"div",45),d(5,"div",46),p(6,ao,5,11,"p-scroller",47)(7,ro,2,6,"ng-container",20)(8,wo,5,7,"ng-template",null,7,A),m(),p(10,So,3,1,"div",20),d(11,"span",44,8),v("focus",function(i){f(e);let o=r();return b(o.onLastHiddenFocus(i))}),m()()}if(t&2){let e=r();z(e.panelStyleClass),s("ngClass","p-multiselect-overlay p-component")("ngStyle",e.panelStyle),x("id",e.id+"_list"),c(),x("tabindex",0)("data-p-hidden-accessible",!0)("data-p-hidden-focusable",!0),c(2),s("ngTemplateOutlet",e.headerTemplate||e._headerTemplate),c(),s("ngIf",e.showHeader),c(),Ue("max-height",e.virtualScroll?"auto":e.scrollHeight||"auto"),c(),s("ngIf",e.virtualScroll),c(),s("ngIf",!e.virtualScroll),c(3),s("ngIf",e.footerFacet||e.footerTemplate||e._footerTemplate),c(),x("tabindex",0)("data-p-hidden-accessible",!0)("data-p-hidden-focusable",!0)}}var To=({dt:t})=>`
.p-multiselect {
    display: inline-flex;
    cursor: pointer;
    position: relative;
    user-select: none;
    background: ${t("multiselect.background")};
    border: 1px solid ${t("multiselect.border.color")};
    transition: background ${t("multiselect.transition.duration")}, color ${t("multiselect.transition.duration")}, border-color ${t("multiselect.transition.duration")}, outline-color ${t("multiselect.transition.duration")}, box-shadow ${t("multiselect.transition.duration")};
    border-radius: ${t("multiselect.border.radius")};
    outline-color: transparent;
    box-shadow: ${t("multiselect.shadow")};
}

.p-multiselect.ng-invalid.ng-dirty {
    border-color: ${t("multiselect.invalid.border.color")};
}

.p-multiselect:not(.p-disabled):hover {
    border-color: ${t("multiselect.hover.border.color")};
}

.p-multiselect:not(.p-disabled).p-focus {
    border-color: ${t("multiselect.focus.border.color")};
    box-shadow: ${t("multiselect.focus.ring.shadow")};
    outline: ${t("multiselect.focus.ring.width")} ${t("multiselect.focus.ring.style")} ${t("multiselect.focus.ring.color")};
    outline-offset: ${t("multiselect.focus.ring.offset")};
}

.p-multiselect.p-variant-filled {
    background: ${t("multiselect.filled.background")};
}

.p-multiselect.p-variant-filled:not(.p-disabled):hover {
    background: ${t("multiselect.filled.hover.background")};
}

.p-multiselect.p-variant-filled.p-focus {
    background: ${t("multiselect.filled.focus.background")};
}

.p-multiselect.p-disabled {
    opacity: 1;
    background: ${t("multiselect.disabled.background")};
}

.p-multiselect-dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    color: ${t("multiselect.dropdown.color")};
    width: ${t("multiselect.dropdown.width")};
    border-start-end-radius: ${t("multiselect.border.radius")};
    border-end-end-radius: ${t("multiselect.border.radius")};
}

.p-multiselect-label-container {
    overflow: hidden;
    flex: 1 1 auto;
    cursor: pointer;
}

.p-multiselect-label {
    display: flex;
    align-items-center;
    gap: calc(${t("multiselect.padding.y")} / 2);
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: ${t("multiselect.padding.y")} ${t("multiselect.padding.x")};
    color: ${t("multiselect.color")};
}

.p-multiselect-label.p-placeholder {
    color: ${t("multiselect.placeholder.color")};
}

p-multiSelect.ng-invalid.ng-dirty .p-multiselect-label.p-placeholder,
p-multi-select.ng-invalid.ng-dirty .p-multiselect-label.p-placeholder,
p-multiselect.ng-invalid.ng-dirty .p-multiselect-label.p-placeholder {
    color: ${t("multiselect.invalid.placeholder.color")};
}

.p-multiselect.p-disabled .p-multiselect-label {
    color: ${t("multiselect.disabled.color")};
}

.p-multiselect-label-empty {
    overflow: hidden;
    visibility: hidden;
}

.p-multiselect .p-multiselect-overlay {
    min-width: 100%;
}

.p-multiselect-overlay {
    background: ${t("multiselect.overlay.background")};
    color: ${t("multiselect.overlay.color")};
    border: 1px solid ${t("multiselect.overlay.border.color")};
    border-radius: ${t("multiselect.overlay.border.radius")};
    box-shadow: ${t("multiselect.overlay.shadow")};
}

.p-multiselect-header {
    display: flex;
    align-items: center;
    padding: ${t("multiselect.list.header.padding")};
}

.p-multiselect-header .p-checkbox {
    margin-inline-end: ${t("multiselect.option.gap")};
}

.p-multiselect-filter-container {
    flex: 1 1 auto;
}

.p-multiselect-filter {
    width: 100%;
}

.p-multiselect-list-container {
    overflow: auto;
}

.p-multiselect-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
    padding: ${t("multiselect.list.padding")};
    display: flex;
    flex-direction: column;
    gap: ${t("multiselect.list.gap")}
}

.p-multiselect-option {
    cursor: pointer;
    font-weight: normal;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: ${t("multiselect.option.gap")};
    padding: ${t("multiselect.option.padding")};
    border: 0 none;
    color: ${t("multiselect.option.color")};
    background: transparent;
    transition: background ${t("multiselect.transition.duration")}, color ${t("multiselect.transition.duration")}, border-color ${t("multiselect.transition.duration")}, box-shadow ${t("multiselect.transition.duration")}, outline-color ${t("multiselect.transition.duration")};
    border-radius: ${t("multiselect.option.border.radius")}
}

.p-multiselect-option:not(.p-multiselect-option-selected):not(.p-disabled).p-focus {
    background: ${t("multiselect.option.focus.background")};
    color: ${t("multiselect.option.focus.color")};
}

.p-multiselect-option.p-multiselect-option-selected {
    background: ${t("multiselect.option.selected.background")};
    color: ${t("multiselect.option.selected.color")};
}

.p-multiselect-option.p-multiselect-option-selected.p-focus {
    background: ${t("multiselect.option.selected.focus.background")};
    color: ${t("multiselect.option.selected.focus.color")};
}

.p-multiselect-option-group {
    cursor: auto;
    margin: 0;
    padding: ${t("multiselect.option.group.padding")};
    background: ${t("multiselect.option.group.background")};
    color: ${t("multiselect.option.group.color")};
    font-weight: ${t("multiselect.option.group.font.weight")};
}

.p-multiselect-empty-message {
    padding: ${t("multiselect.empty.message.padding")};
}

.p-multiselect-label .p-chip {
    padding-top: calc(${t("multiselect.padding.y")} / 2);
    padding-bottom: calc(${t("multiselect.padding.y")} / 2);
    border-radius: ${t("multiselect.chip.border.radius")};
}

.p-multiselect-label:has(.p-chip) {
    padding: calc(${t("multiselect.padding.y")} / 2) calc(${t("multiselect.padding.x")} / 2);
}

.p-multiselect-fluid {
    display: flex;
}

.p-multiselect-sm .p-multiselect-label {
    font-size: ${t("multiselect.sm.font.size")};
    padding-block: ${t("multiselect.sm.padding.y")};
    padding-inline: ${t("multiselect.sm.padding.x")};
}

.p-multiselect-sm .p-multiselect-dropdown .p-icon {
    font-size: ${t("multiselect.sm.font.size")};
    width: ${t("multiselect.sm.font.size")};
    height: ${t("multiselect.sm.font.size")};
}

.p-multiselect-lg .p-multiselect-label {
    font-size: ${t("multiselect.lg.font.size")};
    padding-block: ${t("multiselect.lg.padding.y")};
    padding-inline: ${t("multiselect.lg.padding.x")};
}

.p-multiselect-lg .p-multiselect-dropdown .p-icon {
    font-size: ${t("multiselect.lg.font.size")};
    width: ${t("multiselect.lg.font.size")};
    height: ${t("multiselect.lg.font.size")};
}

.p-multiselect-clear-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    color: ${t("multiselect.clear.icon.color")};
}`,Oo={root:({props:t})=>({position:t.appendTo==="self"?"relative":void 0})},Mo={root:({instance:t})=>({"p-multiselect p-component p-inputwrapper":!0,"p-multiselect-display-chip":t.display==="chip","p-disabled":t.disabled,"p-invalid":t.invalid,"p-variant-filled":t.variant?t.variant==="filled":t.config.inputStyle==="filled","p-focus":t.focused,"p-inputwrapper-filled":t.filled,"p-inputwrapper-focus":t.focused||t.overlayVisible,"p-multiselect-open":t.overlayVisible,"p-multiselect-fluid":t.hasFluid,"p-multiselect-sm p-inputfield-sm":t.size==="small","p-multiselect-lg p-inputfield-lg":t.size==="large"}),labelContainer:"p-multiselect-label-container",label:({instance:t})=>({"p-multiselect-label":!0,"p-placeholder":t.label()===t.placeholder(),"p-multiselect-label-empty":!t.placeholder()&&!t.defaultLabel&&(!t.modelValue()||t.modelValue().length===0)}),chipItem:"p-multiselect-chip-item",pcChip:"p-multiselect-chip",chipIcon:"p-multiselect-chip-icon",dropdown:"p-multiselect-dropdown",loadingIcon:"p-multiselect-loading-icon",dropdownIcon:"p-multiselect-dropdown-icon",overlay:"p-multiselect-overlay p-component",header:"p-multiselect-header",pcFilterContainer:"p-multiselect-filter-container",pcFilter:"p-multiselect-filter",listContainer:"p-multiselect-list-container",list:"p-multiselect-list",optionGroup:"p-multiselect-option-group",option:({instance:t,option:l,index:e,getItemOptions:n})=>({"p-multiselect-option":!0,"p-multiselect-option-selected":t.isSelected(l)&&t.highlightOnSelect,"p-focus":t.focusedOptionIndex===t.getOptionIndex(e,n),"p-disabled":t.isOptionDisabled(l)}),emptyMessage:"p-multiselect-empty-message"},Bt=(()=>{class t extends ae{name="multiselect";theme=To;classes=Mo;inlineStyles=Oo;static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275prov=ie({token:t,factory:t.\u0275fac})}return t})();var Vo={provide:se,useExisting:te(()=>Fe),multi:!0},Fo=(()=>{class t extends X{id;option;selected;label;disabled;itemSize;focused;ariaPosInset;ariaSetSize;variant;template;checkIconTemplate;itemCheckboxIconTemplate;highlightOnSelect;onClick=new S;onMouseEnter=new S;onOptionClick(e){this.onClick.emit({originalEvent:e,option:this.option,selected:this.selected}),e.stopPropagation(),e.preventDefault()}onOptionMouseEnter(e){this.onMouseEnter.emit({originalEvent:e,option:this.option,selected:this.selected})}static \u0275fac=(()=>{let e;return function(i){return(e||(e=P(t)))(i||t)}})();static \u0275cmp=$({type:t,selectors:[["p-multiSelectItem"],["p-multiselect-item"]],inputs:{id:"id",option:"option",selected:[2,"selected","selected",y],label:"label",disabled:[2,"disabled","disabled",y],itemSize:[2,"itemSize","itemSize",B],focused:[2,"focused","focused",y],ariaPosInset:"ariaPosInset",ariaSetSize:"ariaSetSize",variant:"variant",template:"template",checkIconTemplate:"checkIconTemplate",itemCheckboxIconTemplate:"itemCheckboxIconTemplate",highlightOnSelect:[2,"highlightOnSelect","highlightOnSelect",y]},outputs:{onClick:"onClick",onMouseEnter:"onMouseEnter"},features:[Q],decls:5,vars:28,consts:[["checkboxicon",""],["pRipple","","role","option",1,"p-multiselect-option",3,"click","mouseenter","ngStyle","ngClass","id"],[3,"ngModel","binary","tabindex","variant","ariaLabel"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(n,i){n&1&&(d(0,"li",1),v("click",function(a){return i.onOptionClick(a)})("mouseenter",function(a){return i.onOptionMouseEnter(a)}),d(1,"p-checkbox",2),p(2,Si,3,0,"ng-container",3),m(),p(3,ki,2,1,"span",3)(4,Ti,1,0,"ng-container",4),m()),n&2&&(s("ngStyle",O(20,xe,i.itemSize+"px"))("ngClass",De(22,xi,i.selected&&i.highlightOnSelect,i.disabled,i.focused))("id",i.id),x("aria-label",i.label)("aria-setsize",i.ariaSetSize)("aria-posinset",i.ariaPosInset)("aria-selected",i.selected)("data-p-focused",i.focused)("data-p-highlight",i.selected)("data-p-disabled",i.disabled)("aria-checked",i.selected),c(),s("ngModel",i.selected)("binary",!0)("tabindex",-1)("variant",i.variant)("ariaLabel",i.label),c(),s("ngIf",i.itemCheckboxIconTemplate),c(),s("ngIf",!i.template),c(),s("ngTemplateOutlet",i.template)("ngTemplateOutletContext",O(26,Kt,i.option)))},dependencies:[H,K,de,U,ue,Ve,be,ge,fe,Ot,q],encapsulation:2})}return t})(),Fe=(()=>{class t extends X{zone;filterService;overlayService;id;ariaLabel;style;styleClass;panelStyle;panelStyleClass;inputId;disabled;fluid;readonly;group;filter=!0;filterPlaceHolder;filterLocale;overlayVisible;tabindex=0;variant;appendTo;dataKey;name;ariaLabelledBy;set displaySelectedLabel(e){this._displaySelectedLabel=e}get displaySelectedLabel(){return this._displaySelectedLabel}set maxSelectedLabels(e){this._maxSelectedLabels=e}get maxSelectedLabels(){return this._maxSelectedLabels}selectionLimit;selectedItemsLabel;showToggleAll=!0;emptyFilterMessage="";emptyMessage="";resetFilterOnHide=!1;dropdownIcon;chipIcon;optionLabel;optionValue;optionDisabled;optionGroupLabel="label";optionGroupChildren="items";showHeader=!0;filterBy;scrollHeight="200px";lazy=!1;virtualScroll;loading=!1;virtualScrollItemSize;loadingIcon;virtualScrollOptions;overlayOptions;ariaFilterLabel;filterMatchMode="contains";tooltip="";tooltipPosition="right";tooltipPositionStyle="absolute";tooltipStyleClass;autofocusFilter=!1;display="comma";autocomplete="off";size;showClear=!1;autofocus;get autoZIndex(){return this._autoZIndex}set autoZIndex(e){this._autoZIndex=e,console.log("The autoZIndex property is deprecated since v14.2.0, use overlayOptions property instead.")}get baseZIndex(){return this._baseZIndex}set baseZIndex(e){this._baseZIndex=e,console.log("The baseZIndex property is deprecated since v14.2.0, use overlayOptions property instead.")}get showTransitionOptions(){return this._showTransitionOptions}set showTransitionOptions(e){this._showTransitionOptions=e,console.log("The showTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.")}get hideTransitionOptions(){return this._hideTransitionOptions}set hideTransitionOptions(e){this._hideTransitionOptions=e,console.log("The hideTransitionOptions property is deprecated since v14.2.0, use overlayOptions property instead.")}set defaultLabel(e){this._defaultLabel=e,console.log("defaultLabel property is deprecated since 16.6.0, use placeholder instead")}get defaultLabel(){return this._defaultLabel}set placeholder(e){this._placeholder.set(e)}get placeholder(){return this._placeholder.asReadonly()}get options(){return this._options()}set options(e){pt(this._options(),e)||this._options.set(e)}get filterValue(){return this._filterValue()}set filterValue(e){this._filterValue.set(e)}get itemSize(){return this._itemSize}set itemSize(e){this._itemSize=e,console.log("The itemSize property is deprecated, use virtualScrollItemSize property instead.")}get selectAll(){return this._selectAll}set selectAll(e){this._selectAll=e}focusOnHover=!0;filterFields;selectOnFocus=!1;autoOptionFocus=!1;highlightOnSelect=!0;onChange=new S;onFilter=new S;onFocus=new S;onBlur=new S;onClick=new S;onClear=new S;onPanelShow=new S;onPanelHide=new S;onLazyLoad=new S;onRemove=new S;onSelectAllChange=new S;overlayViewChild;filterInputChild;focusInputViewChild;itemsViewChild;scroller;lastHiddenFocusableElementOnOverlay;firstHiddenFocusableElementOnOverlay;headerCheckboxViewChild;footerFacet;headerFacet;_componentStyle=E(Bt);searchValue;searchTimeout;_selectAll=null;_autoZIndex;_baseZIndex;_showTransitionOptions;_hideTransitionOptions;_defaultLabel;_placeholder=V(void 0);_itemSize;_selectionLimit;_disableTooltip=!1;value;_filteredOptions;onModelChange=()=>{};onModelTouched=()=>{};valuesAsString;focus;filtered;itemTemplate;groupTemplate;loaderTemplate;headerTemplate;filterTemplate;footerTemplate;emptyFilterTemplate;emptyTemplate;selectedItemsTemplate;checkIconTemplate;loadingIconTemplate;filterIconTemplate;removeTokenIconTemplate;chipIconTemplate;clearIconTemplate;dropdownIconTemplate;itemCheckboxIconTemplate;headerCheckboxIconTemplate;templates;_itemTemplate;_groupTemplate;_loaderTemplate;_headerTemplate;_filterTemplate;_footerTemplate;_emptyFilterTemplate;_emptyTemplate;_selectedItemsTemplate;_checkIconTemplate;_loadingIconTemplate;_filterIconTemplate;_removeTokenIconTemplate;_chipIconTemplate;_clearIconTemplate;_dropdownIconTemplate;_itemCheckboxIconTemplate;_headerCheckboxIconTemplate;ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"item":this._itemTemplate=e.template;break;case"group":this._groupTemplate=e.template;break;case"selectedItems":case"selecteditems":this._selectedItemsTemplate=e.template;break;case"header":this._headerTemplate=e.template;break;case"filter":this._filterTemplate=e.template;break;case"emptyfilter":this._emptyFilterTemplate=e.template;break;case"empty":this._emptyTemplate=e.template;break;case"footer":this._footerTemplate=e.template;break;case"loader":this._loaderTemplate=e.template;break;case"checkicon":this._checkIconTemplate=e.template,console.warn("checkicon is deprecated and will removed in future. Use itemcheckboxicon or headercheckboxicon templates instead.");break;case"headercheckboxicon":this._headerCheckboxIconTemplate=e.template;break;case"loadingicon":this._loadingIconTemplate=e.template;break;case"filtericon":this._filterIconTemplate=e.template;break;case"removetokenicon":this._removeTokenIconTemplate=e.template;break;case"clearicon":this._clearIconTemplate=e.template;break;case"dropdownicon":this._dropdownIconTemplate=e.template;break;case"itemcheckboxicon":this._itemCheckboxIconTemplate=e.template;break;case"chipicon":this._chipIconTemplate=e.template;break;default:this._itemTemplate=e.template;break}})}headerCheckboxFocus;filterOptions;preventModelTouched;preventDocumentDefault;focused=!1;itemsWrapper;_displaySelectedLabel=!0;_maxSelectedLabels=3;modelValue=V(null);_filterValue=V(null);_options=V(null);startRangeIndex=V(-1);focusedOptionIndex=V(-1);selectedOptions;clickInProgress=!1;get hostClasses(){let e=[];return typeof this.rootClass=="string"?e.push(this.rootClass):Array.isArray(this.rootClass)?e.push(...this.rootClass):typeof this.rootClass=="object"&&Object.keys(this.rootClass).filter(n=>this.rootClass[n]).forEach(n=>e.push(n)),this.styleClass&&e.push(this.styleClass),e.join(" ")}get rootClass(){return this._componentStyle.classes.root({instance:this})}get labelClass(){return this._componentStyle.classes.label({instance:this})}get emptyMessageLabel(){return this.emptyMessage||this.config.getTranslation(_e.EMPTY_MESSAGE)}get emptyFilterMessageLabel(){return this.emptyFilterMessage||this.config.getTranslation(_e.EMPTY_FILTER_MESSAGE)}get filled(){return typeof this.modelValue()=="string"?!!this.modelValue():G(this.modelValue())}get isVisibleClearIcon(){return this.modelValue()!=null&&this.modelValue()!==""&&G(this.modelValue())&&this.showClear&&!this.disabled&&!this.readonly&&this.filled}get toggleAllAriaLabel(){return this.config.translation.aria?this.config.translation.aria[this.allSelected()?"selectAll":"unselectAll"]:void 0}get closeAriaLabel(){return this.config.translation.aria?this.config.translation.aria.close:void 0}get listLabel(){return this.config.getTranslation(_e.ARIA).listLabel}get hasFluid(){let n=this.el.nativeElement.closest("p-fluid");return this.fluid||!!n}getAllVisibleAndNonVisibleOptions(){return this.group?this.flatOptions(this.options):this.options||[]}visibleOptions=F(()=>{let e=this.getAllVisibleAndNonVisibleOptions(),n=ut(e)&&wt.isObject(e[0]);if(this._filterValue()){let i;if(n?i=this.filterService.filter(e,this.searchFields(),this._filterValue(),this.filterMatchMode,this.filterLocale):i=e.filter(o=>o.toString().toLocaleLowerCase().includes(this._filterValue().toLocaleLowerCase())),this.group){let o=this.options||[],a=[];return o.forEach(u=>{let Ce=this.getOptionGroupChildren(u).filter(Ut=>i.includes(Ut));Ce.length>0&&a.push(ee(J({},u),{[typeof this.optionGroupChildren=="string"?this.optionGroupChildren:"items"]:[...Ce]}))}),this.flatOptions(a)}return i}return e});label=F(()=>{let e,n=this.modelValue();if(n&&n.length&&this.displaySelectedLabel){if(G(this.maxSelectedLabels)&&n.length>this.maxSelectedLabels)return this.getSelectedItemsLabel();e="";for(let i=0;i<n.length;i++)i!==0&&(e+=", "),e+=this.getLabelByValue(n[i])}else e=this.placeholder()||this.defaultLabel||"";return e});chipSelectedItems=F(()=>G(this.maxSelectedLabels)&&this.modelValue()&&this.modelValue().length>this.maxSelectedLabels?this.modelValue().slice(0,this.maxSelectedLabels):this.modelValue());constructor(e,n,i){super(),this.zone=e,this.filterService=n,this.overlayService=i,Re(()=>{let o=this.modelValue(),a=this.getAllVisibleAndNonVisibleOptions();a&&G(a)&&(this.optionValue&&this.optionLabel&&o?this.selectedOptions=a.filter(u=>o.includes(u[this.optionLabel])||o.includes(u[this.optionValue])):this.selectedOptions=o,this.cd.markForCheck())})}ngOnInit(){super.ngOnInit(),this.id=this.id||ht("pn_id_"),this.autoUpdateModel(),this.filterBy&&(this.filterOptions={filter:e=>this.onFilterInputChange(e),reset:()=>this.resetFilter()})}maxSelectionLimitReached(){return this.selectionLimit&&this.modelValue()&&this.modelValue().length===this.selectionLimit}ngAfterViewInit(){super.ngAfterViewInit(),this.overlayVisible&&this.show()}ngAfterViewChecked(){this.filtered&&(this.zone.runOutsideAngular(()=>{setTimeout(()=>{this.overlayViewChild?.alignOverlay()},1)}),this.filtered=!1)}flatOptions(e){return(e||[]).reduce((n,i,o)=>{n.push({optionGroup:i,group:!0,index:o});let a=this.getOptionGroupChildren(i);return a&&a.forEach(u=>n.push(u)),n},[])}autoUpdateModel(){if(this.selectOnFocus&&this.autoOptionFocus&&!this.hasSelectedOption()){this.focusedOptionIndex.set(this.findFirstFocusedOptionIndex());let e=this.getOptionValue(this.visibleOptions()[this.focusedOptionIndex()]);this.onOptionSelect({originalEvent:null,option:[e]})}}updateModel(e,n){this.value=e,this.onModelChange(e),this.modelValue.set(e)}onInputClick(e){e.stopPropagation(),e.preventDefault(),this.focusedOptionIndex.set(-1)}onOptionSelect(e,n=!1,i=-1){let{originalEvent:o,option:a}=e;if(this.disabled||this.isOptionDisabled(a))return;let u=this.isSelected(a),g=null;u?g=this.modelValue().filter(Ce=>!Y(Ce,this.getOptionValue(a),this.equalityKey())):g=[...this.modelValue()||[],this.getOptionValue(a)],this.updateModel(g,o),i!==-1&&this.focusedOptionIndex.set(i),n&&Z(this.focusInputViewChild?.nativeElement),this.onChange.emit({originalEvent:e,value:g,itemValue:a})}findSelectedOptionIndex(){return this.hasSelectedOption()?this.visibleOptions().findIndex(e=>this.isValidSelectedOption(e)):-1}onOptionSelectRange(e,n=-1,i=-1){if(n===-1&&(n=this.findNearestSelectedOptionIndex(i,!0)),i===-1&&(i=this.findNearestSelectedOptionIndex(n)),n!==-1&&i!==-1){let o=Math.min(n,i),a=Math.max(n,i),u=this.visibleOptions().slice(o,a+1).filter(g=>this.isValidOption(g)).map(g=>this.getOptionValue(g));this.updateModel(u,e)}}searchFields(){return(this.filterBy||this.optionLabel||"label").split(",")}findNearestSelectedOptionIndex(e,n=!1){let i=-1;return this.hasSelectedOption()&&(n?(i=this.findPrevSelectedOptionIndex(e),i=i===-1?this.findNextSelectedOptionIndex(e):i):(i=this.findNextSelectedOptionIndex(e),i=i===-1?this.findPrevSelectedOptionIndex(e):i)),i>-1?i:e}findPrevSelectedOptionIndex(e){let n=this.hasSelectedOption()&&e>0?he(this.visibleOptions().slice(0,e),i=>this.isValidSelectedOption(i)):-1;return n>-1?n:-1}findFirstFocusedOptionIndex(){let e=this.findFirstSelectedOptionIndex();return e<0?this.findFirstOptionIndex():e}findFirstOptionIndex(){return this.visibleOptions().findIndex(e=>this.isValidOption(e))}findFirstSelectedOptionIndex(){return this.hasSelectedOption()?this.visibleOptions().findIndex(e=>this.isValidSelectedOption(e)):-1}findNextSelectedOptionIndex(e){let n=this.hasSelectedOption()&&e<this.visibleOptions().length-1?this.visibleOptions().slice(e+1).findIndex(i=>this.isValidSelectedOption(i)):-1;return n>-1?n+e+1:-1}equalityKey(){return this.optionValue?null:this.dataKey}hasSelectedOption(){return G(this.modelValue())}isValidSelectedOption(e){return this.isValidOption(e)&&this.isSelected(e)}isOptionGroup(e){return(this.group||this.optionGroupLabel)&&e.optionGroup&&e.group}isValidOption(e){return e&&!(this.isOptionDisabled(e)||this.isOptionGroup(e))}isOptionDisabled(e){return this.maxSelectionLimitReached()&&!this.isSelected(e)?!0:this.optionDisabled?W(e,this.optionDisabled):e&&e.disabled!==void 0?e.disabled:!1}isSelected(e){let n=this.getOptionValue(e);return(this.modelValue()||[]).some(i=>Y(i,n,this.equalityKey()))}isOptionMatched(e){return this.isValidOption(e)&&this.getOptionLabel(e).toString().toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale))}isEmpty(){return!this._options()||this.visibleOptions()&&this.visibleOptions().length===0}getOptionIndex(e,n){return this.virtualScrollerDisabled?e:n&&n.getItemOptions(e).index}getAriaPosInset(e){return(this.optionGroupLabel?e-this.visibleOptions().slice(0,e).filter(n=>this.isOptionGroup(n)).length:e)+1}get ariaSetSize(){return this.visibleOptions().filter(e=>!this.isOptionGroup(e)).length}getLabelByValue(e){let i=(this.group?this.flatOptions(this._options()):this._options()||[]).find(o=>!this.isOptionGroup(o)&&Y(this.getOptionValue(o),e,this.equalityKey()));return i?this.getOptionLabel(i):null}getSelectedItemsLabel(){let e=/{(.*?)}/,n=this.selectedItemsLabel?this.selectedItemsLabel:this.config.getTranslation(_e.SELECTION_MESSAGE);return e.test(n)?n.replace(n.match(e)[0],this.modelValue().length+""):n}getOptionLabel(e){return this.optionLabel?W(e,this.optionLabel):e&&e.label!=null?e.label:e}getOptionValue(e){return this.optionValue?W(e,this.optionValue):!this.optionLabel&&e&&e.value!==void 0?e.value:e}getOptionGroupLabel(e){return this.optionGroupLabel?W(e,this.optionGroupLabel):e&&e.label!=null?e.label:e}getOptionGroupChildren(e){return this.optionGroupChildren?W(e,this.optionGroupChildren):e.items}onKeyDown(e){if(this.disabled){e.preventDefault();return}let n=e.metaKey||e.ctrlKey;switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"PageDown":this.onPageDownKey(e);break;case"PageUp":this.onPageUpKey(e);break;case"Enter":case"Space":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"ShiftLeft":case"ShiftRight":this.onShiftKey();break;default:if(e.code==="KeyA"&&n){let i=this.visibleOptions().filter(o=>this.isValidOption(o)).map(o=>this.getOptionValue(o));this.updateModel(i,e),e.preventDefault();break}!n&&mt(e.key)&&(!this.overlayVisible&&this.show(),this.searchOptions(e,e.key),e.preventDefault());break}}onFilterKeyDown(e){switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e,!0);break;case"ArrowLeft":case"ArrowRight":this.onArrowLeftKey(e,!0);break;case"Home":this.onHomeKey(e,!0);break;case"End":this.onEndKey(e,!0);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e,!0);break;default:break}}onArrowLeftKey(e,n=!1){n&&this.focusedOptionIndex.set(-1)}onArrowDownKey(e){let n=this.focusedOptionIndex()!==-1?this.findNextOptionIndex(this.focusedOptionIndex()):this.findFirstFocusedOptionIndex();e.shiftKey&&this.onOptionSelectRange(e,this.startRangeIndex(),n),this.changeFocusedOptionIndex(e,n),!this.overlayVisible&&this.show(),e.preventDefault(),e.stopPropagation()}onArrowUpKey(e,n=!1){if(e.altKey&&!n)this.focusedOptionIndex()!==-1&&this.onOptionSelect(e,this.visibleOptions()[this.focusedOptionIndex()]),this.overlayVisible&&this.hide(),e.preventDefault();else{let i=this.focusedOptionIndex()!==-1?this.findPrevOptionIndex(this.focusedOptionIndex()):this.findLastFocusedOptionIndex();e.shiftKey&&this.onOptionSelectRange(e,i,this.startRangeIndex()),this.changeFocusedOptionIndex(e,i),!this.overlayVisible&&this.show(),e.preventDefault()}e.stopPropagation()}onHomeKey(e,n=!1){let{currentTarget:i}=e;if(n){let o=i.value.length;i.setSelectionRange(0,e.shiftKey?o:0),this.focusedOptionIndex.set(-1)}else{let o=e.metaKey||e.ctrlKey,a=this.findFirstOptionIndex();e.shiftKey&&o&&this.onOptionSelectRange(e,a,this.startRangeIndex()),this.changeFocusedOptionIndex(e,a),!this.overlayVisible&&this.show()}e.preventDefault()}onEndKey(e,n=!1){let{currentTarget:i}=e;if(n){let o=i.value.length;i.setSelectionRange(e.shiftKey?0:o,o),this.focusedOptionIndex.set(-1)}else{let o=e.metaKey||e.ctrlKey,a=this.findLastFocusedOptionIndex();e.shiftKey&&o&&this.onOptionSelectRange(e,this.startRangeIndex(),a),this.changeFocusedOptionIndex(e,a),!this.overlayVisible&&this.show()}e.preventDefault()}onPageDownKey(e){this.scrollInView(this.visibleOptions().length-1),e.preventDefault()}onPageUpKey(e){this.scrollInView(0),e.preventDefault()}onEnterKey(e){this.overlayVisible?this.focusedOptionIndex()!==-1&&(e.shiftKey?this.onOptionSelectRange(e,this.focusedOptionIndex()):this.onOptionSelect({originalEvent:e,option:this.visibleOptions()[this.focusedOptionIndex()]})):this.onArrowDownKey(e),e.preventDefault()}onEscapeKey(e){this.overlayVisible&&this.hide(!0),e.stopPropagation(),e.preventDefault()}onDeleteKey(e){this.showClear&&(this.clear(e),e.preventDefault())}onTabKey(e,n=!1){n||(this.overlayVisible&&this.hasFocusableElements()?(Z(e.shiftKey?this.lastHiddenFocusableElementOnOverlay.nativeElement:this.firstHiddenFocusableElementOnOverlay.nativeElement),e.preventDefault()):(this.focusedOptionIndex()!==-1&&this.onOptionSelect({originalEvent:e,option:this.visibleOptions()[this.focusedOptionIndex()]}),this.overlayVisible&&this.hide(this.filter)))}onShiftKey(){this.startRangeIndex.set(this.focusedOptionIndex())}onContainerClick(e){if(!(this.disabled||this.loading||this.readonly||e.target.isSameNode(this.focusInputViewChild?.nativeElement))){if(!this.overlayViewChild||!this.overlayViewChild.el.nativeElement.contains(e.target)){if(this.clickInProgress)return;this.clickInProgress=!0,setTimeout(()=>{this.clickInProgress=!1},150),this.overlayVisible?this.hide(!0):this.show(!0)}this.focusInputViewChild?.nativeElement.focus({preventScroll:!0}),this.onClick.emit(e),this.cd.detectChanges()}}onFirstHiddenFocus(e){let n=e.relatedTarget===this.focusInputViewChild?.nativeElement?rt(this.overlayViewChild?.overlayViewChild?.nativeElement,':not([data-p-hidden-focusable="true"])'):this.focusInputViewChild?.nativeElement;Z(n)}onInputFocus(e){this.focused=!0;let n=this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.overlayVisible&&this.autoOptionFocus?this.findFirstFocusedOptionIndex():-1;this.focusedOptionIndex.set(n),this.overlayVisible&&this.scrollInView(this.focusedOptionIndex()),this.onFocus.emit({originalEvent:e})}onInputBlur(e){this.focused=!1,this.onBlur.emit({originalEvent:e}),this.preventModelTouched||this.onModelTouched(),this.preventModelTouched=!1}onFilterInputChange(e){let n=e.target.value;this._filterValue.set(n),this.focusedOptionIndex.set(-1),this.onFilter.emit({originalEvent:e,filter:this._filterValue()}),!this.virtualScrollerDisabled&&this.scroller.scrollToIndex(0),setTimeout(()=>{this.overlayViewChild.alignOverlay()})}onLastHiddenFocus(e){let n=e.relatedTarget===this.focusInputViewChild?.nativeElement?ct(this.overlayViewChild?.overlayViewChild?.nativeElement,':not([data-p-hidden-focusable="true"])'):this.focusInputViewChild?.nativeElement;Z(n)}onOptionMouseEnter(e,n){this.focusOnHover&&this.changeFocusedOptionIndex(e,n)}onHeaderCheckboxKeyDown(e){if(this.disabled){e.preventDefault();return}switch(e.code){case"Space":this.onToggleAll(e);break;case"Enter":this.onToggleAll(e);break;default:break}}onFilterBlur(e){this.focusedOptionIndex.set(-1)}onHeaderCheckboxFocus(){this.headerCheckboxFocus=!0}onHeaderCheckboxBlur(){this.headerCheckboxFocus=!1}onToggleAll(e){if(!(this.disabled||this.readonly)){if(this.selectAll!=null)this.onSelectAllChange.emit({originalEvent:e,checked:!this.allSelected()});else{let n=this.getAllVisibleAndNonVisibleOptions().filter(g=>this.isSelected(g)&&(this.optionDisabled?W(g,this.optionDisabled):g&&g.disabled!==void 0?g.disabled:!1)),i=this.allSelected()?this.visibleOptions().filter(g=>!this.isValidOption(g)&&this.isSelected(g)):this.visibleOptions().filter(g=>this.isSelected(g)||this.isValidOption(g)),a=[...this.filter&&!this.allSelected()?this.getAllVisibleAndNonVisibleOptions().filter(g=>this.isSelected(g)&&this.isValidOption(g)):[],...n,...i].map(g=>this.getOptionValue(g)),u=[...new Set(a)];this.updateModel(u,e),(!u.length||u.length===this.getAllVisibleAndNonVisibleOptions().length)&&this.onSelectAllChange.emit({originalEvent:e,checked:!!u.length})}this.partialSelected()&&(this.selectedOptions=null,this.cd.markForCheck()),this.onChange.emit({originalEvent:e,value:this.value}),Tt.focus(this.headerCheckboxViewChild?.inputViewChild?.nativeElement),this.headerCheckboxFocus=!0,e.originalEvent.preventDefault(),e.originalEvent.stopPropagation()}}changeFocusedOptionIndex(e,n){this.focusedOptionIndex()!==n&&(this.focusedOptionIndex.set(n),this.scrollInView())}get virtualScrollerDisabled(){return!this.virtualScroll}scrollInView(e=-1){let n=e!==-1?`${this.id}_${e}`:this.focusedOptionId;if(this.itemsViewChild&&this.itemsViewChild.nativeElement){let i=Te(this.itemsViewChild.nativeElement,`li[id="${n}"]`);i?i.scrollIntoView&&i.scrollIntoView({block:"nearest",inline:"nearest"}):this.virtualScrollerDisabled||setTimeout(()=>{this.virtualScroll&&this.scroller?.scrollToIndex(e!==-1?e:this.focusedOptionIndex())},0)}}get focusedOptionId(){return this.focusedOptionIndex()!==-1?`${this.id}_${this.focusedOptionIndex()}`:null}writeValue(e){this.value=e,this.modelValue.set(this.value),this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.disabled=e,this.cd.markForCheck()}allSelected(){return this.selectAll!==null?this.selectAll:G(this.visibleOptions())&&this.visibleOptions().every(e=>this.isOptionGroup(e)||this.isOptionDisabled(e)||this.isSelected(e))}partialSelected(){return this.selectedOptions&&this.selectedOptions.length>0&&this.selectedOptions.length<this.options.length}show(e){this.overlayVisible=!0;let n=this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.autoOptionFocus?this.findFirstFocusedOptionIndex():this.findSelectedOptionIndex();this.focusedOptionIndex.set(n),e&&Z(this.focusInputViewChild?.nativeElement),this.cd.markForCheck()}hide(e){this.overlayVisible=!1,this.focusedOptionIndex.set(-1),this.filter&&this.resetFilterOnHide&&this.resetFilter(),this.overlayOptions?.mode==="modal"&&at(),e&&Z(this.focusInputViewChild?.nativeElement),this.cd.markForCheck()}onOverlayAnimationStart(e){if(e.toState==="visible"){if(this.itemsWrapper=Te(this.overlayViewChild?.overlayViewChild?.nativeElement,this.virtualScroll?".p-scroller":".p-multiselect-list-container"),this.virtualScroll&&this.scroller?.setContentEl(this.itemsViewChild?.nativeElement),this.options&&this.options.length)if(this.virtualScroll){let n=this.modelValue()?this.focusedOptionIndex():-1;n!==-1&&this.scroller?.scrollToIndex(n)}else{let n=Te(this.itemsWrapper,'[data-p-highlight="true"]');n&&n.scrollIntoView({block:"nearest",inline:"nearest"})}this.filterInputChild&&this.filterInputChild.nativeElement&&(this.preventModelTouched=!0,this.autofocusFilter&&this.filterInputChild.nativeElement.focus()),this.onPanelShow.emit(e)}e.toState==="void"&&(this.itemsWrapper=null,this.onModelTouched(),this.onPanelHide.emit(e))}resetFilter(){this.filterInputChild&&this.filterInputChild.nativeElement&&(this.filterInputChild.nativeElement.value=""),this._filterValue.set(null),this._filteredOptions=null}close(e){this.hide(),e.preventDefault(),e.stopPropagation()}clear(e){this.value=null,this.updateModel(null,e),this.selectedOptions=null,this.onClear.emit(),this._disableTooltip=!0,e.stopPropagation()}labelContainerMouseLeave(){this._disableTooltip&&(this._disableTooltip=!1)}removeOption(e,n){let i=this.modelValue().filter(o=>!Y(o,e,this.equalityKey()));this.updateModel(i,n),this.onChange.emit({originalEvent:n,value:i,itemValue:e}),this.onRemove.emit({newValue:i,removed:e}),n&&n.stopPropagation()}findNextItem(e){let n=e.nextElementSibling;return n?me(n.children[0],"p-disabled")||Qe(n.children[0])||me(n,"p-multiselect-item-group")?this.findNextItem(n):n.children[0]:null}findPrevItem(e){let n=e.previousElementSibling;return n?me(n.children[0],"p-disabled")||Qe(n.children[0])||me(n,"p-multiselect-item-group")?this.findPrevItem(n):n.children[0]:null}findNextOptionIndex(e){let n=e<this.visibleOptions().length-1?this.visibleOptions().slice(e+1).findIndex(i=>this.isValidOption(i)):-1;return n>-1?n+e+1:e}findPrevOptionIndex(e){let n=e>0?he(this.visibleOptions().slice(0,e),i=>this.isValidOption(i)):-1;return n>-1?n:e}findLastSelectedOptionIndex(){return this.hasSelectedOption()?he(this.visibleOptions(),e=>this.isValidSelectedOption(e)):-1}findLastFocusedOptionIndex(){let e=this.findLastSelectedOptionIndex();return e<0?this.findLastOptionIndex():e}findLastOptionIndex(){return he(this.visibleOptions(),e=>this.isValidOption(e))}searchOptions(e,n){this.searchValue=(this.searchValue||"")+n;let i=-1,o=!1;return this.focusedOptionIndex()!==-1?(i=this.visibleOptions().slice(this.focusedOptionIndex()).findIndex(a=>this.isOptionMatched(a)),i=i===-1?this.visibleOptions().slice(0,this.focusedOptionIndex()).findIndex(a=>this.isOptionMatched(a)):i+this.focusedOptionIndex()):i=this.visibleOptions().findIndex(a=>this.isOptionMatched(a)),i!==-1&&(o=!0),i===-1&&this.focusedOptionIndex()===-1&&(i=this.findFirstFocusedOptionIndex()),i!==-1&&this.changeFocusedOptionIndex(e,i),this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(()=>{this.searchValue="",this.searchTimeout=null},500),o}activateFilter(){if(this.hasFilter()&&this._options)if(this.group){let e=[];for(let n of this.options){let i=this.filterService.filter(this.getOptionGroupChildren(n),this.searchFields(),this.filterValue,this.filterMatchMode,this.filterLocale);i&&i.length&&e.push(ee(J({},n),{[this.optionGroupChildren]:i}))}this._filteredOptions=e}else this._filteredOptions=this.filterService.filter(this.options,this.searchFields(),this.filterValue,this.filterMatchMode,this.filterLocale);else this._filteredOptions=null}hasFocusableElements(){return st(this.overlayViewChild.overlayViewChild.nativeElement,':not([data-p-hidden-focusable="true"])').length>0}hasFilter(){return this._filterValue()&&this._filterValue().trim().length>0}static \u0275fac=function(n){return new(n||t)(Ie(Ge),Ie(_t),Ie(gt))};static \u0275cmp=$({type:t,selectors:[["p-multiSelect"],["p-multiselect"],["p-multi-select"]],contentQueries:function(n,i,o){if(n&1&&(C(o,bt,5),C(o,ft,5),C(o,Oi,4),C(o,Mi,4),C(o,Vi,4),C(o,Fi,4),C(o,Ei,4),C(o,$i,4),C(o,Li,4),C(o,Ai,4),C(o,Di,4),C(o,Pi,4),C(o,zi,4),C(o,Ri,4),C(o,Qi,4),C(o,Ni,4),C(o,Bi,4),C(o,Ki,4),C(o,Hi,4),C(o,qi,4),C(o,le,4)),n&2){let a;h(a=_())&&(i.footerFacet=a.first),h(a=_())&&(i.headerFacet=a.first),h(a=_())&&(i.itemTemplate=a.first),h(a=_())&&(i.groupTemplate=a.first),h(a=_())&&(i.loaderTemplate=a.first),h(a=_())&&(i.headerTemplate=a.first),h(a=_())&&(i.filterTemplate=a.first),h(a=_())&&(i.footerTemplate=a.first),h(a=_())&&(i.emptyFilterTemplate=a.first),h(a=_())&&(i.emptyTemplate=a.first),h(a=_())&&(i.selectedItemsTemplate=a.first),h(a=_())&&(i.checkIconTemplate=a.first),h(a=_())&&(i.loadingIconTemplate=a.first),h(a=_())&&(i.filterIconTemplate=a.first),h(a=_())&&(i.removeTokenIconTemplate=a.first),h(a=_())&&(i.chipIconTemplate=a.first),h(a=_())&&(i.clearIconTemplate=a.first),h(a=_())&&(i.dropdownIconTemplate=a.first),h(a=_())&&(i.itemCheckboxIconTemplate=a.first),h(a=_())&&(i.headerCheckboxIconTemplate=a.first),h(a=_())&&(i.templates=a)}},viewQuery:function(n,i){if(n&1&&(L(ji,5),L(Gi,5),L(Ui,5),L(Zi,5),L(Wi,5),L(Yi,5),L(Xi,5),L(Ji,5)),n&2){let o;h(o=_())&&(i.overlayViewChild=o.first),h(o=_())&&(i.filterInputChild=o.first),h(o=_())&&(i.focusInputViewChild=o.first),h(o=_())&&(i.itemsViewChild=o.first),h(o=_())&&(i.scroller=o.first),h(o=_())&&(i.lastHiddenFocusableElementOnOverlay=o.first),h(o=_())&&(i.firstHiddenFocusableElementOnOverlay=o.first),h(o=_())&&(i.headerCheckboxViewChild=o.first)}},hostVars:7,hostBindings:function(n,i){n&1&&v("click",function(a){return i.onContainerClick(a)}),n&2&&(x("id",i.id),N(i.style),z(i.hostClasses),Ze("p-variant-filled",i.variant==="filled"||i.config.inputVariant()==="filled"||i.config.inputStyle()==="filled"))},inputs:{id:"id",ariaLabel:"ariaLabel",style:"style",styleClass:"styleClass",panelStyle:"panelStyle",panelStyleClass:"panelStyleClass",inputId:"inputId",disabled:[2,"disabled","disabled",y],fluid:[2,"fluid","fluid",y],readonly:[2,"readonly","readonly",y],group:[2,"group","group",y],filter:[2,"filter","filter",y],filterPlaceHolder:"filterPlaceHolder",filterLocale:"filterLocale",overlayVisible:[2,"overlayVisible","overlayVisible",y],tabindex:[2,"tabindex","tabindex",B],variant:"variant",appendTo:"appendTo",dataKey:"dataKey",name:"name",ariaLabelledBy:"ariaLabelledBy",displaySelectedLabel:"displaySelectedLabel",maxSelectedLabels:"maxSelectedLabels",selectionLimit:[2,"selectionLimit","selectionLimit",B],selectedItemsLabel:"selectedItemsLabel",showToggleAll:[2,"showToggleAll","showToggleAll",y],emptyFilterMessage:"emptyFilterMessage",emptyMessage:"emptyMessage",resetFilterOnHide:[2,"resetFilterOnHide","resetFilterOnHide",y],dropdownIcon:"dropdownIcon",chipIcon:"chipIcon",optionLabel:"optionLabel",optionValue:"optionValue",optionDisabled:"optionDisabled",optionGroupLabel:"optionGroupLabel",optionGroupChildren:"optionGroupChildren",showHeader:[2,"showHeader","showHeader",y],filterBy:"filterBy",scrollHeight:"scrollHeight",lazy:[2,"lazy","lazy",y],virtualScroll:[2,"virtualScroll","virtualScroll",y],loading:[2,"loading","loading",y],virtualScrollItemSize:[2,"virtualScrollItemSize","virtualScrollItemSize",B],loadingIcon:"loadingIcon",virtualScrollOptions:"virtualScrollOptions",overlayOptions:"overlayOptions",ariaFilterLabel:"ariaFilterLabel",filterMatchMode:"filterMatchMode",tooltip:"tooltip",tooltipPosition:"tooltipPosition",tooltipPositionStyle:"tooltipPositionStyle",tooltipStyleClass:"tooltipStyleClass",autofocusFilter:[2,"autofocusFilter","autofocusFilter",y],display:"display",autocomplete:"autocomplete",size:"size",showClear:[2,"showClear","showClear",y],autofocus:[2,"autofocus","autofocus",y],autoZIndex:"autoZIndex",baseZIndex:"baseZIndex",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",defaultLabel:"defaultLabel",placeholder:"placeholder",options:"options",filterValue:"filterValue",itemSize:"itemSize",selectAll:"selectAll",focusOnHover:[2,"focusOnHover","focusOnHover",y],filterFields:"filterFields",selectOnFocus:[2,"selectOnFocus","selectOnFocus",y],autoOptionFocus:[2,"autoOptionFocus","autoOptionFocus",y],highlightOnSelect:[2,"highlightOnSelect","highlightOnSelect",y]},outputs:{onChange:"onChange",onFilter:"onFilter",onFocus:"onFocus",onBlur:"onBlur",onClick:"onClick",onClear:"onClear",onPanelShow:"onPanelShow",onPanelHide:"onPanelHide",onLazyLoad:"onLazyLoad",onRemove:"onRemove",onSelectAllChange:"onSelectAllChange"},features:[oe([Vo,Bt]),Q],ngContentSelectors:tn,decls:16,vars:35,consts:[["focusInput",""],["elseBlock",""],["overlay",""],["content",""],["token",""],["removeicon",""],["firstHiddenFocusableEl",""],["buildInItems",""],["lastHiddenFocusableEl",""],["builtInFilterElement",""],["headerCheckbox",""],["checkboxicon",""],["filterInput",""],["scroller",""],["loader",""],["items",""],[1,"p-hidden-accessible"],["role","combobox",3,"focus","blur","keydown","pTooltip","tooltipPosition","positionStyle","tooltipStyleClass","pAutoFocus"],[1,"p-multiselect-label-container",3,"mouseleave","pTooltip","tooltipDisabled","tooltipPosition","positionStyle","tooltipStyleClass"],[3,"ngClass"],[4,"ngIf"],[1,"p-multiselect-dropdown"],[4,"ngIf","ngIfElse"],[3,"visibleChange","onAnimationStart","onHide","visible","options","target","appendTo","autoZIndex","baseZIndex","showTransitionOptions","hideTransitionOptions"],[1,"p-multiselect-chip-item"],["class","p-multiselect-chip-item",4,"ngFor","ngForOf"],["styleClass","p-multiselect-chip",3,"onRemove","label","removable","removeIcon"],["class","p-multiselect-chip-icon",3,"click",4,"ngIf"],[1,"p-multiselect-chip-icon",3,"click"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["class","p-multiselect-clear-icon",3,"click",4,"ngIf"],[1,"p-multiselect-clear-icon",3,"click"],[4,"ngTemplateOutlet"],["aria-hidden","true",3,"ngClass",4,"ngIf"],["aria-hidden","true",3,"class",4,"ngIf"],["aria-hidden","true",3,"ngClass"],["aria-hidden","true"],["class","p-multiselect-dropdown-icon",4,"ngIf"],["class","p-multiselect-dropdown-icon",3,"ngClass",4,"ngIf"],[3,"styleClass",4,"ngIf"],[1,"p-multiselect-dropdown-icon",3,"ngClass"],[3,"styleClass"],[1,"p-multiselect-dropdown-icon"],[3,"ngClass","ngStyle"],["role","presentation",1,"p-hidden-accessible","p-hidden-focusable",3,"focus"],["class","p-multiselect-header",4,"ngIf"],[1,"p-multiselect-list-container"],[3,"items","style","itemSize","autoSize","tabindex","lazy","options","onLazyLoad",4,"ngIf"],[1,"p-multiselect-header"],[3,"ngModel","ariaLabel","binary","variant","disabled","onChange",4,"ngIf"],["class","p-multiselect-filter-container",4,"ngIf"],[3,"onChange","ngModel","ariaLabel","binary","variant","disabled"],[1,"p-multiselect-filter-container"],["pInputText","","type","text","role","searchbox",1,"p-multiselect-filter",3,"input","keydown","click","blur","variant","value","disabled"],["class","p-multiselect-filter-icon",4,"ngIf"],[1,"p-multiselect-filter-icon"],[3,"onLazyLoad","items","itemSize","autoSize","tabindex","lazy","options"],["role","listbox","aria-multiselectable","true",1,"p-multiselect-list",3,"ngClass"],["ngFor","",3,"ngForOf"],["class","p-multiselect-empty-message","role","option",3,"ngStyle",4,"ngIf"],["role","option",1,"p-multiselect-option-group",3,"ngStyle"],[3,"onClick","onMouseEnter","id","option","selected","label","disabled","template","checkIconTemplate","itemCheckboxIconTemplate","itemSize","focused","ariaPosInset","ariaSetSize","variant","highlightOnSelect"],["role","option",1,"p-multiselect-empty-message",3,"ngStyle"]],template:function(n,i){if(n&1){let o=M();Xe(en),d(0,"div",16)(1,"input",17,0),v("focus",function(u){return f(o),b(i.onInputFocus(u))})("blur",function(u){return f(o),b(i.onInputBlur(u))})("keydown",function(u){return f(o),b(i.onKeyDown(u))}),m()(),d(3,"div",18),v("mouseleave",function(){return f(o),b(i.labelContainerMouseLeave())}),d(4,"div",19),p(5,bn,3,2,"ng-container",20)(6,Cn,3,6,"ng-container",20),m()(),p(7,kn,3,2,"ng-container",20),d(8,"div",21),p(9,En,3,2,"ng-container",22)(10,Rn,2,2,"ng-template",null,1,A),m(),d(12,"p-overlay",23,2),tt("visibleChange",function(u){return f(o),et(i.overlayVisible,u)||(i.overlayVisible=u),b(u)}),v("onAnimationStart",function(u){return f(o),b(i.onOverlayAnimationStart(u))})("onHide",function(){return f(o),b(i.hide())}),p(14,ko,13,18,"ng-template",null,3,A),m()}if(n&2){let o,a=re(11);x("data-p-hidden-accessible",!0),c(),s("pTooltip",i.tooltip)("tooltipPosition",i.tooltipPosition)("positionStyle",i.tooltipPositionStyle)("tooltipStyleClass",i.tooltipStyleClass)("pAutoFocus",i.autofocus),x("aria-disabled",i.disabled)("id",i.inputId)("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledBy)("aria-haspopup","listbox")("aria-expanded",(o=i.overlayVisible)!==null&&o!==void 0?o:!1)("aria-controls",i.overlayVisible?i.id+"_list":null)("tabindex",i.disabled?-1:i.tabindex)("aria-activedescendant",i.focused?i.focusedOptionId:void 0)("value",i.label()||"empty"),c(2),s("pTooltip",i.tooltip)("tooltipDisabled",i._disableTooltip)("tooltipPosition",i.tooltipPosition)("positionStyle",i.tooltipPositionStyle)("tooltipStyleClass",i.tooltipStyleClass),c(),s("ngClass",i.labelClass),c(),s("ngIf",!i.selectedItemsTemplate&&!i._selectedItemsTemplate),c(),s("ngIf",i.selectedItemsTemplate||i._selectedItemsTemplate),c(),s("ngIf",i.isVisibleClearIcon),c(2),s("ngIf",i.loading)("ngIfElse",a),c(3),Je("visible",i.overlayVisible),s("options",i.overlayOptions)("target","@parent")("appendTo",i.appendTo)("autoZIndex",i.autoZIndex)("baseZIndex",i.baseZIndex)("showTransitionOptions",i.showTransitionOptions)("hideTransitionOptions",i.hideTransitionOptions)}},dependencies:[H,K,ke,de,U,ue,Fo,Et,q,Lt,$t,Me,Oe,Ct,vt,xt,Vt,Ft,Mt,At,Ve,be,ge,fe],encapsulation:2,changeDetection:0})}return t})(),jt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=Se({type:t});static \u0275inj=ve({imports:[Fe,q,q]})}return t})();var Lo=(t,l)=>l.id;function Ao(t,l){if(t&1&&k(0,"app-icon-container",0),t&2){let e=r().$implicit,n=r();s("color",e.color.hex)("iconName",n.animalName())}}function Do(t,l){if(t&1&&(p(0,Ao,1,2,"app-icon-container",0),k(1,"app-card",1)(2,"app-card",1)),t&2){let e=l.$implicit,n=r();R(n.isTotemShown()?0:-1),c(),s("creature",n.getFemaleByColorId(e.colorId)),c(),s("creature",n.getMaleByColorId(e.colorId))}}var Ee=class t{isTotemShown=we(!1);animal=we(null);animalName=we("");male=F(()=>this.animal()?.male||[]);female=F(()=>this.animal()?.female||[]);totem=F(()=>this.animal()?.totem||[]);getFemaleByColorId(l){return this.female().find(e=>e.colorId===l)||null}getMaleByColorId(l){return this.male().find(e=>e.colorId===l)||null}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=$({type:t,selectors:[["app-animal"]],inputs:{isTotemShown:[1,"isTotemShown"],animal:[1,"animal"],animalName:[1,"animalName"]},decls:2,vars:0,consts:[[3,"color","iconName"],[3,"creature"]],template:function(e,n){e&1&&We(0,Do,3,3,null,null,Lo),e&2&&Ye(n.totem())},dependencies:[zt,Pt],styles:["[_nghost-%COMP%]{display:flex;flex-direction:row;align-items:center;flex-wrap:wrap;justify-content:center;gap:1vw}"]})};var Po=t=>({active:t}),zo=t=>({"hide-slider":t}),Ro=t=>["!text-xs","pi",t];function Qo(t,l){t&1&&T(0)}function No(t,l){if(t&1&&(d(0,"div",9),p(1,Qo,1,0,"ng-container",10),m(),d(2,"div",11),D(3),m()),t&2){let e=l.$implicit,n=r(2);c(),s("ngComponentOutlet",n.iconService.getIconComponent(e.name)),c(2),ne(" ",e.translatedName," ")}}function Bo(t,l){if(t&1&&k(0,"i",12),t&2){let e=r(2);s("ngClass",O(1,Ro,e.isTotemShown?"pi-check":"pi-times"))}}function Ko(t,l){if(t&1&&(d(0,"div",13),k(1,"app-animal",14),m()),t&2){let e=l.$implicit,n=r(2);c(),s("animal",e)("isTotemShown",n.isTotemShown)}}function Ho(t,l){if(t&1){let e=M();d(0,"div",2)(1,"p-multiselect",3),Pe(2,"translate"),v("onChange",function(i){f(e);let o=r();return b(o.selectedAnimals.set(i.value))}),p(3,No,4,2,"ng-template",null,0,A),m(),d(5,"div",4),v("click",function(){f(e);let i=r();return b(i.isTotemShown=!i.isTotemShown)})("keydown.enter",function(){f(e);let i=r();return b(i.isTotemShown=!i.isTotemShown)})("keydown.space",function(){f(e);let i=r();return b(i.isTotemShown=!i.isTotemShown)}),d(6,"div",5),D(7),Pe(8,"translate"),m(),d(9,"p-toggleswitch",6),p(10,Bo,1,3,"ng-template",null,1,A),m()()(),d(12,"div",7),p(13,Ko,2,2,"div",8),m()}if(t&2){let e=r();c(),s("options",e.animals())("ngModel",e.selectedAnimals())("placeholder",ze(2,8,"Select Familiars")),c(5),s("ngClass",O(12,Po,e.isTotemShown)),c(),j(ze(8,10,"The Familiar")),c(2),s("ngModel",e.isTotemShown),c(3),s("ngClass",O(14,zo,!e.isTotemShown)),c(),s("ngForOf",e.filteredAnimals())}}var Gt=class t{stateService=E(St);iconService=E(Dt);translate=E(nt);dataAccessService=E(It);newLanguageSignal=Ne(this.translate.onLangChange.asObservable());animals=F(()=>{let l=this.newLanguageSignal();return console.log("New language:",l),this.stateService.animals().map(e=>{let n=e.name?e.name.charAt(0).toUpperCase()+e.name.slice(1):"";return ee(J({},e),{translatedName:this.translate.instant(n)})})});isTotemShown=!1;isDataLoading=F(()=>this.stateService.isDataLoading());selectedAnimals=V([]);filteredAnimals=F(()=>this.selectedAnimals().length?this.selectedAnimals():this.animals());ngOnInit(){if(this.stateService.isDataLoading.set(!0),!(this.stateService.animals().length===0)){this.stateService.isDataLoading.set(!1);return}this.dataAccessService.getAnimals().subscribe({next:e=>{this.stateService.addAnimalsDataToState(e)},error:()=>this.stateService.isDataLoading.set(!1),complete:()=>this.stateService.isDataLoading.set(!1)})}static \u0275fac=function(e){return new(e||t)};static \u0275cmp=$({type:t,selectors:[["app-embodiments"]],decls:1,vars:1,consts:[["item",""],["handle",""],[1,"filters"],["optionLabel","translatedName","dataKey","id",1,"w-full","md:w-80",3,"onChange","options","ngModel","placeholder"],["tabindex","0","role","button",1,"totem-switcher",3,"click","keydown.enter","keydown.space"],[1,"label",3,"ngClass"],[3,"ngModel"],[1,"embodiments-container",3,"ngClass"],["class","genders",4,"ngFor","ngForOf"],[1,"icon-container"],[4,"ngComponentOutlet"],[1,"label"],[3,"ngClass"],[1,"genders"],[3,"animal","isTotemShown"]],template:function(e,n){e&1&&p(0,Ho,14,16),e&2&&R(n.isDataLoading()?-1:0)},dependencies:[ke,Ke,be,ge,fe,K,Ee,jt,Fe,H,it,lt,ot],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1vw;padding:64px 20px}[_nghost-%COMP%]     .p-toggleswitch-slider{border:1px solid rgba(161,161,170,.2)!important}.filters[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;justify-content:flex-end;gap:14px;width:100%;height:auto;padding:20px}.filters[_ngcontent-%COMP%]   .p-multiselect[_ngcontent-%COMP%]{width:100%;max-width:300px}.filters[_ngcontent-%COMP%]   .p-multiselect[_ngcontent-%COMP%]   .icon-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:30px;height:30px}.filters[_ngcontent-%COMP%]   .p-multiselect[_ngcontent-%COMP%]   .icon-container[_ngcontent-%COMP%]     svg{width:100%!important;height:100%!important;fill:#fff}.filters[_ngcontent-%COMP%]   .p-multiselect[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%]{font-size:24px}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;background:#09090b;cursor:pointer;border:1px solid #52525b;border-radius:6px;width:auto;padding:4.75px 12px;justify-content:flex-end;gap:10px;flex-shrink:0}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]:hover{border-color:#71717a}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%]{font-size:22px;margin-bottom:0;text-align:center;white-space:nowrap;-webkit-user-select:none;user-select:none;color:#a1a1aa;font-weight:900}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]   .label.active[_ngcontent-%COMP%]{color:#fff}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]   p-toggleswitch[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center}.embodiments-container[_ngcontent-%COMP%]{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:center;gap:1vw;width:auto}.embodiments-container[_ngcontent-%COMP%]   .genders[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;flex-wrap:wrap;justify-content:center;gap:1vw}.hide-slider[_ngcontent-%COMP%]     .p-imagecompare-slider{display:none!important}@media screen and (max-width: 1680px){.embodiments-container[_ngcontent-%COMP%]{max-width:1000px}}@media screen and (max-width: 845px){.embodiments-container[_ngcontent-%COMP%]{max-width:500px}}@media screen and (max-width: 768px){.filters[_ngcontent-%COMP%]{flex-direction:column;gap:20px}.filters[_ngcontent-%COMP%]   .totem-switcher[_ngcontent-%COMP%]{justify-content:center}}@media screen and (max-width: 502px){.embodiments-container[_ngcontent-%COMP%]{padding:10px}.filters[_ngcontent-%COMP%]{padding:10px 0}}"]})};export{Gt as EmbodimentsComponent};
