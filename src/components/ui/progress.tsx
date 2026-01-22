import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function Progress({ current, total, className }: ProgressProps) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>進捗</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
