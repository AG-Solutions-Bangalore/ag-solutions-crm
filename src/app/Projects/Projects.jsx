import React from "react";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import StatusDropdown from "@/components/toogle/Enquiry-toggle";
import BASE_URL from "@/config/base-url";
import { ENQUIRY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Projects = () => {
  const { data, isLoading, error, refetch } = useGetApiMutation({
    url: `${BASE_URL}/enquiry`,
    queryKey: ["enquiry"],
  });
  return (
    <div>
      <h1>Hello world</h1>
    </div>
  );
};

export default Projects;
