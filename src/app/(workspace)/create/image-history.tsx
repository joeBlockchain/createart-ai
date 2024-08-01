"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
}

export default function ImageHistory() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const supabase = createClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          return;
        }

        const { data, error } = await supabase
          .from("generated_images")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setImages(data as GeneratedImage[]);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError("Error loading images");
      }
    };

    fetchImages();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col items-start gap-2 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2">
        {images.map((image) => (
          <div key={image.id} className="border rounded-lg overflow-hidden">
            <Image
              src={image.image_url}
              alt={image.prompt}
              width={50}
              height={50}
              className="w-fit object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
