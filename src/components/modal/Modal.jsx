import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Modal = ({
  open,
  onClose,
  title,
  onSubmit,
  submitText = "Save",
  isLoading = false,
  maxWidthClass = "sm:max-w-md",
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={maxWidthClass}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="py-4 space-y-4">{children}</div>

        {/* Action Buttons */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? `${submitText}ing...` : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
