import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { PROJECT_API } from "@/constants/apiConstants";
import { X, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ImageUpload from "@/components/image-upload/image-upload";

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
  const isEditMode = Boolean(project?.id);
  const queryClient = useQueryClient();
  const { trigger: saveProject, loading: isSubmitting } = useApiMutation();
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({ project_image: "" });

  // Fetch full Project Details by ID if editing
  const {
    data: projectDetailRes,
    isLoading: isLoadingDetail,
  } = useGetApiMutation({
    url: project?.id ? `${BASE_URL}/project/${project.id}` : null,
    queryKey: ["project-detail", project?.id],
    enabled: Boolean(project?.id),
  });

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
    project_type: "General",
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

  const handleImageChange = (fieldName, file) => {
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "webp") {
        toast.error("Only WEBP image files (.webp) are allowed");
        setErrors((prev) => ({ ...prev, [fieldName]: "Only WEBP (.webp) files are allowed" }));
        return;
      }
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [fieldName]: url }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const initializedIdRef = React.useRef(null);

  useEffect(() => {
    if (project?.id) {
      const detail = projectDetailRes?.data?.data || projectDetailRes?.data || project;
      const isNewProjectModal = initializedIdRef.current !== project.id;
      const isDetailDataNewlyLoaded = Boolean(projectDetailRes) && initializedIdRef.current === "LIST_ONLY";

      if (isNewProjectModal || isDetailDataNewlyLoaded) {
        setFormData((prev) => ({
          ...prev,
          page: detail.page || project.page || prev.page || "",
          project_sort: detail.project_sort ?? project.project_sort ?? prev.project_sort ?? "",
          project_name: detail.project_name || detail.project_title || project.project_name || project.project_title || prev.project_name || "",
          project_type: detail.project_type || project.project_type || prev.project_type || "General",
          project_description: detail.project_description || prev.project_description || "",
          project_image: prev.project_image || null,
          project_image_alt: detail.project_image_alt || detail.project_name || detail.project_title || project.project_name || prev.project_image_alt || "",
          project_status: detail.project_status || project.project_status || prev.project_status || "Active",
          project_industry: detail.project_industry || prev.project_industry || "",
          project_solution: detail.project_solution || prev.project_solution || "",
          project_features: detail.project_features || prev.project_features || "",
          project_technology: detail.project_technology || prev.project_technology || "",
        }));

        const imgName = detail.project_image || project.project_image;
        setPreview((prev) => ({
          project_image: prev.project_image && prev.project_image.startsWith("blob:")
            ? prev.project_image
            : imgName
            ? `https://ag-solutions.in/webapi/public/assets/images/project_images/${imgName}`
            : "",
        }));

        initializedIdRef.current = projectDetailRes ? project.id : "LIST_ONLY";
      }
    } else {
      initializedIdRef.current = null;
      setFormData({
        page: "",
        project_sort: "",
        project_name: "",
        project_type: "General",
        project_description: "",
        project_image: null,
        project_image_alt: "",
        project_status: "Active",
        project_industry: "",
        project_solution: "",
        project_features: "",
        project_technology: "",
      });
      setPreview({ project_image: "" });
    }
  }, [project?.id, projectDetailRes]);

  const handleSubmit = async () => {
    if (!formData.page) {
      toast.error("Please select a page");
      setErrors((prev) => ({ ...prev, page: "Page is required" }));
      return;
    }
    if (!formData.project_name?.trim()) {
      toast.error("Please enter project name");
      setErrors((prev) => ({ ...prev, project_name: "Project name is required" }));
      return;
    }
    if (!formData.project_type?.trim()) {
      toast.error("Please enter project type");
      setErrors((prev) => ({ ...prev, project_type: "Project type is required" }));
      return;
    }
    if (!formData.project_image_alt?.trim()) {
      toast.error("Please enter image alt text");
      setErrors((prev) => ({ ...prev, project_image_alt: "Image alt text is required" }));
      return;
    }
    if (!isEditMode && !formData.project_image && !preview.project_image) {
      toast.error("Please select a project image");
      setErrors((prev) => ({ ...prev, project_image: "Project image is required" }));
      return;
    }

    const payload = new FormData();
    payload.append("page", formData.page);
    payload.append("project_sort", formData.project_sort || "0");
    payload.append("project_name", formData.project_name);
    payload.append("project_title", formData.project_name);
    payload.append("project_type", formData.project_type?.trim() || "General");
    payload.append("project_description", formData.project_description || "");
    payload.append("project_image_alt", formData.project_image_alt.trim());
    payload.append("project_status", formData.project_status || "Active");
    payload.append("project_industry", formData.project_industry || "");
    payload.append("project_solution", formData.project_solution || "");
    payload.append("project_features", formData.project_features || "");
    payload.append("project_technology", formData.project_technology || "");

    if (isEditMode) {
      payload.append("_method", "PUT");
    }

    if (formData.project_image instanceof File) {
      payload.append("project_image", formData.project_image);
    }

    try {
      const res = await saveProject({
        url: isEditMode ? PROJECT_API.updateById(project.id) : PROJECT_API.create,
        method: "POST",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === "success") {
        toast.success(res?.message || (isEditMode ? "Project updated successfully" : "Project created successfully"));
        queryClient.invalidateQueries({ queryKey: ["project"] });
        if (project?.id) {
          queryClient.invalidateQueries({ queryKey: ["project-detail", project.id] });
        }
        if (refetch) refetch();
        setOpenEdit(false);
      } else {
        toast.error(res?.message || (isEditMode ? "Failed to update project" : "Failed to create project"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update project" : "Failed to create project"));
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setOpenEdit(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-between">
            <span>{isEditMode ? "Edit Project" : "Add New Project"}</span>
            {isLoadingDetail && (
              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading details...
              </span>
            )}
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
                  <option key={pageItem.page_url || pageItem.id} value={pageItem.page_url}>
                    {pageItem.page_name}
                  </option>
                ))}
              {formData.page &&
                pagesData &&
                !pagesData.some((p) => p.page_url === formData.page) && (
                  <option value={formData.page}>{formData.page}</option>
                )}
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
            <Label className="text-sm font-medium">Project Type <Redstar /></Label>
            <Input
              name="project_type"
              value={formData.project_type}
              onChange={handleInputChange}
              placeholder="Enter project type"
              className={errors.project_type ? "border-red-500" : ""}
            />
            {errors.project_type && (
              <p className="text-sm text-red-500">{errors.project_type}</p>
            )}
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

          {isEditMode && (
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
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Image Alt Text <Redstar />
            </Label>
            <Input
              name="project_image_alt"
              value={formData.project_image_alt}
              onChange={handleInputChange}
              placeholder="Alt text for image"
              className={errors.project_image_alt ? "border-red-500" : ""}
            />
            {errors.project_image_alt && (
              <p className="text-xs text-red-500">{errors.project_image_alt}</p>
            )}
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

          <div className="space-y-2 md:col-span-2 border border-border p-4 rounded-lg bg-card">
            <ImageUpload
              id="project_image"
              label="Project Image (WEBP only)"
              selectedFile={formData.project_image}
              previewImage={preview.project_image}
              onFileChange={(e) => handleImageChange("project_image", e.target.files?.[0])}
              onRemove={() => handleRemoveImage("project_image")}
              error={errors.project_image}
              accept="image/webp,.webp"
              allowedExtensions={["webp"]}
              format="WEBP only"
            />
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

