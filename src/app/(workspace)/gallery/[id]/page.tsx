import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ImageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: image, error } = await supabase
    .from("generated_images")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user?.id)
    .single();

  if (error) {
    console.error("Error fetching image:", error);
    return <div>Error loading image details</div>;
  }

  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Link
        href="/gallery"
        className="text-blue-500 hover:underline mb-4 inline-block"
      >
        &larr; Back to Gallery
      </Link>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Image
            src={image.image_url}
            alt={image.prompt}
            width={800}
            height={800}
            className="w-full rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-4">Image Details</h1>
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">Prompt:</h2>
              <p>{image.prompt}</p>
            </div>
            <div>
              <h2 className="font-semibold">Model:</h2>
              <Badge>{image.model}</Badge>
            </div>
            <div>
              <h2 className="font-semibold">Aspect Ratio:</h2>
              <Badge>{image.aspect_ratio}</Badge>
            </div>
            {image.style_preset && (
              <div>
                <h2 className="font-semibold">Style Preset:</h2>
                <Badge>{image.style_preset}</Badge>
              </div>
            )}
            {image.negative_prompt && (
              <div>
                <h2 className="font-semibold">Negative Prompt:</h2>
                <p>{image.negative_prompt}</p>
              </div>
            )}
            <div>
              <h2 className="font-semibold">Seed:</h2>
              <p>{image.seed}</p>
            </div>
            <div>
              <h2 className="font-semibold">AI Improve Prompt:</h2>
              <p>{image.ai_improve_prompt ? "Yes" : "No"}</p>
            </div>
            <div>
              <h2 className="font-semibold">Created At:</h2>
              <p>{new Date(image.created_at).toLocaleString()}</p>
            </div>
            <div className="mt-8">
              <DeleteButton imageId={image.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
