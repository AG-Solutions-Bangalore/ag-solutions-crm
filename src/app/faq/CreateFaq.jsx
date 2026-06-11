import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FilePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
import Loader from "@/components/loader/loader";

const CreateFaq = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { trigger, loading } = useApiMutation();

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
  });

  const [subs, setSubs] = useState([
    { faq_sort: "1", faq_heading: "", faq_que: "", faq_ans: "" },
  ]);

  const [errors, setErrors] = useState({});

  const handleAddSub = () => {
    setSubs([
      ...subs,
      {
        faq_sort: String(subs.length + 1),
        faq_heading: "",
        faq_que: "",
        faq_ans: "",
      },
    ]);
  };

  const handleRemoveSub = (index) => {
    const newSubs = subs.filter((_, i) => i !== index);
    setSubs(newSubs);
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

    subs.forEach((sub, index) => {
      payload.append(`subs[${index}][faq_sort]`, sub.faq_sort);
      payload.append(`subs[${index}][faq_heading]`, sub.faq_heading);
      payload.append(`subs[${index}][faq_que]`, sub.faq_que);
      payload.append(`subs[${index}][faq_ans]`, sub.faq_ans);
      payload.append(`subs[${index}][faq_status]`, 1);
    });

    try {
      const res = await trigger({
        url: FAQ_API.create,
        method: "POST",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "FAQ created successfully");
        queryClient.invalidateQueries(["faq"]);
        navigate("/faq-list");
      } else {
        toast.error(res?.message || "Failed to create FAQ");
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
        title="Create FAQ"
        description="Add a new FAQ group with multiple questions and answers."
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
              form="create-faq-form"
              className="px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader />
                </>
              ) : (
                "Create FAQ"
              )}
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <form id="create-faq-form" onSubmit={handleSubmit}>
          {/* Main FAQ Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>FAQ Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
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
              <Card key={index} className="relative shadow-sm border-gray-200">
                <div className="absolute top-4 right-4">
                  {subs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveSub(index)}
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
                      <Label className="text-sm font-medium">
                        Heading <Redstar />
                      </Label>
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

export default CreateFaq;
