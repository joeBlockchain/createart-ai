import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: images, error } = await supabase
    .from("generated_images")
    .select("*");

  console.log(error);
  if (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Generated Images</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="border rounded-lg overflow-hidden">
            <Image
              src={image.image_url}
              alt={image.prompt}
              width={400}
              height={400}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <p className="font-semibold mb-2 truncate">{image.prompt}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{image.model}</Badge>
                <Badge>{image.aspect_ratio}</Badge>
                {image.style_preset && <Badge>{image.style_preset}</Badge>}
              </div>
              <Link
                href={`/gallery/${image.id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
