/* =========================================================
   SuppleNavi - UI制御
   設計方針: 文字入力なしで完結させる。
   ・選ぶ = 「よく選ばれるもの」＋「種類ごとの開閉パネル」を押すだけ
   ・読む = 結論を1行のバナーで出し、○（報告なし）は折りたたむ
   ・検索は残すが既定で閉じておき、使いたい人だけが開く
   ========================================================= */

const S = {
  picked: [],          // 選択中のアイテムid
  kind: 'all',
  q: '',
  view: 'card',        // 'card' | 'matrix'
  sex: 'm',
  q2: '',
  cat2: 'all',
  goalCat: null,       // 表示中の悩みカテゴリ
  goal: null,          // 表示中の悩み
  openG: null,         // 開いている種類パネルの番号（PICK_GROUPS の index）
  sum: null,           // 直近の判定サマリー（下部バー用）
};

const $  = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const KIND_LABEL = {supp:'サプリ', food:'食品', drug:'お薬'};

/* ボタン用の短い表示名（無ければ正式名） */
const disp = (it) => (it && (SHORT[it.id] || it.name)) || '';

/* ================= タブ ================= */
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
    document.querySelectorAll('.pane').forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    $('#pane-' + t.dataset.pane).classList.add('on');
    renderBar();
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
});

/* =========================================================
   押すだけで選ぶパネル
   ========================================================= */
function groupItems(g) {
  return ITEMS.filter(i => i.kind === g.kind && (!g.cat || i.cat === g.cat));
}

function pkBtn(id) {
  const it = ITEM_MAP[id];
  if (!it) return '';
  const on = S.picked.includes(id);
  return `<button class="pk${on ? ' on' : ''}" data-id="${id}">`
    + `<span class="pk-c">${on ? '✓' : '＋'}</span>${esc(disp(it))}</button>`;
}

function renderPick() {
  const el = $('#pick');

  const popular = POPULAR.map(g => `
    <div class="pk-g">
      <div class="pk-t">${g.icon} ${esc(g.label)}</div>
      <div class="pk-l">${g.ids.map(pkBtn).join('')}</div>
    </div>`).join('');

  const groups = PICK_GROUPS.map((g, i) => {
    const open = S.openG === i;
    const list = groupItems(g);
    return `<div class="ac${open ? ' on' : ''}">
      <button class="ac-h" data-ac="${i}">
        <span class="ac-i">${g.icon}</span>
        <span class="ac-n">${esc(g.name)}</span>
        <span class="ac-c">${list.length}件</span>
        <span class="ac-a">${open ? '−' : '＋'}</span>
      </button>
      ${open ? `<div class="pk-l ac-b">${list.map(it => pkBtn(it.id)).join('')}</div>` : ''}
    </div>`;
  }).join('');

  el.innerHTML = popular
    + `<div class="pk-t">📂 上に無いものは、ここを押して探す</div><div class="acs">${groups}</div>`;

  el.querySelectorAll('.pk').forEach(b => { b.onclick = () => toggle(b.dataset.id); });
  el.querySelectorAll('.ac-h').forEach(b => {
    b.onclick = () => {
      const i = Number(b.dataset.ac);
      S.openG = (S.openG === i) ? null : i;   // 開いているものを押したら閉じる
      renderPick();
    };
  });
}

/* ================= 名前で探す（任意・既定は閉じている）================= */
function renderGrid() {
  const list = searchItems(S.q, S.kind);
  if (!list.length) {
    $('#grid').innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-i">🔍</div>'
      + '<div class="empty-t">見つかりませんでした</div>'
      + '<div class="empty-s">別のことばで探してみてください</div></div>';
    return;
  }
  $('#grid').innerHTML = list.map(it => {
    const on = S.picked.includes(it.id);
    return `<button class="it${on ? ' on' : ''}" data-id="${it.id}">
      <span class="it-k">${KIND_LABEL[it.kind]}</span>
      <span class="it-n">${esc(it.name)}</span>
    </button>`;
  }).join('');

  $('#grid').querySelectorAll('.it').forEach(b => {
    b.onclick = () => toggle(b.dataset.id);
  });
}

