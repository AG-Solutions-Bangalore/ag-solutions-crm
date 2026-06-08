import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_API, SPONSAR_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/modal/Modal";
import ImageUpload from "@/components/image-upload/image-upload";

import { useNavigate } from "react-router-dom";
import Redstar from "@/components/Redstar";
// Import your new BaseModal

const SponsorModal = ({ setOpenEdit }) => {
  const queryClient = useQueryClient();
  const { trigger, loading } = useApiMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sponsors_image: "",
    sponsors_sort: "",
    sponsors_url: "",
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    sponsors_image: "",
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

    if (!formData.sponsors_image) {
      newErrors.sponsors_image = "Sonsar image is required";
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
    formDataObj.append("sponsors_sort", formData.sponsors_sort);
    formDataObj.append("sponsors_url", formData.sponsors_url);

    if (formData.sponsors_image instanceof File) {
      formDataObj.append("sponsors_image", formData.sponsors_image);
    }

    try {
      const res = await trigger({
        url: SPONSAR_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "SPONSAR created successfully");
        queryClient.invalidateQueries({ queryKey: ["sponsor"] });
        // Adjust the route as per your routing setup
        navigate("/Sponsar-list");
      } else {
        toast.error(res?.message || "Failed to create project");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  // Sync data whenever the Category prop changes

  // const handleUpdate = async () => {
  //   if (!formData.sponsors_image.trim()) {
  //     toast.error("Category name is required");
  //     return;
  //   }

  //   try {
  //     const response = await trigger({
  //       url: SPONSAR_API.create(),
  //       method: "POST",
  //       data: {
  //         category_name: formData.category_name,
  //         category_status: formData.category_status,
  //       },
  //     });

  //     queryClient.setQueryData(["category", null], (old) => {
  //       if (!old?.data?.data) return old;
  //       return {
  //         ...old,
  //         data: {
  //           ...old.data,
  //           data: old.data.data.map((item) =>
  //             item.id === Category.id
  //               ? {
  //                   ...item,
  //                   category_name: formData.category_name,
  //                   category_status: formData.category_status,
  //                 }
  //               : item,
  //           ),
  //         },
  //       };
  //     });

  //     toast.success(response?.message || "Category updated successfully");
  //     setOpenEdit(false);
  //   } catch (error) {
  //     toast.error("Failed to update category");
  //   }
  // };

  return (
    <Modal
      open={true}
      onClose={() => setOpenEdit(false)}
      title="Create Sponsar"
      onSubmit={handleSubmit}
      submitText="Create"
      isLoading={loading}
      maxWidthClass="sm:max-w-md"
    >
      {/* Custom fields specific only to this modal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sponsors_image" className="text-sm font-medium">
            Upload Image
          </Label>
          <ImageUpload
            id="sponsors_image"
            label=""
            selectedFile={formData.sponsors_image}
            previewImage={preview.sponsors_image}
            onFileChange={(e) =>
              handleImageChange("sponsors_image", e.target.files?.[0])
            }
            onRemove={() => handleRemoveImage("sponsors_image")}
            error={errors.sponsors_image}
            maxSize={5}
          />
          {errors.sponsors_image && (
            <p className="text-sm text-red-500 mt-1">{errors.sponsors_image}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="project_name" className="text-sm font-medium">
          Sponsar sort <Redstar />
        </Label>
        <Input
          id="sponsors_sort"
          name="sponsors_sort"
          type="text"
          placeholder="Enter project name"
          value={formData.sponsors_sort}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_name" className="text-sm font-medium">
          Sponsors Url <Redstar />
        </Label>
        <Input
          id="sponsors_url"
          name="sponsors_url"
          type="text"
          placeholder="Enter project name"
          value={formData.sponsors_url}
          onChange={handleInputChange}
        />
      </div>
    </Modal>
  );
};

export default SponsorModal;
