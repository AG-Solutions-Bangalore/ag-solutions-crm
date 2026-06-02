import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import StatusDropdown from "@/components/toogle/Enquiry-toggle";
import BASE_URL from "@/config/base-url";
import { ENQUIRY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const EnquiryList = () => {
  const { data, isLoading, error } = useGetApiMutation({
    url: `${BASE_URL}/enquiry`,
    queryKey: ["enquiry"],
  });
  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: ENQUIRY_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Enquiry deleted successfully");
        queryClient.invalidateQueries(["enquiry-list"]);
        refetch();
      } else {
        toast.error(res?.message || "Failed to delete enquiry");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );
  if (error) return <div>Error</div>;
  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Name",
      accessorKey: "enquiryFullName",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.enquiryFullName}</span>
      ),
    },
    {
      header: "Mobile",
      accessorKey: "enquiryMobile",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.enquiryMobile}</span>
      ),
    },
    {
      header: "Email",
      accessorKey: "enquiryEmail",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.enquiryEmail}</span>
      ),
    },
    {
      header: "Message",
      accessorKey: "enquiryMessage",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.enquiryMessage}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <StatusDropdown
          initialStatus={row.original.status}
          apiUrl={`${BASE_URL}/enquiry/${row.original.id}`}
          payloadKey="enquiryStatus"
          method="PUT"
          options={["Pending", "Approved", "Cancel", "Completed"]}
        />
      ),
    },
    {
      header: "Delete",
      cell: ({ row }) => (
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];
  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data?.data || []}
        pageSize={10}
        searchPlaceholder="Search Enquiries..."
      />
    </div>
  );
};
export default EnquiryList;
