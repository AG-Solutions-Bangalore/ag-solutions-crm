import DataTable from "@/components/common/data-table";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { ExternalLink, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { SPONSOR_API } from "@/constants/apiConstants";
import ImageCell from "@/components/common/ImageCell";
import { useNavigate } from "react-router-dom";
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

const Sponsor = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/sponsor`,
    queryKey: ["sponsor", pageIndex, pageSize],
    params: {
      page: pageIndex + 1,
      per_page: pageSize,
    },
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: SPONSOR_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["sponsor"] });
        toast.success(res?.message || "Sponsor deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete sponsor");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const sponsorBaseUrl = getImageBaseUrl(data?.image_url, "Sponsor");
  const noImageUrl = getNoImageUrl(data?.image_url);

  const sponsorList = data?.data?.data || [];
  const totalRecords = data?.data?.total || sponsorList.length || 0;
  const totalPages = data?.data?.last_page || Math.ceil(totalRecords / pageSize) || 1;

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
      header: "Logo",
      accessorKey: "sponsor_image",
      cell: ({ row }) => {
        const fileName = row.original.sponsor_image;
        const src = fileName ? `${sponsorBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.sponsor_name || "Sponsor logo"}
            width={60}
            height={36}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Sponsor Name",
      accessorKey: "sponsor_name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.sponsor_name || "-"}
        </span>
      ),
    },
    {
      header: "Website Link",
      accessorKey: "sponsor_link",
      cell: ({ row }) => {
        const link = row.original.sponsor_link;
        return link ? (
          <a
            href={link.startsWith("http") ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>{link}</span>
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete Sponsor"
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
        <p className="font-semibold">Error loading sponsors</p>
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
          Sponsors & Partners
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage brand sponsors, partner logos, and external destination URLs.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={sponsorList}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: totalPages,
          total: totalRecords,
          onPageChange: (newPage) => setPageIndex(newPage),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPageIndex(0);
          },
        }}
        addButton={{
          to: "/sponsor/create",
          label: "Add Sponsor",
        }}
        searchPlaceholder="Search sponsors..."
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Sponsor</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this sponsor? This action cannot be undone.
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

export default Sponsor;
