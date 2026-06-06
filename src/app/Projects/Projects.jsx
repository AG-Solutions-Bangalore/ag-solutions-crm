import React, { useState, useEffect } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import StatusDropdown from "@/components/toogle/Enquiry-toggle";
import BASE_URL from "@/config/base-url";
import { PROJECT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import ImageCell from "@/components/common/ImageCell";
import ToggleStatus from "@/components/toogle/status-toogle";
import ProjectModal from "./projectModal";

// --- Local Editable Sort Input using your logic ---
const EditableSortInput = ({ initialValue, id, queryClient }) => {
  const [value, setValue] = useState(initialValue);
  const { trigger: PROJECT_SORT_UPDATE } = useApiMutation();

  const handleBlur = async () => {
    if (Number(value) === Number(initialValue)) {
      return;
    }
    try {
      await PROJECT_SORT_UPDATE({
        url: PROJECT_API.updateSort(id),
        method: "PATCH",
        data: {
          project_sort: value,
        },
      });
      toast.success("Sort updated");
    } catch (error) {
      toast.error("Failed to update sort");
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      className="w-16 h-8 border rounded border-gray-300 px-1 text-center text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  );
};
// ------------------------------------------------

const Projects = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedPage, setSelectedPage] = useState("all");

  const { data, isLoading, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/project`,
    queryKey: ["project"],
  });
  const imageBaseUrl =
    data?.image_url?.find((item) => item.image_for === "Projects")?.image_url ||
    "";

  const noImageUrl =
    data?.image_url?.find((item) => item.image_for === "No Image")?.image_url ||
    "";

  const { trigger: deleteProject } = useApiMutation();

  const pages = [
    "all",
    ...new Set((data?.data || []).map((item) => item.page)),
  ];

  const handleDelete = async (id) => {
    console.log(id);
    try {
      const response = await deleteProject({
        url: PROJECT_API.deleteById(id),
        method: "DELETE",
      });

      queryClient.setQueryData(["project", null], (old) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((item) => item.id !== id),
        };
      });

      toast.success(response?.message || "Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects =
    selectedPage === "all"
      ? data?.data || []
      : (data?.data || []).filter((item) => item.page === selectedPage);

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Page",
      accessorKey: "page",
    },
    {
      header: "Project Name",
      accessorKey: "project_name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.project_name}</span>
      ),
    },

    {
      header: "Project Type",
      accessorKey: "project_type",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.project_type || "-"}
        </span>
      ),
    },
    {
      header: "Project Sort",
      accessorKey: "project_sort",
      cell: ({ row }) => (
        <EditableSortInput
          initialValue={row.original.project_sort}
          id={row.original.id}
          queryClient={queryClient}
        />
      ),
    },
    {
      header: "Project Image",
      accessorKey: "project_image",
      cell: ({ row }) => {
        const fileName = row.original.project_image;
        const src = fileName ? `${imageBaseUrl}${fileName}` : `${noImageUrl}`;
        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={row.original.project_name}
          />
        );
      },
    },
    {
      header: "Status",
      accessorKey: "project_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.project_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.project_status}
            apiUrl={PROJECT_API.updateStatus(row.original.id)}
            payloadKey="project_status"
            method="patch"
            onSuccess={() => {
              // Update the cache locally instead of calling refetch()
              queryClient.setQueryData(["project", null], (old) => {
                if (!old?.data) return old;
                // Determine the new toggled status
                const newStatus =
                  row.original.project_status === "Active"
                    ? "Inactive"
                    : "Active";
                return {
                  ...old,
                  data: old.data.map((item) =>
                    item.id === row.original.id
                      ? { ...item, project_status: newStatus }
                      : item,
                  ),
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
            className="h-4 w-4 hover:text-blue-600 cursor-pointer"
            onClick={() => {
              setSelectedProject(row.original);
              setOpenEdit(true);
            }}
          />

          <Trash2
            className="h-4 w-4 hover:text-red-600 cursor-pointer"
            onClick={() => setDeleteId(row.original.id)} // Open dialog instead of deleting directly
          />
        </div>
      ),
      enableSorting: false,
    },
  ];
  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <div>
      <DataTable
        columns={columns}
        data={filteredProjects}
        pageSize={10}
        filterProjects={
          <div className="mb-2 ml-20 flex items-center gap-1">
            <label className="text-[15px] font-medium">Filter:</label>

            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="h-10 w-34 rounded border px-2 text-xs"
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page === "all" ? "All Pages" : page}
                </option>
              ))}
            </select>
          </div>
        }
        addButton={{
          to: "/create-project",
          label: "Add Project",
        }}
        searchPlaceholder="Search Projects..."
      />
      {openEdit && (
        <ProjectModal setOpenEdit={setOpenEdit} project={selectedProject} />
      )}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
      </AlertDialog>
    </div>
  );
};

export default Projects;
