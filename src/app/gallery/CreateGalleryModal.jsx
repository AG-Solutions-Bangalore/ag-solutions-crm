import ImageUpload from "@/components/image-upload/image-upload";
import Modal from "@/components/modal/Modal";
import Redstar from "@/components/Redstar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GALLERY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CreateGalleryModal = ({ setOpenModal }) => {
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
    if (!formData.gallery_image) {
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
    formDataObj.append("gallery_sort", formData.gallery_sort || "0");
    formDataObj.append("gallery_status", formData.gallery_status);

    if (formData.gallery_image instanceof File) {
      formDataObj.append("gallery_image", formData.gallery_image);
    }

    try {
      const res = await trigger({
        url: GALLERY_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200 || res?.status === "success") {
        toast.success(res?.message || "Gallery image uploaded successfully");
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
        setOpenModal(false);
      } else {
        toast.error(res?.message || "Failed to upload gallery image");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong while uploading");
    }
  };

  return (
    <Modal
      open={true}
      onClose={() => setOpenModal(false)}
      title="Add Gallery Image"
      onSubmit={handleSubmit}
      submitText="Upload Image"
      isLoading={loading}
      maxWidthClass="sm:max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gallery_image" className="text-sm font-medium">
            Upload Image <Redstar />
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
      </div>
    </Modal>
  );
};

export default CreateGalleryModal;

