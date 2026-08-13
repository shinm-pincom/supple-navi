/* =========================================================
   実描画テスト（node verify-render.js）
   jsdom で index.html を実際に読み込み、クリック・入力を再現して
   画面が正しく描画されるかを確認する。要 jsdom:
     npm install jsdom
   ========================================================= */
const fs = require('fs');
const path = require('path');
let JSDOM;
try { ({JSDOM} = require('jsdom')); }
catch (e) {
  console.log('jsdom が入っていないため実描画テストはスキップします。');
  console.log('実行するには: npm install jsdom');
  process.exit(0);
}

const D = __dirname;
let ng = 0;
const bad = (m) => { console.log('  NG ' + m); ng++; };
const ok  = (m) => console.log('  OK ' + m);

const dom = new JSDOM(fs.readFileSync(path.join(D, 'index.html'), 'utf8'), {
  runScripts: 'dangerously',
  url: 'file:///' + D.replace(/\\/g, '/') + '/index.html',
  pretendToBeVisual: true,
});
const {window} = dom;
const doc = window.document;
window.scrollTo = () => {};
window.print = () => { window.__printed = true; };

const jsErrors = [];
window.addEventListener('error', e => jsErrors.push(e.message));

// <script src> は resources 無効だと読まれないので、同じ順で <script> を注入して実行させる
['data-items', 'data-rules', 'data-goals', 'engine', 'app'].forEach(f => {
  const s = doc.createElement('script');
  s.textContent = fs.readFileSync(path.join(D, 'js', f + '.js'), 'utf8');
  doc.body.appendChild(s);
});

// top-level const は window のプロパティにならないため式として取り出す
const G = (n) => window.eval(n);

const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
const click = (el) => el.dispatchEvent(new window.Event('click', {bubbles: true}));
const input = (el, v) => { el.value = v; el.dispatchEvent(new window.Event('input', {bubbles: true})); };
let e0;

console.log('=== 1. 初期描画 ===');
if (!$$('#grid .it').length) bad('成分グリッドが空');
else ok(`成分グリッド ${$$('#grid .it').length}件を描画`);
if (!/2つ以上選ぶと判定できます/.test($('#out').textContent)) bad('未選択時の案内文が出ていない');
else ok('未選択時の案内文を表示');
if (!$$('#pane-goal .gcat').length) bad('悩みカテゴリが空');
else ok(`悩みカテゴリ ${$$('#pane-goal .gcat').length}件を描画`);
if (!$$('#dose-out tbody tr').length) bad('目安量テーブルが空');
else ok(`目安量テーブル ${$$('#dose-out tbody tr').length}行を描画`);

console.log('\n=== 2. 成分を2つ選んで判定（納豆 × ワルファリン）===');
click($$('#grid .it').find(b => b.dataset.id === 'f_natto'));
click($$('#grid .it').find(b => b.dataset.id === 'd_warfarin'));
const out1 = $('#out').textContent;
if (!/避ける/.test(out1)) bad('「避ける」が表示されない'); else ok('判定カードに「避ける」を表示');
if (!/ワルファリンが効かなくなる/.test(out1)) bad('理由が出ていない'); else ok('理由「ワルファリンが効かなくなる」を表示');
if (!/どうする:/.test(out1)) bad('対処法が出ていない'); else ok('「どうする:」の対処行を表示');
const ngCount = $('#out .sum-c.ng .n');
if (!ngCount || ngCount.textContent !== '1') bad(`サマリの×件数が想定外: ${ngCount && ngCount.textContent}`);
else ok('サマリ ×=1件');
if (!/薬剤師または医師にご確認/.test(out1)) bad('受診案内が出ていない'); else ok('×検出時の受診案内を表示');
if ($$('#sel .sel-c').length !== 2) bad('選択チップが2件でない'); else ok('選択チップ 2件');

console.log('\n=== 3. 一覧表（マトリクス）への切替 ===');
click($$('#out .view-sw button').find(b => b.dataset.v === 'matrix'));
const cells = $$('#out .mx .cell');
if (!cells.length) bad('マトリクスのセルが描画されない');
else ok(`マトリクス ${$$('#out .mx tbody tr').length}行 / セル${cells.length}個`);
if (!cells.some(c => c.textContent === '×')) bad('マトリクスに × が出ていない'); else ok('マトリクスに × を表示');
if (!cells.some(c => c.getAttribute('title'))) bad('ホバー説明(title)が無い'); else ok('セルに理由のツールチップあり');
click($$('#out .view-sw button').find(b => b.dataset.v === 'card'));

