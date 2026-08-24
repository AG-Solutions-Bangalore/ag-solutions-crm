import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_API, PROJECT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { store } from "@/store/store";
import BASE_URL from "@/config/base-url";

const CreateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { trigger, loading: isSubmitting } = useApiMutation();

  // Fetch pages for the dropdown using the provided API endpoint and Bearer Token

  const [categoryName, setCategoryName] = useState("");

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryName(e.target.value);
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
    if (!categoryName.trim()) {
      newErrors.category_name = "Category name is required";
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
    const formDataObj = new FormData();
    formDataObj.append("category_name", categoryName.trim());
    try {
      const res = await trigger({
        url: CATEGORY_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Category created successfully");
        queryClient.invalidateQueries({ queryKey: ["category"] });
        navigate("/Category-list");
      } else {
        toast.error(res?.message || "Failed to create Category");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={FolderPlus}
        title="Add New Category"
        description="Fill in the details to register a new category in the system."
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
              form="create-category-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-category-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <Label htmlFor="category_name" className="text-sm font-medium">
                Category Name <Redstar />
              </Label>
              <Input
                id="category_name"
                name="category_name"
                type="text"
                placeholder="Enter Category name"
                value={categoryName}
                onChange={handleInputChange}
                className={errors.category_name ? "border-red-500" : ""}
              />
              {errors.category_name && (
                <p className="text-sm text-red-500">{errors.category_name}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCategory;
