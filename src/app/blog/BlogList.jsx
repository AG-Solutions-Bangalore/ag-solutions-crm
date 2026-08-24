import React, { useState } from "react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/loader/loader";
import { BLOG_API, BLOG_LIST } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Calendar, Edit, Trash2 } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import { Badge } from "@/components/ui/badge";
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

import BlogModal from "./BlogModal";

const BlogList = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/blog`,
    queryKey: ["blog", pageIndex],
    params: {
      page: pageIndex + 1,
    },
  });


  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: BLOG_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["blog"] });
        toast.success(res?.message || "Blog deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const blogBaseUrl = getImageBaseUrl(data?.image_url, "Blog");
  const noImageUrl = getNoImageUrl(data?.image_url);

  const blogList = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const totalRecords = data?.data?.total || blogList.length || 0;
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
      header: "Banner",
      accessorKey: "blog_banner_image",
      cell: ({ row }) => {
        const fileName = row.original.blog_banner_image;
        const src = fileName ? `${blogBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.blog_title}
            width={75}
            height={45}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Title",
      accessorKey: "blog_title",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs line-clamp-2 max-w-xs">
          {row.original.blog_title}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "categories",
      cell: ({ row }) => (
        <Badge variant="indigo" className="text-xs font-medium">
          {row.original.categories || "General"}
        </Badge>
      ),
    },

    {
      header: "Created Date",
      accessorKey: "blog_created_date",
      cell: ({ row }) => {
        const date = new Date(row.original.blog_created_date);
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>
              {row.original.blog_created_date
                ? `${String(date.getDate()).padStart(2, "0")}-${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}-${date.getFullYear()}`
                : "-"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "blog_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.blog_status}
          apiUrl={BLOG_LIST.updateStatus(row.original.id)}
          payloadKey="blog_status"
          method="patch"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["blog"] });
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
            title="Edit Blog"
            onClick={() => {
              setSelectedBlogId(row.original.id);
              setOpenModal(true);
            }}
          >
            <Edit className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Blog"
            onClick={() => {
              setDeleteId(row.original.id);
              setOpenDelete(true);
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
      enableSorting: false,
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
        <p className="font-semibold">Error loading blogs</p>
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
          Blog Articles
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage, publish, and edit articles for your company blog.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={blogList}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: totalPages,
          total: totalRecords,
          onPageChange: (newPage) => setPageIndex(newPage),
        }}
        addButton={{
          onClick: () => {
            setSelectedBlogId(null);
            setOpenModal(true);
          },
          label: "Create Blog",
        }}
        searchPlaceholder="Search blogs..."
      />

      {openModal && (
        <BlogModal
          setOpenModal={setOpenModal}
          blogId={selectedBlogId}
          refetch={refetch}
        />
      )}



      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Blog</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this blog post? This action cannot be undone.
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

export default BlogList;

