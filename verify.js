/* データ整合性チェック（node verify.js） */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = {console};
vm.createContext(ctx);
['js/data-items.js','js/data-rules.js','js/data-goals.js','js/engine.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, {filename: f});
});
// top-level const はコンテキストのプロパティにならないため式で取り出す
['ITEMS','PAIRS','TAG_RULES','SOLO_ALERTS','GOALS','GOAL_CATS','ITEM_MAP','LV',
 'judgePair','judgeAll','summarize','soloAlerts','checkGoalCombo','searchItems','searchGoals']
  .forEach(n => { ctx[n] = vm.runInContext(n, ctx); });

const {ITEMS, PAIRS, TAG_RULES, SOLO_ALERTS, GOALS, GOAL_CATS, ITEM_MAP} = ctx;
let err = 0;
const bad = (m) => { console.log('  NG ' + m); err++; };

console.log('=== 件数 ===');
console.log('成分・食品・薬 :', ITEMS.length,
  '(サプリ', ITEMS.filter(i=>i.kind==='supp').length,
  '/ 食品', ITEMS.filter(i=>i.kind==='food').length,
  '/ 薬', ITEMS.filter(i=>i.kind==='drug').length, ')');
console.log('個別ペアルール :', PAIRS.length);
console.log('タグルール     :', TAG_RULES.length);
console.log('単体アラート   :', SOLO_ALERTS.length);
console.log('悩み           :', GOALS.length, '/ カテゴリ', GOAL_CATS.length);
console.log('総判定可能ペア :', ITEMS.length*(ITEMS.length-1)/2);

console.log('\n=== 1. ID重複 ===');
const seen = new Set();
ITEMS.forEach(i => { if (seen.has(i.id)) bad('重複ID: '+i.id); seen.add(i.id); });
console.log(err ? '' : '  OK');

console.log('\n=== 2. 必須フィールド ===');
let e0 = err;
ITEMS.forEach(i => {
  ['id','kind','name','cat','tags','doseM','doseF','ul','basis','timing','note'].forEach(k => {
    if (i[k] === undefined) bad(`${i.id}: ${k} が未定義`);
  });
  if (!Array.isArray(i.tags)) bad(`${i.id}: tags が配列でない`);
  if (!['supp','food','drug'].includes(i.kind)) bad(`${i.id}: kind不正 ${i.kind}`);
});
if (err === e0) console.log('  OK');

console.log('\n=== 3. PAIRSの参照ID ===');
e0 = err;
PAIRS.forEach((p,n) => {
  if (!ITEM_MAP[p.a]) bad(`PAIRS[${n}] a="${p.a}" が存在しない`);
  if (!ITEM_MAP[p.b]) bad(`PAIRS[${n}] b="${p.b}" が存在しない`);
  if (!['ng','caution','good','ok'].includes(p.lv)) bad(`PAIRS[${n}] lv不正: ${p.lv}`);
  if (!p.msg || !p.how) bad(`PAIRS[${n}] msg/how欠落`);
  if (p.a === p.b) bad(`PAIRS[${n}] 同一ID同士`);
});
if (err === e0) console.log('  OK');

console.log('\n=== 4. PAIRSの重複定義 ===');
e0 = err;
const pk = new Map();
PAIRS.forEach((p,n) => {
  const k = [p.a,p.b].sort().join('|');
  if (pk.has(k)) bad(`重複ペア: ${p.a} × ${p.b} (index ${pk.get(k)} と ${n})`);
  else pk.set(k, n);
});
if (err === e0) console.log('  OK');

console.log('\n=== 5. TAG_RULESのタグが実在するか ===');
e0 = err;
const allTags = new Set();
ITEMS.forEach(i => i.tags.forEach(t => allTags.add(t)));
TAG_RULES.forEach((r,n) => {
  if (!allTags.has(r.tagA)) bad(`TAG_RULES[${n}] tagA="${r.tagA}" を持つ成分が無い`);
  if (!allTags.has(r.tagB)) bad(`TAG_RULES[${n}] tagB="${r.tagB}" を持つ成分が無い`);
  if (!['ng','caution','good','ok'].includes(r.lv)) bad(`TAG_RULES[${n}] lv不正`);
});
if (err === e0) console.log('  OK');

console.log('\n=== 6. SOLO_ALERTSの参照ID ===');
e0 = err;
SOLO_ALERTS.forEach((s,n) => { if (!ITEM_MAP[s.id]) bad(`SOLO_ALERTS[${n}] id="${s.id}" が存在しない`); });
if (err === e0) console.log('  OK');

