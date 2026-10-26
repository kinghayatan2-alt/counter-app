export const MAX=1000000000;
export function numeric(raw){return String(raw).trim().replace(/[０-９．]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/[,，]/g,'');}
export function integer(raw,min=0){const s=numeric(raw);if(!/^\d+$/.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)&&n>=min&&n<=MAX?n:null;}
export function denominator(raw){const s=numeric(raw);if(!/^\d+(\.\d+)?$/.test(s))return null;const n=Number(s);return Number.isFinite(n)&&n>=1&&n<=MAX?n:null;}
export function fraction(total,count){if(total===null||total===0||count===0)return '—';const d=total/count;return '1/'+new Intl.NumberFormat('ja-JP',{maximumFractionDigits:d<1?9:2}).format(d);}
function correction(n){const inv=1/n;return inv/12-inv**3/360+inv**5/1260;}
export function logBinomial(n,k,d){if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||k<0||k>n||!Number.isFinite(d)||d<1)throw new RangeError('invalid binomial input');if(n===0)return 0;if(d===1)return k===n?0:-Infinity;const p=1/d,q=1-p;if(k===0)return n*Math.log1p(-p);if(k===n)return n*Math.log(p);const j=Math.min(k,n-k);if(j<10000){let choose=0;for(let i=1;i<=j;i++)choose+=Math.log(n-j+i)-Math.log(i);return Math.min(0,choose+k*Math.log(p)+(n-k)*Math.log1p(-p));}const r=k/n,s=(n-k)/n;return Math.min(0,-k*Math.log(r/p)-(n-k)*Math.log(s/q)-.5*Math.log(2*Math.PI*n*r*s)+correction(n)-correction(k)-correction(n-k));}
export function percentFromLog(log){if(log===-Infinity)return '0%';const x=log+Math.log(100);if(x<Math.log(.000001)){const e=Math.floor(x/Math.LN10);return `${Math.exp(x-e*Math.LN10).toFixed(2)} × 10^${e}%`;}const p=Math.exp(x);if(p>99.995&&log<0)return '約100%';return new Intl.NumberFormat('ja-JP',{maximumFractionDigits:p<.01?8:2,minimumFractionDigits:p>=.01?2:0}).format(p)+'%';}

// Two hypotheses with equal prior weights; use log odds to avoid underflow.
export function compareCandidates(n,k,a,b){
 const la=logBinomial(n,k,a),lb=logBinomial(n,k,b);
 if(la===-Infinity&&lb===-Infinity)throw new RangeError('両方の候補で起こりえない結果です。分母と回数を確認してください。');
 if(la===-Infinity)return [0,100];if(lb===-Infinity)return [100,0];
 const delta=lb-la;const first=delta>=0?Math.exp(-delta)/(1+Math.exp(-delta)):1/(1+Math.exp(delta));
 return [100*first,100*(1-first)];
}
