import DataTable from "@/components/common/data-table";
import ToggleStatus from "@/components/toogle/status-toogle";
import BASE_URL from "@/config/base-url";
import { CATEGORY_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import Loader from "@/components/loader/loader";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CreateCategoryModal from "./CreateCategoryModal";
import CategoryModal from "./CategoryModal";
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

const Category = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/category`,
    queryKey: ["category", pageIndex, searchTerm],
    params: {
      page: searchTerm ? undefined : pageIndex + 1,
      search: searchTerm || undefined,
    },
  });

  const { trigger: deleteTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: CATEGORY_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["category"] });
        toast.success(res?.message || "Category deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting category");
    }
  };

  const categoryList = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const totalRecords = searchTerm
    ? categoryList.length
    : (data?.data?.total || categoryList.length || 0);
  const totalPages = searchTerm
    ? (Math.ceil(totalRecords / 10) || 1)
    : (data?.data?.last_page || Math.ceil(totalRecords / 10) || 1);

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
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit Category"
            onClick={() => {
              setSelectedCategory(row.original);
              setOpenEdit(true);
            }}
          >
            <Edit className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Category"
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
        data={categoryList}
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
        addButton={{
          onClick: () => setOpenCreate(true),
          label: "Add Category",
        }}
        searchPlaceholder="Search categories..."
      />


      {openCreate && <CreateCategoryModal setOpenCreate={setOpenCreate} />}
      {openEdit && selectedCategory && (
        <CategoryModal
          setOpenEdit={setOpenEdit}
          Category={selectedCategory}
        />
      )}

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Category</AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this category? This action cannot be undone.
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

export default Category;

