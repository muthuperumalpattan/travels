import { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { formatInr } from "../utils/format";

interface Props {
  label: string;
  value: number;
  money?: boolean;
  icon: LucideIcon;
}

export function StatCard({ label, value, money, icon: Icon }: Props) {
  return (
    <Card className="flex items-start gap-3 sm:gap-4">
      <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 font-display text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
          {money ? formatInr(value) : value}
        </p>
      </div>
    </Card>
  );
}
