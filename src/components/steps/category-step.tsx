"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CameraIcon,
  GamepadIcon,
  HeadphonesIcon,
  LaptopIcon,
  MonitorIcon,
  PlusIcon,
  SmartphoneIcon,
  TvIcon,
  WashingMachineIcon,
  WatchIcon,
} from "lucide-react";

interface CategoryStepProps {
  category: string;
  categoryMemo: string;
  onCategoryChange: (category: string) => void;
  onMemoChange: (memo: string) => void;
}

const PRESET_CATEGORIES = [
  { name: "スマートフォン", icon: SmartphoneIcon },
  { name: "ノートPC", icon: LaptopIcon },
  { name: "イヤホン・ヘッドホン", icon: HeadphonesIcon },
  { name: "カメラ", icon: CameraIcon },
  { name: "スマートウォッチ", icon: WatchIcon },
  { name: "テレビ", icon: TvIcon },
  { name: "ゲーム機", icon: GamepadIcon },
  { name: "モニター", icon: MonitorIcon },
  { name: "洗濯機", icon: WashingMachineIcon },
];

export function CategoryStep({
  category,
  categoryMemo,
  onCategoryChange,
  onMemoChange,
}: CategoryStepProps) {
  const isCustomCategory =
    category && !PRESET_CATEGORIES.some((c) => c.name === category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">購入するカテゴリを選択</h2>
        <p className="text-muted-foreground text-sm">
          比較したい製品のカテゴリを選んでください
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
            value={isCustomCategory ? category : ""}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const input = document.getElementById(
                "custom-category",
              ) as HTMLInputElement;
              if (input?.value) onCategoryChange(input.value);
            }}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
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
