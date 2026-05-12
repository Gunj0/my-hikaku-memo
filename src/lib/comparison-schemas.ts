import { z } from "zod";

export const decisionPointSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  isImportant: z.boolean(),
  weight: z.number().int().min(1).max(5),
  memo: z.string(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  memo: z.string(),
});

export const productScoreSchema = z.object({
  productId: z.string().min(1),
  pointId: z.string().min(1),
  score: z.number().int().min(0).max(5),
  memo: z.string(),
});

export const comparisonDataSchema = z.object({
  category: z.string(),
  categoryMemo: z.string(),
  decisionPoints: z.array(decisionPointSchema),
  pointsMemo: z.string(),
  products: z.array(productSchema),
  productsMemo: z.string(),
  scores: z.array(productScoreSchema),
  selectedProductId: z.string().nullable(),
  decisionMemo: z.string(),
});

export const comparisonMemoPayloadSchema = z.object({
  title: z.string().trim().min(1).max(120),
  data: comparisonDataSchema,
});

export type ComparisonMemoPayload = z.infer<typeof comparisonMemoPayloadSchema>;
