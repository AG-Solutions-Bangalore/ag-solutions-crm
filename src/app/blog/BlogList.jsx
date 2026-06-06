import React, { useState } from "react";
import { toast } from "sonner";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/loader/loader";
import { BLOG_API, BLOG_LIST } from "@/constants/apiConstants"; // Adjust path as needed

// import { Button } from "@/components/ui/button"; // Unused
// import { Input } from "@/components/ui/input"; // Unused
// import { Label } from "@/components/ui/label"; // Unused
// import Modal from "@/components/modal/Modal"; // Unused
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Edit } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import CreateBlog from "./CreateBlog";
import { useNavigate } from "react-router-dom";

const BlogList = () => {
  const queryClient = useQueryClient();
  const { trigger } = useApiMutation();

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] = useState(null); // null = Create Mode, object = Edit Mode
  //   const [formData, setFormData] = useState({
  //     title: "",
  //     content: "",
  //     status: "Active",
  //   });

  // --- Fetch Blogs (Mock Query - adjust URL/key to match your architecture) ---
  const { data, isLoading, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/blog`,
    queryKey: ["blog", null],
  });

  // --- Modal Open Handlers ---
  //   const handleOpenCreate = () => {
  //     setSelectedBlog(null);
  //     setFormData({ title: "", content: "", status: "Active" });
  //     setIsModalOpen(true);
  //   };

  //   const handleOpenEdit = (blog) => {
  //     setSelectedBlog(blog);
  //     setFormData({
  //       title: blog.title || "",
  //       content: blog.content || "",
  //       status: blog.status || "Active",
  //     });
  //     setIsModalOpen(true);
  //   };

  //   // --- Create or Update Form Submission ---
  //   const handleSubmit = async () => {
  //     if (!formData.title.trim() || !formData.content.trim()) {
  //       toast.error("Title and Content are required fields");
  //       return;
  //     }

  //     const isEdit = !!selectedBlog;
  //     const url = isEdit
  //       ? BLOG_LIST.updateById(selectedBlog.id)
  //       : BLOG_LIST.create;
  //     const method = isEdit ? "PATCH" : "POST";

  //     try {
  //       const response = await trigger({
  //         url,
  //         method,
  //         data: formData,
  //       });

  //       // Optimistically update or clear caches
  //       queryClient.invalidateQueries(["blogs"]);

  //       toast.success(
  //         response?.message ||
  //           `Blog ${isEdit ? "updated" : "created"} successfully!`,
  //       );
  //       setIsModalOpen(false);
  //     } catch (error) {
  //       toast.error(`Failed to ${isEdit ? "update" : "create"} blog`);
  //     }
  //   };

  //   // --- Toggle Status (Active/Inactive) ---
  //   const handleToggleStatus = async (blog) => {
  //     const nextStatus = blog.status === "Active" ? "Inactive" : "Active";
  //     try {
  //       await trigger({
  //         url: BLOG_LIST.updateStatus(blog.id),
  //         method: "PATCH",
  //         data: { status: nextStatus },
  //       });

  //       queryClient.invalidateQueries(["blogs"]);
  //       toast.success(`Blog status updated to ${nextStatus}`);
  //     } catch (error) {
  //       toast.error("Failed to update status");
  //     }
  //   };
  const blogBaseUrl = getImageBaseUrl(data?.image_url, "Blog");
  const noImageUrl = getNoImageUrl(data?.image_url);
  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },

    {
      header: "Image",
      accessorKey: "blog_banner_image",
      cell: ({ row }) => {
        const fileName = row.original.blog_banner_image;

        const src = fileName ? `${blogBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.blog_title}
            width={80}
            height={50}
          />
        );
      },
    },

    {
      header: "Title",
      accessorKey: "blog_title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.blog_title}</span>
      ),
    },

    {
      header: "Category",
      accessorKey: "categories",
      cell: ({ row }) => <span>{row.original.categories}</span>,
    },

    {
      header: "Created Date",
      accessorKey: "blog_created_date",
      cell: ({ row }) => <span>{row.original.blog_created_date}</span>,
    },

    // {
    //   header: "Status",
    //   accessorKey: "blog_status",
    //   cell: ({ row }) => (
    //     <ToggleStatus
    //       initialStatus={row.original.blog_status}
    //       apiUrl={BLOG_LIST.updateStatus(row.original.id)}
    //       payloadKey="blog_status"
    //       method="PATCH"
    //       onSuccess={() => {
    //         queryClient.invalidateQueries({
    //           queryKey: ["blog"],
    //         });
    //       }}
    //     />
    //   ),
    // },
    {
      header: "Status",
      accessorKey: "blog_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.blog_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.blog_status}
            apiUrl={BLOG_LIST.updateStatus(row.original.id)}
            payloadKey="blog_status"
            method="patch"
            onSuccess={() => {
              // Update the cache locally instead of calling refetch()
              queryClient.setQueryData(["blog", null], (old) => {
                if (!old?.data?.data) return old;
                // Determine the new toggled status
                const newStatus =
                  row.original.blog_status === "Active" ? "Inactive" : "Active";
                return {
                  ...old,
                  data: {
                    ...old.data,
                    data: old.data.data.map((item) =>
                      item.id === row.original.id
                        ? { ...item, blog_status: newStatus }
                        : item,
                    ),
                  },
                };
              });
            }}
          />
        </span>
      ),
    },

    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Edit
            className="h-4 w-4 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/blog-edit/${row.original.id}`)}
          />
        </div>
      ),
    },
  ];
  return (
    <div>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-red-500">Error loading blogs</div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data?.data || []}
            pageSize={10}
            addButton={{
              onClick: () => navigate("/create-blog"),
              label: "Create Blog",
            }}
            searchPlaceholder="Search Blogs..."
          />
        )}
      {/* {openCreate && <CreateBlog setOpenEdit={setOpenCreate} />} */}
      {/* 4. Render the Create Category Modal */}
      {/* {openCreate && <CreateCategoryModal setOpenCreate={setOpenCreate} />} */}

      {/* <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                handleDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
};

export default BlogList;
