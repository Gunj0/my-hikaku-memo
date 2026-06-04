import { z } from "zod";

import {
  COMPARISON_DECISION_POINTS_MAX_COUNT,
  COMPARISON_ID_MAX_LENGTH,
  COMPARISON_MEMO_TEXT_MAX_LENGTH,
  COMPARISON_PRODUCTS_MAX_COUNT,
  COMPARISON_SCORES_MAX_COUNT,
  COMPARISON_SHORT_TEXT_MAX_LENGTH,
} from "@/lib/comparison-limits";
import { normalizeDecisionPointWeight } from "@/lib/types";

export const decisionPointSchema = z.object({
  id: z.string().min(1).max(COMPARISON_ID_MAX_LENGTH),
  name: z.string().max(COMPARISON_SHORT_TEXT_MAX_LENGTH),
  weight: z
    .number()
    .int()
    .min(1)
    .max(5)
    .transform(normalizeDecisionPointWeight),
  memo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
});

export const productSchema = z.object({
  id: z.string().min(1).max(COMPARISON_ID_MAX_LENGTH),
  name: z.string().max(COMPARISON_SHORT_TEXT_MAX_LENGTH),
  memo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
});

export const productScoreSchema = z.object({
  productId: z.string().min(1).max(COMPARISON_ID_MAX_LENGTH),
  pointId: z.string().min(1).max(COMPARISON_ID_MAX_LENGTH),
  score: z.number().int().min(0).max(5),
  memo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
});

export const comparisonDataSchema = z.object({
  category: z.string().max(COMPARISON_SHORT_TEXT_MAX_LENGTH),
  categoryMemo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
  decisionPoints: z
    .array(decisionPointSchema)
    .max(COMPARISON_DECISION_POINTS_MAX_COUNT),
  pointsMemo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
  products: z.array(productSchema).max(COMPARISON_PRODUCTS_MAX_COUNT),
  productsMemo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
  scores: z.array(productScoreSchema).max(COMPARISON_SCORES_MAX_COUNT),
  selectedProductId: z.string().max(COMPARISON_ID_MAX_LENGTH).nullable(),
  decisionMemo: z.string().max(COMPARISON_MEMO_TEXT_MAX_LENGTH),
});

export const comparisonMemoPayloadSchema = z.object({
  title: z.string().trim().min(1).max(COMPARISON_SHORT_TEXT_MAX_LENGTH),
  data: comparisonDataSchema,
  isPublic: z.boolean().optional().default(false),
});

export type ComparisonMemoPayload = z.infer<typeof comparisonMemoPayloadSchema>;
