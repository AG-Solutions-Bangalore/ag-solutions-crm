import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

import BASE_URL from "@/config/base-url";
import { BLOG_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useApiMutation } from "@/hooks/useApiMutation";

import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import Loader from "@/components/loader/loader";

const UpdateBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trigger: updateBlog, loading } = useApiMutation();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/blog/${id}`,
    queryKey: ["blog", id],
  });

  const { data: categoriesResponse } = useGetApiMutation({
    url: `${BASE_URL}/category`,
    queryKey: ["category"],
  });

  // const { data: categoriesResponse } = useQuery({
  //   queryKey: ["active-categories"],
  //   queryFn: async () => {
  //     const token = store.getState().auth?.token;
  //     // You can replace CATEGORY_API.list with the exact endpoint to fetch active categories
  //     const res = await axios.get(
  //       `${BASE_URL}${CATEGORY_API.list || "/category"}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );
  //     return res.data;
  //   },
  // });
  const rawCategories = Array.isArray(categoriesResponse?.data?.data)
    ? categoriesResponse.data.data
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  const categories = rawCategories.filter(
    (item) => item.category_status === "Active" || !item.category_status
  );

  const [formData, setFormData] = useState({
    blog_slug: "",
    blog_index: "Yes",
    blog_meta_keywords: "",
    blog_title: "",
    blog_short_description: "",
    blog_description: "",
    blog_banner_image: null,
    blog_banner_image_alt: "",
    blog_updated_date: "",
    blog_front: "",
    blog_categories_ids: "",
    blog_featured: "No",
    blog_status: "Active",
  });
  const [preview, setPreview] = useState({
    blog_banner_image: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!data) return;

    const blog = data?.data?.data || data?.data;

    if (!blog) return;

    setFormData({
      blog_slug: blog.blog_slug || "",
      blog_index: blog.blog_index || "Yes",
      blog_meta_keywords: blog.blog_meta_keywords || "",
      blog_title: blog.blog_title || "",
      blog_short_description: blog.blog_short_description || "",
      blog_description: blog.blog_description || "",
      blog_banner_image: null,
      blog_banner_image_alt: blog.blog_banner_image_alt || "",
      blog_updated_date:
        blog.blog_updated_date || new Date().toISOString().split("T")[0],
      blog_categories_ids:
        blog.blog_categories_ids ||
        blog.blog_category_id ||
        (Array.isArray(blog.categories) ? blog.categories.map((c) => c.id).join(",") : "") ||
        "",
      blog_front: blog.blog_front || "",
      blog_featured: blog.blog_featured || "No",
      blog_status: blog.blog_status || "Active",
    });

    setPreview({
      blog_banner_image: blog.blog_banner_image
        ? `https://ag-solutions.in/webapi/public/assets/images/blog_images/${blog.blog_banner_image}`
        : "",
    });
  }, [data]);


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

  const handleImageChange = (fieldName, file) => {
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    const imageUrl = URL.createObjectURL(file);

    setPreview((prev) => ({
      ...prev,
      [fieldName]: imageUrl,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.blog_title) {
      newErrors.blog_title = "Blog title is required";
      isValid = false;
    }
    if (!formData.blog_slug) {
      newErrors.blog_slug = "Blog slug is required";
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

    const payload = new FormData();

    payload.append("blog_slug", formData.blog_slug);
    payload.append("blog_index", formData.blog_index);
    payload.append("blog_meta_keywords", formData.blog_meta_keywords);
    payload.append("blog_title", formData.blog_title);
    payload.append("blog_short_description", formData.blog_short_description);
    payload.append("blog_description", formData.blog_description);
    payload.append("blog_banner_image_alt", formData.blog_banner_image_alt);
    payload.append("blog_updated_date", formData.blog_updated_date);
    payload.append("blog_front", formData.blog_front);
    payload.append("blog_featured", formData.blog_featured);
    payload.append("blog_status", formData.blog_status);

    if (formData.blog_banner_image instanceof File) {
      payload.append("blog_banner_image", formData.blog_banner_image);
    }
    payload.append(
      "blog_categories_ids",
      formData.blog_categories_ids,
      // JSON.stringify(formData.blog_categories_ids.map(Number).join(",")),
    );
    try {
      const res = await updateBlog({
        url: BLOG_API.updateById(id),
        method: "post",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.message || "Blog updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["blog"],
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update blog");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill all the required fields");
  //     return;
  //   }

  //   const payload = new FormData();

  //   payload.append("blog_slug", formData.blog_slug);
  //   payload.append("blog_index", formData.blog_index);
  //   payload.append("blog_meta_keywords", formData.blog_meta_keywords);
  //   payload.append("blog_title", formData.blog_title);
  //   payload.append("blog_short_description", formData.blog_short_description);
  //   payload.append("blog_description", formData.blog_description);
  //   payload.append("blog_banner_image_alt", formData.blog_banner_image_alt);
  //   payload.append("blog_updated_date", formData.blog_updated_date);
  //   payload.append("blog_front", formData.blog_front);
  //   payload.append("blog_featured", formData.blog_featured);
  //   payload.append("blog_status", formData.blog_status);

  //   if (formData.blog_banner_image instanceof File) {
  //     payload.append("blog_banner_image", formData.blog_banner_image);
  //   }
  //   const response = await fetch(`https://api.example.com/blogs/${id}`, {
  //     method: "PUT",
  //     body: formData,
  //   });
  //   const data = await response.json();
  //   console.log(data);
  // };
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-6">Error loading blog</div>;
  }

  return (
    <div>
      <PageHeader
        icon={Edit}
        title="Update Blog"
        description="Update the details of the existing blog post."
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
              form="update-blog-form"
              className="px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Blog"
              )}
            </Button>
          </div>
        }
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="update-blog-form"
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
                      ? `${formData.blog_categories_ids.split(",").length} Categories Selected`
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
                          checked={formData.blog_categories_ids
                            .split(",")
                            .includes(String(category.id))}
                          onCheckedChange={(checked) => {
                            const id = String(category.id);

                            const ids = formData.blog_categories_ids
                              ? formData.blog_categories_ids.split(",")
                              : [];

                            const updated = checked
                              ? [...ids, id]
                              : ids.filter((item) => item !== id);

                            setFormData((prev) => ({
                              ...prev,
                              blog_categories_ids: updated.join(","),
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
                  {formData.blog_categories_ids.split(",").map((id) => {
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
            <div className="space-y-4 md:col-span-2 border border-border p-4 rounded-lg bg-card">
              <h3 className="font-medium text-base text-foreground">Blog Banner Image</h3>


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

            {/* Blog Status Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={formData.blog_status}
                onValueChange={(val) => handleSelectChange("blog_status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Updated Date */}
            <div className="space-y-2">
              <Label
                htmlFor="blog_updated_date"
                className="text-sm font-medium"
              >
                Updated Date
              </Label>
              <Input
                id="blog_updated_date"
                name="blog_updated_date"
                type="date"
                value={formData.blog_updated_date}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateBlog;
