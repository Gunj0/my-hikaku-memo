# 評価・集計ロジック設計

## 1. 文書の目的

本書は、評価点入力から集計結果表示、最終決定候補提示までのロジックを定義する。

## 2. 基本概念

- 評価対象は「重視ポイント」に限定する。
- 重視ポイントは isImportant が true の比較ポイントである。
- 各重視ポイントは weight を持つ。
- 各候補製品は重視ポイントごとに評価点を持つ。
- 集計結果は評価点に重要度を掛けて算出する。

## 3. 入力値

### 3.1 重視ポイント抽出

```text
importantPoints = decisionPoints.filter(point => point.isImportant)
```

### 3.2 評価点取得

各製品と比較ポイントの組み合わせに対応する ProductScore を検索し、存在しない場合は 0 点として扱う。

```text
score(productId, pointId) = ProductScore.score or 0
```

## 4. 加重点計算

各製品に対する各重視ポイントの加重点は次式で計算する。

$$
weightedScore = rawScore \times weight
$$

ここで、

- $rawScore$ は 0 から 5 の評価点
- $weight$ は 1 から 5 の重要度

## 5. 製品合計点計算

各製品の合計点は、重視ポイントごとの加重点を合算して算出する。

$$
totalScore(product) = \sum_{point \in importantPoints}(score(product, point) \times point.weight)
$$

## 6. 最大点と達成率

各製品の最大点は、全重視ポイントで最高評価 5 点を取った場合の合計値である。

$$
maxPossible = \sum_{point \in importantPoints}(5 \times point.weight)
$$

達成率は次式で計算する。

$$
percentage =
\begin{cases}
\frac{totalScore}{maxPossible} \times 100 & maxPossible > 0 \\
0 & maxPossible = 0
\end{cases}
$$

## 7. 順位付け

- 候補製品一覧に対して totalScore を計算する。
- totalScore の降順でソートする。
- 同点時は現行仕様上、元の並び順維持を明示していないため、JavaScript の sort 結果に依存する。

## 8. 最高評価表示条件

- 順位 1 位の候補が存在すること。
- かつ、その合計点が 0 より大きいこと。
- 条件を満たす場合に限り、最高評価バッジやトロフィー表示を行う。

## 9. 最終決定候補表示

- 最終決定画面では、集計結果と同じ順位順を用いる。
- 利用者は順位に関係なく任意の候補を選択できる。
- 選択結果は selectedProductId に保持する。

## 10. スコア未入力時の扱い

- 評価入力を行っていない組み合わせは 0 点とする。
- メモのみ先に入力した場合は score=0 のレコードが作成されうる。
- 重視ポイントが 0 件の場合、集計に必要な分母が存在しないため percentage は 0 とする。

## 11. ロジック適用箇所

- 評価入力画面: 各組み合わせの score と memo を更新する。
- 集計結果画面: totalScore、maxPossible、percentage、順位を表示する。
- 最終決定画面: 集計順に候補を並べ、選択 UI に反映する。

## 12. 現行仕様上の注意点

- score の必須入力チェックは行っていない。
- 重視ポイント削除後も関連スコアが state に残る可能性がある。
- 候補削除後も関連スコアが state に残る可能性がある。
- そのため、集計は「現在存在する products と importantPoints に対して照会できる score のみを利用する」前提で成立している。

## 13. 保存済みメモとの関係

- 保存済みメモは ComparisonData 全体を保存し、読込後に同じロジックで集計を再計算する。
- 保存や読込は評価・集計式そのものを変更しない。
