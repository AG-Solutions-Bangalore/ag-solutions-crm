import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import BASE_URL from "@/config/base-url";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
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

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/campaign-visit?per_page=100`,
    queryKey: ["campaign-visit-all"],
  });

  useEffect(() => {
    if (data?.data?.data) {
      setCampaigns(data.data.data);
    }
  }, [data]);

  const { trigger: deleteCampaign } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      await deleteCampaign({
        url: `${BASE_URL}/campaign-visit/${id}`,
        method: "DELETE",
      });
      setCampaigns((prev) => prev.filter((item) => item.id !== id));
      toast.success("Campaign visit record deleted");
    } catch {
      toast.error("Failed to delete campaign record");
    }
  };

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {row.index + 1}
        </span>
      ),
    },
    {
      header: "Visit Date",
      accessorKey: "visit_date",
      cell: ({ row }) => {
        const date = new Date(row.original.visit_date);
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>
              {`${String(date.getDate()).padStart(2, "0")}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}-${date.getFullYear()}`}
            </span>
          </div>
        );
      },
    },
    {
      header: "Campaign",
      accessorKey: "utm_campaign",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {row.original.utm_campaign || "-"}
        </span>
      ),
    },
    {
      header: "Source",
      accessorKey: "utm_source",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.utm_source || "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete Record"
          onClick={() => setDeleteId(row.original.id)}
        >
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-semibold">Error loading campaign visits</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Campaign Visits
        </h1>
        <p className="text-xs text-muted-foreground">
          Track campaign sources, UTM parameters, and lead referral traffic.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search by campaign or source..."
      />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl border border-border bg-card/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Record</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete this campaign visit record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
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
    </motion.div>
  );
};

export default Campaign;
