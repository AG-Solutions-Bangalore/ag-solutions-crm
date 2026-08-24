import DataTable from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import BASE_URL from "@/config/base-url";

import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Calendar, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Loader from "@/components/loader/loader";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { NEWSLETTER_API } from "@/constants/apiConstants";

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

const Newsletter = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/newsletter`,
    queryKey: ["newsletter", pageIndex],
    params: {
      page: pageIndex + 1,
    },
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: `${BASE_URL}/newsletter/${id}`,
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["newsletter"] });
        toast.success(res?.message || "Subscriber deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete subscriber");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const subscriberList = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const totalRecords = data?.data?.total || subscriberList.length || 0;
  const totalPages = data?.data?.last_page || Math.ceil(totalRecords / 10) || 1;

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {pageIndex * 10 + row.index + 1}
        </span>
      ),
    },

    {
      header: "Subscriber Email",
      accessorKey: "newsletter_email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Mail className="size-3.5" />
          </div>
          <span className="font-semibold text-foreground text-xs">
            {row.original.newsletter_email || row.original.email || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Subscription Date",
      accessorKey: "created_at",
      cell: ({ row }) => {
        const rawDate = row.original.created_at || row.original.newsletter_created_at;
        if (!rawDate) return <span className="text-xs text-muted-foreground">-</span>;
        const date = new Date(rawDate);
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
      header: "Status",
      accessorKey: "status",
      cell: () => (
        <Badge variant="success" className="text-xs font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Subscribed
        </Badge>
      ),
    },
    {
      header: "Actions",

      accessorKey: "actions",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete Subscriber"
          onClick={() => {
            setDeleteId(row.original.id);
            setOpenDelete(true);
          }}
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
        <p className="font-semibold">Error loading newsletter subscribers</p>
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
          Newsletter Subscribers
        </h1>
        <p className="text-xs text-muted-foreground">
          View all subscribers signed up for marketing updates and newsletters.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={subscriberList}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: totalPages,
          total: totalRecords,
          onPageChange: (newPage) => setPageIndex(newPage),
        }}
        searchPlaceholder="Search subscribers..."
      />


      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Subscriber</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
              onClick={() => {
                handleDelete(deleteId);
                setOpenDelete(false);
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

export default Newsletter;

