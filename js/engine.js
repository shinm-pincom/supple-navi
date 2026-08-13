/* =========================================================
   SuppleNavi - 判定エンジン
   ========================================================= */

const LV = {
  ng:      {rank:4, mark:'×', label:'避ける',     cls:'ng'},
  caution: {rank:3, mark:'△', label:'注意',       cls:'caution'},
  good:    {rank:2, mark:'◎', label:'相性よい',   cls:'good'},
  ok:      {rank:1, mark:'○', label:'報告なし',   cls:'ok'},
};

const ITEM_MAP = {};
ITEMS.forEach(it => { ITEM_MAP[it.id] = it; });

/* --- 個別ペアの索引化（順序を問わない） --- */
const PAIR_MAP = {};
PAIRS.forEach(p => {
  PAIR_MAP[p.a + '|' + p.b] = p;
  PAIR_MAP[p.b + '|' + p.a] = p;
});

/* ---------------------------------------------------------
   2成分の判定
   戻り値: {lv, mark, label, reasons:[{msg,how,src}]}
   --------------------------------------------------------- */
function judgePair(idA, idB) {
  const a = ITEM_MAP[idA], b = ITEM_MAP[idB];
  if (!a || !b) return null;

  const reasons = [];
  let best = 'ok';

  const bump = (lv) => { if (LV[lv].rank > LV[best].rank) best = lv; };

  // 1) 個別ペアルール（最優先。これがあればタグルールは補足扱い）
  const pair = PAIR_MAP[idA + '|' + idB];
  if (pair) {
    reasons.push({msg: pair.msg, how: pair.how, src: 'pair'});
    bump(pair.lv);
  }

  // 2) タグベースルール
  const seen = new Set(reasons.map(r => r.msg));
  TAG_RULES.forEach(r => {
    const hitAB = a.tags.includes(r.tagA) && b.tags.includes(r.tagB);
    const hitBA = a.tags.includes(r.tagB) && b.tags.includes(r.tagA);
    if (!hitAB && !hitBA) return;
    // 同一タグ同士のルールは、両方が同じタグを持つ場合のみ
    if (r.tagA === r.tagB && !(a.tags.includes(r.tagA) && b.tags.includes(r.tagA))) return;
    if (seen.has(r.msg)) return;
    seen.add(r.msg);
    reasons.push({msg: r.msg, how: r.how, src: 'tag'});
    bump(r.lv);
  });

  // 3) 何も当たらなければ ○
  if (!reasons.length) {
    reasons.push({
      msg: '既知の重大な相互作用は報告されていません',
      how: '通常の摂取量なら問題は報告されていません',
      src: 'none'
    });
  }

  // ◎ と × / △ が混在した場合、警告側を優先して表示順を整える
  reasons.sort((x, y) => (y.src === 'pair' ? 1 : 0) - (x.src === 'pair' ? 1 : 0));

  return {
    lv: best,
    mark: LV[best].mark,
    label: LV[best].label,
    cls: LV[best].cls,
    reasons: reasons
  };
}

/* ---------------------------------------------------------
   選択リスト全体を総当たりで判定
   --------------------------------------------------------- */
function judgeAll(ids) {
  const results = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const r = judgePair(ids[i], ids[j]);
      if (!r) continue;
      results.push({
        a: ITEM_MAP[ids[i]],
        b: ITEM_MAP[ids[j]],
        ...r
      });
    }
  }
  // 危険度の高い順 → 同順位は名前順
  results.sort((x, y) => {
    const d = LV[y.lv].rank - LV[x.lv].rank;
    if (d !== 0) return d;
    return x.a.name.localeCompare(y.a.name, 'ja');
  });
  return results;
}

/* ---------------------------------------------------------
   単体アラート（他と組まなくても注意したいもの）
   --------------------------------------------------------- */
function soloAlerts(ids) {
  return SOLO_ALERTS
    .filter(s => ids.includes(s.id))
    .map(s => ({...s, item: ITEM_MAP[s.id], mark: LV[s.lv].mark, cls: LV[s.lv].cls}));
}

/* ---------------------------------------------------------
   合計サマリー
   --------------------------------------------------------- */
function summarize(results) {
  const c = {ng: 0, caution: 0, good: 0, ok: 0};
  results.forEach(r => c[r.lv]++);
  return c;
}

/* ---------------------------------------------------------
   検索用の文字ならし
   「鉄」を "てつ"、「カフェイン」を "かふぇいん" や "ｶﾌｪｲﾝ" でも拾えるように、
   半角カタカナ→全角、カタカナ→ひらがな、全角英数→半角、大文字→小文字、
   長音・区切り記号の差を吸収する
   --------------------------------------------------------- */
