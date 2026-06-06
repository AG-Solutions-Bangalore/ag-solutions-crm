import React, { useState } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import ImageCell from "@/components/common/ImageCell";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import SponsorModal from "./SponsarModal";
import { Edit } from "lucide-react";
import SponsarEdit from "./SponsarEdit";
import { toast } from "sonner";

const Sponsor = () => {
  // Fetch sponsors list
  const [openCreate, setOpenCreate] = useState(false); // 2. State for the create modal
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSponsar, setSelectedSponsar] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isLoading, error } = useGetApiMutation({
    url: `${BASE_URL}/sponsor`,
    queryKey: ["sponsor", pageIndex],
    params: {
      page: pageIndex + 1,
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 font-medium">
        Error loading sponsors.
      </div>
    );
  }

  // Get base URLs from API response
  const sponsorsBaseUrl = getImageBaseUrl(data?.image_url, "Sponsors");
  const noImageUrl = getNoImageUrl(data?.image_url);

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Image",
      accessorKey: "sponsors_image",
      cell: ({ row }) => {
        const fileName = row.original.sponsors_image;
        const src = fileName ? `${sponsorsBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt="Sponsor Logo"
            width={80} // Optimal dimensions for logos
            height={40}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Redirect URL",
      accessorKey: "sponsors_url",
      cell: ({ row }) => {
        const url = row.original.sponsors_url;
        if (!url) return <span className="text-gray-400">-</span>;

        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-xs block font-medium"
          >
            {url}
          </a>
        );
      },
    },
    {
      header: "Sort Order",
      accessorKey: "sponsors_sort",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.sponsors_sort}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "sponsors_status",
      cell: ({ row }) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            row.original.sponsors_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.sponsors_status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Edit
            className="h-4 w-4 hover:text-blue-600 cursor-pointer"
            onClick={() => {
              setSelectedSponsar(row.original);
              setOpenEdit(true);
            }}
          />

          {/* <Trash2
            className="h-4 w-4 hover:text-red-600 cursor-pointer"
            onClick={() => setDeleteId(row.original.id)} // Open dialog instead of deleting directly
          /> */}
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data?.data || []} // Safely accesses nested paginated data array
        pageSize={10}
        serverPagination={{
          pageIndex: pageIndex,
          pageCount: data?.data?.last_page || 1,
          total: data?.data?.total || 0,
          onPageChange: (newPageIndex) => setPageIndex(newPageIndex),
        }}
        searchPlaceholder="Search Sponsors..."
        addButton={{
          onClick: () => setOpenCreate(true),
          label: "Add Sponsor",
        }}
      />
      {openCreate && <SponsorModal setOpenEdit={setOpenCreate} />}
      {openEdit && (
        <SponsarEdit
          setOpenEdit={setOpenEdit}
          selectedSponsar={selectedSponsar}
          sponsorsBaseUrl={sponsorsBaseUrl}
        />
      )}
    </div>
  );
};

export default Sponsor;
