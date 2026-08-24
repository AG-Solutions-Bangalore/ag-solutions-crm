import { useApiMutation } from "@/hooks/useApiMutation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const statusStyles = {
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Cancel: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const StatusDropdown = ({
  initialStatus,
  apiUrl,
  payloadKey = "enquiryStatus",
  method = "PUT",
  options = [],
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleChange = async (e) => {
    const newStatus = e.target.value;

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
        toast.success(res.message || "Status updated successfully");
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const currentStyle = statusStyles[status] || "bg-muted text-muted-foreground border-border";

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`h-7 px-2.5 py-0.5 rounded-md text-xs font-semibold border cursor-pointer transition-all outline-none focus:ring-1 focus:ring-ring ${currentStyle}`}
    >
      {options.map((item) => (
        <option key={item} value={item} className="bg-popover text-popover-foreground">
          {item}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;
