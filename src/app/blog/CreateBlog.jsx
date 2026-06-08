import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_LIST, CATEGORY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import { store } from "@/store/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const CreateBlog = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { trigger, loading } = useApiMutation();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [preview, setPreview] = useState({
    blog_banner_image: "",
  });
  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      const url = URL.createObjectURL(file);

      setPreview((prev) => ({
        ...prev,
        [fieldName]: url,
      }));

      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
    }));

    setPreview((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };
  // Fetch categories for the multi-select dropdown (Update API endpoint as per your app)
  const { data: categoriesResponse } = useQuery({
    queryKey: ["active-categories"],
    queryFn: async () => {
      const token = store.getState().auth?.token;
      // You can replace CATEGORY_API.list with the exact endpoint to fetch active categories
      const res = await axios.get(
        `${BASE_URL}${CATEGORY_API.list || "/category"}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
  });
  const categories =
    categoriesResponse?.data?.data?.filter(
      (item) => item.category_status === "Active",
    ) || [];

  const [formData, setFormData] = useState({
    blog_slug: "",
    blog_index: "Yes", // Default to Yes as per common practices, update if needed
    blog_meta_keywords: "",
    blog_title: "",
    blog_short_description: "",
    blog_description: "",
    blog_banner_image: null,
    blog_banner_image_alt: "",
    blog_categories_ids: [],
    blog_front: "",
    blog_featured: "No", // Default to No
  });

  const [errors, setErrors] = useState({});

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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For native multi-select

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.blog_categories_ids.length) {
      newErrors.blog_categories_ids = "Please select at least one category";
      isValid = false;
    }
    if (!formData.blog_slug) {
      newErrors.blog_slug = "Blog slug is required";
      isValid = false;
    }
    if (!formData.blog_title) {
      newErrors.blog_title = "Blog title is required";
      isValid = false;
    }
    if (!formData.blog_short_description) {
      newErrors.blog_short_description = "Short description is required";
      isValid = false;
    }
    if (!formData.blog_description) {
      newErrors.blog_description = "Description is required";
      isValid = false;
    }
    if (!formData.blog_banner_image) {
      newErrors.blog_banner_image = "Banner image is required";
      isValid = false;
    }
    if (!formData.blog_banner_image_alt) {
      newErrors.blog_banner_image_alt = "Banner image alt text is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all the required fields");
      return;
    }

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "blog_categories_ids") {
        formDataObj.append(
          "blog_categories_ids",
          JSON.stringify(formData.blog_categories_ids.map(Number)),
        );
      } else {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      const res = await trigger({
        url: BLOG_LIST.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Blog created successfully");
        queryClient.invalidateQueries(["blog", null]);
        navigate("/blog-list"); // Change this to your actual blog list route
      } else {
        toast.error(res?.message || "Failed to create Blog");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  return (
    <div>
      <PageHeader
        icon={FilePlus}
        title="Add New Blog"
        description="Fill in the details to publish a new blog post."
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
              form="create-blog-form"
              className="px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Blog"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-blog-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Blog Title */}
            <div className="space-y-2">
              <Label htmlFor="blog_title" className="text-sm font-medium">
                Blog Title <Redstar />
              </Label>
              <Input
                id="blog_title"
                name="blog_title"
                type="text"
                placeholder="Enter blog title"
                value={formData.blog_title}
                onChange={handleInputChange}
                className={errors.blog_title ? "border-red-500" : ""}
              />
              {errors.blog_title && (
                <p className="text-sm text-red-500">{errors.blog_title}</p>
              )}
            </div>

            {/* Blog Slug */}
            <div className="space-y-2">
              <Label htmlFor="blog_slug" className="text-sm font-medium">
                Blog Slug <Redstar />
              </Label>
              <Input
                id="blog_slug"
                name="blog_slug"
                type="text"
                placeholder="e.g. how-to-start-coding"
                value={formData.blog_slug}
                onChange={handleInputChange}
                className={errors.blog_slug ? "border-red-500" : ""}
              />
              {errors.blog_slug && (
                <p className="text-sm text-red-500">{errors.blog_slug}</p>
              )}
            </div>

            {/* Blog Categories (Multi Select Native Fallback) */}
            {/* Blog Categories (Multi Select Native Fallback) */}
            {/* Blog Categories */}
            <div className="space-y-2">
              <Label>
                Categories <Redstar />
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {formData.blog_categories_ids.length > 0
                      ? `${formData.blog_categories_ids.length} Categories Selected`
                      : "Select Categories"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-80">
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={formData.blog_categories_ids.includes(
                            String(category.id),
                          )}
                          onCheckedChange={(checked) => {
                            const id = String(category.id);

                            setFormData((prev) => ({
                              ...prev,
                              blog_categories_ids: checked
                                ? [...prev.blog_categories_ids, id]
                                : prev.blog_categories_ids.filter(
                                    (item) => item !== id,
                                  ),
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              blog_categories_ids: "",
                            }));
                          }}
                        />

                        <Label
                          htmlFor={`category-${category.id}`}
                          className="cursor-pointer"
                        >
                          {category.category_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {errors.blog_categories_ids && (
                <p className="text-sm text-red-500">
                  {errors.blog_categories_ids}
                </p>
              )}

              {formData.blog_categories_ids.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.blog_categories_ids.map((id) => {
                    const category = categories.find(
                      (cat) => String(cat.id) === String(id),
                    );

                    return (
                      <span
                        key={id}
                        className="px-2 py-1 text-xs rounded-md bg-primary/10"
                      >
                        {category?.category_name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="blog_short_description"
                className="text-sm font-medium"
              >
                Short Description <Redstar />
              </Label>
              <Textarea
                id="blog_short_description"
                name="blog_short_description"
                placeholder="Enter a brief summary"
                value={formData.blog_short_description}
                onChange={handleInputChange}
                className={
                  errors.blog_short_description ? "border-red-500" : ""
                }
              />
              {errors.blog_short_description && (
                <p className="text-sm text-red-500">
                  {errors.blog_short_description}
                </p>
              )}
            </div>

            {/* Full Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="blog_description" className="text-sm font-medium">
                Full Description <Redstar />
              </Label>
              <Textarea
                id="blog_description"
                name="blog_description"
                placeholder="Enter full blog content"
                rows={8}
                value={formData.blog_description}
                onChange={handleInputChange}
                className={errors.blog_description ? "border-red-500" : ""}
              />
              {errors.blog_description && (
                <p className="text-sm text-red-500">
                  {errors.blog_description}
                </p>
              )}
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-4 md:col-span-2 border p-4 rounded-lg bg-gray-50/50">
              <h3 className="font-medium text-base">
                Blog Banner Image <Redstar />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="blog_banner_image"
                    className="text-sm font-medium"
                  >
                    Upload Banner Image
                  </Label>

                  <ImageUpload
                    id="blog_banner_image"
                    label=""
                    selectedFile={formData.blog_banner_image}
                    previewImage={preview.blog_banner_image}
                    onFileChange={(e) =>
                      handleImageChange(
                        "blog_banner_image",
                        e.target.files?.[0],
                      )
                    }
                    onRemove={() => handleRemoveImage("blog_banner_image")}
                    error={errors.blog_banner_image}
                    maxSize={5}
                  />

                  {errors.blog_banner_image && (
                    <p className="text-sm text-red-500">
                      {errors.blog_banner_image}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="blog_banner_image_alt"
                    className="text-sm font-medium"
                  >
                    Banner Image Alt Text <Redstar />
                  </Label>

                  <Input
                    id="blog_banner_image_alt"
                    name="blog_banner_image_alt"
                    type="text"
                    placeholder="Enter banner image alt text"
                    value={formData.blog_banner_image_alt}
                    onChange={handleInputChange}
                    className={
                      errors.blog_banner_image_alt ? "border-red-500" : ""
                    }
                  />

                  {errors.blog_banner_image_alt && (
                    <p className="text-sm text-red-500">
                      {errors.blog_banner_image_alt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Image Alt Text */}

            {/* Blog Meta Keywords */}
            <div className="space-y-2">
              <Label
                htmlFor="blog_meta_keywords"
                className="text-sm font-medium"
              >
                Meta Keywords
              </Label>
              <Input
                id="blog_meta_keywords"
                name="blog_meta_keywords"
                type="text"
                placeholder="tech, coding, react"
                value={formData.blog_meta_keywords}
                onChange={handleInputChange}
              />
            </div>

            {/* Blog Front */}
            <div className="space-y-2">
              <Label htmlFor="blog_front" className="text-sm font-medium">
                Blog Front Order (Number)
              </Label>
              <Input
                id="blog_front"
                name="blog_front"
                type="number"
                placeholder="Enter front order number"
                value={formData.blog_front}
                onChange={handleInputChange}
              />
            </div>

            {/* Blog Index Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Blog Index</Label>
              <Select
                value={formData.blog_index}
                onValueChange={(val) => handleSelectChange("blog_index", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blog Featured Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Featured</Label>
              <Select
                value={formData.blog_featured}
                onValueChange={(val) =>
                  handleSelectChange("blog_featured", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBlog;
