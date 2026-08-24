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
import { Calendar, Edit } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BlogList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/blog`,
    queryKey: ["blog"],
  });

  const blogBaseUrl = getImageBaseUrl(data?.image_url, "Blog");
  const noImageUrl = getNoImageUrl(data?.image_url);

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
        <span className="text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {row.original.categories || "General"}
        </span>
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit Blog"
            onClick={() => navigate(`/blog-edit/${row.original.id}`)}
          >
            <Edit className="size-3.5" />
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
        data={data?.data?.data || []}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        addButton={{
          onClick: () => navigate("/create-blog"),
          label: "Create Blog",
        }}
        searchPlaceholder="Search blogs..."
      />
    </motion.div>
  );
};

export default BlogList;