function toggle(id) {
  const i = S.picked.indexOf(id);
  if (i >= 0) S.picked.splice(i, 1);
  else S.picked.push(id);
  renderSel();
  renderPick();
  renderGrid();
  renderResult();
}

function renderSel() {
  const el = $('#sel');
  if (!S.picked.length) {
    el.innerHTML = '<span class="sel-empty">下のボタンを押して2つ以上選んでください</span>';
    return;
  }
  el.innerHTML = S.picked.map(id => {
    const it = ITEM_MAP[id];
    return `<span class="sel-c">${esc(disp(it))}<button class="x" data-id="${id}" aria-label="削除">×</button></span>`;
  }).join('')
  + (S.picked.length >= 2 ? '<button class="btn-2" id="clr" style="margin-left:4px">すべて消す</button>' : '');

  el.querySelectorAll('.x').forEach(b => { b.onclick = () => toggle(b.dataset.id); });
  const c = $('#clr');
  if (c) c.onclick = () => { S.picked = []; renderSel(); renderPick(); renderGrid(); renderResult(); };
}

/* ================= 判定結果 ================= */
/* 結論を1行で出す。ここだけ読めば次の行動が決まるようにする */
function verdictHtml(sum) {
  const v = sum.ng
    ? {c:'ng', i:'⛔', t:`避けた方がいい組み合わせが ${sum.ng}件`,
       s:'下の × の組み合わせを、薬剤師または医師にご確認ください'}
    : sum.caution
      ? {c:'caution', i:'⚠️', t:`注意したい組み合わせが ${sum.caution}件`,
         s:'× はありません。飲む時間をずらすなどで対応できることが多いです'}
      : {c:'good', i:'✅', t:'避けた方がいい組み合わせはありません',
         s:'この組み合わせで既知の重大な相互作用は報告されていません'};
  return `<div class="vb ${v.c}">
    <div class="vb-i">${v.i}</div>
    <div><div class="vb-t">${v.t}</div><div class="vb-s">${v.s}</div></div>
  </div>`;
}

function renderResult() {
  const out = $('#out');

  if (S.picked.length < 2) {
    S.sum = null;
    const solo = soloAlerts(S.picked);
    out.innerHTML = solo.length ? soloBlock(solo) : `
      <div class="card"><div class="empty">
        <div class="empty-i">💊</div>
        <div class="empty-t">2つ以上選ぶと判定できます</div>
        <div class="empty-s">サプリ同士、サプリと食品、お薬との組み合わせもチェックできます</div>
      </div></div>`;
    renderBar();
    return;
  }

  const results = judgeAll(S.picked);
  const sum = summarize(results);
  const solo = soloAlerts(S.picked);
  S.sum = sum;

  const shown  = results.filter(r => r.lv !== 'ok');   // ×・△・◎ は最初から見せる
  const hidden = results.filter(r => r.lv === 'ok');   // ○ は折りたたむ（読む量を減らす）

  const cardBody = shown.length ? cardsHtml(shown) : `
    <div class="note life">
      <span class="note-i">✅</span>
      <div><b>気をつけたい組み合わせはありませんでした</b>
      選んだ組み合わせについて、既知の重大な相互作用の報告はありません。</div>
    </div>`;

  out.innerHTML = `
    ${verdictHtml(sum)}

    <div class="sum">
      <div class="sum-c ng"><div class="n">${sum.ng}</div><div class="l">× 避ける</div></div>
      <div class="sum-c caution"><div class="n">${sum.caution}</div><div class="l">△ 注意</div></div>
      <div class="sum-c good"><div class="n">${sum.good}</div><div class="l">◎ 相性よい</div></div>
      <div class="sum-c ok"><div class="n">${sum.ok}</div><div class="l">○ 報告なし</div></div>
    </div>

    ${solo.length ? soloBlock(solo) : ''}

    <div class="card">
      <h2 class="card-t"><span class="step">2</span>判定結果（${results.length}組）</h2>
      <div class="view-sw">
        <button class="${S.view === 'card' ? 'on' : ''}" data-v="card">📋 リスト</button>
        <button class="${S.view === 'matrix' ? 'on' : ''}" data-v="matrix">⊞ 一覧表</button>
      </div>
      ${S.view === 'card'
        ? cardBody + (hidden.length ? `<details class="fold">
            <summary>○ 問題の報告がない組み合わせ ${hidden.length}組も見る</summary>
            ${cardsHtml(hidden)}
          </details>` : '')
        : matrixHtml(S.picked)}
      <div class="legend">
        <span class="lg-ng"><b>×</b> 避ける</span>
        <span class="lg-ca"><b>△</b> 注意（時間をずらす等）</span>
        <span class="lg-gd"><b>◎</b> 相性がよい</span>
        <span class="lg-ok"><b>○</b> 問題の報告なし</span>
      </div>
    </div>

    ${(sum.ng || sum.caution) ? `
    <div class="note avoid">
      <span class="note-i">🏥</span>
      <div><b>次のアクション</b>
      ×・△が出た組み合わせは、お薬手帳とこの画面（印刷ボタンでPDF化できます）を持って、
      かかりつけの薬剤師または医師にご確認ください。判断を代わりに行うものではありません。</div>
    </div>` : ''}
  `;

  out.querySelectorAll('.view-sw button').forEach(b => {
    b.onclick = () => { S.view = b.dataset.v; renderResult(); };
  });
  renderBar();
}

