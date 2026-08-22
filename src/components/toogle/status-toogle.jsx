import { useApiMutation } from "@/hooks/useApiMutation";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ToggleStatus = ({
  initialStatus,
  apiUrl,
  payloadKey = "status",
  activeValue = "Active",
  inactiveValue = "Inactive",
  method = "PUT",
  showLabel = true,
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const isActive = status === activeValue;

  const handleToggle = async (checked) => {
    const newStatus = checked ? activeValue : inactiveValue;
    // optimistic update
    const previousStatus = status;
    setStatus(newStatus);

    try {
      const res = await trigger({
        url: apiUrl,
        method,
        data: {
          [payloadKey]: newStatus,
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        setStatus(newStatus);
        onSuccess?.();
        toast.success(res?.message || `Status updated to ${newStatus}`);
      } else {
        setStatus(previousStatus); // revert
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      setStatus(previousStatus); // revert
      toast.error(err?.message || "Unable to update status");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={loading}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted-foreground/30 h-5 w-9 transition-colors cursor-pointer"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full pointer-events-none">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        )}
      </div>
      {showLabel && (
        <span
          className={`text-[11px] font-semibold select-none ${
            isActive ? "text-emerald-500" : "text-muted-foreground"
          }`}
        >
          {status}
        </span>
      )}
    </div>
  );
};

export default ToggleStatus;
