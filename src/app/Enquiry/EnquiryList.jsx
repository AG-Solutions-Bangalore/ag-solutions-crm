import DataTable from "@/components/common/data-table";
import StatusDropdown from "@/components/toogle/Enquiry-toggle";
import BASE_URL from "@/config/base-url";
import { ENQUIRY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Eye, Mail, MessageSquare, Phone, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EnquiryList = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const queryClient = useQueryClient();

  // Server-side paginated React Query hook
  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/enquiry`,
    queryKey: ["enquiry", pageIndex, pageSize, searchTerm],
    params: {
      page: pageIndex + 1,
      per_page: pageSize,
      search: searchTerm || undefined,
    },
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: ENQUIRY_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({
          queryKey: ["enquiry"],
        });
        toast.success(res?.message || "Enquiry deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete enquiry");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const enquiriesList = data?.data?.data || [];
  const totalRecords = data?.data?.total || enquiriesList.length || 0;
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
      header: "Name",
      accessorKey: "enquiryFullName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <User className="size-3.5" />
          </div>
          <span className="font-semibold text-foreground whitespace-nowrap">
            {row.original.enquiryFullName || "Anonymous"}
          </span>
        </div>
      ),
    },
    {
      header: "Mobile",
      accessorKey: "enquiryMobile",
      cell: ({ row }) => {
        const mobile = row.original.enquiryMobile;
        return mobile ? (
          <a
            href={`tel:${mobile}`}
            className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            <Phone className="size-3 text-muted-foreground" />
            <span>{mobile}</span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "enquiryEmail",
      cell: ({ row }) => {
        const email = row.original.enquiryEmail;
        return email ? (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors max-w-[180px] truncate"
            title={email}
          >
            <Mail className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      header: "Message",
      accessorKey: "enquiryMessage",
      cell: ({ row }) => {
        const message = row.original.enquiryMessage;
        return (
          <div
            className="group cursor-pointer max-w-[200px]"
            onClick={() => setSelectedEnquiry(row.original)}
            title="Click to view full message"
          >
            <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
              {message || "-"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Medium",
      accessorKey: "utm_medium",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.utm_medium || "-"}
        </span>
      ),
    },
    {
      header: "Source",
      accessorKey: "utm_source",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground max-w-[140px] truncate block" title={row.original.utm_source}>
          {row.original.utm_source || "-"}
        </span>
      ),
    },
    {
      header: "Campaign",
      accessorKey: "utm_campaign",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md max-w-[140px] truncate block" title={row.original.utm_campaign}>
          {row.original.utm_campaign || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <StatusDropdown
          initialStatus={row.original.enquiryStatus || row.original.status || "Pending"}
          apiUrl={`${BASE_URL}/enquiry/${row.original.id}`}
          payloadKey="enquiryStatus"
          method="PUT"
          options={["Pending", "Approved", "Cancel", "Completed"]}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["enquiry"] });
          }}
        />
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="View Details"
            onClick={() => setSelectedEnquiry(row.original)}
          >
            <Eye className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Enquiry"
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

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Enquiries
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time server-synced customer leads and enquiry messages.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={enquiriesList}
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
          onSearch: (query) => {
            setSearchTerm(query);
            setPageIndex(0);
          },
        }}
        searchPlaceholder="Search enquiries by name, email, mobile..."
      />

      {/* 🔹 View Full Details Dialog */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-lg rounded-xl border border-border bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="size-5 text-primary" />
              <span>Enquiry Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Full enquiry submission from {selectedEnquiry?.enquiryFullName || "Lead"}
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Name:</span>
                  <span className="font-semibold text-foreground text-sm">{selectedEnquiry.enquiryFullName || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status:</span>
                  <span className="font-semibold text-foreground">{selectedEnquiry.enquiryStatus || selectedEnquiry.status || "Pending"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Mobile:</span>
                  <a href={`tel:${selectedEnquiry.enquiryMobile}`} className="font-medium text-primary hover:underline">
                    {selectedEnquiry.enquiryMobile || "-"}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Email:</span>
                  <a href={`mailto:${selectedEnquiry.enquiryEmail}`} className="font-medium text-primary hover:underline">
                    {selectedEnquiry.enquiryEmail || "-"}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-1 font-medium">Message:</span>
                <div className="p-3 bg-background rounded-lg border border-border text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.enquiryMessage || "No message content"}
                </div>
              </div>

              {(selectedEnquiry.utm_campaign || selectedEnquiry.utm_source || selectedEnquiry.utm_medium) && (
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-muted/30 p-2 rounded border border-border/40">
                    <span className="text-muted-foreground block">Campaign:</span>
                    <span className="font-medium text-foreground truncate block">{selectedEnquiry.utm_campaign || "-"}</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded border border-border/40">
                    <span className="text-muted-foreground block">Source:</span>
                    <span className="font-medium text-foreground truncate block">{selectedEnquiry.utm_source || "-"}</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded border border-border/40">
                    <span className="text-muted-foreground block">Medium:</span>
                    <span className="font-medium text-foreground truncate block">{selectedEnquiry.utm_medium || "-"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 🔹 Delete Confirmation Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this enquiry record? This action cannot be undone.
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

export default EnquiryList;
