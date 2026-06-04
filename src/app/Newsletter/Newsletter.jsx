import React, { useState } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import BASE_URL from "@/config/base-url";
import { NEWSLETTER_API } from "@/constants/apiConstants";
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

const Newsletter = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetApiMutation({
    url: `${BASE_URL}/newsletter`,
    queryKey: ["newsletter"],
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: NEWSLETTER_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        // Updated to target the correct "newsletter" queryKey
        queryClient.setQueryData(["newsletter", null], (old) => {
          if (!old?.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.filter((item) => item.id !== id),
            },
          };
        });
        toast.success(res?.message || "Newsletter deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete newsletter");
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

  if (error) return <div>Error loading newsletters</div>;

  // Updated columns to match newsletter API response
  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Email",
      accessorKey: "newsletter_email",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.newsletter_email}</span>
      ),
    },
    {
      header: "Subscribed Date",
      accessorKey: "newsletter_created",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {new Date(row.original.newsletter_created)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => {
            setDeleteId(row.original.id);
            setOpen(true);
          }}
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
        searchPlaceholder="Search Newsletters..."
      />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to delete this newsletter email?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              No
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                handleDelete(deleteId);
                setOpen(false);
                setDeleteId(null);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Newsletter;
