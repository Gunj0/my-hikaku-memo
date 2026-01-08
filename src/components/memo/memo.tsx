"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_TAGS } from "@/const/Category";
import { Criterion, Product } from "@/types/memo";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import StepNumber from "./step-number";

export default function ComparisonMemo() {
  const [productCategory, setProductCategory] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: crypto.randomUUID(), name: "価格", priority: "2" },
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [finalNotes, setFinalNotes] = useState("");

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      { id: crypto.randomUUID(), name: "", priority: "" },
    ]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
    // Remove evaluations for this criterion from all products
    setProducts(
      products.map((p) => {
        const newEvaluations = { ...p.evaluations };
        delete newEvaluations[id];
        return { ...p, evaluations: newEvaluations };
      })
    );
  };

  const updateCriterion = (
    id: string,
    field: "name" | "priority",
    value: string
  ) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: "",
      evaluations: {},
      isSelected: false,
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateProductName = (id: string, name: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const updateEvaluation = (
    productId: string,
    criterionId: string,
    value: string
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, evaluations: { ...p.evaluations, [criterionId]: value } }
          : p
      )
    );
  };

  const toggleProductSelection = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, isSelected: !p.isSelected } : p
      )
    );
  };

  const selectCategoryTag = (category: string) => {
    setProductCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-2 max-w-7xl">
      <div className="space-y-4">
        {/* Step 1: Product Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StepNumber number={1} />
              カテゴリー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TAGS.map((tag) => (
                <Button
                  key={tag}
                  variant={productCategory === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectCategoryTag(tag)}
                  className="text-sm"
                >
                  {tag}
                </Button>
              ))}
            </div>
            <Input
              placeholder="または、カスタムカテゴリーを入力"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Step 2: Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </span>
              選定ポイント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="例: 価格、サイズ、メーカー"
                    value={criterion.name}
                    onChange={(e) =>
                      updateCriterion(criterion.id, "name", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCriterion(criterion.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addCriterion}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              選定ポイントを追加
            </Button>
          </CardContent>
        </Card>

        {/* Step 3: Products and Evaluation Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </span>
              候補製品と評価
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteria.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-muted/80 to-muted/50 border-b-2 border-border">
                      <th className="p-4 text-left font-bold text-foreground min-w-[200px] border-r border-border/50">
                        製品名
                      </th>
                      {criteria.map((criterion, index) => (
                        <th
                          key={criterion.id}
                          className={`p-4 text-left font-bold text-foreground min-w-[180px] ${
                            index < criteria.length - 1
                              ? "border-r border-border/50"
                              : ""
                          }`}
                        >
                          {criterion.name || "選定ポイント"}
                        </th>
                      ))}
                      <th className="p-4 text-center font-bold text-foreground w-[100px] border-l border-border/50">
                        選択
                      </th>
                      <th className="p-4 text-center font-bold text-foreground w-[60px] border-l border-border/50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`transition-all duration-200 border-b border-border/30 last:border-b-0 ${
                          product.isSelected
                            ? "bg-accent/20 shadow-[inset_4px_0_0_0] shadow-primary"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="p-3 border-r border-border/30">
                          <Input
                            placeholder="製品名を入力"
                            value={product.name}
                            onChange={(e) =>
                              updateProductName(product.id, e.target.value)
                            }
                            className={`border-0 bg-transparent focus-visible:ring-2 focus-visible:ring-primary/50 transition-all ${
                              product.isSelected
                                ? "font-bold text-foreground"
                                : ""
                            }`}
                          />
                        </td>
                        {criteria.map((criterion, index) => (
                          <td
                            key={criterion.id}
                            className={`p-3 ${
                              index < criteria.length - 1
                                ? "border-r border-border/30"
                                : ""
                            }`}
                          >
                            <Input
                              placeholder="評価を入力"
                              value={product.evaluations[criterion.id] || ""}
                              onChange={(e) =>
                                updateEvaluation(
                                  product.id,
                                  criterion.id,
                                  e.target.value
                                )
                              }
                              className="border-0 bg-transparent focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                            />
                          </td>
                        ))}
                        <td className="p-3 text-center border-l border-border/30">
                          <Button
                            variant={product.isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleProductSelection(product.id)}
                            className={`w-full transition-all ${
                              product.isSelected
                                ? "shadow-md hover:shadow-lg"
                                : "hover:border-primary hover:text-primary"
                            }`}
                          >
                            {product.isSelected ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                選択中
                              </>
                            ) : (
                              "選択"
                            )}
                          </Button>
                        </td>
                        <td className="p-3 text-center border-l border-border/30">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(product.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border">
                まず選定ポイントを追加してください
              </div>
            )}
            <Button
              onClick={addProduct}
              variant="outline"
              className="w-full bg-transparent hover:bg-primary/5 hover:border-primary transition-all"
              disabled={criteria.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              候補製品を追加
            </Button>
          </CardContent>
        </Card>

        {/* Step 4: Final Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </span>
              選んだ理由・総評
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="最終的に選んだ製品の理由や、比較検討の総評を記入してください..."
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              className="min-h-32 text-base leading-relaxed"
            />
          </CardContent>
        </Card>
        <Button disabled className="w-full mt-4">
          メモを保存する(メンテナンス中)
        </Button>
        {/* Comparison Summary Table */}
      </div>
    </div>
  );
}
