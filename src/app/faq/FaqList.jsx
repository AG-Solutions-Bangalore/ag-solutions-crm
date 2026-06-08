import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";
import { FAQ_API } from "@/constants/apiConstants";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
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

import DataTable from "@/components/common/data-table";
import ToggleStatus from "@/components/toogle/status-toogle";

const FaqList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const { trigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      await trigger({
        url: FAQ_API.deleteFaq(id),
        method: "DELETE",
      });
      toast.success("FAQ group deleted successfully");
      queryClient.invalidateQueries(["faq"]);
    } catch (err) {
      toast.error("Failed to delete FAQ group");
    }
  };

  // Fetch FAQs
  const { data, isLoading, error } = useGetApiMutation({
    url: `${BASE_URL}/faq`,
    queryKey: ["faq", pageIndex],
    params: {
      page: pageIndex + 1,
    },
  });

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "FAQ For (Page)",
      accessorKey: "faq_for",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.faq_for}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "faq_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.faq_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.faq_status}
            apiUrl={FAQ_API.updateStatus(row.original.id)}
            payloadKey="faq_status"
            method="patch"
            onSuccess={() => {
              queryClient.setQueryData(["faq", pageIndex, { page: pageIndex + 1 }], (old) => {
                if (!old?.data?.data) return old;
                const newStatus =
                  row.original.faq_status === "Active" ? "Inactive" : "Active";
                return {
                  ...old,
                  data: {
                    ...old.data,
                    data: old.data.data.map((item) =>
                      item.id === row.original.id
                        ? { ...item, faq_status: newStatus }
                        : item,
                    ),
                  },
                };
              });
            }}
          />
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Edit
            className="h-4 w-4 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/faq-edit/${row.original.id}`)}
          />
          <Trash2
            className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
            onClick={() => setDeleteId(row.original.id)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6">Error loading FAQs</div>;
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data?.data || []}
        pageSize={10}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: data?.data?.last_page || 1,
          total: data?.data?.total || 0,
          onPageChange: (newPageIndex) => setPageIndex(newPageIndex),
        }}
        createButton={<></>}
        addButton={{
          onClick: () => navigate("/create-faq"),
          label: "Create FAQ",
        }}
        searchPlaceholder="Search FAQs..."
      />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              FAQ group.
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

export default FaqList;
