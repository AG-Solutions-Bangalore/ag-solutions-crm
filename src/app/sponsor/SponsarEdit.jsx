import ImageUpload from "@/components/image-upload/image-upload";
import Modal from "@/components/modal/Modal";
import Redstar from "@/components/Redstar";
import { Input } from "@/components/ui/input";
import { SPONSAR_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const SponsarEdit = ({ setOpenEdit, selectedSponsar, sponsorsBaseUrl }) => {
  console.log(selectedSponsar);
  const { trigger, loading } = useApiMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sponsors_sort: selectedSponsar?.sponsors_sort || "",
    sponsors_url: selectedSponsar?.sponsors_url || "",
    sponsors_image: selectedSponsar?.sponsors_image || "",
    sponsors_status: selectedSponsar?.sponsors_status || "Active",
  });
  useEffect(() => {
    if (selectedSponsar) {
      setFormData({
        sponsors_sort: selectedSponsar.sponsors_sort || "",
        sponsors_url: selectedSponsar.sponsors_url || "",
        sponsors_image: selectedSponsar.sponsors_image || "",
        sponsors_status: selectedSponsar.sponsors_status || "Active",
      });
      setPreview({
        sponsors_image: selectedSponsar.sponsors_image
          ? `${sponsorsBaseUrl}${selectedSponsar.sponsors_image}`
          : "",
      });
    }
  }, [selectedSponsar, sponsorsBaseUrl]);
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

    if (!formData.sponsors_image && !formData.sponsors_url) {
      newErrors.sponsors_url = "URL is required";
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
    formDataObj.append("sponsors_status", formData.sponsors_status);
    if (formData.sponsors_image instanceof File) {
      formDataObj.append("sponsors_image", formData.sponsors_image);
    }
    formDataObj.append("_method", "PUT");

    try {
      const res = await trigger({
        url: SPONSAR_API.updateById(selectedSponsar.id),
        method: "POST",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Sponsor updated successfully");
        queryClient.invalidateQueries({ queryKey: ["sponsor"] });
        setOpenEdit(false);
      } else {
        toast.error(res?.message || "Failed to update sponsor");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  return (
    <div>
      <Modal
        open={true}
        onClose={() => setOpenEdit(false)}
        title="Edit Sponsor"
        onSubmit={handleSubmit}
        submitText="Update"
        isLoading={loading}
        maxWidthClass="sm:max-w-md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsors_image" className="text-sm font-medium">
              Sponsor Logo
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
              <p className="text-sm text-red-500 mt-1">
                {errors.sponsors_image}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsors_sort" className="text-sm font-medium">
              Sort Order
            </Label>
            <Input
              id="sponsors_sort"
              name="sponsors_sort"
              type="number"
              placeholder="Enter sort order (e.g. 1)"
              value={formData.sponsors_sort}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsors_url" className="text-sm font-medium">
              Sponsor Website URL <Redstar />
            </Label>
            <Input
              id="sponsors_url"
              name="sponsors_url"
              type="text"
              placeholder="e.g. https://example.com"
              value={formData.sponsors_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.sponsors_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sponsors_status: e.target.value,
                })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SponsarEdit;