console.log('\n=== 4. 検索の入力ゆれ（漢字・ひらがな・カタカナ・半角カナ・全角英数）===');
e0 = ng;
[['鉄','iron'], ['てつ','iron'], ['Fe','iron'], ['ｶﾌｪｲﾝ','caffeine'], ['かふぇいん','caffeine'],
 ['カフェイン','caffeine'], ['ワーファリン','d_warfarin'], ['ぴる','d_op'], ['ぐれーぷふるーつ','f_grapefruit'],
 ['ビタミン',null], ['フィッシュオイル','omega3'], ['omega','omega3'], ['ＥＰＡ','omega3'],
 ['ｱｽﾋﾟﾘﾝ','d_doac'], ['血圧の薬','d_bp'], ['けつあつのくすり','d_bp'], ['おちゃ','f_tea'],
 ['納豆','f_natto'], ['なっとう','f_natto']].forEach(([q, expect]) => {
  input($('#q'), q);
  const hits = $$('#grid .it').map(b => b.dataset.id);
  if (!hits.length) bad(`検索「${q}」が0件`);
  else if (expect && !hits.includes(expect)) bad(`検索「${q}」に ${expect} が無い（${hits.slice(0,4).join(',')}）`);
  else ok(`検索「${q}」→ ${hits.length}件${expect ? `（${expect} を含む）` : ''}`);
});
input($('#q'), 'ぜったいにない成分名');
if (!/見つかりませんでした/.test($('#grid').textContent)) bad('0件時のメッセージが出ない');
else ok('0件時のメッセージを表示');
input($('#q'), '');
click($$('#kinds .chip').find(b => b.dataset.kind === 'drug'));
if (!$$('#grid .it').every(b => b.querySelector('.it-k').textContent === 'お薬')) bad('「お薬」フィルタが効いていない');
else ok(`「お薬」フィルタで ${$$('#grid .it').length}件に絞り込み`);
click($$('#kinds .chip').find(b => b.dataset.kind === 'all'));

console.log('\n=== 5. 選択解除 ===');
click($('#sel .sel-c .x'));
if ($$('#sel .sel-c').length !== 1) bad('×ボタンで1件削除できていない'); else ok('チップの×で1件削除');
click($$('#grid .it').find(b => b.dataset.id === 'f_natto'));
const clr = $('#clr');
if (!clr) bad('「すべて消す」が出ない');
else { click(clr); if ($$('#sel .sel-c').length) bad('すべて消せていない'); else ok('「すべて消す」で全解除'); }

console.log('\n=== 6. タブ切替 ===');
click($('.tab[data-pane="goal"]'));
if (!$('#pane-goal').classList.contains('on')) bad('悩みタブに切り替わらない'); else ok('悩みタブへ切替');
if ($('#pane-check').classList.contains('on')) bad('前のタブが残っている'); else ok('前のタブは非表示');

console.log('\n=== 7. 悩みから探す（カテゴリ → 悩み → 詳細）===');
click($('#pane-goal .gcat'));
const goals = $$('#pane-goal .gitem');
if (!goals.length) bad('悩み一覧が空'); else ok(`悩み一覧 ${goals.length}件`);
click(goals[0]);
const gtxt = $('#pane-goal').textContent;
if (!$$('#pane-goal .sup').length) bad('成分カードが出ない'); else ok(`成分カード ${$$('#pane-goal .sup').length}件`);
if (!/目安 /.test(gtxt)) bad('目安量が出ていない'); else ok('目安量を表示');
if (!$$('#pane-goal .ev').length) bad('エビデンス★が出ない'); else ok('エビデンス★を表示');
if (!/サプリより先に効くこと/.test(gtxt)) bad('lifestyle欄が出ていない'); else ok('「サプリより先に効くこと」を表示');
if (!/主役|補助/.test(gtxt)) bad('役割ラベルが出ていない'); else ok('主役／補助のラベルを表示');

console.log('\n=== 8. 悩み → 飲み合わせチェックへの引き継ぎ ===');
click($('#gcheck'));
if (!$('#pane-check').classList.contains('on')) bad('チェックタブに移動しない'); else ok('チェックタブへ自動移動');
const carried = $$('#sel .sel-c').length;
if (carried < 2) bad(`成分が引き継がれていない（${carried}件）`);
else ok(`成分 ${carried}件を引き継ぎ、${$$('#out .rc').length}組を判定`);