console.log('\n=== 7. GOALSの参照ID・カテゴリ ===');
e0 = err;
const catIds = new Set(GOAL_CATS.map(c=>c.id));
const gseen = new Set();
GOALS.forEach(g => {
  if (gseen.has(g.id)) bad(`重複GOAL id: ${g.id}`); gseen.add(g.id);
  if (!catIds.has(g.cat)) bad(`${g.id}: cat="${g.cat}" が GOAL_CATS に無い`);
  if (!g.lifestyle) bad(`${g.id}: lifestyle が無い`);
  if (!g.items || !g.items.length) bad(`${g.id}: items が空`);
  (g.items||[]).forEach(x => {
    if (!ITEM_MAP[x.id]) bad(`${g.id}: 成分 "${x.id}" が存在しない`);
    if (![1,2,3].includes(x.ev)) bad(`${g.id}/${x.id}: ev不正 ${x.ev}`);
    if (!['main','sub'].includes(x.role)) bad(`${g.id}/${x.id}: role不正 ${x.role}`);
    if (!x.dose) bad(`${g.id}/${x.id}: dose が無い`);
  });
  if (!(g.items||[]).some(x=>x.role==='main')) bad(`${g.id}: main が1つも無い`);
});
GOAL_CATS.forEach(c => {
  if (!GOALS.some(g=>g.cat===c.id)) bad(`カテゴリ "${c.id}" に悩みが0件`);
});
if (err === e0) console.log('  OK');

console.log('\n=== 8. 全ペア総当たりで判定が落ちないか ===');
e0 = err;
const ids = ITEMS.map(i=>i.id);
let cnt = {ng:0,caution:0,good:0,ok:0};
for (let i=0;i<ids.length;i++) for (let j=i+1;j<ids.length;j++) {
  let r;
  try { r = ctx.judgePair(ids[i], ids[j]); }
  catch(ex) { bad(`例外 ${ids[i]} × ${ids[j]}: ${ex.message}`); continue; }
  if (!r) { bad(`null: ${ids[i]} × ${ids[j]}`); continue; }
  if (!r.reasons.length) bad(`reasons空: ${ids[i]} × ${ids[j]}`);
  cnt[r.lv]++;
}
console.log('  判定分布:', JSON.stringify(cnt));
if (err === e0) console.log('  OK');

console.log('\n=== 9. 主要ケースの期待値テスト ===');
e0 = err;
const T = [
  ['f_natto','d_warfarin','ng','納豆×ワルファリン'],
  ['f_grapefruit','d_statin','ng','グレープフルーツ×スタチン'],
  ['st_johns','d_op','ng','セントジョーンズワート×ピル'],
  ['calcium','iron','caution','カルシウム×鉄'],
  ['vit_c','iron','good','ビタミンC×鉄'],
  ['vit_d','calcium','good','ビタミンD×カルシウム'],
  ['iron','f_tea','caution','鉄×お茶'],
  ['calcium','d_abx','ng','カルシウム×抗菌薬'],
  ['omega3','d_warfarin','ng','オメガ3×ワルファリン'],
  ['creatine','protein_whey','good','クレアチン×プロテイン'],
  ['caffeine','theanine','good','カフェイン×テアニン'],
  ['hyaluronic','f_water','ok','ヒアルロン酸×水（無関係）'],
  ['ceramide','f_water','ok','セラミド×水（無関係）'],
  ['alpha_lipoic','d_diabetes','ng','αリポ酸×糖尿病薬'],
  ['iodine','d_thyroid','ng','ヨウ素×甲状腺薬'],
  ['tryptophan','d_ssri','ng','トリプトファン×SSRI'],
  ['probiotics','d_abx','caution','乳酸菌×抗菌薬'],
  ['iron','d_thyroid','ng','鉄×甲状腺薬'],
];
T.forEach(([a,b,exp,label]) => {
  const r = ctx.judgePair(a,b);
  if (!r) { bad(`${label}: 判定できない`); return; }
  if (r.lv !== exp) bad(`${label}: 期待 ${exp} → 実際 ${r.lv} (${r.reasons[0].msg})`);
});
if (err === e0) console.log(`  OK (${T.length}件すべて期待通り)`);

console.log('\n=== 10. 未使用タグ（ルールで拾われないタグ） ===');
const usedTags = new Set();
TAG_RULES.forEach(r => { usedTags.add(r.tagA); usedTags.add(r.tagB); });
const unused = [...allTags].filter(t => !usedTags.has(t)).sort();
console.log('  ' + (unused.length ? unused.join(', ') : 'なし'));
console.log('  （分類用タグなら問題なし。衝突を想定したタグならルール追加を検討）');

console.log('\n=== 11. 悩み内の成分同士の衝突 ===');
GOALS.forEach(g => {
  const c = ctx.checkGoalCombo(g);
  if (c.length) {
    console.log(`  ${g.name}: ${c.map(x=>`${x.mark} ${x.a.name}×${x.b.name}`).join(' / ')}`);
  }
});

console.log('\n' + (err ? `❌ NG ${err}件` : '✅ 全チェック通過'));
process.exit(err ? 1 : 0);
