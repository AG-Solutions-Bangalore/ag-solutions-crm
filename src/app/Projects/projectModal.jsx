import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PROJECT_API } from "@/constants/apiConstants";
import { X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

import { store } from "@/store/store";
import Redstar from "@/components/Redstar";
import BASE_URL from "@/config/base-url";

const ProjectModal = ({ setOpenEdit, project, refetch }) => {
  const queryClient = useQueryClient();
  const { trigger: updateProject } = useApiMutation();
  const [errors, setErrors] = useState({});

  const { data: pagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["pages-dropdown"],
    queryFn: async () => {
      const state = store.getState();
      const token = state.auth?.token;
      const response = await fetch(
        "https://ag-solutions.in/webapi/public/api/page",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (!project) return;
    setFormData({
      page: project.page || "",
      project_sort: project.project_sort || "",
      project_name: project.project_name || "",
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
    const payload = new FormData();
    payload.append("page", formData.page);
    payload.append("project_sort", formData.project_sort);
    payload.append("project_name", formData.project_name);
    payload.append("project_type", formData.project_type);
    payload.append("project_description", formData.project_description);
    payload.append("project_image_alt", formData.project_image_alt);
    payload.append("project_status", formData.project_status);
    payload.append("project_industry", formData.project_industry);
    payload.append("project_solution", formData.project_solution);
    payload.append("project_features", formData.project_features);
    payload.append("project_technology", formData.project_technology);

    // Append image file directly if present
    if (formData.project_image) {
      payload.append("project_image", formData.project_image);
    }

    try {
      await updateProject({
        url: PROJECT_API.updateById(project.id),
        method: "PUT",
        data: payload,
      });

      // Invalidate project list cache to refresh data
      queryClient.invalidateQueries(["project", null]);

      if (refetch) refetch();
      setOpenEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* X Close Button on top right */}
        <button
          onClick={() => setOpenEdit(false)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Edit Project</h2>

        {/* 2-Column Responsive Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Page & Project Sort */}
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
              type="number"
              value={formData.project_sort}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_sort: e.target.value,
                })
              }
            />
          </div>

          {/* Row 2: Project Name & Project Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Name</Label>
            <Input
              value={formData.project_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_name: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Type</Label>
            <Input
              value={formData.project_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_type: e.target.value,
                })
              }
            />
          </div>

          {/* Row 3: Industry & Technology */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Industry</Label>
            <Input
              value={formData.project_industry}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_industry: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Technology</Label>
            <Input
              value={formData.project_technology}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_technology: e.target.value,
                })
              }
            />
          </div>

          {/* Row 4: Status & Image Alt Text */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.project_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_status: e.target.value,
                })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Features</Label>
            <Textarea
              rows={4}
              value={formData.project_features}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_features: e.target.value,
                })
              }
            />
          </div>
          {/* Row 5: Description & Solution */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              rows={4}
              value={formData.project_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_description: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Solution</Label>
            <Textarea
              rows={4}
              value={formData.project_solution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_solution: e.target.value,
                })
              }
            />
          </div>

          {/* Row 6: Features & Project Image (with inline preview) */}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Image Alt Text</Label>
            <Input
              value={formData.project_image_alt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_image_alt: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Image</Label>
            <div className="flex items-center gap-4">
              {project?.project_image && (
                <img
                  src={`https://ag-solutions.in/webapi/public/assets/images/project_images/${project.project_image}`}
                  alt={project.project_name}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <Input
                type="file"
                className="flex-1"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project_image: e.target.files?.[0],
                  })
                }
                fe
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-8">
          <button
            onClick={() => setOpenEdit(false)}
            className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