console.log('\n=== 9. 悩み検索の入力ゆれ ===');
e0 = ng;
click($('.tab[data-pane="goal"]'));
const S = G('S');
S.goal = null; S.goalCat = null; G('renderGoal')();
[['寝つき',1], ['ねつき',1], ['ダイエット',1], ['だいえっと',1], ['乾燥',1], ['便秘',1],
 ['血圧',1], ['けつあつ',1], ['美容',1]].forEach(([q, min]) => {
  input($('#gq'), q);
  const n = $$('#gres .gitem').length;
  if (n < min) bad(`悩み検索「${q}」が ${n}件`); else ok(`悩み検索「${q}」→ ${n}件`);
});
input($('#gq'), 'そんな悩みはない');
if (!/見つかりませんでした/.test($('#gres').textContent)) bad('悩み検索0件時のメッセージが出ない');
else ok('0件時のメッセージを表示');

console.log('\n=== 10. 成分と目安量（男女切替・カテゴリ絞り込み・検索）===');
click($('.tab[data-pane="dose"]'));
const rowM = $('#dose-out tbody tr .dose-v').textContent;
click($('#sexsw button[data-sex="f"]'));
const rowF = $('#dose-out tbody tr .dose-v').textContent;
if (rowM === rowF) bad('男女で目安量が切り替わっていない'); else ok('男女で目安量が切り替わる');
if (!/成人女性の目安/.test($('#dose-out').textContent)) bad('見出しが女性に変わらない');
else ok('見出しが「成人女性の目安」に変化');
const chips = $$('#cats2 .chip');
if (chips.length < 2) bad('カテゴリチップが生成されない');
else { click(chips[1]); ok(`カテゴリ「${chips[1].textContent}」で ${$$('#dose-out tbody tr').length}件に絞り込み`); }
input($('#q2'), 'びたみん');
if (!$$('#dose-out tbody tr').length) bad('目安量タブのひらがな検索がヒットしない');
else ok(`目安量タブ「びたみん」→ ${$$('#dose-out tbody tr').length}件`);

console.log('\n=== 11. 免責・印刷 ===');
if (!/必ず医師・薬剤師に最終確認/.test($('.disc').textContent)) bad('冒頭の免責が無い');
else ok('全画面共通の免責を表示');
if (!/責任を負いません/.test($('.disc-f').textContent)) bad('フッター免責が無い'); else ok('フッター免責を表示');
click($('.hd .btn-2'));
if (!window.__printed) bad('印刷ボタンが window.print() を呼ばない'); else ok('印刷ボタンが動作');

console.log('\n=== 12. 全45悩みの詳細を実描画 ===');
e0 = ng;
const GOALS = G('GOALS');
GOALS.forEach(g => {
  S.goal = g; S.goalCat = g.cat;
  try { G('renderGoal')(); } catch (ex) { bad(`${g.name}: 描画で例外 ${ex.message}`); return; }
  const t = $('#pane-goal').textContent;
  if (!$$('#pane-goal .sup').length) bad(`${g.name}: 成分カードが0件`);
  if (!/目安 /.test(t)) bad(`${g.name}: 目安量が出ていない`);
  if (!/サプリより先に効くこと/.test(t)) bad(`${g.name}: lifestyleが出ていない`);
});
if (ng === e0) console.log(`  OK ${GOALS.length}件すべて例外なく描画（成分カード・目安量・lifestyle付き）`);

console.log('\n=== 13. 全108件を一括選択して描画（最大負荷）===');
e0 = ng;
const ITEMS = G('ITEMS');
S.picked = ITEMS.map(i => i.id);
S.view = 'matrix';
const t0 = process.hrtime.bigint();
try { G('renderResult')(); } catch (ex) { bad('マトリクス描画で例外: ' + ex.message); }
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
const big = $$('#out .mx .cell').length;
if (big !== ITEMS.length * ITEMS.length) bad(`セル数が想定外: ${big}（期待 ${ITEMS.length ** 2}）`);
else console.log(`  OK ${ITEMS.length}×${ITEMS.length}=${big}セルを ${ms.toFixed(0)}ms で描画`);
S.view = 'card';
const t1 = process.hrtime.bigint();
try { G('renderResult')(); } catch (ex) { bad('リスト描画で例外: ' + ex.message); }
const ms2 = Number(process.hrtime.bigint() - t1) / 1e6;
const cards = $$('#out .rc').length;
const expectPairs = ITEMS.length * (ITEMS.length - 1) / 2;
if (cards < expectPairs) bad(`カード数が不足: ${cards}（期待 ${expectPairs}）`);
else console.log(`  OK リスト ${cards}組を ${ms2.toFixed(0)}ms で描画`);
if (!$('#out .rc').classList.contains('ng')) bad('最も危険な組み合わせが先頭に来ていない');
else ok('危険度の高い順に並んでいる（先頭が×）');
S.picked = []; G('renderResult')();

