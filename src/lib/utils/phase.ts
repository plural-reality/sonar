export interface PhaseRange {
  start: number;
  end: number;
  phase: "exploration" | "deep-dive";
}

export interface PhaseProfile {
  ranges: PhaseRange[];
}

export const DEFAULT_PHASE_PROFILE: PhaseProfile = {
  ranges: [
    { start: 1, end: 5, phase: "exploration" },
    { start: 6, end: 10, phase: "exploration" },
    { start: 11, end: 15, phase: "exploration" },
    { start: 16, end: 20, phase: "deep-dive" },
    { start: 21, end: 25, phase: "exploration" },
    { start: 26, end: 30, phase: "deep-dive" },
    { start: 31, end: 35, phase: "exploration" },
    { start: 36, end: 40, phase: "deep-dive" },
    { start: 41, end: 45, phase: "exploration" },
    { start: 46, end: 50, phase: "deep-dive" },
  ],
};

export function getPhaseForQuestionIndex(
  questionIndex: number,
  phaseProfile: PhaseProfile = DEFAULT_PHASE_PROFILE
): "exploration" | "deep-dive" {
  // For questions beyond 50, cycle through phases
  const normalizedIndex =
    questionIndex > 50 ? ((questionIndex - 1) % 50) + 1 : questionIndex;

  for (const range of phaseProfile.ranges) {
    if (normalizedIndex >= range.start && normalizedIndex <= range.end) {
      return range.phase;
    }
  }

  return "exploration"; // Default fallback
}

export function getPhaseDescription(phase: "exploration" | "deep-dive"): string {
  if (phase === "exploration") {
    return `【探索フェーズ】
このフェーズの目的は、ユーザーの目的・背景情報に対して「まだ聞けていないテーマ」を網羅的にカバーすることです。

1. ユーザーの目的達成に必要な、まだ一度も触れていないテーマがあれば優先的に扱う
2. 主要テーマが一通りカバーできている場合は、同じテーマを「別の角度」から問う
   - 例: 時間軸を変える（過去→現在→未来）、立場を変える（自分→他者→社会）、条件を変える（理想→現実→制約下）
3. テーマ間の優先度を問うようなメタ質問によって、優先順位や思いの強さを確認する

■ 大局観の維持
- 直近の回答に引きずられすぎず、全体目的に対するバランスを常に意識する
- 「この目的を達成するために、あと何を聞くべきか」を俯瞰して考える`;
  }

  return `【深掘りフェーズ】
このフェーズの目的は、探索フェーズで見えてきたテーマについて「より深い理解」を得ることです。

■ 深掘りの方向性
1. 「このテーマについて、こういう場合はどうか？」という条件分岐を探る
2. 表面的な回答の背後にある「なぜそう思うのか」の根拠や価値観を引き出す
3. 一見矛盾する回答があれば、その境界線や条件を明らかにする


■ 新規情報の獲得
- 既に聞いたことと同じことを聞いても意味がない
- 常に「この質問で新たな情報・気づき・理解が得られるか」を自問する
- ユーザー自身も気づいていなかった側面を引き出すことを目指す`;
}
