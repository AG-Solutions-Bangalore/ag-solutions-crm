import DataTable from "@/components/common/data-table";
import ToggleStatus from "@/components/toogle/status-toogle";
import BASE_URL from "@/config/base-url";
import { CATEGORY_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import Loader from "@/components/loader/loader";
import { motion } from "framer-motion";

const Category = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/category`,
    queryKey: ["category"],
  });

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
      header: "Category Name",
      accessorKey: "category_name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.category_name}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "category_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.category_status}
          apiUrl={CATEGORY_API.updateStatus(row.original.id)}
          payloadKey="category_status"
          method="patch"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["category"] });
          }}
        />
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
        <p className="font-semibold">Error loading categories</p>
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
          Categories
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage product, service, and blog classification categories.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data?.data || data?.data || []}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search categories..."
      />
    </motion.div>
  );
};

export default Category;
