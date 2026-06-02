import { useApiMutation } from "@/hooks/useApiMutation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

        toast.success(res.message);
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      toast.error(err?.message);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="border rounded px-2 py-1"
    >
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;
