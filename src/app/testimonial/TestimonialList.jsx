import DataTable from "@/components/common/data-table";
import ToggleStatus from "@/components/toogle/status-toogle";
import BASE_URL from "@/config/base-url";
import { TESTIMONIAL_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
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
import TestimonialModal from "./TestimonialModal";

const TestimonialList = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}${TESTIMONIAL_API.list}`,
    queryKey: ["testimonial", pageIndex, pageSize, searchTerm],
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
        url: TESTIMONIAL_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["testimonial"] });
        toast.success(res?.message || "Testimonial deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete testimonial");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const testimonialList = data?.data?.data || data?.data || [];
  const totalRecords = searchTerm
    ? testimonialList.length
    : (data?.data?.total || testimonialList.length || 0);
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
      header: "Testimonial For",
      accessorKey: "testimonial_for",
      cell: ({ row }) => {
        const rawName = row.original.testimonial_for || "General";
        const displayName = String(rawName)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <span className="font-semibold text-foreground text-xs">
            {displayName}
          </span>
        );
      },
    },
    {
      header: "Client Name",
      accessorKey: "testimonial_client_name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs line-clamp-1 max-w-xs">
          {row.original.testimonial_client_name || "-"}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "testimonial_description",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">
          {row.original.testimonial_description || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "testimonial_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.testimonial_status || "Active"}
          apiUrl={TESTIMONIAL_API.updateStatus(row.original.id)}
          payloadKey="testimonial_status"
          method="patch"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["testimonial"] });
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
            title="Edit Testimonial"
            onClick={() => {
              setSelectedTestimonialId(row.original.id);
              setOpenModal(true);
            }}
          >
            <Edit className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Testimonial"
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
        <p className="font-semibold">Error loading testimonials</p>
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
          Testimonials
        </h1>
        <p className="text-xs text-muted-foreground">
          Create, organize, and publish client testimonials across pages.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={testimonialList}
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
            setSelectedTestimonialId(null);
            setOpenModal(true);
          },
          label: "Add Testimonial",
        }}
        searchPlaceholder="Search testimonials..."
      />

      {openModal && (
        <TestimonialModal
          setOpenModal={setOpenModal}
          testimonialId={selectedTestimonialId}
          refetch={refetch}
        />
      )}

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Testimonial</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this testimonial? This action cannot be undone.
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

export default TestimonialList;
