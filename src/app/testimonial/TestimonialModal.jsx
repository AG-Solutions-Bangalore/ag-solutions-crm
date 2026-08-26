import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TESTIMONIAL_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";
import { store } from "@/store/store";

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

const TestimonialModal = ({ setOpenModal, testimonialId, refetch }) => {
  const isEditMode = Boolean(testimonialId);
  const queryClient = useQueryClient();
  const { trigger: saveTestimonial, loading: isSubmitting } = useApiMutation();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    testimonial_for: "",
    testimonial_client_name: "",
    testimonial_description: "",
    testimonial_status: "Active",
  });

  // Fetch full Testimonial Details by ID if editing
  const {
    data: testimonialDetailRes,
    isLoading: isLoadingDetail,
  } = useGetApiMutation({
    url: testimonialId ? `${BASE_URL}${TESTIMONIAL_API.byId(testimonialId)}` : null,
    queryKey: ["testimonial-detail", testimonialId],
    enabled: Boolean(testimonialId),
  });

  // Fetch Page dropdown (same API used by project page dropdown)
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

  const initializedIdRef = useRef(null);

  useEffect(() => {
    if (testimonialId) {
      const detail =
        testimonialDetailRes?.data?.data ||
        testimonialDetailRes?.data ||
        null;

      if (detail) {
        const isNewTestimonial = initializedIdRef.current !== testimonialId;

        if (isNewTestimonial) {
          setFormData((prev) => ({
            ...prev,
            testimonial_for: detail.testimonial_for || "",
            testimonial_client_name: detail.testimonial_client_name || "",
            testimonial_description: detail.testimonial_description || "",
            testimonial_status: detail.testimonial_status || "Active",
          }));
          initializedIdRef.current = testimonialId;
        }
      }
    } else {
      initializedIdRef.current = null;
      setFormData({
        testimonial_for: "",
        testimonial_client_name: "",
        testimonial_description: "",
        testimonial_status: "Active",
      });
    }
  }, [testimonialId, testimonialDetailRes]);

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

    if (!formData.testimonial_for) {
      newErrors.testimonial_for = "Please select a page";
      isValid = false;
    }
    if (!formData.testimonial_client_name?.trim()) {
      newErrors.testimonial_client_name = "Client name is required";
      isValid = false;
    }
    if (!formData.testimonial_description?.trim()) {
      newErrors.testimonial_description = "Description is required";
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
    payload.append("testimonial_for", formData.testimonial_for);
    payload.append("testimonial_client_name", formData.testimonial_client_name.trim());
    payload.append("testimonial_description", formData.testimonial_description.trim());
    payload.append("testimonial_status", formData.testimonial_status || "Active");

    if (isEditMode) {
      payload.append("_method", "PUT");
    }

    try {
      const res = await saveTestimonial({
        url: isEditMode
          ? TESTIMONIAL_API.updateById(testimonialId)
          : TESTIMONIAL_API.create,
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
              ? "Testimonial updated successfully"
              : "Testimonial created successfully")
        );
        queryClient.invalidateQueries({ queryKey: ["testimonial"] });
        if (testimonialId) {
          queryClient.invalidateQueries({ queryKey: ["testimonial-detail", testimonialId] });
        }
        if (refetch) refetch();
        setOpenModal(false);
      } else {
        toast.error(
          res?.message ||
            (isEditMode
              ? "Failed to update testimonial"
              : "Failed to create testimonial")
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isEditMode
            ? "Failed to update testimonial"
            : "Failed to create testimonial")
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setOpenModal(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-between">
            <span>{isEditMode ? "Edit Testimonial" : "Add New Testimonial"}</span>
            {isLoadingDetail && (
              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading details...
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoadingDetail ? (
          <div className="py-12 flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testimonial_for" className="text-sm font-medium">
                  Testimonial For (Page) <Redstar />
                </Label>
                <select
                  id="testimonial_for"
                  name="testimonial_for"
                  value={formData.testimonial_for}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.testimonial_for ? "border-red-500" : ""}`}
                  disabled={isLoadingPages}
                >
                  <option value="">
                    {isLoadingPages ? "Loading pages..." : "Select a page"}
                  </option>
                  {pagesData &&
                    pagesData.map((pageItem) => (
                      <option
                        key={pageItem.page_url || pageItem.id}
                        value={pageItem.page_url}
                      >
                        {pageItem.page_name}
                      </option>
                    ))}
                  {formData.testimonial_for &&
                    pagesData &&
                    !pagesData.some((p) => p.page_url === formData.testimonial_for) && (
                      <option value={formData.testimonial_for}>
                        {formData.testimonial_for}
                      </option>
                    )}
                </select>
                {errors.testimonial_for && (
                  <p className="text-sm text-red-500">{errors.testimonial_for}</p>
                )}
              </div>

              {isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="testimonial_status" className="text-sm font-medium">
                    Status
                  </Label>
                  <select
                    id="testimonial_status"
                    name="testimonial_status"
                    value={formData.testimonial_status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial_client_name" className="text-sm font-medium">
                Client Name <Redstar />
              </Label>
              <Input
                id="testimonial_client_name"
                name="testimonial_client_name"
                value={formData.testimonial_client_name}
                onChange={handleInputChange}
                placeholder="Enter client name"
                className={errors.testimonial_client_name ? "border-red-500" : ""}
              />
              {errors.testimonial_client_name && (
                <p className="text-xs text-red-500">{errors.testimonial_client_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial_description" className="text-sm font-medium">
                Description <Redstar />
              </Label>
              <Textarea
                id="testimonial_description"
                name="testimonial_description"
                rows={5}
                value={formData.testimonial_description}
                onChange={handleInputChange}
                placeholder="Write the testimonial content..."
                className={errors.testimonial_description ? "border-red-500" : ""}
              />
              {errors.testimonial_description && (
                <p className="text-xs text-red-500">{errors.testimonial_description}</p>
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
            disabled={isSubmitting || isLoadingDetail}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Testimonial"
            ) : (
              "Create Testimonial"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialModal;
