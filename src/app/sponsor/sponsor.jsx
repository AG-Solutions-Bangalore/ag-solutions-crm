import DataTable from "@/components/common/data-table";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { SPONSOR_API } from "@/constants/apiConstants";
import ImageCell from "@/components/common/ImageCell";
import { motion } from "framer-motion";
import SponsorModal from "./SponsarModal";
import SponsarEdit from "./SponsarEdit";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSponsar, setSelectedSponsar] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/sponsor`,
    queryKey: ["sponsor", pageIndex, pageSize, searchTerm],
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

  const sponsorList = data?.data?.data || data?.data || [];
  const totalRecords = searchTerm
    ? sponsorList.length
    : (data?.data?.total || sponsorList.length || 0);
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
      header: "Logo",
      accessorKey: "sponsors_image",
      cell: ({ row }) => {
        const fileName = row.original.sponsors_image || row.original.sponsor_image;
        const src = fileName ? `${sponsorBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.sponsors_name || row.original.sponsor_name || "Sponsor logo"}
            width={60}
            height={36}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Sponsor Name / Url",
      accessorKey: "sponsors_url",
      cell: ({ row }) => {
        const name =
          row.original.sponsors_name ||
          row.original.sponsor_name ||
          row.original.sponsors_url ||
          row.original.sponsor_url ||
          `Sponsor #${row.original.id}`;
        return (
          <span className="font-semibold text-foreground text-xs">
            {name}
          </span>
        );
      },
    },
    {
      header: "Website Link",
      accessorKey: "sponsor_link",
      cell: ({ row }) => {
        const link =
          row.original.sponsors_url ||
          row.original.sponsor_link ||
          row.original.sponsor_url;
        return link ? (
          <a
            href={link.startsWith("http") ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span className="max-w-[200px] truncate">{link}</span>
            <ExternalLink className="size-3 shrink-0" />
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit Sponsor"
            onClick={() => {
              setSelectedSponsar(row.original);
              setOpenEdit(true);
            }}
          >
            <Edit className="size-3.5" />
          </button>
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
        </div>
      ),
    },
  ];

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
          onClick: () => setOpenCreate(true),
          label: "Add Sponsor",
        }}
        searchPlaceholder="Search sponsors..."
      />

      {openCreate && <SponsorModal setOpenEdit={setOpenCreate} />}
      {openEdit && selectedSponsar && (
        <SponsarEdit
          setOpenEdit={setOpenEdit}
          selectedSponsar={selectedSponsar}
          sponsorsBaseUrl={sponsorBaseUrl}
        />
      )}

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
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

