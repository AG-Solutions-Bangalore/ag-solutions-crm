import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";

import { FAQ_API, PAGE_TWO_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import BASE_URL from "@/config/base-url";

import PageHeader from "@/components/common/page-header";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const UpdateFaq = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trigger, loading } = useApiMutation();

  // Fetch FAQ Details
  const {
    data: faqData,
    isLoading: faqLoading,
    refetch,
  } = useGetApiMutation({
    url: `${BASE_URL}${FAQ_API.byId(id)}`,
    queryKey: ["faq", id],
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

  const [subs, setSubs] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!faqData) return;

    // Handle nested data structure: API response might be { data: { ... } } or { data: { data: { ... } } }
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
          faq_heading: "",
          faq_que: "",
          faq_ans: "",
          faq_status: "Active",
        },
      ]);
    }
  }, [faqData]);

  const handleAddSub = () => {
    setSubs([
      ...subs,
      {
        faq_sort: String(subs.length + 1),
        faq_heading: "",
        faq_que: "",
        faq_ans: "",
        faq_status: "Active",
      },
    ]);
  };

  const handleRemoveSub = async (index, subId) => {
    if (subId) {
      if (
        window.confirm(
          "Are you sure you want to delete this specific question?",
        )
      ) {
        try {
          await trigger({
            url: FAQ_API.deleteSub(subId),
            method: "DELETE",
          });
          toast.success("Question deleted successfully");
          refetch(); // Refetch to get the latest subs from the server
        } catch (error) {
          toast.error("Failed to delete question");
        }
      }
    } else {
      // Just remove it locally if it hasn't been saved yet
      const newSubs = subs.filter((_, i) => i !== index);
      setSubs(newSubs);
    }
  };

  const handleSubChange = (index, field, value) => {
    const newSubs = [...subs];
    newSubs[index][field] = value;
    setSubs(newSubs);
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
        newErrors[`sub_${index}_faq_sort`] = "Required";
        isValid = false;
      }
      // if (!sub.faq_heading) {
      //   newErrors[`sub_${index}_faq_heading`] = "Required";
      //   isValid = false;
      // }
      if (!sub.faq_que) {
        newErrors[`sub_${index}_faq_que`] = "Required";
        isValid = false;
      }
      if (!sub.faq_ans) {
        newErrors[`sub_${index}_faq_ans`] = "Required";
        isValid = false;
      }
    });

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
    payload.append("faq_for", formData.faq_for);
    payload.append("faq_status", formData.faq_status);

    subs.forEach((sub, index) => {
      if (sub.id) payload.append(`subs[${index}][id]`, sub.id);
      payload.append(`subs[${index}][faq_sort]`, sub.faq_sort);
      payload.append(`subs[${index}][faq_heading]`, sub.faq_heading);
      payload.append(`subs[${index}][faq_que]`, sub.faq_que);
      payload.append(`subs[${index}][faq_ans]`, sub.faq_ans);

      const subStatus =
        sub.faq_status === "Active" ||
        sub.faq_status === 1 ||
        sub.faq_status === "1"
          ? 1
          : 0;
      payload.append(`subs[${index}][faq_status]`, subStatus);
    });

    try {
      const res = await trigger({
        url: FAQ_API.updateById(id),
        method: "POST", // The backend expects POST with ?_method=PUT which is configured in API Constants
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200 || res?.status === "success") {
        toast.success(res?.message || "FAQ updated successfully");
        navigate("/faq-list");
      } else {
        toast.error(res?.message || "Failed to update FAQ");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  if (faqLoading) {
    return <div className="p-6">Loading FAQ...</div>;
  }

  return (
    <div>
      <PageHeader
        icon={Edit}
        title="Update FAQ"
        description="Edit the FAQ group and manage questions and answers."
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
              form="update-faq-form"
              className="px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update FAQ"
              )}
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <form id="update-faq-form" onSubmit={handleSubmit}>
          {/* Main FAQ Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>FAQ Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  FAQ For (Page) <Redstar />
                </Label>
                <Select
                  value={formData.faq_for}
                  onValueChange={(val) => {
                    setFormData({ ...formData, faq_for: val });
                    setErrors({ ...errors, faq_for: "" });
                  }}
                  disabled={pageTwoLoading}
                >
                  <SelectTrigger
                    className={errors.faq_for ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select Page..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTwoOptions.map((page) => (
                      <SelectItem
                        key={page.page_two_url}
                        value={String(page.page_two_url)}
                      >
                        {page.page_two_name || `Page ${page.page_two_url}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faq_for && (
                  <p className="text-sm text-red-500">{errors.faq_for}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.faq_status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, faq_status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items (Subs) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions & Answers</h3>
              <Button
                type="button"
                onClick={handleAddSub}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>

            {subs.map((sub, index) => (
              <Card
                key={sub.id || `new-${index}`}
                className="relative shadow-sm border-gray-200"
              >
                <div className="absolute top-4 right-4">
                  {subs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveSub(index, sub.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sort */}
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-sm font-medium">
                        Sort Order <Redstar />
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={sub.faq_sort}
                        onChange={(e) =>
                          handleSubChange(index, "faq_sort", e.target.value)
                        }
                        className={
                          errors[`sub_${index}_faq_sort`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>

                    {/* Heading */}
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-sm font-medium">Heading</Label>
                      <Input
                        type="text"
                        placeholder="Enter heading..."
                        value={sub.faq_heading}
                        onChange={(e) =>
                          handleSubChange(index, "faq_heading", e.target.value)
                        }
                        className={
                          errors[`sub_${index}_faq_heading`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>

                    {/* Question */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium">
                        Question <Redstar />
                      </Label>
                      <Input
                        type="text"
                        placeholder="Enter question..."
                        value={sub.faq_que}
                        onChange={(e) =>
                          handleSubChange(index, "faq_que", e.target.value)
                        }
                        className={
                          errors[`sub_${index}_faq_que`] ? "border-red-500" : ""
                        }
                      />
                    </div>

                    {/* Answer */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium">
                        Answer <Redstar />
                      </Label>
                      <Textarea
                        rows={4}
                        placeholder="Enter answer..."
                        value={sub.faq_ans}
                        onChange={(e) =>
                          handleSubChange(index, "faq_ans", e.target.value)
                        }
                        className={
                          errors[`sub_${index}_faq_ans`] ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFaq;