const HK = {'ｶ':'カ','ｷ':'キ','ｸ':'ク','ｹ':'ケ','ｺ':'コ','ｻ':'サ','ｼ':'シ','ｽ':'ス','ｾ':'セ','ｿ':'ソ',
  'ﾀ':'タ','ﾁ':'チ','ﾂ':'ツ','ﾃ':'テ','ﾄ':'ト','ﾅ':'ナ','ﾆ':'ニ','ﾇ':'ヌ','ﾈ':'ネ','ﾉ':'ノ',
  'ﾊ':'ハ','ﾋ':'ヒ','ﾌ':'フ','ﾍ':'ヘ','ﾎ':'ホ','ﾏ':'マ','ﾐ':'ミ','ﾑ':'ム','ﾒ':'メ','ﾓ':'モ',
  'ﾔ':'ヤ','ﾕ':'ユ','ﾖ':'ヨ','ﾗ':'ラ','ﾘ':'リ','ﾙ':'ル','ﾚ':'レ','ﾎ':'ホ','ﾜ':'ワ','ﾝ':'ン',
  'ｱ':'ア','ｲ':'イ','ｳ':'ウ','ｴ':'エ','ｵ':'オ','ｦ':'ヲ','ｧ':'ァ','ｨ':'ィ','ｩ':'ゥ','ｪ':'ェ','ｫ':'ォ',
  'ｬ':'ャ','ｭ':'ュ','ｮ':'ョ','ｯ':'ッ','ﾞ':'゛','ﾟ':'゜','ﾛ':'ロ','ﾙ':'ル'};
const DAKU = {'カ':'ガ','キ':'ギ','ク':'グ','ケ':'ゲ','コ':'ゴ','サ':'ザ','シ':'ジ','ス':'ズ','セ':'ゼ','ソ':'ゾ',
  'タ':'ダ','チ':'ヂ','ツ':'ヅ','テ':'デ','ト':'ド','ハ':'バ','ヒ':'ビ','フ':'ブ','ヘ':'ベ','ホ':'ボ','ウ':'ヴ'};
const HANDAKU = {'ハ':'パ','ヒ':'ピ','フ':'プ','ヘ':'ペ','ホ':'ポ'};

function norm(s) {
  let t = String(s || '');
  // 半角カタカナ→全角カタカナ（濁点・半濁点は前の字に合成）
  if (/[｡-ﾟ]/.test(t)) {
    let o = '';
    for (const c of t) {
      const f = HK[c] || c;
      const prev = o.slice(-1);
      if (f === '゛' && DAKU[prev]) { o = o.slice(0, -1) + DAKU[prev]; continue; }
      if (f === '゜' && HANDAKU[prev]) { o = o.slice(0, -1) + HANDAKU[prev]; continue; }
      o += f;
    }
    t = o;
  }
  return t
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角英数記号→半角
    .replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))   // カタカナ→ひらがな
    .replace(/[ー\-・･\s（）()、,／\/]/g, '')                                 // 長音・区切り記号は無視
    .toLowerCase();
}

/* ---------------------------------------------------------
   検索（名前 + 別名 + カテゴリ）
   --------------------------------------------------------- */
function searchItems(q, kindFilter) {
  const s = norm(q);
  return ITEMS.filter(it => {
    if (kindFilter && kindFilter !== 'all' && it.kind !== kindFilter) return false;
    if (!s) return true;
    if (norm(it.name).includes(s)) return true;
    if (norm(it.cat).includes(s)) return true;
    return (it.alias || []).some(a => norm(a).includes(s));
  });
}

/* ---------------------------------------------------------
   悩み検索
   --------------------------------------------------------- */
function searchGoals(q) {
  const s = norm(q);
  if (!s) return GOALS;
  return GOALS.filter(g => {
    if (norm(g.name).includes(s)) return true;
    if ((g.kw || []).some(k => norm(k).includes(s))) return true;
    const cat = GOAL_CATS.find(c => c.id === g.cat);
    return cat && norm(cat.name).includes(s);
  });
}

/* ---------------------------------------------------------
   悩みから選んだ成分セットの内部整合チェック
   （おすすめされた組み合わせ自体に衝突がないか）
   --------------------------------------------------------- */
function checkGoalCombo(goal) {
  const ids = goal.items.map(x => x.id);
  return judgeAll(ids).filter(r => r.lv === 'ng' || r.lv === 'caution');
}
