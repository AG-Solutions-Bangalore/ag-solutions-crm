import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

const SponsarModal = ({ setOpenEdit, Category }) => {
  console.log(Category);
  const queryClient = useQueryClient();
  const { trigger, loading } = useApiMutation();

  const [formData, setFormData] = useState({
    category_name: "",
    category_status: "Active",
  });
  //   useEffect(() => {
  //     if (category) {
  //       setCategoryName(category.category_name || "");
  //     }
  //   }, [category]);
//   useEffect(() => {
//     if (Category) {
//       setFormData({
//         category_name: Category.category_name || "",
//         category_status: Category.category_status || "Active",
//       });
//     }
//   }, [Category]);

  const handleUpdate = async () => {
    if (!formData.category_name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await trigger({
        url: CATEGORY_API.update(Category.id),
        method: "PATCH",
        data: {
          category_name: formData.category_name,
          category_status: formData.category_status,
        },
      });

      queryClient.setQueryData(["category", null], (old) => {
        if (!old?.data?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((item) =>
              item.id === Category.id
                ? {
                    ...item,
                    category_name: formData.category_name,
                    category_status: formData.category_status,
                  }
                : item,
            ),
          },
        };
      });

      toast.success(response?.message || "Category updated successfully");
      setOpenEdit(false);
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => setOpenEdit(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <label className="text-sm font-medium">Category Name</label>

          <Input
            value={formData.category_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                category_name: e.target.value,
              })
            }
            placeholder="Enter Category name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.category_status}
            onChange={(e) =>
              setFormData({
                ...formData,
                category_status: e.target.value,
              })
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenEdit(false)}>
            Cancel
          </Button>

          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SponsarModal;
