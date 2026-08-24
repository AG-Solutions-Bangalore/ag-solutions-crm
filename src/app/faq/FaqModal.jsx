import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { FAQ_API, PAGE_TWO_API } from "@/constants/apiConstants";
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

const FaqModal = ({ setOpenModal, faqId, refetch }) => {
  const isEditMode = Boolean(faqId);
  const queryClient = useQueryClient();
  const { trigger: saveFaq, loading: isSubmitting } = useApiMutation();
  const { trigger: deleteSubTrigger } = useApiMutation();

  // Fetch FAQ Details if editing
  const {
    data: faqData,
    isLoading: faqLoading,
  } = useGetApiMutation({
    url: faqId ? `${BASE_URL}${FAQ_API.byId(faqId)}` : null,
    queryKey: ["faq-detail", faqId],
    enabled: Boolean(faqId),
  });

  // Fetch FAQ For (Page Two Dropdown)
  const { data: pageTwoData, isLoading: pageTwoLoading } = useGetApiMutation({
    url: `${BASE_URL}${PAGE_TWO_API.dropdown}`,
    queryKey: ["page-two-dropdown"],
  });

  const pageTwoOptions = Array.isArray(pageTwoData?.data)
    ? pageTwoData.data
    : pageTwoData?.data?.data || [];

  const [formData, setFormData] = useState({
    faq_for: "",
    faq_status: "Active",
  });

  const [subs, setSubs] = useState([
    { faq_sort: "1", faq_heading: "", faq_que: "", faq_ans: "", faq_status: "Active" },
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode || !faqData) return;

    const faq = faqData?.data?.data || faqData?.data;
    if (!faq) return;

    setFormData({
      faq_for: String(faq.faq_for || ""),
      faq_status: faq.faq_status || "Active",
    });

    if (faq.subs && Array.isArray(faq.subs) && faq.subs.length > 0) {
      setSubs(faq.subs);
    } else {
      setSubs([
        {
          faq_sort: "1",
          faq_heading: faq.faq_heading || "",
          faq_que: faq.faq_question || faq.faq_que || "",
          faq_ans: faq.faq_answer || faq.faq_ans || "",
          faq_status: faq.faq_status || "Active",
        },
      ]);
    }
  }, [faqData, isEditMode]);

  const handleAddSub = () => {
    setSubs((prev) => [
      ...prev,
      {
        faq_sort: String(prev.length + 1),
        faq_heading: "",
        faq_que: "",
        faq_ans: "",
        faq_status: "Active",
      },
    ]);
  };

  const handleRemoveSub = async (index, subId) => {
    if (subId && isEditMode) {
      try {
        await deleteSubTrigger({
          url: `${BASE_URL}/faq-sub/${subId}`,
          method: "DELETE",
        });
        toast.success("Question deleted");
      } catch {
        toast.error("Failed to delete question");
        return;
      }
    }
    setSubs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubChange = (index, field, value) => {
    setSubs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.faq_for) {
      newErrors.faq_for = "Please select FAQ For";
      isValid = false;
    }

    if (subs.length === 0) {
      toast.error("Please add at least one FAQ item");
      return false;
    }

    subs.forEach((sub, index) => {
      if (!sub.faq_sort) {
        newErrors[`sub_${index}_faq_sort`] = "Sort is required";
        isValid = false;
      }
      if (!sub.faq_que?.trim()) {
        newErrors[`sub_${index}_faq_que`] = "Question is required";
        isValid = false;
      }
      if (!sub.faq_ans?.trim()) {
        newErrors[`sub_${index}_faq_ans`] = "Answer is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = new FormData();
    payload.append("faq_for", formData.faq_for);
    payload.append("faq_status", formData.faq_status || "Active");

    subs.forEach((sub, index) => {
      if (sub.id) payload.append(`subs[${index}][id]`, sub.id);
      payload.append(`subs[${index}][faq_sort]`, sub.faq_sort || "1");
      payload.append(`subs[${index}][faq_heading]`, sub.faq_heading || "");
      payload.append(`subs[${index}][faq_que]`, sub.faq_que || "");
      payload.append(`subs[${index}][faq_ans]`, sub.faq_ans || "");
      payload.append(
        `subs[${index}][faq_status]`,
        sub.faq_status === "Inactive" ? 0 : 1
      );
    });

    if (isEditMode) {
      payload.append("_method", "PUT");
    }

    try {
      const res = await saveFaq({
        url: isEditMode ? FAQ_API.updateById(faqId) : FAQ_API.create,
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
              ? "FAQ updated successfully"
              : "FAQ created successfully")
        );
        queryClient.invalidateQueries({ queryKey: ["faq"] });
        if (refetch) refetch();
        setOpenModal(false);
      } else {
        toast.error(
          res?.message ||
            (isEditMode ? "Failed to update FAQ" : "Failed to create FAQ")
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isEditMode ? "Failed to update FAQ" : "Failed to create FAQ")
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setOpenModal(false)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {isEditMode ? "Edit FAQ" : "Add New FAQ"}
          </DialogTitle>
        </DialogHeader>

        {faqLoading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  FAQ For (Page) <Redstar />
                </Label>
                <select
                  value={formData.faq_for}
                  onChange={(e) => {
                    setFormData({ ...formData, faq_for: e.target.value });
                    setErrors({ ...errors, faq_for: "" });
                  }}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.faq_for ? "border-red-500" : ""}`}
                  disabled={pageTwoLoading}
                >
                  <option value="">
                    {pageTwoLoading ? "Loading pages..." : "Select Page..."}
                  </option>
                  {pageTwoOptions.map((page) => (
                    <option
                      key={page.page_two_url}
                      value={String(page.page_two_url)}
                    >
                      {page.page_two_name || `Page ${page.page_two_url}`}
                    </option>
                  ))}
                </select>
                {errors.faq_for && (
                  <p className="text-sm text-red-500">{errors.faq_for}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <select
                  value={formData.faq_status}
                  onChange={(e) =>
                    setFormData({ ...formData, faq_status: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Sub Questions & Answers */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Questions & Answers
                </h3>
                <Button
                  type="button"
                  onClick={handleAddSub}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </Button>
              </div>

              {subs.map((sub, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border border-border bg-card/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Item #{index + 1}
                    </span>
                    {subs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSub(index, sub.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1 md:col-span-1">
                      <Label className="text-xs font-medium">Sort Order <Redstar /></Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={sub.faq_sort}
                        onChange={(e) =>
                          handleSubChange(index, "faq_sort", e.target.value)
                        }
                        className={`h-9 text-xs ${errors[`sub_${index}_faq_sort`] ? "border-red-500" : ""}`}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label className="text-xs font-medium">Question <Redstar /></Label>
                      <Input
                        placeholder="e.g. How does the onboarding process work?"
                        value={sub.faq_que}
                        onChange={(e) =>
                          handleSubChange(index, "faq_que", e.target.value)
                        }
                        className={`h-9 text-xs ${errors[`sub_${index}_faq_que`] ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Answer <Redstar /></Label>
                    <Textarea
                      rows={3}
                      placeholder="Write clear, comprehensive answer..."
                      value={sub.faq_ans}
                      onChange={(e) =>
                        handleSubChange(index, "faq_ans", e.target.value)
                      }
                      className={`text-xs ${errors[`sub_${index}_faq_ans`] ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
              ))}
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
            disabled={isSubmitting || faqLoading}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update FAQ"
            ) : (
              "Create FAQ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaqModal;
