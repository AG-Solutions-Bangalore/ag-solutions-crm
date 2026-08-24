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
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useGetApiMutation({
    url: `${BASE_URL}/enquiry`,
    queryKey: ["enquiry", pageIndex, searchTerm],
    params: {
      page: searchTerm ? undefined : pageIndex + 1,
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

  const enquiriesList = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const totalRecords = searchTerm
    ? enquiriesList.length
    : (data?.data?.total || enquiriesList.length || 0);
  const totalPages = searchTerm
    ? (Math.ceil(totalRecords / 10) || 1)
    : (data?.data?.last_page || Math.ceil(totalRecords / 10) || 1);

  console.log("[EnquiryList] Render -> pageIndex:", pageIndex, "totalRecords:", totalRecords, "totalPages:", totalPages, "received items:", enquiriesList.length, "isLoading:", isLoading, "isFetching:", isFetching);


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
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: totalPages,
          total: totalRecords,
          searchValue: searchTerm,
          onPageChange: (newPage) => setPageIndex(newPage),
          onSearch: (newSearch) => {
            setSearchTerm(newSearch);
            setPageIndex(0);
          },
        }}
        searchPlaceholder="Search enquiries by name, email, mobile..."
      />



      {/* 🔹 View Full Details Dialog */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-lg rounded-xl border border-border bg-card shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base font-semibold">
              <MessageSquare className="size-5 text-primary" />
              <span>Enquiry Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Full enquiry submission from {selectedEnquiry?.enquiryFullName || "Lead"}
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Name:</span>
                  <span className="font-semibold text-foreground text-sm">{selectedEnquiry.enquiryFullName || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Status:</span>
                  <span className="font-semibold text-foreground">{selectedEnquiry.enquiryStatus || selectedEnquiry.status || "Pending"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Mobile:</span>
                  <a href={`tel:${selectedEnquiry.enquiryMobile}`} className="font-medium text-primary hover:underline">
                    {selectedEnquiry.enquiryMobile || "-"}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Email:</span>
                  <a href={`mailto:${selectedEnquiry.enquiryEmail}`} className="font-medium text-primary hover:underline">
                    {selectedEnquiry.enquiryEmail || "-"}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-1.5 font-medium">Message:</span>
                <div className="p-3.5 bg-muted/30 rounded-lg border border-border text-foreground text-xs leading-relaxed whitespace-pre-wrap min-h-[70px]">
                  {selectedEnquiry.enquiryMessage || "No message content"}
                </div>
              </div>

              {(selectedEnquiry.utm_campaign || selectedEnquiry.utm_source || selectedEnquiry.utm_medium) && (
                <div className="grid grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                    <span className="text-muted-foreground block text-[10px]">Campaign:</span>
                    <span className="font-medium text-foreground truncate block mt-0.5">{selectedEnquiry.utm_campaign || "-"}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                    <span className="text-muted-foreground block text-[10px]">Source:</span>
                    <span className="font-medium text-foreground truncate block mt-0.5">{selectedEnquiry.utm_source || "-"}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                    <span className="text-muted-foreground block text-[10px]">Medium:</span>
                    <span className="font-medium text-foreground truncate block mt-0.5">{selectedEnquiry.utm_medium || "-"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 🔹 Delete Confirmation Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
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
