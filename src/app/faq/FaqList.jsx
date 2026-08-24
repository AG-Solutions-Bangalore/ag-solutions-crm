import DataTable from "@/components/common/data-table";
import ToggleStatus from "@/components/toogle/status-toogle";
import BASE_URL from "@/config/base-url";
import { FAQ_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import Loader from "@/components/loader/loader";
import FaqModal from "./FaqModal";

const FaqList = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/faq`,
    queryKey: ["faq", pageIndex, pageSize, searchTerm],
    params: {
      page: searchTerm ? undefined : pageIndex + 1,
      per_page: pageSize,
      search: searchTerm || undefined,
    },
  });


  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: FAQ_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["faq"] });
        toast.success(res?.message || "FAQ deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete FAQ");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const faqList = data?.data?.data || data?.data || [];
  const totalRecords = searchTerm
    ? faqList.length
    : (data?.data?.total || faqList.length || 0);
  const totalPages = searchTerm
    ? (Math.ceil(totalRecords / pageSize) || 1)
    : (data?.data?.last_page || Math.ceil(totalRecords / pageSize) || 1);

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {pageIndex * pageSize + row.index + 1}
        </span>
      ),
    },
    {
      header: "FAQ Page / Section",
      accessorKey: "faq_for",
      cell: ({ row }) => {
        const rawName = row.original.faq_for || "General";
        const displayName = String(rawName)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-xs">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono">
              {rawName}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "faq_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.faq_status || "Active"}
          apiUrl={FAQ_API.updateStatus(row.original.id)}
          payloadKey="faq_status"
          method="patch"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["faq"] });
          }}
        />
      ),
    },

    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit FAQ"
            onClick={() => {
              setSelectedFaqId(row.original.id);
              setOpenModal(true);
            }}
          >
            <Edit className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete FAQ"
            onClick={() => {
              setDeleteId(row.original.id);
              setOpenDelete(true);
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-semibold">Error loading FAQs</p>
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
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-muted-foreground">
          Create, organize, and publish FAQs for client guidance.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={faqList}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: totalPages,
          total: totalRecords,
          searchValue: searchTerm,
          onPageChange: (newPage) => setPageIndex(newPage),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPageIndex(0);
          },
          onSearch: (newSearch) => {
            setSearchTerm(newSearch);
            setPageIndex(0);
          },
        }}
        addButton={{
          onClick: () => {
            setSelectedFaqId(null);
            setOpenModal(true);
          },
          label: "Add FAQ",
        }}
        searchPlaceholder="Search FAQs..."
      />

      {openModal && (
        <FaqModal
          setOpenModal={setOpenModal}
          faqId={selectedFaqId}
          refetch={refetch}
        />
      )}


      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete FAQ</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this FAQ? This action cannot be undone.
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

export default FaqList;

