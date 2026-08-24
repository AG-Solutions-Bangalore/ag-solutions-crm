import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PROJECT_API } from "@/constants/apiConstants";
import { X, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { store } from "@/store/store";
import Redstar from "@/components/Redstar";
import BASE_URL from "@/config/base-url";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ProjectModal = ({ setOpenEdit, project, refetch }) => {
  const queryClient = useQueryClient();
  const { trigger: updateProject, loading: isSubmitting } = useApiMutation();
  const [errors, setErrors] = useState({});

  const { data: pagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["pages-dropdown"],
    queryFn: async () => {
      const state = store.getState();
      const token = state.auth?.token;
      const response = await fetch(`${BASE_URL}/page`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      return result?.data || [];
    },
  });

  const [formData, setFormData] = useState({
    page: "",
    project_sort: "",
    project_name: "",
    project_type: "",
    project_description: "",
    project_image: null,
    project_image_alt: "",
    project_status: "Active",
    project_industry: "",
    project_solution: "",
    project_features: "",
    project_technology: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  useEffect(() => {
    if (!project) return;
    setFormData({
      page: project.page || "",
      project_sort: project.project_sort ?? "",
      project_name: project.project_name || project.project_title || "",
      project_type: project.project_type || "",
      project_description: project.project_description || "",
      project_image: null,
      project_image_alt: project.project_image_alt || "",
      project_status: project.project_status || "Active",
      project_industry: project.project_industry || "",
      project_solution: project.project_solution || "",
      project_features: project.project_features || "",
      project_technology: project.project_technology || "",
    });
  }, [project]);

  const handleUpdate = async () => {
    if (!formData.page) {
      toast.error("Please select a page");
      return;
    }
    if (!formData.project_name.trim()) {
      toast.error("Please enter project name");
      return;
    }

    const payload = new FormData();
    payload.append("page", formData.page);
    payload.append("project_sort", formData.project_sort || "0");
    payload.append("project_name", formData.project_name);
    payload.append("project_title", formData.project_name);
    payload.append("project_type", formData.project_type || "");
    payload.append("project_description", formData.project_description || "");
    payload.append("project_image_alt", formData.project_image_alt || "");
    payload.append("project_status", formData.project_status || "Active");
    payload.append("project_industry", formData.project_industry || "");
    payload.append("project_solution", formData.project_solution || "");
    payload.append("project_features", formData.project_features || "");
    payload.append("project_technology", formData.project_technology || "");
    payload.append("_method", "PUT");

    if (formData.project_image instanceof File) {
      payload.append("project_image", formData.project_image);
    }

    try {
      const res = await updateProject({
        url: PROJECT_API.updateById(project.id),
        method: "POST",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === "success") {
        toast.success(res?.message || "Project updated successfully");
        queryClient.invalidateQueries({ queryKey: ["project"] });
        if (refetch) refetch();
        setOpenEdit(false);
      } else {
        toast.error(res?.message || "Failed to update project");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update project");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setOpenEdit(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="page" className="text-sm font-medium">
              Page <Redstar />
            </Label>
            <select
              id="page"
              name="page"
              value={formData.page}
              onChange={handleInputChange}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.page ? "border-red-500" : ""}`}
              disabled={isLoadingPages}
            >
              <option value="">
                {isLoadingPages ? "Loading pages..." : "Select a page"}
              </option>
              {pagesData &&
                pagesData.map((pageItem) => (
                  <option key={pageItem.page_url} value={pageItem.page_url}>
                    {pageItem.page_name}
                  </option>
                ))}
            </select>
            {errors.page && (
              <p className="text-sm text-red-500">{errors.page}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Sort</Label>
            <Input
              name="project_sort"
              type="number"
              value={formData.project_sort}
              onChange={handleInputChange}
              placeholder="Sort order number"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Name <Redstar /></Label>
            <Input
              name="project_name"
              value={formData.project_name}
              onChange={handleInputChange}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Type</Label>
            <Input
              name="project_type"
              value={formData.project_type}
              onChange={handleInputChange}
              placeholder="Enter project type"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Industry</Label>
            <Input
              name="project_industry"
              value={formData.project_industry}
              onChange={handleInputChange}
              placeholder="Enter industry"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Technology</Label>
            <Input
              name="project_technology"
              value={formData.project_technology}
              onChange={handleInputChange}
              placeholder="e.g. React, Node.js"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <select
              name="project_status"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.project_status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Image Alt Text</Label>
            <Input
              name="project_image_alt"
              value={formData.project_image_alt}
              onChange={handleInputChange}
              placeholder="Alt text for image"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Features</Label>
            <Textarea
              name="project_features"
              rows={3}
              value={formData.project_features}
              onChange={handleInputChange}
              placeholder="Project features..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              name="project_description"
              rows={3}
              value={formData.project_description}
              onChange={handleInputChange}
              placeholder="Project description..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Solution</Label>
            <Textarea
              name="project_solution"
              rows={3}
              value={formData.project_solution}
              onChange={handleInputChange}
              placeholder="Project solution..."
            />
          </div>

          <div className="space-y-2 md:col-span-2 border border-border p-4 rounded-lg bg-muted/20">
            <Label className="text-sm font-medium block mb-2">Project Image</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {project?.project_image && (
                <img
                  src={`https://ag-solutions.in/webapi/public/assets/images/project_images/${project.project_image}`}
                  alt={project.project_name || project.project_title || "Project image"}
                  className="w-20 h-14 object-cover rounded-md border border-border shadow-2xs"
                />
              )}
              <Input
                type="file"
                className="flex-1"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project_image: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpenEdit(false)}
            type="button"
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

