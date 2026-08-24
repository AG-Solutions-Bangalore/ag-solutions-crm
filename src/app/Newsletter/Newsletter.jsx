import DataTable from "@/components/common/data-table";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Mail, Calendar } from "lucide-react";
import React from "react";
import Loader from "@/components/loader/loader";
import { motion } from "framer-motion";

const Newsletter = () => {
  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/newsletter`,
    queryKey: ["newsletter"],
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
      header: "Subscriber Email",
      accessorKey: "newsletter_email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Mail className="size-3.5" />
          </div>
          <span className="font-semibold text-foreground text-xs">
            {row.original.newsletter_email}
          </span>
        </div>
      ),
    },
    {
      header: "Subscription Date",
      accessorKey: "created_at",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
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
        data={data?.data || []}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search subscribers..."
      />
    </motion.div>
  );
};

export default Newsletter;
