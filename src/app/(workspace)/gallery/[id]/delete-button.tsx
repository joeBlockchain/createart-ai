"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteImage } from "./actions";
import { Button } from "@/components/ui/button";

export default function DeleteButton({ imageId }: { imageId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteImage(imageId);
    if (result.success) {
      router.push("/gallery");
    } else {
      alert("Failed to delete image. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
      {isDeleting ? "Deleting..." : "Delete Image"}
    </Button>
  );
}
