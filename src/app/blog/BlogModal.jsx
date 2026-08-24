import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BLOG_LIST, BLOG_API, CATEGORY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/loader/loader";
import { CKEditor } from "ckeditor4-react";
import ImageCell from "@/components/common/ImageCell";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";

const BlogModal = ({ setOpenModal, blogId, blogItem, refetch }) => {
  const editorInstanceRef = useRef(null);
  const effectiveBlogId = blogId || blogItem?.id;
  const isEditMode = Boolean(effectiveBlogId);
  const queryClient = useQueryClient();
  const { trigger: saveBlog, loading: isSubmitting } = useApiMutation();

  // Fetch Blog Details if editing
  const {
    data: blogData,
    isLoading: blogLoading,
  } = useGetApiMutation({
    url: effectiveBlogId ? `${BASE_URL}/blog/${effectiveBlogId}` : null,
    queryKey: ["blog-detail", effectiveBlogId],
    enabled: Boolean(effectiveBlogId),
  });

  // Fetch Categories Dropdown
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetApiMutation({
    url: `${BASE_URL}/category`,
    queryKey: ["category-dropdown"],
  });

  const categories = Array.isArray(categoriesResponse?.data?.data)
    ? categoriesResponse.data.data
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  const [formData, setFormData] = useState({
    blog_title: blogItem?.blog_title || "",
    blog_slug: blogItem?.blog_slug || "",
    blog_categories_ids: String(
      blogItem?.blog_categories_ids ||
      blogItem?.blog_category_id ||
      (Array.isArray(blogItem?.categories) ? blogItem.categories.map((c) => c.id || c).join(",") : "") ||
      ""
    ),
    blog_short_description: blogItem?.blog_short_description || "",
    blog_description: blogItem?.blog_description || "",
    blog_banner_image: null,
    blog_banner_image_alt: blogItem?.blog_banner_image_alt || blogItem?.blog_title || "",
    blog_status: blogItem?.blog_status || "Active",
    blog_featured: blogItem?.blog_featured || "No",
    blog_index: blogItem?.blog_index || "Yes",
    blog_meta_keywords: blogItem?.blog_meta_keywords || "",
    blog_front: blogItem?.blog_front || "",
    blog_created_date: blogItem?.blog_created_date || new Date().toISOString().split("T")[0],
    blog_updated_date: new Date().toISOString().split("T")[0],
  });

  const [existingImage, setExistingImage] = useState(blogItem?.blog_banner_image || "");
  const [errors, setErrors] = useState({});

  const populateFromBlog = (blog) => {
    if (!blog) return;
    const catIds =
      blog.blog_categories_ids ||
      blog.blog_category_id ||
      (Array.isArray(blog.categories) ? blog.categories.map((c) => c.id || c).join(",") : "") ||
      "";

    setFormData((prev) => ({
      ...prev,
      blog_title: blog.blog_title || prev.blog_title || "",
      blog_slug: blog.blog_slug || prev.blog_slug || "",
      blog_categories_ids: String(catIds || prev.blog_categories_ids || ""),
      blog_short_description: blog.blog_short_description || prev.blog_short_description || "",
      blog_description: blog.blog_description || prev.blog_description || "",
      blog_banner_image_alt: blog.blog_banner_image_alt || prev.blog_banner_image_alt || "",
      blog_status: blog.blog_status || prev.blog_status || "Active",
      blog_featured: blog.blog_featured || prev.blog_featured || "No",
      blog_index: blog.blog_index || prev.blog_index || "Yes",
      blog_meta_keywords: blog.blog_meta_keywords || prev.blog_meta_keywords || "",
      blog_front: blog.blog_front || prev.blog_front || "",
      blog_created_date: blog.blog_created_date || prev.blog_created_date || new Date().toISOString().split("T")[0],
      blog_updated_date: new Date().toISOString().split("T")[0],
    }));

    if (blog.blog_banner_image) {
      setExistingImage(blog.blog_banner_image);
    }

    if (blog.blog_description && editorInstanceRef.current) {
      editorInstanceRef.current.setData(blog.blog_description);
    }
  };

  useEffect(() => {
    if (blogItem) {
      populateFromBlog(blogItem);
    }
  }, [blogItem]);

  useEffect(() => {
    if (blogData) {
      const blog = blogData?.data?.data || blogData?.data || blogData?.blog;
      if (blog) {
        populateFromBlog(blog);
      }
    }
  }, [blogData]);

  useEffect(() => {
    if (editorInstanceRef.current && formData.blog_description) {
      try {
        if (editorInstanceRef.current.getData() !== formData.blog_description) {
          editorInstanceRef.current.setData(formData.blog_description);
        }
      } catch (err) {
        console.error("Failed to sync editor data", err);
      }
    }
  }, [formData.blog_description]);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "blog_title" && !isEditMode) {
        updated.blog_slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.blog_title.trim()) {
      newErrors.blog_title = "Blog title is required";
      isValid = false;
    }
    if (!formData.blog_slug.trim()) {
      newErrors.blog_slug = "Slug is required";
      isValid = false;
    }
    if (!formData.blog_short_description.trim()) {
      newErrors.blog_short_description = "Short description is required";
      isValid = false;
    }
    if (!formData.blog_description.trim()) {
      newErrors.blog_description = "Description content is required";
      isValid = false;
    }
    if (!formData.blog_banner_image_alt?.trim()) {
      newErrors.blog_banner_image_alt = "Image alt text is required";
      isValid = false;
    }
    if (!isEditMode && !formData.blog_banner_image) {
      newErrors.blog_banner_image = "Banner image is required";
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = new FormData();
    payload.append("blog_title", formData.blog_title);
    payload.append("blog_slug", formData.blog_slug);
    payload.append("blog_categories_ids", formData.blog_categories_ids || "");
    payload.append("blog_short_description", formData.blog_short_description);
    payload.append("blog_description", formData.blog_description);
    payload.append("blog_banner_image_alt", formData.blog_banner_image_alt || formData.blog_title);
    payload.append("blog_status", formData.blog_status || "Active");
    payload.append("blog_featured", formData.blog_featured || "No");
    payload.append("blog_index", formData.blog_index || "Yes");
    payload.append("blog_meta_keywords", formData.blog_meta_keywords || "");

    if (isEditMode) {
      payload.append("blog_updated_date", formData.blog_updated_date);
      payload.append("_method", "PUT");
    } else {
      payload.append("blog_created_date", formData.blog_created_date);
    }

    if (formData.blog_banner_image instanceof File) {
      payload.append("blog_banner_image", formData.blog_banner_image);
    }

    try {
      const res = await saveBlog({
        url: isEditMode ? BLOG_API.updateById(blogId) : BLOG_LIST.create,
        method: "POST",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === "success") {
        toast.success(
          res?.message ||
            (isEditMode
              ? "Blog article updated successfully"
              : "Blog article created successfully")
        );
        queryClient.invalidateQueries({ queryKey: ["blog"] });
        if (refetch) refetch();
        setOpenModal(false);
      } else {
        toast.error(
          res?.message ||
            (isEditMode ? "Failed to update blog" : "Failed to create blog")
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isEditMode ? "Failed to update blog" : "Failed to create blog")
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setOpenModal(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {isEditMode ? "Edit Blog Article" : "Create Blog Article"}
          </DialogTitle>
        </DialogHeader>

        {blogLoading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">
                Article Title <Redstar />
              </Label>
              <Input
                name="blog_title"
                value={formData.blog_title}
                onChange={handleInputChange}
                placeholder="Enter compelling article title"
                className={errors.blog_title ? "border-red-500" : ""}
              />
              {errors.blog_title && (
                <p className="text-xs text-red-500">{errors.blog_title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Slug <Redstar />
              </Label>
              <Input
                name="blog_slug"
                value={formData.blog_slug}
                onChange={handleInputChange}
                placeholder="article-slug-url"
                className={errors.blog_slug ? "border-red-500" : ""}
              />
              {errors.blog_slug && (
                <p className="text-xs text-red-500">{errors.blog_slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <select
                name="blog_categories_ids"
                value={formData.blog_categories_ids}
                onChange={handleInputChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={categoriesLoading}
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.category_name} value={cat.id || cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">
                Short Summary <Redstar />
              </Label>
              <Textarea
                rows={2}
                name="blog_short_description"
                value={formData.blog_short_description}
                onChange={handleInputChange}
                placeholder="Brief summary displayed on blog listings..."
                className={errors.blog_short_description ? "border-red-500" : ""}
              />
              {errors.blog_short_description && (
                <p className="text-xs text-red-500">{errors.blog_short_description}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">
                Full Article Content <Redstar />
              </Label>
              <div className="rounded-lg overflow-hidden border border-input focus-within:ring-2 focus-within:ring-ring text-black">
                <CKEditor
                  key={`blog-content-editor-${effectiveBlogId || "new"}`}
                  initData={formData.blog_description}
                  data={formData.blog_description}
                  onInstanceReady={(evt) => {
                    editorInstanceRef.current = evt.editor;
                    const desc =
                      formData.blog_description ||
                      blogData?.data?.data?.blog_description ||
                      blogData?.data?.blog_description ||
                      blogItem?.blog_description ||
                      "";
                    if (desc) {
                      evt.editor.setData(desc);
                    }
                  }}

                  onChange={(e) => {

                    const editorData = e.editor.getData();
                    setFormData((prev) => ({
                      ...prev,
                      blog_description: editorData,
                    }));
                    if (errors.blog_description) {
                      setErrors((prev) => ({
                        ...prev,
                        blog_description: "",
                      }));
                    }
                  }}
                  config={{
                    versionCheck: false,
                    toolbar: [
                      {
                        name: "basicstyles",
                        items: ["Bold", "Italic", "Strike"],
                      },
                      {
                        name: "paragraph",
                        items: [
                          "NumberedList",
                          "BulletedList",
                          "-",
                          "Outdent",
                          "Indent",
                        ],
                      },
                      { name: "links", items: ["Link", "Unlink"] },
                      { name: "insert", items: ["Image", "Table"] },
                      { name: "styles", items: ["Styles", "Format"] },
                      { name: "tools", items: ["Maximize"] },
                    ],
                    height: 220,
                  }}
                />
              </div>

              {errors.blog_description && (
                <p className="text-xs text-red-500">{errors.blog_description}</p>
              )}
            </div>


            {isEditMode && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <select
                  name="blog_status"
                  value={formData.blog_status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Blog Index</Label>
              <select
                name="blog_index"
                value={formData.blog_index}
                onChange={handleInputChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>


            <div className="space-y-2">
              <Label className="text-sm font-medium">Featured Article?</Label>
              <select
                name="blog_featured"
                value={formData.blog_featured}
                onChange={handleInputChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="No">No</option>
                <option value="Yes">Yes (Featured on Home)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Meta Keywords</Label>
              <Input
                name="blog_meta_keywords"
                value={formData.blog_meta_keywords}
                onChange={handleInputChange}
                placeholder="e.g. react, web development, mobile apps"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">
                Image Alt Text <Redstar />
              </Label>
              <Input
                name="blog_banner_image_alt"
                value={formData.blog_banner_image_alt}
                onChange={handleInputChange}
                placeholder="SEO alt text for banner image"
                className={errors.blog_banner_image_alt ? "border-red-500" : ""}
              />
              {errors.blog_banner_image_alt && (
                <p className="text-xs text-red-500">{errors.blog_banner_image_alt}</p>
              )}
            </div>



            <div className="space-y-2 md:col-span-2 border border-border p-4 rounded-lg bg-muted/20">
              <Label className="text-sm font-medium block mb-2">
                Banner Image {!isEditMode && <Redstar />}
              </Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {existingImage && (
                  <ImageCell
                    src={
                      existingImage.startsWith("http")
                        ? existingImage
                        : `${getImageBaseUrl(blogData?.image_url, "Blog")}${existingImage}`
                    }
                    fallback={getNoImageUrl(blogData?.image_url)}
                    alt="Current Banner"
                    width={96}
                    height={56}
                    className="w-24 h-14 object-cover rounded-md border border-border shadow-2xs shrink-0"
                  />
                )}
                <Input
                  type="file"
                  className="flex-1"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      blog_banner_image: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>

              {errors.blog_banner_image && (
                <p className="text-xs text-red-500 mt-1">{errors.blog_banner_image}</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpenModal(false)}
            type="button"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || blogLoading}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Blog"
            ) : (
              "Create Blog"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogModal;
