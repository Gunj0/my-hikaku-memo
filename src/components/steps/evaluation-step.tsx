'use client'

import { Textarea } from '@/components/ui/textarea'
import { Product, DecisionPoint, ProductScore } from '@/lib/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { StarIcon } from 'lucide-react'

interface EvaluationStepProps {
  products: Product[]
  decisionPoints: DecisionPoint[]
  scores: ProductScore[]
  onScoresChange: (scores: ProductScore[]) => void
}

export function EvaluationStep({
  products,
  decisionPoints,
  scores,
  onScoresChange
}: EvaluationStepProps) {
  const importantPoints = decisionPoints.filter(p => p.isImportant)

  const getScore = (productId: string, pointId: string): ProductScore | undefined => {
    return scores.find(s => s.productId === productId && s.pointId === pointId)
  }

  const updateScore = (productId: string, pointId: string, score: number) => {
    const existingIndex = scores.findIndex(
      s => s.productId === productId && s.pointId === pointId
    )
    
    if (existingIndex >= 0) {
      const newScores = [...scores]
      newScores[existingIndex] = { ...newScores[existingIndex], score }
      onScoresChange(newScores)
    } else {
      onScoresChange([...scores, { productId, pointId, score, memo: '' }])
    }
  }

  const updateMemo = (productId: string, pointId: string, memo: string) => {
    const existingIndex = scores.findIndex(
      s => s.productId === productId && s.pointId === pointId
    )
    
    if (existingIndex >= 0) {
      const newScores = [...scores]
      newScores[existingIndex] = { ...newScores[existingIndex], memo }
      onScoresChange(newScores)
    } else {
      onScoresChange([...scores, { productId, pointId, score: 0, memo }])
    }
  }

  if (products.length === 0 || importantPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">評価を入力</h2>
          <p className="text-muted-foreground text-sm">
            製品と重視ポイントを先に設定してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">評価を入力</h2>
        <p className="text-muted-foreground text-sm">
          各製品の重視ポイントに対する評価を入力してください
        </p>
      </div>

      {/* Mobile view: cards */}
      <div className="md:hidden space-y-6">
        {products.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-secondary p-4">
              <h3 className="font-medium">{product.name}</h3>
            </div>
            <div className="divide-y divide-border">
              {importantPoints.map((point) => {
                const scoreData = getScore(product.id, point.id)
                return (
                  <div key={point.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{point.name}</span>
                      <span className="text-xs text-muted-foreground">
                        重要度: {point.weight}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => updateScore(product.id, point.id, score)}
                          className="p-1"
                        >
                          <StarIcon
                            className={cn(
                              'w-7 h-7 transition-colors',
                              score <= (scoreData?.score || 0)
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="メモ..."
                      value={scoreData?.memo || ''}
                      onChange={(e) => updateMemo(product.id, point.id, e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">ポイント</TableHead>
              <TableHead className="text-center w-20">重要度</TableHead>
              {products.map((product) => (
                <TableHead key={product.id} className="min-w-[200px] text-center">
                  {product.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {importantPoints.map((point) => (
              <TableRow key={point.id}>
                <TableCell className="font-medium">{point.name}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <StarIcon className="w-4 h-4 fill-primary" />
                    {point.weight}
                  </span>
                </TableCell>
                {products.map((product) => {
                  const scoreData = getScore(product.id, point.id)
                  return (
                    <TableCell key={product.id}>
                      <div className="space-y-2">
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => updateScore(product.id, point.id, score)}
                              className="p-0.5"
                            >
                              <StarIcon
                                className={cn(
                                  'w-5 h-5 transition-colors',
                                  score <= (scoreData?.score || 0)
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground/30'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="メモ..."
                          value={scoreData?.memo || ''}
                          onChange={(e) => updateMemo(product.id, point.id, e.target.value)}
                          className="min-h-[50px] resize-none text-xs"
                        />
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
