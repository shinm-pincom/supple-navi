/* =========================================================
   SuppleNavi - 悩み（課題）→ 成分マッピング
   ---------------------------------------------------------
   ev  : エビデンスの強さ  3=★★★（複数RCT/機能性表示の実績多数）
                          2=★★（一定の報告あり）
                          1=★（限定的・伝統的使用のみ）
   role: 'main'（主役）| 'sub'（補助）
   ========================================================= */

const GOAL_CATS = [
  {id:'sleep',   name:'睡眠',        icon:'🌙', color:'#6366f1'},
  {id:'stress',  name:'ストレス・メンタル', icon:'🧘', color:'#8b5cf6'},
  {id:'fatigue', name:'疲れ・エネルギー', icon:'⚡', color:'#f59e0b'},
  {id:'beauty',  name:'美容',        icon:'✨', color:'#ec4899'},
  {id:'diet',    name:'ダイエット・体型', icon:'🏃', color:'#10b981'},
  {id:'body',    name:'筋力・運動',   icon:'💪', color:'#ef4444'},
  {id:'health',  name:'健康・数値',   icon:'🩺', color:'#0ea5e9'},
  {id:'brain',   name:'脳・集中力',   icon:'🧠', color:'#14b8a6'},
  {id:'gut',     name:'腸・お腹',     icon:'🌿', color:'#84cc16'},
  {id:'immune',  name:'免疫・季節',   icon:'🛡️', color:'#06b6d4'},
  {id:'woman',   name:'女性の悩み',   icon:'🌸', color:'#f472b6'},
  {id:'man',     name:'男性の悩み',   icon:'🔵', color:'#3b82f6'},
  {id:'senior',  name:'加齢・関節・目', icon:'🦴', color:'#a855f7'},
];

