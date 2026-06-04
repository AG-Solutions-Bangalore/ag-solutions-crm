import React, { useState, useEffect } from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import StatusDropdown from "@/components/toogle/Enquiry-toggle";
import BASE_URL from "@/config/base-url";
import { CATEGORY_API, PROJECT_API } from "@/constants/apiConstants";
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
import CategoryModal from "./CategoryModal";
import CreateCategoryModal from "./CreateCategoryModal"; // 1. Import the new create modal

const Category = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false); // 2. State for the create modal
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedPage, setSelectedPage] = useState("all");

  const { data, isLoading, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/category`,
    queryKey: ["category"],
  });

  const columns = [
    {
      header: "SL No",
      accessorKey: "slno",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      header: "Name",
      accessorKey: "category_name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.category_name}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "project_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.category_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.category_status}
            apiUrl={CATEGORY_API.updateStatus(row.original.id)}
            payloadKey="category_status"
            method="patch"
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["category"],
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
              console.log(row.original);
              setSelectedCategory(row.original);
              setOpenEdit(true);
            }}
          />
        </div>
      ),
      enableSorting: false,
    },
  ];
  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data?.data || []}
        pageSize={10}
        createButton={<></>}
        // 3. Update the addButton from a route path 'to' to an 'onClick' handler
        addButton={{
          onClick: () => setOpenCreate(true),
          label: "Create Category",
        }}
        searchPlaceholder="Search Projects..."
      />
      {openEdit && (
        <CategoryModal setOpenEdit={setOpenEdit} Category={selectedCategory} />
      )}

      {/* 4. Render the Create Category Modal */}
      {openCreate && <CreateCategoryModal setOpenCreate={setOpenCreate} />}

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

export default Category;
