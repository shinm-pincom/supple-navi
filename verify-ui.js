/* =========================================================
   UI配線チェック（node verify-ui.js）
   ブラウザを開かずに、画面が壊れる原因になりやすい配線を静的に検査する。
   ・$('#id') の参照先が存在するか
   ・使っている CSS クラスが定義されているか
   ・スクリプトの読み込み順（依存関係）
   ・印刷/モバイル対応、外部通信ゼロ、入力値のエスケープ
   ========================================================= */
const fs = require('fs');
const path = require('path');

const D = __dirname;
const html = fs.readFileSync(path.join(D, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(D, 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(D, 'css', 'style.css'), 'utf8');

let ng = 0;
const bad = (m) => { console.log('  NG ' + m); ng++; };
let e0;

console.log("=== 1. $('#id') 参照先の存在 ===");
const refIds = [...new Set([...app.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]))];
const htmlIds = new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
const dynIds = new Set([...app.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
refIds.forEach(i => { if (!htmlIds.has(i) && !dynIds.has(i)) bad(`#${i} がどこにも定義されていない`); });
if (!ng) console.log(`  OK (${refIds.length}件すべて解決)`);

console.log('\n=== 2. data-* 属性の読み書き整合 ===');
e0 = ng;
const dataSet = new Set([...(html + app).matchAll(/data-([\w-]+)=/g)].map(m => m[1]));
const dataGet = new Set([...app.matchAll(/dataset\.([\w]+)/g)].map(m => m[1]));
dataGet.forEach(k => { if (!dataSet.has(k)) bad(`dataset.${k} を読むが data-${k} を書き出す箇所が無い`); });
if (ng === e0) console.log(`  OK (書込 ${[...dataSet].join(', ')})`);

console.log('\n=== 3. CSSクラスの定義漏れ ===');
const used = new Set();
[...app.matchAll(/class="([^"`$]+)"/g)].forEach(m => m[1].split(/\s+/).forEach(c => c && used.add(c)));
[...html.matchAll(/class="([^"]+)"/g)].forEach(m => m[1].split(/\s+/).forEach(c => c && used.add(c)));
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nocss = [...used].filter(c => !new RegExp('\\.' + reEsc(c) + '(?![\\w-])').test(css)).sort();
console.log('  ' + (nocss.length ? nocss.join(', ') : 'なし'));
console.log('  （classList.add で後付けする .on 等は動的付与なので別扱い）');

console.log('\n=== 4. スクリプト読み込み順 ===');
e0 = ng;
const order = [...html.matchAll(/src="js\/([\w-]+)\.js"/g)].map(m => m[1]);
const want = ['data-items', 'data-rules', 'data-goals', 'engine', 'app'];
if (order.join(',') !== want.join(',')) bad(`順序 ${order.join(' → ')} が期待 ${want.join(' → ')} と異なる`);
if (ng === e0) console.log('  OK ' + order.join(' → '));

console.log('\n=== 5. app.js が使うグローバルの提供元 ===');
e0 = ng;
const src = ['data-items', 'data-rules', 'data-goals', 'engine']
  .map(f => fs.readFileSync(path.join(D, 'js', f + '.js'), 'utf8')).join('\n');
['ITEMS', 'ITEM_MAP', 'GOALS', 'GOAL_CATS', 'judgePair', 'judgeAll', 'summarize', 'soloAlerts',
 'checkGoalCombo', 'searchItems', 'searchGoals', 'norm'].forEach(n => {
  if (!new RegExp('(const|function|var|let)\\s+' + n + '\\b').test(src)) bad(`${n} の定義が見つからない`);
  if (!new RegExp('\\b' + n + '\\b').test(app)) console.log(`  ※ ${n} は app.js から未使用`);
});
if (ng === e0) console.log('  OK');

console.log('\n=== 6. 印刷・モバイル対応 ===');
e0 = ng;
if (!/@media\s+print/.test(css)) bad('@media print が無い');
if (!/@media[^{]*max-width/.test(css)) bad('モバイル用ブレークポイントが無い');
if (!/window\.print\(\)/.test(html + app)) bad('印刷ボタンが無い');
if (ng === e0) console.log('  OK (@media print / max-width / window.print すべてあり)');

console.log('\n=== 7. 外部通信ゼロの確認 ===');
e0 = ng;
const all = html + app + src + css;
[/fetch\s*\(/, /XMLHttpRequest/, /https?:\/\/(?!www\.w3\.org)/, /<script[^>]+src="http/].forEach(re => {
  const m = all.match(re);
  if (m) bad(`外部参照らしき記述: ${m[0]}`);
});
if (ng === e0) console.log('  OK 通信コードなし・外部URL参照なし');

console.log('\n=== 8. ユーザー入力の innerHTML への流入 ===');
e0 = ng;
if (!/const esc\s*=/.test(app)) bad('esc() ヘルパーが定義されていない');
app.split(/\n/).forEach((line, n) => {
  if (!/innerHTML|`</.test(line)) return;
  const m = line.match(/\$\{[^}]*(S\.q2?|target\.value)[^}]*\}/);
  if (m && !/esc\(/.test(m[0])) bad(`app.js:${n + 1} 入力値を直接埋め込み → ${m[0]}`);
});
const escCalls = (app.match(/esc\(/g) || []).length - 1;
if (ng === e0) console.log(`  OK 入力値の直接埋め込みなし（esc() 適用 ${escCalls}箇所）`);

console.log('\n=== 9. 文字入力なしで完結できるか ===');
e0 = ng;
// 検索欄は「開かなくても使える」状態＝既定で hidden になっているか
[['srch-w', '飲み合わせタブの検索'], ['q2-w', '目安量タブの検索']].forEach(([id, name]) => {
  const m = html.match(new RegExp('id="' + id + '"([^>]*)>'));
  if (!m) bad(`${name}（#${id}）が index.html に無い`);
  else if (!/\bhidden\b/.test(m[1])) bad(`${name}が既定で開いている（hidden 属性が無い）`);
});
if (!/id="gq-w"[^>]*\bhidden\b/.test(app)) bad('悩みタブの検索が既定で開いている（hidden 属性が無い）');
// 押すだけで選べるデータが揃っているか
const dataSrc = ['data-items', 'data-goals']
  .map(f => fs.readFileSync(path.join(D, 'js', f + '.js'), 'utf8')).join('\n');
['POPULAR', 'PICK_GROUPS', 'SHORT', 'POPULAR_GOALS'].forEach(n => {
  if (!new RegExp('const\\s+' + n + '\\s*=').test(dataSrc)) bad(`${n} の定義が見つからない`);
  if (!new RegExp('\\b' + n + '\\b').test(app)) bad(`${n} を app.js が使っていない`);
});
if (ng === e0) console.log('  OK 検索欄は既定で閉じ、押すだけの選択肢（POPULAR / PICK_GROUPS / POPULAR_GOALS）を使用');

console.log('\n=== 10. 免責の常時表示 ===');
e0 = ng;
if (!/必ず医師・薬剤師に最終確認/.test(html)) bad('冒頭の免責文が無い');
if (!/責任を負いません/.test(html)) bad('フッターの免責文が無い');
if (!/おすすめするものではなく/.test(html)) bad('「おすすめしない」旨の記載が無い');
if (!/外部に送信・保存されません/.test(html)) bad('データの取り扱いに関する記載が無い');
if (ng === e0) console.log('  OK 免責4項目すべて記載あり');

console.log('\n' + (ng ? `❌ NG ${ng}件` : '✅ UI配線チェック 全通過'));
process.exit(ng ? 1 : 0);