/* 画面下端の判定バー（スクロールしても結論が見えるようにする） */
function renderBar() {
  const el = $('#bar');
  if (!el) return;
  const s = S.sum;
  const onCheck = $('#pane-check').classList.contains('on');
  if (!s || S.picked.length < 2 || !onCheck) {
    el.className = 'bar';
    el.innerHTML = '';
    return;
  }
  const cls = s.ng ? 'ng' : s.caution ? 'caution' : 'good';
  const mark = s.ng ? `× ${s.ng}件` : s.caution ? `△ ${s.caution}件` : '✅ 問題なし';
  el.className = 'bar on ' + cls;
  el.innerHTML = `<span class="bar-n">${S.picked.length}個を選択中</span>
    <span class="bar-m">${mark}</span>
    <button class="bar-b" id="bar-go">結果を見る ↓</button>`;
  $('#bar-go').onclick = () => {
    try { $('#out').scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (e) { /* 非対応環境は無視 */ }
  };
}

function soloBlock(solo) {
  return `<div class="card">
    <h2 class="card-t">⚠️ 選んだ成分そのものへの注意</h2>
    <div class="res">
    ${solo.map(s => `
      <div class="rc ${s.cls}">
        <div class="rc-m">${s.mark}</div>
        <div class="rc-b">
          <div class="rc-p">${esc(disp(s.item))}<span class="rc-tag">単体での注意</span></div>
          <div class="rc-msg">${esc(s.msg)}</div>
          <div class="rc-how"><b>どうする:</b> ${esc(s.how)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function cardsHtml(results) {
  return '<div class="res">' + results.map(r => {
    const main = r.reasons[0];
    const rest = r.reasons.slice(1);
    return `<div class="rc ${r.cls}">
      <div class="rc-m">${r.mark}</div>
      <div class="rc-b">
        <div class="rc-p">${esc(disp(r.a))}<span class="rc-x">×</span>${esc(disp(r.b))}
          <span class="rc-tag">${r.label}</span></div>
        <div class="rc-msg">${esc(main.msg)}</div>
        ${main.src !== 'none' ? `<div class="rc-how"><b>どうする:</b> ${esc(main.how)}</div>` : ''}
        ${rest.length ? `<ul class="rc-more">${rest.map(x => `<li>${esc(x.msg)} → ${esc(x.how)}</li>`).join('')}</ul>` : ''}
      </div>
    </div>`;
  }).join('') + '</div>';
}

function matrixHtml(ids) {
  const items = ids.map(id => ITEM_MAP[id]);
  let h = '<div class="mx-wrap"><table class="mx"><thead><tr><th></th>';
  items.forEach(it => { h += `<th class="col"><span>${esc(disp(it))}</span></th>`; });
  h += '</tr></thead><tbody>';
  items.forEach((ra, i) => {
    h += `<tr><th class="row" title="${esc(ra.name)}">${esc(disp(ra))}</th>`;
    items.forEach((rb, j) => {
      if (i === j) { h += '<td><div class="cell self">—</div></td>'; return; }
      const r = judgePair(ra.id, rb.id);
      const tip = `${ra.name} × ${rb.name}: ${r.label}／${r.reasons[0].msg}`;
      h += `<td><div class="cell ${r.cls}" title="${esc(tip)}">${r.mark}</div></td>`;
    });
    h += '</tr>';
  });
  return h + '</tbody></table></div><p class="hint">💡 マークにカーソルを合わせると理由が表示されます</p>';
}

/* ================= 悩みから探す ================= */
function renderGoal() {
  const v = $('#goal-view');

  // 詳細
  if (S.goal) {
    const g = S.goal;
    const cat = GOAL_CATS.find(c => c.id === g.cat);
    const conflicts = checkGoalCombo(g);

    v.innerHTML = `
      <button class="back" id="gback">${S.goalCat ? `← ${esc(cat.name)}の一覧に戻る` : '← 悩みの一覧に戻る'}</button>
      <div class="card">
        <div class="gd-hd">
          <div class="gd-i">${cat.icon}</div>
          <div><div class="gd-c">${esc(cat.name)}</div><div class="gd-n">${esc(g.name)}</div></div>
        </div>

        <h3 class="card-t">💊 関連が報告されている成分と目安量</h3>
        ${g.items.map(x => {
          const it = ITEM_MAP[x.id];
          if (!it) return '';
          const stars = '★'.repeat(x.ev) + `<span class="ev-o">${'★'.repeat(3 - x.ev)}</span>`;
          return `<div class="sup ${x.role}">
            <span class="sup-r ${x.role}">${x.role === 'main' ? '主役' : '補助'}</span>
            <div class="sup-b">
              <div class="sup-n">${esc(disp(it))}<span class="ev" title="報告の強さ">${stars}</span></div>
              <div class="sup-w">${esc(x.why)}</div>
              <div class="sup-d">目安 ${esc(x.dose)}</div>
            </div>
          </div>`;
        }).join('')}

        ${conflicts.length ? `
        <h3 class="card-t" style="margin-top:20px">⚠️ 上の成分同士で注意が必要な組み合わせ</h3>
        ${cardsHtml(conflicts)}` : ''}

        <div class="note life" style="margin-top:18px">
          <span class="note-i">🌱</span>
          <div><b>サプリより先に効くこと</b>${esc(g.lifestyle)}</div>
        </div>
        ${g.avoid && g.avoid !== '—' ? `
        <div class="note avoid">
          <span class="note-i">🚫</span>
          <div><b>避けた方がいいこと</b>${esc(g.avoid)}</div>
        </div>` : ''}

        <button class="btn" id="gcheck" style="margin-top:14px">
          この成分の組み合わせを飲み合わせチェックに入れる
        </button>
        <p class="hint">※ ここに挙げた成分は「関連の報告がある」ものです。あなたに必要かどうかの判断は医師・薬剤師にご確認ください。</p>
      </div>`;

    $('#gback').onclick = () => { S.goal = null; renderGoal(); };
    $('#gcheck').onclick = () => {
      S.picked = g.items.map(x => x.id).filter(id => ITEM_MAP[id]);
      renderSel(); renderPick(); renderGrid(); renderResult();
      document.querySelector('.tab[data-pane="check"]').click();
    };
    return;
  }

  // カテゴリ内の悩み一覧
  if (S.goalCat) {
    const cat = GOAL_CATS.find(c => c.id === S.goalCat);
    const list = GOALS.filter(g => g.cat === S.goalCat);
    v.innerHTML = `
      <button class="back" id="cback">← すべてのカテゴリに戻る</button>
      <div class="card">
        <h2 class="card-t">${cat.icon} ${esc(cat.name)}の悩み</h2>
        <div class="glist">
          ${list.map(g => `<button class="gitem" data-g="${g.id}">
            <span class="gitem-i">${cat.icon}</span>
            <span class="gitem-n">${esc(g.name)}</span>
            <span class="gitem-a">›</span>
          </button>`).join('')}
        </div>
      </div>`;
    $('#cback').onclick = () => { S.goalCat = null; renderGoal(); };
    v.querySelectorAll('.gitem').forEach(b => {
      b.onclick = () => { S.goal = GOALS.find(g => g.id === b.dataset.g); renderGoal(); };
    });
    return;
  }

  // 入口画面（よくある悩み → カテゴリ。文字入力は任意）
  v.innerHTML = `
    <div class="card">
      <h2 class="card-t"><span class="step">🎯</span>気になっていることを押す</h2>

      <div class="pk-t">🔥 よくある悩み</div>
      <div class="pk-l">
        ${POPULAR_GOALS.map(id => {
          const g = GOALS.find(x => x.id === id);
          if (!g) return '';
          const c = GOAL_CATS.find(x => x.id === g.cat);
          return `<button class="gpop" data-g="${g.id}">${c ? c.icon : ''} ${esc(g.name)}</button>`;
        }).join('')}
      </div>

      <div class="pk-t">📂 ほかの悩みは、カテゴリを押して探す</div>
      <div class="gcats">
        ${GOAL_CATS.map(c => {
          const n = GOALS.filter(g => g.cat === c.id).length;
          return `<button class="gcat" data-c="${c.id}">
            <span class="gcat-i">${c.icon}</span>
            <span class="gcat-n">${esc(c.name)}</span>
            <span class="gcat-c">${n}件</span>
          </button>`;
        }).join('')}
      </div>

      <button class="more-b" id="gq-t">🔤 ことばを入力して探す（任意）</button>
      <div id="gq-w" hidden>
        <div class="srch">
          <span class="srch-i">🔍</span>
          <input type="text" id="gq" placeholder="悩みを検索（例: 寝つき、疲れ、乾燥、便秘、血圧）">
        </div>
      </div>
      <div id="gres" style="margin-top:14px"></div>
    </div>`;

  v.querySelectorAll('.gpop').forEach(b => {
    b.onclick = () => { S.goal = GOALS.find(g => g.id === b.dataset.g); renderGoal(); };
  });
  v.querySelectorAll('.gcat').forEach(b => {
    b.onclick = () => { S.goalCat = b.dataset.c; renderGoal(); };
  });

  $('#gq-t').onclick = () => {
    const w = $('#gq-w'), b = $('#gq-t');
    if (w.hasAttribute('hidden')) { w.removeAttribute('hidden'); b.textContent = '✕ 入力して探すのを閉じる'; }
    else { w.setAttribute('hidden', ''); b.textContent = '🔤 ことばを入力して探す（任意）'; }
  };

  $('#gq').oninput = (e) => {
    const q = e.target.value.trim();
    const box = $('#gres');
    if (!q) { box.innerHTML = ''; return; }
    const list = searchGoals(q);
    box.innerHTML = list.length
      ? `<h3 class="card-t">検索結果 ${list.length}件</h3><div class="glist">`
        + list.map(g => {
            const c = GOAL_CATS.find(x => x.id === g.cat);
            return `<button class="gitem" data-g="${g.id}">
              <span class="gitem-i">${c.icon}</span>
              <span class="gitem-n">${esc(g.name)}<span class="gitem-c">${esc(c.name)}</span></span>
              <span class="gitem-a">›</span></button>`;
          }).join('') + '</div>'
      : '<div class="empty"><div class="empty-i">🔍</div><div class="empty-t">見つかりませんでした</div></div>';
    box.querySelectorAll('.gitem').forEach(b => {
      b.onclick = () => { S.goal = GOALS.find(g => g.id === b.dataset.g); renderGoal(); };
    });
  };
}

/* ================= 成分と目安量 ================= */
function renderDose() {
  const cats = ['all', ...new Set(ITEMS.filter(i => i.kind === 'supp').map(i => i.cat))];
  $('#cats2').innerHTML = cats.map(c =>
    `<button class="chip${S.cat2 === c ? ' on' : ''}" data-c="${esc(c)}">${c === 'all' ? 'すべて' : esc(c)}</button>`
  ).join('');
  $('#cats2').querySelectorAll('.chip').forEach(b => {
    b.onclick = () => { S.cat2 = b.dataset.c; renderDose(); };
  });

  let list = ITEMS.filter(i => i.kind === 'supp');
  if (S.cat2 !== 'all') list = list.filter(i => i.cat === S.cat2);
  if (S.q2) {
    const s = norm(S.q2);   // カタカナ・ひらがな・全角半角の差を吸収（engine.js）
    list = list.filter(i => norm(i.name).includes(s)
      || norm(i.cat).includes(s)
      || (i.alias || []).some(a => norm(a).includes(s)));
  }

  if (!list.length) {
    $('#dose-out').innerHTML = '<div class="empty"><div class="empty-i">🔍</div><div class="empty-t">見つかりませんでした</div></div>';
    return;
  }

  const sexLabel = S.sex === 'm' ? '成人男性の目安' : '成人女性の目安';
  $('#dose-out').innerHTML = `
    <table class="dose-t">
      <thead><tr>
        <th style="width:24%">成分</th>
        <th style="width:24%">${sexLabel}</th>
        <th style="width:19%">上限・注意ライン</th>
        <th style="width:16%">タイミング</th>
        <th>ひとこと</th>
      </tr></thead>
      <tbody>
      ${list.map(it => `<tr>
        <td><div class="dose-n">${esc(it.name)}</div><div class="dose-bs">${esc(it.cat)}</div></td>
        <td class="dose-v">${esc(S.sex === 'm' ? it.doseM : it.doseF)}
          <div class="dose-bs">${esc(it.basis)}</div></td>
        <td class="dose-ul">${esc(it.ul)}</td>
        <td class="dose-tm">${esc(it.timing)}</td>
        <td class="dose-tm">${esc(it.note)}</td>
      </tr>`).join('')}
      </tbody>
    </table>
    <p class="hint">※ 目安量は健康な成人を想定した一般的な値です。妊娠中・授乳中・持病のある方・服薬中の方は必ず医師・薬剤師にご確認ください。
    上限量は「これを超えたら危険」ではなく「超えないことが望ましい」ラインです。</p>`;
}

/* ================= イベント ================= */
/* 検索欄は既定で閉じておく。押した人だけに開く */
$('#srch-t').onclick = () => {
  const w = $('#srch-w'), b = $('#srch-t');
  if (w.hasAttribute('hidden')) {
    w.removeAttribute('hidden');
    b.textContent = '✕ 名前で探すのを閉じる';
    try { $('#q').focus(); } catch (e) { /* 非対応環境は無視 */ }
  } else {
    w.setAttribute('hidden', '');
    b.textContent = '🔤 名前を入力して探す（任意）';
  }
};
$('#q2-t').onclick = () => {
  const w = $('#q2-w'), b = $('#q2-t');
  if (w.hasAttribute('hidden')) { w.removeAttribute('hidden'); b.textContent = '✕ 成分名で探すのを閉じる'; }
  else { w.setAttribute('hidden', ''); b.textContent = '🔤 成分名を入力して探す（任意）'; }
};

$('#q').oninput = (e) => { S.q = e.target.value; renderGrid(); };
$('#kinds').querySelectorAll('.chip').forEach(b => {
  b.onclick = () => {
    S.kind = b.dataset.kind;
    $('#kinds').querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    renderGrid();
  };
});
$('#q2').oninput = (e) => { S.q2 = e.target.value; renderDose(); };
$('#sexsw').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    S.sex = b.dataset.sex;
    $('#sexsw').querySelectorAll('button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    renderDose();
  };
});

/* ================= 初期化 ================= */
renderSel();
renderPick();
renderGrid();
renderResult();
renderGoal();
renderDose();
