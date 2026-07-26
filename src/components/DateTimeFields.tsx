import { useState } from "react";
import { Input } from "@/components/ui/input";

export function DateTimeFields({
  dueDate,
  onDueDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
}: {
  dueDate: string;
  onDueDateChange: (v: string) => void;
  startTime: string;
  onStartTimeChange: (v: string) => void;
  endTime: string;
  onEndTimeChange: (v: string) => void;
}) {
  const [show, setShow] = useState(!!dueDate);

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        + הוספת תאריך
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setShow(false);
            onDueDateChange("");
            onStartTimeChange("");
            onEndTimeChange("");
          }}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          ביטול
        </button>
      </div>
      {dueDate && (
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground shrink-0">עד</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}

export function formatDateTime(dueDate: string | null, startTime: string | null, endTime: string | null) {
  if (!dueDate) return null;
  let text = dueDate;
  if (startTime) {
    text += ` · ${startTime.slice(0, 5)}`;
    if (endTime) text += `-${endTime.slice(0, 5)}`;
  }
  return text;
}