console.log('\n=== 14. 単体アラート（1つだけ選んでも警告が出るか）===');
e0 = ng;
[['st_johns', 'セントジョーンズワート'], ['yohimbe', 'ヨヒンベ']].forEach(([id, name]) => {
  S.picked = [id]; G('renderResult')();
  if (!/単体での注意/.test($('#out').textContent)) bad(`${name}: 単体アラートが出ない`);
  else ok(`${name} 1つだけでも警告を表示`);
});
S.picked = []; G('renderResult')();

console.log('\n=== 15. 文字入力ゼロで完結できるか（押すだけの操作）===');
e0 = ng;
click($('.tab[data-pane="check"]'));
S.picked = []; S.q = ''; S.openG = null;
G('renderSel')(); G('renderPick')(); G('renderResult')();

const pks = $$('#pick .pk');
if (!pks.length) bad('「よく選ばれるもの」のボタンが描画されない');
else ok(`押すだけの候補 ${pks.length}件を表示`);

const pkIron = pks.find(b => b.dataset.id === 'iron');
const pkMilk = pks.find(b => b.dataset.id === 'f_milk');
if (!pkIron || !pkMilk) bad('鉄・牛乳が押すだけの候補に含まれていない');
else {
  click(pkIron); click(pkMilk);
  if ($$('#sel .sel-c').length !== 2) bad('押すだけで2件選択できていない');
  else ok('鉄・牛乳をタップで選択（入力ゼロ）');
  if (!$('#out .vb')) bad('結論バナーが出ない');
  else ok(`結論バナー「${$('#out .vb-t').textContent.trim()}」`);
  if (!$('#bar.on')) bad('画面下端の判定バーが出ない');
  else ok(`下部バー「${$('#bar .bar-m').textContent.trim()}」`);
  if (!$('#bar-go')) bad('「結果を見る」ボタンが無い');
  else { click($('#bar-go')); ok('「結果を見る」で例外が出ない'); }
}

const acHeads = $$('#pick .ac-h');
if (!acHeads.length) bad('種類ごとの開閉パネルが無い');
else {
  click(acHeads[0]);
  const opened = $$('#pick .ac.on .pk').length;
  if (!opened) bad('種類パネルを押しても中身が開かない');
  else ok(`種類パネル「${$('#pick .ac.on .ac-n').textContent}」を開いて ${opened}件`);
  click($$('#pick .ac-h')[0]);
  if ($$('#pick .ac.on').length) bad('同じ見出しを押しても閉じない'); else ok('同じ見出しを押すと閉じる');
}

S.picked = ['vit_c', 'vit_d', 'f_water'];
G('renderSel')(); G('renderPick')(); G('renderResult')();
const foldEl = $('#out .fold');
if (!foldEl) bad('○（報告なし）の折りたたみが無い');
else if (foldEl.hasAttribute('open')) bad('○の折りたたみが最初から開いている');
else ok(`○ ${$$('#out .fold .rc').length}組を折りたたんで表示（読む量を減らせている）`);

click($('.tab[data-pane="goal"]'));
S.goal = null; S.goalCat = null; G('renderGoal')();
const gpops = $$('#pane-goal .gpop');
if (!gpops.length) bad('「よくある悩み」のボタンが無い');
else {
  click(gpops[0]);
  if (!$$('#pane-goal .sup').length) bad('よくある悩みを押しても詳細が出ない');
  else ok(`よくある悩み ${gpops.length}件・1タップで詳細（成分 ${$$('#pane-goal .sup').length}件）`);
}
S.goal = null; S.goalCat = null; G('renderGoal')();
S.picked = []; click($('.tab[data-pane="check"]'));
G('renderSel')(); G('renderPick')(); G('renderResult')();

console.log('\n=== 16. JSエラーの発生有無 ===');
if (jsErrors.length) jsErrors.forEach(e => bad('JSエラー: ' + e));
else ok('操作中に未捕捉のJSエラーなし');

console.log('\n' + (ng ? `❌ NG ${ng}件` : '✅ 実描画テスト 全通過'));
process.exit(ng ? 1 : 0);
