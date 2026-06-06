import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { store } from "@/store/store";
import BASE_URL from "@/config/base-url";

const CreateProjects = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { trigger, loading: isSubmitting } = useApiMutation();

  // Fetch pages for the dropdown using the provided API endpoint and Bearer Token
  const { data: pagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["pages-dropdown"],
    queryFn: async () => {
      // Get the token from local storage (Update this if you store it differently e.g. cookies/sessionStorage)
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
      // The API returns the array wrapped in a 'data' object
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
    project_industry: "",
    project_solution: "",
    project_features: "",
    project_technology: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    project_image: "",
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.page) {
      newErrors.page = "Page is required";
      isValid = false;
    }
    if (!formData.project_name) {
      newErrors.project_name = "Project name is required";
      isValid = false;
    }
    if (!formData.project_type) {
      newErrors.project_type = "Project type is required";
      isValid = false;
    }
    if (!formData.project_image) {
      newErrors.project_image = "Project image is required";
      isValid = false;
    }
    if (!formData.project_image_alt) {
      newErrors.project_image_alt = "Image alt text is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all the required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("page", formData.page);
    formDataObj.append("project_sort", formData.project_sort);
    formDataObj.append("project_name", formData.project_name);
    formDataObj.append("project_type", formData.project_type);
    formDataObj.append("project_description", formData.project_description);
    formDataObj.append("project_image_alt", formData.project_image_alt);
    formDataObj.append("project_industry", formData.project_industry);
    formDataObj.append("project_solution", formData.project_solution);
    formDataObj.append("project_features", formData.project_features);
    formDataObj.append("project_technology", formData.project_technology);

    if (formData.project_image instanceof File) {
      formDataObj.append("project_image", formData.project_image);
    }

    try {
      const res = await trigger({
        url: PROJECT_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Project created successfully");
        // Invalidate the project list cache to refresh data
        queryClient.invalidateQueries(["project", null]);
        // Adjust the route as per your routing setup
        navigate("/projects");
      } else {
        toast.error(res?.message || "Failed to create project");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={FolderPlus}
        title="Add New Project"
        description="Fill in the details to register a new project in the system."
        rightContent={
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              form="create-project-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-project-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Page Dropdown */}
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

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project_name" className="text-sm font-medium">
                Project Name <Redstar />
              </Label>
              <Input
                id="project_name"
                name="project_name"
                type="text"
                placeholder="Enter project name"
                value={formData.project_name}
                onChange={handleInputChange}
                className={errors.project_name ? "border-red-500" : ""}
              />
              {errors.project_name && (
                <p className="text-sm text-red-500">{errors.project_name}</p>
              )}
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="project_type" className="text-sm font-medium">
                Project Type <Redstar />
              </Label>
              <Input
                id="project_type"
                name="project_type"
                type="text"
                placeholder="Enter project type"
                value={formData.project_type}
                onChange={handleInputChange}
                className={errors.project_type ? "border-red-500" : ""}
              />
              {errors.project_type && (
                <p className="text-sm text-red-500">{errors.project_type}</p>
              )}
            </div>

            {/* Project Sort */}
            <div className="space-y-2">
              <Label htmlFor="project_sort" className="text-sm font-medium">
                Project Sort
              </Label>
              <Input
                id="project_sort"
                name="project_sort"
                type="number"
                placeholder="Enter sort order (number)"
                value={formData.project_sort}
                onChange={handleInputChange}
              />
            </div>

            {/* Project Industry */}
            <div className="space-y-2">
              <Label htmlFor="project_industry" className="text-sm font-medium">
                Industry
              </Label>
              <Input
                id="project_industry"
                name="project_industry"
                type="text"
                placeholder="Enter project industry"
                value={formData.project_industry}
                onChange={handleInputChange}
              />
            </div>

            {/* Project Technology */}
            <div className="space-y-2">
              <Label
                htmlFor="project_technology"
                className="text-sm font-medium"
              >
                Technology (comma separated)
              </Label>
              <Input
                id="project_technology"
                name="project_technology"
                type="text"
                placeholder="e.g. React, Node.js, MongoDB"
                value={formData.project_technology}
                onChange={handleInputChange}
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="project_description"
                className="text-sm font-medium"
              >
                Project Description
              </Label>
              <Textarea
                id="project_description"
                name="project_description"
                placeholder="Enter project description"
                value={formData.project_description}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>

            {/* Project Solution */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project_solution" className="text-sm font-medium">
                Project Solution
              </Label>
              <Textarea
                id="project_solution"
                name="project_solution"
                placeholder="Enter project solution"
                value={formData.project_solution}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>

            {/* Project Features */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project_features" className="text-sm font-medium">
                Project Features
              </Label>
              <Textarea
                id="project_features"
                name="project_features"
                placeholder="Enter project features"
                value={formData.project_features}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>

            {/* Project Image Section */}
            <div className="space-y-4 md:col-span-2 border p-4 rounded-lg bg-gray-50/50">
              <h3 className="font-medium text-base">
                Media <Redstar />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="project_image"
                    className="text-sm font-medium"
                  >
                    Upload Image
                  </Label>
                  <ImageUpload
                    id="project_image"
                    label=""
                    selectedFile={formData.project_image}
                    previewImage={preview.project_image}
                    onFileChange={(e) =>
                      handleImageChange("project_image", e.target.files?.[0])
                    }
                    onRemove={() => handleRemoveImage("project_image")}
                    error={errors.project_image}
                    maxSize={5}
                  />
                  {errors.project_image && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.project_image}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="project_image_alt"
                    className="text-sm font-medium"
                  >
                    Image Alt Text <Redstar />
                  </Label>
                  <Input
                    id="project_image_alt"
                    name="project_image_alt"
                    type="text"
                    placeholder="Enter image alt text"
                    value={formData.project_image_alt}
                    onChange={handleInputChange}
                    className={errors.project_image_alt ? "border-red-500" : ""}
                  />
                  {errors.project_image_alt && (
                    <p className="text-sm text-red-500">
                      {errors.project_image_alt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjects;