const GOALS = [

/* ================= 睡眠 ================= */
{id:'g_sleep_onset', cat:'sleep', name:'寝つきが悪い', kw:['入眠','寝られない','布団に入っても','ねつき','ねられない','にゅうみん'],
 items:[
  {id:'glycine', role:'main', ev:3, why:'深部体温を下げて寝つきを助ける', dose:'3g／就寝30分前'},
  {id:'theanine', role:'main', ev:3, why:'興奮を抑えて入眠しやすくする', dose:'200mg／就寝30〜60分前'},
  {id:'gaba', role:'sub', ev:2, why:'リラックス方向に働く', dose:'100mg／就寝前'},
  {id:'magnesium', role:'sub', ev:2, why:'神経の興奮を抑える', dose:'200〜350mg／夕食後'},
  {id:'valerian', role:'sub', ev:2, why:'鎮静系ハーブ', dose:'300〜600mg／就寝前'},
 ],
 lifestyle:'カフェインは就寝6時間前まで。就寝1時間前に照明を落とすのが最も効果が大きい。',
 avoid:'カフェイン錠・エナジードリンクの夕方以降の摂取'},

{id:'g_sleep_quality', cat:'sleep', name:'夜中に何度も起きる', kw:['中途覚醒','浅い','ぐっすり','よなか','ちゅうとかくせい'],
 items:[
  {id:'glycine', role:'main', ev:3, why:'睡眠の質の指標を改善する報告', dose:'3g／就寝30分前'},
  {id:'magnesium', role:'main', ev:2, why:'不足していると眠りが浅くなりやすい', dose:'200〜350mg／夕食後'},
  {id:'theanine', role:'sub', ev:2, why:'中途覚醒の減少報告', dose:'200mg／就寝前'},
  {id:'vit_d', role:'sub', ev:1, why:'不足と睡眠の質の関連報告', dose:'25μg(1,000IU)／食後'},
 ],
 lifestyle:'寝る前のアルコールは寝つきを良くするが後半の眠りを壊す。就寝3時間前まで。',
 avoid:'寝酒、就寝前の高糖質'},

{id:'g_sleep_shift', cat:'sleep', name:'時差ぼけ・夜勤で昼夜が逆転', kw:['時差','夜勤','シフト','じさぼけ','やきん'],
 items:[
  {id:'melatonin', role:'main', ev:3, why:'体内時計を前後にずらす作用', dose:'0.5〜3mg（国内では食品として販売不可。医療機関で相談）'},
  {id:'glycine', role:'sub', ev:2, why:'寝つきの補助', dose:'3g'},
  {id:'theanine', role:'sub', ev:2, why:'リラックス', dose:'200mg'},
 ],
 lifestyle:'朝の光を浴びる／浴びないのコントロールが最も強力。',
 avoid:'寝る前のブルーライト、夜勤明けの明るい帰宅'},

/* ================= ストレス・メンタル ================= */
{id:'g_stress', cat:'stress', name:'イライラ・ストレスを感じる', kw:['ストレス','イライラ','緊張','いらいら','すとれす'],
 items:[
  {id:'theanine', role:'main', ev:3, why:'一時的なストレスの緩和で機能性表示の届出多数', dose:'200mg'},
  {id:'ashwagandha', role:'main', ev:2, why:'コルチゾール低下の報告', dose:'300〜600mg／夕食後'},
  {id:'gaba', role:'sub', ev:2, why:'一時的な精神的ストレスの緩和', dose:'28〜100mg'},
  {id:'magnesium', role:'sub', ev:2, why:'ストレスで消耗しやすい', dose:'290〜370mg'},
  {id:'vit_b6', role:'sub', ev:2, why:'神経伝達物質の合成に必要', dose:'1.4mg（上限45〜60mg）'},
 ],
 lifestyle:'運動が最も再現性の高いストレス対策。週3回20分の有酸素運動から。',
 avoid:'カフェインの過剰（不安を強めることがある）'},

{id:'g_mood', cat:'stress', name:'気分が落ちこみやすい', kw:['落ち込み','憂うつ','やる気が出ない','おちこみ','ゆううつ','やるきがでない'],
 items:[
  {id:'omega3', role:'main', ev:2, why:'EPAでの気分への報告', dose:'EPA中心で1,000〜2,000mg'},
  {id:'vit_d', role:'main', ev:2, why:'血中濃度が低い人での関連報告', dose:'25μg(1,000IU)'},
  {id:'folate', role:'sub', ev:2, why:'不足と気分の関連', dose:'240μg'},
  {id:'vit_b12', role:'sub', ev:2, why:'不足で気分・認知に影響', dose:'2.4μg'},
  {id:'st_johns', role:'sub', ev:2, why:'軽度〜中等度で報告あり。ただし薬との相互作用が非常に多い', dose:'300mg×3回（処方薬がある人は使わない）'},
 ],
 lifestyle:'2週間以上続く落ち込みはサプリではなく受診が最短。',
 avoid:'処方薬服用中のセントジョーンズワート（相互作用が重大）'},

/* ================= 疲れ・エネルギー ================= */
{id:'g_fatigue', cat:'fatigue', name:'疲れが抜けない', kw:['疲労','だるい','倦怠感','つかれ','ひろう'],
 items:[
  {id:'vit_b1', role:'main', ev:2, why:'糖質をエネルギーに変える工程で必須', dose:'1.4mg（サプリは数十mg配合が多い）'},
  {id:'iron', role:'main', ev:3, why:'鉄不足は疲労の代表的な原因（特に女性）', dose:'女10.5mg／男7.5mg。まず血液検査を'},
  {id:'vit_b12', role:'sub', ev:2, why:'不足で疲労感が出る', dose:'2.4μg'},
  {id:'coq10', role:'sub', ev:2, why:'エネルギー産生に関わる', dose:'100mg／食後'},
  {id:'taurine', role:'sub', ev:1, why:'肝機能・疲労感への報告', dose:'1,000mg'},
 ],
 lifestyle:'まず健康診断で貧血・甲状腺・肝機能を確認するのが最短。',
 avoid:'エナジードリンクの常飲（一時的な覚醒で疲労は残る）'},

{id:'g_hangover', cat:'fatigue', name:'二日酔いしやすい', kw:['二日酔い','お酒','飲みすぎ','ふつかよい','おさけ','のみすぎ'],
 items:[
  {id:'taurine', role:'main', ev:2, why:'肝機能のサポート', dose:'1,000〜2,000mg'},
  {id:'milk_thistle', role:'sub', ev:1, why:'肝臓のケア目的で使われる', dose:'200〜400mg'},
  {id:'vit_b1', role:'sub', ev:2, why:'飲酒で消耗する', dose:'1.4mg以上'},
  {id:'curcumin', role:'sub', ev:1, why:'伝統的に飲酒前に使われる', dose:'500mg'},
 ],
 lifestyle:'水分と一緒に飲む・空腹で飲まないの効果が最も大きい。',
 avoid:'アセトアミノフェンとの併用（肝負担）、濃縮カテキンサプリ'},

{id:'g_summer', cat:'fatigue', name:'夏バテ・食欲が落ちる', kw:['夏バテ','暑さ','食欲不振','なつばて','しょくよくふしん'],
 items:[
  {id:'vit_b1', role:'main', ev:2, why:'汗で失われやすい', dose:'1.4mg以上'},
  {id:'magnesium', role:'sub', ev:2, why:'汗で失われる', dose:'290〜370mg'},
  {id:'potassium', role:'sub', ev:2, why:'汗で失われる', dose:'食事から。サプリは腎機能次第'},
  {id:'vit_c', role:'sub', ev:1, why:'ストレス下で消耗', dose:'100mg'},
 ],
 lifestyle:'水だけでなく塩分も。経口補水液が最も確実。',
 avoid:'水だけの大量摂取（低ナトリウムのリスク）'},

/* ================= 美容 ================= */
{id:'g_skin_dry', cat:'beauty', name:'肌の乾燥・小じわ', kw:['乾燥','かさつき','しわ','ハリ','はだ','かんそう','こじわ'],
 items:[
  {id:'collagen', role:'main', ev:3, why:'肌の弾力・水分で機能性表示の届出多数', dose:'2.5〜10g／8〜12週継続'},
  {id:'ceramide', role:'main', ev:3, why:'肌の水分保持で届出多数', dose:'0.6〜1.8mg'},
  {id:'hyaluronic', role:'sub', ev:2, why:'肌の水分で届出あり', dose:'120mg'},
  {id:'vit_c', role:'sub', ev:2, why:'コラーゲン合成に必要', dose:'100mg以上'},
  {id:'omega3', role:'sub', ev:2, why:'皮脂のバリア機能', dose:'1,000mg'},
 ],
 lifestyle:'保湿と紫外線対策が土台。サプリは上乗せ。',
 avoid:'極端な脂質制限（肌の油分が作れなくなる）'},

{id:'g_skin_acne', cat:'beauty', name:'ニキビ・肌荒れ', kw:['ニキビ','吹き出物','肌荒れ','にきび','はだあれ'],
 items:[
  {id:'zinc', role:'main', ev:2, why:'皮膚の再生に関わり、ニキビでの報告あり', dose:'11mg（上限40mg）'},
  {id:'vit_b2', role:'sub', ev:2, why:'皮脂の代謝に関わる', dose:'1.6mg'},
  {id:'vit_b6', role:'sub', ev:2, why:'皮脂バランス', dose:'1.4mg（上限45〜60mg）'},
  {id:'probiotics', role:'sub', ev:2, why:'腸内環境と肌の関連', dose:'10億CFU以上'},
  {id:'omega3', role:'sub', ev:2, why:'炎症を抑える方向', dose:'1,000mg'},
 ],
 lifestyle:'高GI食・乳製品の過剰との関連報告あり。まず皮膚科の外用薬が最短。',
 avoid:'高用量ビオチンの単独摂取（一部で悪化報告）'},

{id:'g_spot', cat:'beauty', name:'シミ・くすみ・美白', kw:['シミ','くすみ','美白','日焼け','しみ','びはく','ひやけ'],
 items:[
  {id:'vit_c', role:'main', ev:2, why:'メラニン生成に関わる工程を抑える方向', dose:'100〜1,000mg／分割'},
  {id:'astaxanthin', role:'main', ev:2, why:'肌の状態で機能性表示の届出あり', dose:'6〜12mg'},
  {id:'vit_e', role:'sub', ev:2, why:'ビタミンCと協働する抗酸化', dose:'常用量'},
  {id:'beta_carotene', role:'sub', ev:1, why:'紫外線への抵抗性の報告', dose:'2〜6mg（喫煙者は高用量を避ける）'},
 ],
 lifestyle:'日焼け止めの効果がサプリより圧倒的に大きい。SPF30以上を毎日。',
 avoid:'喫煙者のβカロテン高用量サプリ'},

{id:'g_hair', cat:'beauty', name:'髪のボリューム・抜け毛', kw:['抜け毛','薄毛','髪','ハリコシ','かみ','ぬけげ','うすげ','はくはつ'],
 items:[
  {id:'iron', role:'main', ev:3, why:'鉄不足は女性の抜け毛の代表的原因', dose:'女10.5mg。まず血液検査を'},
  {id:'zinc', role:'main', ev:2, why:'髪のタンパク合成に必要', dose:'11mg'},
  {id:'biotin', role:'sub', ev:1, why:'不足時には有効だが充足者への追加効果は限定的', dose:'50μg'},
  {id:'protein_whey', role:'sub', ev:2, why:'髪の材料はタンパク質', dose:'体重×1.2g/日を確保'},
  {id:'saw_palmetto', role:'sub', ev:2, why:'男性型脱毛での報告', dose:'320mg（男性）'},
 ],
 lifestyle:'男性型脱毛は皮膚科の内服薬（フィナステリド等）が最もエビデンスが強い。',
 avoid:'高用量ビオチン（血液検査値を狂わせる）'},

{id:'g_nail', cat:'beauty', name:'爪が割れる・弱い', kw:['爪','二枚爪','割れる','つめ','つめがわれる'],
 items:[
  {id:'biotin', role:'main', ev:2, why:'爪の厚みへの報告', dose:'50μg（サプリは高用量品が多い）'},
  {id:'iron', role:'sub', ev:2, why:'鉄不足でスプーン爪になる', dose:'血液検査後に'},
  {id:'protein_whey', role:'sub', ev:2, why:'爪の材料', dose:'体重×1.2g/日'},
  {id:'zinc', role:'sub', ev:2, why:'爪の成長に必要', dose:'11mg'},
 ],
 lifestyle:'爪は伸びるのが遅く、変化の実感まで3〜6ヶ月。',
 avoid:'除光液の頻用'},

/* ================= ダイエット ================= */
{id:'g_diet_fat', cat:'diet', name:'体脂肪を落としたい', kw:['ダイエット','体脂肪','痩せたい','減量','たいしぼう','やせたい','げんりょう'],
 items:[
  {id:'prebiotics', role:'main', ev:3, why:'難消化性デキストリンは糖・脂肪の吸収を抑える届出多数', dose:'5〜10g／食前'},
  {id:'protein_whey', role:'main', ev:3, why:'タンパク質は満腹感と筋肉維持で減量の土台', dose:'体重×1.2〜1.6g/日'},
  {id:'carnitine', role:'sub', ev:1, why:'脂肪の運搬に関わるが単独効果は小さい', dose:'500〜1,000mg／運動前'},
  {id:'green_tea_ex', role:'sub', ev:1, why:'代謝への弱い報告。肝リスクに注意', dose:'EGCG 800mg/日未満'},
  {id:'mct', role:'sub', ev:1, why:'満腹感・エネルギー源', dose:'5〜15g'},
 ],
 lifestyle:'摂取カロリー < 消費カロリー が絶対条件。サプリの寄与は数%。',
 avoid:'ガルシニア（肝障害報告・効果は平均1kg未満）'},

{id:'g_diet_appetite', cat:'diet', name:'食欲が抑えられない', kw:['食欲','間食','過食','甘いもの','しょくよく','かんしょく','あまいもの'],
 items:[
  {id:'prebiotics', role:'main', ev:2, why:'食物繊維が満腹感を持続させる', dose:'5〜10g／食前'},
  {id:'protein_whey', role:'main', ev:3, why:'タンパク質は満腹ホルモンを最も刺激する', dose:'1食20〜30g'},
  {id:'chromium', role:'sub', ev:1, why:'糖への欲求への弱い報告', dose:'10μg（上限500μg）'},
  {id:'magnesium', role:'sub', ev:1, why:'不足で甘いものを欲しやすくなる説', dose:'290〜370mg'},
 ],
 lifestyle:'睡眠不足は食欲ホルモンを乱す。7時間の睡眠が最も効く食欲対策。',
 avoid:'極端な糖質制限（反動の過食を招く）'},

{id:'g_diet_bloat', cat:'diet', name:'お腹の張り・むくみ', kw:['むくみ','お腹の張り','浮腫','おなかのはり'],
 items:[
  {id:'potassium', role:'main', ev:2, why:'ナトリウムの排出を助ける', dose:'食事から2,000〜2,500mg'},
  {id:'magnesium', role:'sub', ev:2, why:'水分バランスに関わる', dose:'290〜370mg'},
  {id:'vit_b6', role:'sub', ev:2, why:'PMSのむくみへの報告', dose:'1.4mg（上限45〜60mg）'},
 ],
 lifestyle:'減塩が最も効く。食塩相当量を男7.5g/女6.5g未満に。',
 avoid:'腎機能低下時のカリウムサプリ'},

/* ================= 筋力・運動 ================= */
{id:'g_muscle', cat:'body', name:'筋肉をつけたい', kw:['筋トレ','筋肉','バルクアップ','マッスル','きんにく','きんとれ'],
 items:[
  {id:'protein_whey', role:'main', ev:3, why:'筋肉の材料。最も土台になる', dose:'体重×1.6〜2.0g/日を食事+サプリで'},
  {id:'creatine', role:'main', ev:3, why:'サプリの中で最もエビデンスが強い', dose:'3〜5g／毎日'},
  {id:'vit_d', role:'sub', ev:2, why:'不足すると筋力が出にくい', dose:'25μg(1,000IU)'},
  {id:'hmb', role:'sub', ev:1, why:'初心者・高齢者で報告あり', dose:'3g'},
  {id:'eaa', role:'sub', ev:2, why:'タンパク質が足りない時の補助', dose:'6〜15g'},
 ],
 lifestyle:'漸進的な負荷（重量・回数を増やす）が最重要。サプリは補助。',
 avoid:'プロテインだけで総カロリーが足りない状態'},

{id:'g_performance', cat:'body', name:'運動のパフォーマンスを上げたい', kw:['持久力','パフォーマンス','記録','じきゅうりょく','ぱふぉーまんす'],
 items:[
  {id:'creatine', role:'main', ev:3, why:'短時間高強度で効果が明確', dose:'3〜5g／毎日'},
  {id:'caffeine', role:'main', ev:3, why:'持久力・出力への効果が明確', dose:'体重×3mg／運動60分前'},
  {id:'citrulline', role:'sub', ev:2, why:'血流を高めて疲労を遅らせる', dose:'6〜8g／運動前'},
  {id:'bcaa', role:'sub', ev:1, why:'運動中の消耗対策', dose:'5〜10g'},
 ],
 lifestyle:'カフェインは耐性がつく。試合前だけ使うのが効率的。',
 avoid:'カフェインとクレアチンの高用量同時（効果が減る報告）'},

{id:'g_recovery', cat:'body', name:'筋肉痛・回復が遅い', kw:['筋肉痛','回復','リカバリー','きんにくつう','かいふく'],
 items:[
  {id:'protein_whey', role:'main', ev:3, why:'修復の材料', dose:'運動後20〜40g'},
  {id:'omega3', role:'main', ev:2, why:'炎症を抑える方向', dose:'1,000〜2,000mg'},
  {id:'curcumin', role:'sub', ev:2, why:'運動後の炎症への報告', dose:'500mg'},
  {id:'magnesium', role:'sub', ev:2, why:'筋肉の収縮・弛緩に必要', dose:'290〜370mg'},
  {id:'vit_c', role:'sub', ev:1, why:'高用量は逆に適応を妨げる説もある', dose:'常用量にとどめる'},
 ],
 lifestyle:'睡眠が最強の回復手段。7〜9時間。',
 avoid:'高用量の抗酸化サプリを毎日（トレーニング適応を鈍らせる報告）'},

{id:'g_cramp', cat:'body', name:'脚がつる・けいれん', kw:['足がつる','けいれん','クランプ','あしがつる'],
 items:[
  {id:'magnesium', role:'main', ev:2, why:'筋肉の弛緩に関わる', dose:'290〜370mg／夕食後'},
  {id:'potassium', role:'sub', ev:2, why:'電解質バランス', dose:'食事から'},
  {id:'calcium', role:'sub', ev:1, why:'筋収縮に関わる', dose:'650〜800mg'},
  {id:'taurine', role:'sub', ev:1, why:'けいれんへの報告', dose:'1,000mg'},
 ],
 lifestyle:'脱水と冷えが引き金。運動前後の水分と保温。',
 avoid:'甘草の長期摂取（低カリウムでけいれんが増える）'},

/* ================= 健康・数値 ================= */
{id:'g_bp', cat:'health', name:'血圧が高め', kw:['血圧','高血圧','上が130','けつあつ','こうけつあつ'],
 items:[
  {id:'gaba', role:'main', ev:3, why:'血圧が高めの方向けで機能性表示の届出多数', dose:'12.3〜80mg'},
  {id:'omega3', role:'main', ev:2, why:'血圧を下げる方向の報告', dose:'1,000〜2,000mg'},
  {id:'potassium', role:'sub', ev:2, why:'ナトリウムの排出を助ける', dose:'食事から（腎機能に注意）'},
  {id:'coq10', role:'sub', ev:2, why:'血圧への弱い報告', dose:'100mg'},
  {id:'garlic', role:'sub', ev:2, why:'血圧への報告', dose:'600〜1,200mg'},
 ],
 lifestyle:'減塩・減量・運動の3つが薬に近い効果を出す。家庭血圧の記録が必須。',
 avoid:'甘草（血圧を上げる）、カフェイン過剰、エナジードリンク常飲'},

{id:'g_chol', cat:'health', name:'コレステロール・中性脂肪が高め', kw:['コレステロール','中性脂肪','LDL','脂質','これすてろーる','ちゅうせいしぼう','ししつ'],
 items:[
  {id:'omega3', role:'main', ev:3, why:'中性脂肪を下げる効果が明確', dose:'EPA+DHA 1,000〜2,000mg'},
  {id:'prebiotics', role:'main', ev:3, why:'難消化性デキストリンで届出多数', dose:'5〜10g／食前'},
  {id:'garlic', role:'sub', ev:2, why:'LDLへの弱い報告', dose:'600〜1,200mg'},
  {id:'chitosan', role:'sub', ev:1, why:'脂質の吸収を妨げる。効果は小さい', dose:'1,000〜3,000mg'},
 ],
 lifestyle:'飽和脂肪酸を減らす・食物繊維を増やすが基本。LDLが高い人は薬の効果が圧倒的。',
 avoid:'キトサンと脂溶性ビタミンの同時摂取'},

{id:'g_glucose', cat:'health', name:'血糖値が気になる', kw:['血糖','HbA1c','糖尿病予防','けっとう','けっとうち','とうしつ'],
 items:[
  {id:'prebiotics', role:'main', ev:3, why:'食後血糖の上昇を抑える届出多数', dose:'5g／食事の直前'},
  {id:'alpha_lipoic', role:'sub', ev:2, why:'インスリン感受性への報告。低血糖に注意', dose:'200〜600mg'},
  {id:'chromium', role:'sub', ev:1, why:'糖代謝に関わる', dose:'10μg（上限500μg）'},
  {id:'magnesium', role:'sub', ev:2, why:'不足とインスリン抵抗性の関連', dose:'290〜370mg'},
 ],
 lifestyle:'食事の順番（野菜→タンパク→炭水化物）と食後の歩行が即効性がある。',
 avoid:'糖尿病薬服用中のα-リポ酸・クロムの自己判断併用'},

{id:'g_liver', cat:'health', name:'肝機能の数値が気になる', kw:['肝臓','γ-GTP','ALT','脂肪肝','かんぞう','かんきのう','しぼうかん'],
 items:[
  {id:'taurine', role:'main', ev:2, why:'肝機能への報告', dose:'1,000〜2,000mg'},
  {id:'milk_thistle', role:'sub', ev:1, why:'肝ケア目的で使われる', dose:'200〜400mg'},
  {id:'omega3', role:'sub', ev:2, why:'脂肪肝への報告', dose:'1,000〜2,000mg'},
  {id:'vit_e', role:'sub', ev:2, why:'非アルコール性脂肪肝での報告', dose:'常用量'},
 ],
 lifestyle:'飲酒量と体重の削減が最も効く。脂肪肝は体重7%減で改善する報告。',
 avoid:'濃縮カテキンサプリ・ガルシニア・ブラックコホシュ（肝リスク）、飲酒との重複'},

{id:'g_bone', cat:'health', name:'骨密度が心配', kw:['骨','骨密度','骨粗しょう症','ほね','こつみつど','こつそしょうしょう'],
 items:[
  {id:'calcium', role:'main', ev:3, why:'骨の主材料', dose:'650〜800mg（食事込み。1回500mg以下に分割）'},
  {id:'vit_d', role:'main', ev:3, why:'カルシウムの吸収に必須', dose:'25μg(1,000IU)'},
  {id:'vit_k', role:'main', ev:2, why:'カルシウムを骨に定着させる', dose:'150μg（ワルファリン服用中は不可）'},
  {id:'magnesium', role:'sub', ev:2, why:'骨の構成成分', dose:'290〜370mg'},
  {id:'protein_whey', role:'sub', ev:2, why:'骨のコラーゲン部分の材料', dose:'体重×1.2g/日'},
 ],
 lifestyle:'荷重のかかる運動（歩行・軽いジャンプ）が骨を刺激する。',
 avoid:'高塩分・カフェイン過剰（カルシウムの排出が増える）'},

{id:'g_cold_hands', cat:'health', name:'冷え・血行が悪い', kw:['冷え','冷え性','手足が冷たい','血行','ひえ','ひえしょう','けっこう'],
 items:[
  {id:'vit_e', role:'main', ev:2, why:'末梢の血流への報告', dose:'常用量'},
  {id:'nattokinase', role:'sub', ev:2, why:'血流で届出あり。抗凝固薬併用は不可', dose:'2,000FU'},
  {id:'iron', role:'sub', ev:2, why:'貧血が冷えの原因になる', dose:'血液検査後に'},
  {id:'capsaicin', role:'sub', ev:1, why:'一時的に体温を上げる', dose:'食品として少量'},
 ],
 lifestyle:'筋肉量が熱源。下半身の運動が最も効く。',
 avoid:'抗凝固薬とナットウキナーゼの併用'},

/* ================= 脳・集中力 ================= */
{id:'g_focus', cat:'brain', name:'集中力が続かない', kw:['集中','集中力','注意力','しゅうちゅう','しゅうちゅうりょく'],
 items:[
  {id:'caffeine', role:'main', ev:3, why:'覚醒・注意力への効果が明確', dose:'100〜200mg'},
  {id:'theanine', role:'main', ev:3, why:'カフェインと組むと集中が安定する', dose:'200mg（カフェイン100mgと）'},
  {id:'omega3', role:'sub', ev:2, why:'DHAは脳の構成成分', dose:'1,000mg'},
  {id:'vit_b12', role:'sub', ev:2, why:'不足で認知機能が落ちる', dose:'2.4μg'},
  {id:'iron', role:'sub', ev:2, why:'鉄不足で集中力が落ちる', dose:'血液検査後に'},
 ],
 lifestyle:'睡眠不足の状態でサプリを足しても効果は小さい。睡眠が先。',
 avoid:'午後遅いカフェイン（夜の睡眠を削り翌日の集中が落ちる）'},

{id:'g_memory', cat:'brain', name:'記憶力・物忘れ', kw:['記憶','物忘れ','認知','きおく','きおくりょく','ものわすれ','にんち'],
 items:[
  {id:'omega3', role:'main', ev:2, why:'DHAで記憶への届出あり', dose:'DHA 500〜1,000mg'},
  {id:'ginkgo', role:'main', ev:2, why:'認知機能への報告。抗凝固薬併用は不可', dose:'120〜240mg'},
  {id:'vit_b12', role:'sub', ev:2, why:'不足で認知機能が低下', dose:'2.4μg'},
  {id:'folate', role:'sub', ev:2, why:'B12と協働', dose:'240μg'},
  {id:'vit_d', role:'sub', ev:1, why:'不足と認知機能の関連報告', dose:'25μg(1,000IU)'},
 ],
 lifestyle:'有酸素運動が認知機能への介入で最もエビデンスが強い。',
 avoid:'抗凝固薬とイチョウ葉の併用'},

{id:'g_eye_strain', cat:'brain', name:'目の疲れ・かすみ', kw:['目の疲れ','眼精疲労','かすみ','ピント','めのつかれ','がんせいひろう','かすみめ'],
 items:[
  {id:'lutein', role:'main', ev:3, why:'目のコントラスト感度・ブルーライト対策で届出多数', dose:'ルテイン10mg+ゼアキサンチン2mg'},
  {id:'astaxanthin', role:'main', ev:3, why:'目のピント調節で届出多数', dose:'6〜12mg'},
  {id:'bilberry', role:'sub', ev:2, why:'ピント調節への届出あり', dose:'アントシアニン40〜120mg'},
  {id:'omega3', role:'sub', ev:2, why:'ドライアイへの報告', dose:'1,000mg'},
 ],
 lifestyle:'20分ごとに20秒遠くを見る。まぶたを温めるのもドライアイに有効。',
 avoid:'—'},

/* ================= 腸・お腹 ================= */
{id:'g_constipation', cat:'gut', name:'便秘・お通じが悪い', kw:['便秘','お通じ','出ない','べんぴ','おつうじ'],
 items:[
  {id:'prebiotics', role:'main', ev:3, why:'お通じで機能性表示の届出多数', dose:'5〜10g／少量から'},
  {id:'probiotics', role:'main', ev:3, why:'菌株ごとにお通じの届出あり', dose:'10億CFU以上'},
  {id:'magnesium', role:'main', ev:3, why:'酸化マグネシウムは便を柔らかくする（医薬品でも使用）', dose:'200〜350mg／夕食後'},
  {id:'vit_c', role:'sub', ev:1, why:'高用量で緩下作用', dose:'1,000mg超で下痢になるため常用は非推奨'},
 ],
 lifestyle:'水分・食物繊維・運動の3点。朝食後にトイレに行く習慣づけも効く。',
 avoid:'刺激性下剤の常用（腸が慣れて効かなくなる）'},

{id:'g_diarrhea', cat:'gut', name:'お腹がゆるい・下痢しやすい', kw:['下痢','ゆるい','軟便','げり','おなかがゆるい','なんべん'],
 items:[
  {id:'probiotics', role:'main', ev:3, why:'菌のバランスを整える', dose:'10億CFU以上'},
  {id:'prebiotics', role:'sub', ev:1, why:'合う人と合わない人がいる。少量から', dose:'2〜3gから'},
 ],
 lifestyle:'発症前に食べたもの・薬を記録する。2週間以上続くなら受診。',
 avoid:'マグネシウム・MCTオイル・高用量ビタミンC（下痢を悪化させる）'},

{id:'g_gut_env', cat:'gut', name:'腸内環境を整えたい', kw:['腸活','腸内環境','腸内フローラ','ちょうかつ','ちょうないかんきょう'],
 items:[
  {id:'probiotics', role:'main', ev:3, why:'菌そのものを入れる', dose:'10億〜100億CFU'},
  {id:'prebiotics', role:'main', ev:3, why:'菌のエサになる', dose:'5〜10g'},
  {id:'omega3', role:'sub', ev:1, why:'腸内細菌の多様性への報告', dose:'1,000mg'},
 ],
 lifestyle:'発酵食品と食物繊維を毎日。菌の種類は多いほうがよい。',
 avoid:'抗菌薬と同時服用（2〜3時間ずらす）'},

/* ================= 免疫・季節 ================= */
{id:'g_cold', cat:'immune', name:'風邪をひきやすい', kw:['風邪','免疫','ひきやすい','かぜ','めんえき'],
 items:[
  {id:'vit_d', role:'main', ev:3, why:'呼吸器感染の予防でメタ解析あり', dose:'25μg(1,000IU)'},
  {id:'zinc', role:'main', ev:2, why:'発症初期の摂取で期間短縮の報告', dose:'11mg（急性期は短期のみ高用量）'},
  {id:'vit_c', role:'sub', ev:2, why:'予防効果は限定的だが期間短縮の報告', dose:'100〜1,000mg'},
  {id:'probiotics', role:'sub', ev:2, why:'感染頻度への報告', dose:'10億CFU以上'},
  {id:'echinacea', role:'sub', ev:1, why:'急性期の短期使用で報告。免疫抑制薬併用は不可', dose:'300〜500mg×3回／8週まで'},
 ],
 lifestyle:'睡眠6時間未満は感染リスクが上がる。手洗いとワクチンが最も確実。',
 avoid:'免疫抑制薬・自己免疫疾患でのエキナセア／アシュワガンダ'},

{id:'g_pollen', cat:'immune', name:'花粉症・鼻の不快感', kw:['花粉','花粉症','鼻','アレルギー','かふん','かふんしょう','はな','あれるぎー'],
 items:[
  {id:'probiotics', role:'main', ev:2, why:'菌株別に鼻の不快感の届出あり', dose:'10億CFU以上／シーズン前から'},
  {id:'omega3', role:'sub', ev:1, why:'炎症を抑える方向', dose:'1,000mg'},
  {id:'vit_d', role:'sub', ev:1, why:'免疫調整への報告', dose:'25μg(1,000IU)'},
 ],
 lifestyle:'シーズン2週間前からの薬の先行投与が最も効果的。',
 avoid:'—'},

/* ================= 女性の悩み ================= */
{id:'g_pms', cat:'woman', name:'PMS・生理前の不調', kw:['PMS','生理前','月経前','せいりまえ','げっけいまえ'],
 items:[
  {id:'chasteberry', role:'main', ev:2, why:'PMS症状への報告。ドイツで医薬品的に使用', dose:'20〜40mg／朝'},
  {id:'vit_b6', role:'main', ev:2, why:'PMSへの報告', dose:'1.4mg（上限45mg）'},
  {id:'calcium', role:'sub', ev:2, why:'PMS症状の軽減報告', dose:'650mg'},
  {id:'magnesium', role:'sub', ev:2, why:'むくみ・イライラへの報告', dose:'290mg'},
  {id:'omega3', role:'sub', ev:1, why:'生理痛への報告', dose:'1,000mg'},
 ],
 lifestyle:'低用量ピルが最もエビデンスが強い選択肢。婦人科で相談を。',
 avoid:'妊娠の可能性がある場合のチェストベリー'},

{id:'g_meno', cat:'woman', name:'更年期の不調（ホットフラッシュ等）', kw:['更年期','ホットフラッシュ','のぼせ','こうねんき','ほっとふらっしゅ'],
 items:[
  {id:'isoflavone', role:'main', ev:2, why:'エクオール型で症状への報告', dose:'アグリコン換算で食事込み70〜75mg以内'},
  {id:'black_cohosh', role:'main', ev:2, why:'欧州で使用実績。肝リスクの報告あり', dose:'40〜80mg／6ヶ月で見直し'},
  {id:'vit_d', role:'sub', ev:2, why:'骨のリスクが上がる時期の対策', dose:'25μg(1,000IU)'},
  {id:'calcium', role:'sub', ev:3, why:'骨密度が落ちやすい時期', dose:'650mg'},
 ],
 lifestyle:'ホルモン補充療法（HRT）が症状には最も有効。婦人科で選択肢を確認。',
 avoid:'乳がん治療中・ホルモン療法中のイソフラボン自己判断（主治医に確認）'},

{id:'g_anemia', cat:'woman', name:'貧血・立ちくらみ', kw:['貧血','立ちくらみ','ふらつき','鉄不足','ひんけつ','たちくらみ','てつぶそく'],
 items:[
  {id:'iron', role:'main', ev:3, why:'鉄欠乏性貧血の直接の対策', dose:'女10.5mg。診断がつけば処方鉄剤が効率的'},
  {id:'vit_c', role:'main', ev:3, why:'鉄の吸収を大きく高める', dose:'100mg以上／鉄と同時'},
  {id:'folate', role:'sub', ev:2, why:'赤血球をつくる材料', dose:'240μg'},
  {id:'vit_b12', role:'sub', ev:2, why:'赤血球をつくる材料', dose:'2.4μg'},
  {id:'copper', role:'sub', ev:1, why:'鉄の利用に必要', dose:'0.7〜0.9mg'},
 ],
 lifestyle:'まず血液検査でフェリチン（貯蔵鉄）を測る。原因の特定が先。',
 avoid:'鉄とお茶・コーヒー・乳製品・カルシウムの同時摂取'},

{id:'g_preg', cat:'woman', name:'妊娠を計画している', kw:['妊活','妊娠','プレコンセプション','にんかつ','にんしん'],
 items:[
  {id:'folate', role:'main', ev:3, why:'神経管閉鎖障害のリスク低減で最も確立', dose:'サプリで+400μg／妊娠1ヶ月前から'},
  {id:'iron', role:'sub', ev:3, why:'需要が増える', dose:'医師の指示で'},
  {id:'vit_d', role:'sub', ev:2, why:'不足しやすい', dose:'25μg(1,000IU)'},
  {id:'omega3', role:'sub', ev:2, why:'DHAは胎児の発達に必要', dose:'DHA中心で1,000mg'},
 ],
 lifestyle:'サプリより先に禁煙・禁酒・葉酸の3点。産婦人科でのプレコンセプションケアを。',
 avoid:'ビタミンAの高用量、アシュワガンダ、チェストベリー、ブラックコホシュ、セントジョーンズワート'},

/* ================= 男性の悩み ================= */
{id:'g_vitality', cat:'man', name:'活力・元気が出ない', kw:['活力','精力','元気','テストステロン','かつりょく','せいりょく','げんき'],
 items:[
  {id:'zinc', role:'main', ev:2, why:'テストステロンの合成に必要。不足時に効果', dose:'11mg（上限40mg）'},
  {id:'vit_d', role:'main', ev:2, why:'不足とテストステロン低値の関連', dose:'25μg(1,000IU)'},
  {id:'maca', role:'sub', ev:1, why:'伝統的使用と小規模試験', dose:'1,500〜3,000mg'},
  {id:'ashwagandha', role:'sub', ev:2, why:'ストレス由来の低下への報告', dose:'300〜600mg'},
  {id:'mucuna', role:'sub', ev:1, why:'ドパミン系に働く。薬との併用注意', dose:'L-ドーパ換算100〜300mg'},
 ],
 lifestyle:'睡眠不足・肥満・運動不足がテストステロンを最も下げる。まず体重と睡眠。',
 avoid:'ヨヒンベ（国内で食品使用不可・重大な副作用報告）、パーキンソン病薬とムクナ'},

{id:'g_prostate', cat:'man', name:'トイレが近い（前立腺）', kw:['前立腺','夜間頻尿','尿の勢い','トイレが近い','ぜんりつせん','ひんにょう','といれがちかい'],
 items:[
  {id:'saw_palmetto', role:'main', ev:2, why:'BPH症状への報告。欧州で医薬品的に使用', dose:'320mg／食後'},
  {id:'zinc', role:'sub', ev:1, why:'前立腺に多く含まれる', dose:'11mg'},
  {id:'isoflavone', role:'sub', ev:1, why:'ホルモンへの弱い作用', dose:'常用量'},
 ],
 lifestyle:'症状があるなら泌尿器科で前立腺の評価を。がんの除外が優先。',
 avoid:'PSA検査前のノコギリヤシ（数値を見かけ上下げる）'},

{id:'g_ed', cat:'man', name:'血流・パフォーマンス（男性）', kw:['ED','血流','勃起','けつりゅう','ぼっき'],
 items:[
  {id:'citrulline', role:'main', ev:2, why:'一酸化窒素を介した血流改善の報告', dose:'3〜8g'},
  {id:'arginine', role:'sub', ev:2, why:'血流への報告', dose:'3〜6g'},
  {id:'vit_d', role:'sub', ev:1, why:'血管機能との関連', dose:'25μg(1,000IU)'},
  {id:'maca', role:'sub', ev:1, why:'伝統的使用', dose:'1,500〜3,000mg'},
 ],
 lifestyle:'血流の問題は心血管リスクのサインでもある。まず内科での評価を。',
 avoid:'ED治療薬・降圧薬とアルギニン／シトルリンの併用（血圧が下がりすぎる）、ヨヒンベ'},

/* ================= 加齢・関節・目 ================= */
{id:'g_joint', cat:'senior', name:'膝・関節の痛み', kw:['膝','関節','ひざ','痛み','かんせつ','いたみ'],
 items:[
  {id:'glucosamine', role:'main', ev:2, why:'変形性膝関節症で報告あり（製品差が大きい）', dose:'1,500mg／3ヶ月試して判断'},
  {id:'chondroitin', role:'main', ev:2, why:'グルコサミンと併用される', dose:'800〜1,200mg'},
  {id:'omega3', role:'sub', ev:2, why:'炎症を抑える方向', dose:'1,000〜2,000mg'},
  {id:'curcumin', role:'sub', ev:2, why:'膝の痛みへの報告', dose:'500〜1,500mg'},
  {id:'collagen', role:'sub', ev:2, why:'関節への届出あり', dose:'5〜10g'},
 ],
 lifestyle:'大腿四頭筋の筋トレと減量が最もエビデンスが強い。体重1kg減で膝の負荷は3kg減。',
 avoid:'抗凝固薬とグルコサミン／コンドロイチンの併用、甲殻類アレルギーでの原料未確認'},

{id:'g_eye_age', cat:'senior', name:'目の老化が気になる', kw:['加齢','目','眼','AMD','白内障','めのろうか','はくないしょう','かれい'],
 items:[
  {id:'lutein', role:'main', ev:3, why:'AREDS2試験で加齢性眼疾患への報告', dose:'ルテイン10mg+ゼアキサンチン2mg'},
  {id:'omega3', role:'sub', ev:2, why:'網膜の構成成分', dose:'1,000mg'},
  {id:'astaxanthin', role:'sub', ev:2, why:'目の機能への届出あり', dose:'6〜12mg'},
  {id:'vit_c', role:'sub', ev:1, why:'水晶体の抗酸化', dose:'100mg'},
  {id:'zinc', role:'sub', ev:2, why:'AREDS処方に含まれる', dose:'11mg'},
 ],
 lifestyle:'紫外線対策（サングラス）と禁煙が最も効く。眼科での定期検査を。',
 avoid:'喫煙者のβカロテン高用量'},

{id:'g_aging', cat:'senior', name:'アンチエイジング全般', kw:['老化','アンチエイジング','若さ','抗酸化','ろうか','あんちえいじんぐ','こうさんか','わかさ'],
 items:[
  {id:'vit_d', role:'main', ev:2, why:'不足が多く、幅広い指標との関連が報告される', dose:'25μg(1,000IU)'},
  {id:'omega3', role:'main', ev:2, why:'心血管・脳への報告', dose:'1,000〜2,000mg'},
  {id:'protein_whey', role:'main', ev:3, why:'加齢での筋肉減少（サルコペニア）対策', dose:'体重×1.2〜1.5g/日'},
  {id:'nmn', role:'sub', ev:1, why:'注目されているが長期のヒトデータは限定的', dose:'250〜500mg'},
  {id:'resveratrol', role:'sub', ev:1, why:'動物実験の報告が主', dose:'100〜500mg'},
  {id:'coq10', role:'sub', ev:2, why:'加齢で減少する', dose:'100mg'},
 ],
 lifestyle:'運動・睡眠・禁煙の効果はどのサプリより大きい。',
 avoid:'複数の抗酸化サプリの高用量重複（かえって逆効果の報告）'},

{id:'g_sarcopenia', cat:'senior', name:'筋力の低下・転びやすい', kw:['サルコペニア','ロコモ','転倒','筋力低下','さるこぺにあ','きんりょくていか','てんとう'],
 items:[
  {id:'protein_whey', role:'main', ev:3, why:'高齢者はより多くのタンパク質が必要', dose:'体重×1.2〜1.5g/日'},
  {id:'vit_d', role:'main', ev:3, why:'転倒予防への報告', dose:'25μg(1,000IU)'},
  {id:'hmb', role:'sub', ev:2, why:'高齢者で筋肉維持の報告', dose:'3g'},
  {id:'creatine', role:'sub', ev:2, why:'高齢者の筋力への報告', dose:'3g'},
  {id:'calcium', role:'sub', ev:2, why:'骨の対策とセットで', dose:'650〜800mg'},
 ],
 lifestyle:'週2回の筋トレ（自体重スクワットでも可）が最重要。',
 avoid:'—'},
];

/* --- 最初に大きく出す「よくある悩み」。カテゴリを掘らずに1タップで詳細へ --- */
const POPULAR_GOALS = [
  'g_sleep_onset', 'g_fatigue', 'g_stress', 'g_skin_dry', 'g_diet_fat', 'g_constipation',
  'g_bp', 'g_focus', 'g_hair', 'g_anemia', 'g_joint', 'g_cold',
];
