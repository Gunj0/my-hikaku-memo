"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CameraIcon,
  HeadphonesIcon,
  LaptopIcon,
  MonitorIcon,
  SmartphoneIcon,
  TvIcon,
  WashingMachineIcon,
} from "lucide-react";

interface CategoryStepProps {
  category: string;
  categoryMemo: string;
  onCategoryChange: (category: string) => void;
  onMemoChange: (memo: string) => void;
}

const PRESET_CATEGORIES = [
  { name: "スマホ", icon: SmartphoneIcon },
  { name: "ノートPC", icon: LaptopIcon },
  { name: "イヤホン", icon: HeadphonesIcon },
  { name: "カメラ", icon: CameraIcon },
  { name: "テレビ", icon: TvIcon },
  { name: "モニター", icon: MonitorIcon },
  { name: "洗濯機", icon: WashingMachineIcon },
  { name: "冷蔵庫", icon: LaptopIcon },
];

export function CategoryStep({
  category,
  categoryMemo,
  onCategoryChange,
  onMemoChange,
}: CategoryStepProps) {
  const isCustomCategory =
    category && !PRESET_CATEGORIES.some((c) => c.name === category);
  const customCategoryValue = isCustomCategory ? category : "";
  const hasCustomCategoryValue = customCategoryValue.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">カテゴリ</h2>
        <p className="text-muted-foreground text-sm">
          まずは比較するカテゴリを選択・入力してください
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_CATEGORIES.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant={category === name ? "default" : "secondary"}
            className={cn(
              "h-auto py-4 flex flex-col gap-2",
              category === name &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
            onClick={() => onCategoryChange(name)}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm">{name}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        <Label htmlFor="custom-category">その他のカテゴリ</Label>
        <div className="flex gap-2">
          <Input
            id="custom-category"
            placeholder="カテゴリ名を入力..."
            value={customCategoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              "flex-1 border-foreground/50",
              hasCustomCategoryValue &&
                "border-primary bg-primary/5 ring-2 ring-primary/35",
            )}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="category-memo">メモ（任意）</Label>
        <Textarea
          id="category-memo"
          placeholder="購入の背景、予算感、利用シーンなど自由にメモ..."
          value={categoryMemo}
          onChange={(e) => onMemoChange(e.target.value)}
          className="min-h-30 resize-none"
        />
      </div>
    </div>
  );
}
