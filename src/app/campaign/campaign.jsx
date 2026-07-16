import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import BASE_URL from "@/config/base-url";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Campaign = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // Fetch ALL data – no page or search params
  const { data, isLoading } = useGetApiMutation({
    url: `${BASE_URL}/campaign-visit?per_page=100`, // get all records
    queryKey: ["campaign-visit-all"], // static key – never refetches
  });
  useEffect(() => {
    if (data?.data?.data) {
      setCampaigns(data.data.data);
    }
  }, [data]);

  //   const campaigns = data?.data?.data || [];

  const { trigger: deleteCampaign } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      await deleteCampaign({
        url: `${BASE_URL}/campaign-visit/${id}`,
        method: "DELETE",
      });
      // Update cache
      setCampaigns((prev) => prev.filter((item) => item.id !== id));

      toast.success("Campaign visit deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    {
      header: "SL No",
      cell: ({ row }) => <span>{row.index + 1}</span>, // client‑side index
    },
    {
      header: "Visit Date",
      accessorKey: "visit_date",
      cell: ({ row }) => {
        const date = new Date(row.original.visit_date);

        return (
          <span>
            {`${String(date.getDate()).padStart(2, "0")}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}-${date.getFullYear()}`}
          </span>
        );
      },
    },
    {
      header: "Campaign",
      accessorKey: "utm_campaign",
      cell: ({ row }) => <span>{row.original.utm_campaign || "-"}</span>,
    },
    {
      header: "Source",
      accessorKey: "utm_source",
      cell: ({ row }) => <span>{row.original.utm_source || "-"}</span>,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Trash2
          className="h-4 w-4 hover:text-red-600 cursor-pointer"
          onClick={() => setDeleteId(row.original.id)}
        />
      ),
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div>
      <DataTable
        columns={columns}
        data={campaigns}
        pageSize={10}
        searchPlaceholder="Search by campaign or source..."
        // No serverPagination → client‑side filtering + pagination
      />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                handleDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Campaign;
