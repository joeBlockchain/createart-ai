"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteImage(imageId: string) {
  const supabase = createClient();

  try {
    // Delete the image record from the database
    const { error: dbError } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", imageId);

    if (dbError) throw dbError;

    // Delete the image file from storage
    // Assuming the storage path is 'generated_images/{imageId}'
    const { error: storageError } = await supabase.storage
      .from("generated_images")
      .remove([`${imageId}`]);

    if (storageError) throw storageError;

    // Revalidate the gallery page to reflect the changes
    revalidatePath("/gallery");

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
