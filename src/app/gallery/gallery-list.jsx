import DataTable from "@/components/common/data-table";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { GALLERY_API } from "@/constants/apiConstants";
import ImageCell from "@/components/common/ImageCell";
import { motion } from "framer-motion";
import CreateGalleryModal from "./CreateGalleryModal";

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

const GalleryList = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/gallery`,
    queryKey: ["gallery"],
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: GALLERY_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
        toast.success(res?.message || "Image deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete image");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const galleryBaseUrl = getImageBaseUrl(data?.image_url, "Gallery");
  const noImageUrl = getNoImageUrl(data?.image_url);

  const galleryList = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

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
      header: "Image",
      accessorKey: "gallery_image",
      cell: ({ row }) => {
        const fileName =
          row.original.gallery_image ||
          row.original.link_gallery_image ||
          row.original.image;
        const src = fileName ? `${galleryBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.gallery_name || row.original.gallery_title || "Gallery image"}
            width={70}
            height={45}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Gallery Name",
      accessorKey: "gallery_name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.gallery_name || row.original.gallery_title || `Image #${row.original.id}`}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Image"
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
        <p className="font-semibold">Error loading gallery</p>
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
          Gallery
        </h1>
        <p className="text-xs text-muted-foreground">
          Showcase photography, company portfolios, and event albums.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={galleryList}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        addButton={{
          onClick: () => setOpenCreate(true),
          label: "Add Image",
        }}
        searchPlaceholder="Search gallery..."
      />

      {openCreate && <CreateGalleryModal setOpenModal={setOpenCreate} />}

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Image</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this image? This action cannot be undone.
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

export default GalleryList;

