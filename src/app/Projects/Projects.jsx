import DataTable from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/base-url";
import { PROJECT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Edit, MoreVertical, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import Loader from "@/components/loader/loader";
import ToggleStatus from "@/components/toogle/status-toogle";

const Projects = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedPage, setSelectedPage] = useState("all");
  const [sortOrders, setSortOrders] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useGetApiMutation({
    url: `${BASE_URL}/project`,
    queryKey: ["project"],
  });

  const { trigger: deleteTrigger } = useApiMutation();
  const { trigger: updateSortTrigger } = useApiMutation();

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: PROJECT_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        queryClient.invalidateQueries({ queryKey: ["project"] });
        toast.success(res?.message || "Project deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete project");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const handleSortChange = (id, value) => {
    setSortOrders((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSortUpdate = async (id) => {
    const sortValue = sortOrders[id];
    if (sortValue === undefined || sortValue === "") {
      toast.error("Please enter a sort order");
      return;
    }

    try {
      setLoadingId(id);
      const res = await updateSortTrigger({
        url: `${BASE_URL}/project/${id}`,
        method: "put",
        data: {
          project_sort: Number(sortValue),
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success("Sort order updated successfully");
        queryClient.invalidateQueries({ queryKey: ["project"] });
      } else {
        toast.error(res?.message || "Failed to update sort order");
      }
    } catch (error) {
      toast.error("Something went wrong while updating sort order");
    } finally {
      setLoadingId(null);
    }
  };

  const allProjects = data?.data || [];
  const uniquePages = [
    ...new Set(allProjects.map((item) => item.page).filter(Boolean)),
  ];

  const filteredData =
    selectedPage === "all"
      ? allProjects
      : allProjects.filter((item) => item.page === selectedPage);

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
      header: "Project Title",
      accessorKey: "project_title",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.project_title}
        </span>
      ),
    },
    {
      header: "Page Type",
      accessorKey: "page",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {row.original.page || "-"}
        </span>
      ),
    },
    {
      header: "Sort Order",
      accessorKey: "project_sort",
      cell: ({ row }) => {
        const id = row.original.id;
        const value =
          sortOrders[id] !== undefined
            ? sortOrders[id]
            : row.original.project_sort ?? "";

        return (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={value}
              onChange={(e) => handleSortChange(id, e.target.value)}
              className="w-16 h-8 px-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground text-center"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={loadingId === id}
              onClick={() => handleSortUpdate(id)}
              className="h-8 px-2 text-xs rounded-md border-border hover:bg-accent"
            >
              {loadingId === id ? "..." : <ArrowUpDown className="size-3" />}
            </Button>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "project_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.project_status}
          apiUrl={PROJECT_API.updateStatus(row.original.id)}
          payloadKey="project_status"
          method="patch"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["project"] });
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
            title="Edit Project"
            onClick={() => navigate(`/projects/edit/${row.original.id}`)}
          >
            <Edit className="size-3.5" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Project"
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
        <p className="font-semibold">Error loading projects</p>
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
          Projects
        </h1>
        <p className="text-xs text-muted-foreground">
          Organize showcase projects, page categories, and layout sequence.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pageSize={10}
        isLoading={isLoading}
        isFetching={isFetching}
        filterProjects={
          <div className="flex items-center gap-2">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="h-9 w-44 text-xs rounded-lg border-border bg-background shadow-2xs">
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border border-border bg-popover/95 backdrop-blur-md">
                <SelectItem value="all" className="text-xs">All Pages</SelectItem>
                {uniquePages.map((page) => (
                  <SelectItem key={page} value={page} className="text-xs">
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        addButton={{
          to: "/projects/create",
          label: "Add Project",
        }}
        searchPlaceholder="Search projects..."
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-xl border border-border bg-card/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this project? This action cannot be undone.
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

export default Projects;
