import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import BASE_URL from "@/config/base-url";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import ImageCell from "@/components/common/ImageCell";

const GalleryList = () => {
  // Fetch active gallery images from the endpoint
  const { data, isLoading, error } = useGetApiMutation({
    url: `${BASE_URL}/activeGallerys`,
    queryKey: ["activeGallerys"],
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
        Error loading gallery images.
      </div>
    );
  }

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Image",
      accessorKey: "gallery_image",
      cell: ({ row }) => {
        const fileName = row.original.gallery_image;
        const baseUrl = row.original.gallery_url || "";
        const fullSrc = fileName && baseUrl ? `${baseUrl}${fileName}` : "";

        return (
          <ImageCell
            src={fullSrc}
            alt="Gallery Asset"
            width={80} // Customized width for better preview
            height={50} // Customized height for better preview
          />
        );
      },
      enableSorting: false,
      size: 120,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        pageSize={10}
        searchPlaceholder="Search Gallery..."
      />
    </div>
  );
};

export default GalleryList;
