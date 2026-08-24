import ImageUpload from "@/components/image-upload/image-upload";
import Modal from "@/components/modal/Modal";
import Redstar from "@/components/Redstar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GALLERY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const GalleryModal = ({ setOpenModal, galleryItem, galleryBaseUrl, refetch }) => {
  const isEditMode = Boolean(galleryItem?.id);
  const { trigger, loading } = useApiMutation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    gallery_name: "",
    gallery_sort: "",
    gallery_status: "Active",
    gallery_image: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    gallery_image: "",
  });

  useEffect(() => {
    if (galleryItem) {
      setFormData({
        gallery_name:
          galleryItem.gallery_name ||
          galleryItem.link_gallery_name ||
          galleryItem.gallery_title ||
          "",
        gallery_sort:
          galleryItem.gallery_sort ??
          galleryItem.link_gallery_sort ??
          "0",
        gallery_status:
          galleryItem.gallery_status ||
          galleryItem.link_gallery_status ||
          "Active",
        gallery_image: null,
      });

      const existingImg =
        galleryItem.gallery_image ||
        galleryItem.link_gallery_image ||
        galleryItem.image;

      if (existingImg) {
        const fullUrl = existingImg.startsWith("http")
          ? existingImg
          : `${galleryBaseUrl || "https://ag-solutions.in/webapi/public/assets/images/gallery_images/"}${existingImg}`;
        setPreview({ gallery_image: fullUrl });
      }
    } else {
      setFormData({
        gallery_name: "",
        gallery_sort: "",
        gallery_status: "Active",
        gallery_image: null,
      });
      setPreview({ gallery_image: "" });
    }
  }, [galleryItem, galleryBaseUrl]);

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

    if (!formData.gallery_name.trim()) {
      newErrors.gallery_name = "Gallery title is required";
      isValid = false;
    }
    if (!isEditMode && !formData.gallery_image) {
      newErrors.gallery_image = "Image is required";
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
      toast.error("Please fill all required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("gallery_name", formData.gallery_name);
    formDataObj.append("gallery_title", formData.gallery_name);
    formDataObj.append("link_gallery_name", formData.gallery_name);
    formDataObj.append("gallery_sort", formData.gallery_sort || "0");
    formDataObj.append("gallery_status", formData.gallery_status);
    formDataObj.append("link_gallery_status", formData.gallery_status);

    if (isEditMode) {
      formDataObj.append("_method", "PUT");
    }

    if (formData.gallery_image instanceof File) {
      formDataObj.append("gallery_image", formData.gallery_image);
      formDataObj.append("link_gallery_image", formData.gallery_image);
    }

    try {
      const res = await trigger({
        url: isEditMode
          ? GALLERY_API.updateById(galleryItem.id)
          : GALLERY_API.create,
        method: "POST",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200 || res?.status === "success") {
        toast.success(
          res?.message ||
            (isEditMode
              ? "Gallery image updated successfully"
              : "Gallery image uploaded successfully")
        );
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
        if (refetch) refetch();
        setOpenModal(false);
      } else {
        toast.error(
          res?.message ||
            (isEditMode
              ? "Failed to update gallery image"
              : "Failed to upload gallery image")
        );
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong while saving");
    }
  };

  return (
    <Modal
      open={true}
      onClose={() => setOpenModal(false)}
      title={isEditMode ? "Edit Gallery Image" : "Add Gallery Image"}
      onSubmit={handleSubmit}
      submitText={isEditMode ? "Update Image" : "Upload Image"}
      isLoading={loading}
      maxWidthClass="sm:max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gallery_image" className="text-sm font-medium">
            Upload Image {!isEditMode && <Redstar />}
          </Label>
          <ImageUpload
            id="gallery_image"
            label=""
            selectedFile={formData.gallery_image}
            previewImage={preview.gallery_image}
            onFileChange={(e) =>
              handleImageChange("gallery_image", e.target.files?.[0])
            }
            onRemove={() => handleRemoveImage("gallery_image")}
            error={errors.gallery_image}
            maxSize={5}
          />
          {errors.gallery_image && (
            <p className="text-sm text-red-500 mt-1">{errors.gallery_image}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery_name" className="text-sm font-medium">
            Gallery Title / Name <Redstar />
          </Label>
          <Input
            id="gallery_name"
            name="gallery_name"
            type="text"
            placeholder="e.g. Annual Summit 2026"
            value={formData.gallery_name}
            onChange={handleInputChange}
            className={errors.gallery_name ? "border-red-500" : ""}
          />
          {errors.gallery_name && (
            <p className="text-sm text-red-500">{errors.gallery_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery_sort" className="text-sm font-medium">
            Sort Order
          </Label>
          <Input
            id="gallery_sort"
            name="gallery_sort"
            type="number"
            placeholder="e.g. 1"
            value={formData.gallery_sort}
            onChange={handleInputChange}
          />
        </div>

        {isEditMode && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.gallery_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gallery_status: e.target.value,
                })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GalleryModal;


