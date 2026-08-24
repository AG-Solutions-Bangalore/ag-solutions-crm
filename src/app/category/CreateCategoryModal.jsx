import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";

const CreateCategoryModal = ({ setOpenCreate }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name is required");
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
        setOpenCreate(false);
      } else {
        toast.error(res?.message || "Failed to create Category");
      }
    } catch (error) {
      const errorsMsg = error?.response?.data?.message;
      toast.error(errorsMsg || "Something went wrong");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => setOpenCreate(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category_name" className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category_name"
              type="text"
              placeholder="Enter Category name"
              value={categoryName}
              onChange={handleInputChange}
              className={
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpenCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;
