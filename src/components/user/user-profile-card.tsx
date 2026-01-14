import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import Image from "next/image";

interface UserProfileCardProps {
  userName?: string | null | undefined;
  userIcon?: string | null | undefined;
  idOwner?: boolean;
}

export default function UserProfileCard({
  userName,
  userIcon,
  idOwner,
}: UserProfileCardProps) {
  return (
    <Card className="bg-linear-to-br from-slate-100 via-blue-100 to-slate-200">
      <CardContent>
        <div className="flex flex-row items-center gap-3 justify-center">
          {/* アイコン */}
          {userIcon ? (
            <Image
              src={userIcon}
              alt="User Icon"
              className="w-10 h-10 rounded-full object-cover border-2"
              width={64}
              height={64}
            />
          ) : (
            // デフォルトアイコン
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          {/* ユーザー名 */}
          <div>
            {idOwner && (
              <Badge className="bg-blue-500 text-white font-bold">
                ログイン中
              </Badge>
            )}
            <p className="text-gray-600 pointer-events-none">
              {userName ? userName : "ゲストユーザー"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
