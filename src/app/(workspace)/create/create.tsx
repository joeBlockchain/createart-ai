"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dices,
  Sprout,
  ImageOff,
  Replace,
  Eraser,
  Maximize2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { useInView } from "react-intersection-observer";

type Inputs = {
  prompt: string;
};

type CreateImageParams = {
  prompt: string;
  aspectRatio: string;
  stylePreset: string;
  negativePrompt: string;
  seed: number;
  aiImprovePrompt: boolean;
  model: string;
  width: number;
  height: number;
};

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  aspect_ratio: string;
  style_preset: string;
  negative_prompt: string;
  seed: number;
  ai_improve_prompt: boolean;
  model: string;
}

export default function Create() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [stylePreset, setStylePreset] = useState("cinematic");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [aiImprovePrompt, setAiImprovePrompt] = useState(false);
  const [model, setModel] = useState("stable-image-core");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStylePopoverOpen, setIsStylePopoverOpen] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 4294967294);
  };

  const calculateDimensions = (
    aspectRatio: string,
    model: string
  ): { width: number; height: number } => {
    const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);
    let totalPixels: number;

    switch (model) {
      case "stable-image-core":
        totalPixels = 1.5 * 1000000; // 1.5 megapixels
        break;
      case "stable-image-ultra":
      case "sd3-medium":
      case "sd3-large":
      case "sd3-large-turbo":
        totalPixels = 1024 * 1024; // 1 megapixel
        break;
      default:
        throw new Error("Invalid model selected");
    }

    const ratio = widthRatio / heightRatio;

    let newWidth = Math.sqrt(totalPixels * ratio);
    let newHeight = newWidth / ratio;

    // Round to nearest multiple of 64 (required by the API)
    newWidth = Math.round(newWidth / 64) * 64;
    newHeight = Math.round(newHeight / 64) * 64;

    return { width: newWidth, height: newHeight };
  };

  const handleCreateImage = (prompt: string): CreateImageParams => {
    const { width, height } = calculateDimensions(aspectRatio, model);
    const finalSeed = seed !== null ? seed : generateRandomSeed();
    setSeed(finalSeed);
    setCurrentPrompt(prompt);
    return {
      prompt,
      aspectRatio,
      stylePreset: stylePreset === "none" ? "" : stylePreset,
      negativePrompt,
      seed: finalSeed,
      aiImprovePrompt,
      model,
      width,
      height,
    };
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setCurrentPrompt(data.prompt);
      const params = handleCreateImage(data.prompt);
      const res = await fetch("/api/stability-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const responseData = await res.json();
      if (responseData.image) {
        setImage(responseData.image);
        setError("");
        // Auto-save the image to Supabase
        await saveImageToSupabase(responseData.image, params.seed);
      } else {
        setError(responseData.error || "An error occurred");
        setImage("");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred");
      setImage("");
    }
  };

  const saveImageToSupabase = async (imageData: string, usedSeed: number) => {
    try {
      setIsSaving(true);
      // Generate a unique filename
      const filename = `image_${Date.now()}.png`;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Upload the image to Supabase storage with user ID in the path
      const { data, error } = await supabase.storage
        .from("generated-images")
        .upload(`${userId}/${filename}`, base64ToBlob(imageData), {
          contentType: "image/png",
        });

      if (error) throw error;

      // Get the public URL of the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("generated-images")
        .getPublicUrl(`${userId}/${filename}`);

      // Save the image metadata and parameters to the database
      const { data: savedData, error: dbError } = await supabase
        .from("generated_images")
        .insert({
          user_id: userId,
          image_url: publicUrl,
          prompt: currentPrompt,
          aspect_ratio: aspectRatio,
          style_preset: stylePreset,
          negative_prompt: negativePrompt,
          seed: usedSeed,
          ai_improve_prompt: aiImprovePrompt,
          model,
          created_at: new Date().toISOString(),
        })
        .select();

      if (dbError) throw dbError;

      console.log("Image saved successfully:", savedData);
    } catch (error) {
      console.error("Error saving image:", error);
      setError("Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  // Add this helper function to convert base64 to Blob
  function base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const handleStylePresetChange = (value: string) => {
    setStylePreset(value === "none" ? "" : value);
    setIsStylePopoverOpen(false); // Close the popover after selection
  };

  const handleImageSelect = (selectedImage: GeneratedImage) => {
    console.log("selectedImage", selectedImage);
    setImage(selectedImage.image_url);
    setValue("prompt", selectedImage.prompt); // Update the form field
    setCurrentPrompt(selectedImage.prompt);
    setAspectRatio(selectedImage.aspect_ratio);
    setStylePreset(selectedImage.style_preset);
    setNegativePrompt(selectedImage.negative_prompt);
    setSeed(selectedImage.seed);
    setAiImprovePrompt(selectedImage.ai_improve_prompt);
    setModel(selectedImage.model);
  };

  return (
    <main className="flex flex-col h-full grow mx-2 ">
      <div className="flex flex-row grow w-full space-x-4 my-2">
        <div className="flex flex-col grow h-full space-y-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative flex flex-col items-start justify-center"
          >
            <Popover
              open={isStylePopoverOpen}
              onOpenChange={setIsStylePopoverOpen}
            >
              <PopoverTrigger>
                <div className="absolute h-[3.5rem] w-[4rem] top-3 left-3 border border-border rounded-lg flex flex-col items-center justify-center">
                  <div className="text-xs font-semibold">
                    {stylePreset || "None"}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-fit">
                <ToggleGroup
                  type="single"
                  value={stylePreset}
                  onValueChange={handleStylePresetChange}
                  className="grid grid-cols-4 gap-2 text-xs"
                >
                  <ToggleGroupItem
                    value="none"
                    aria-label="None"
                    className="w-[5rem]"
                  >
                    None
                  </ToggleGroupItem>
                  {[
                    "3D Model",
                    "Analog Film",
                    "Anime",
                    "Cinematic",
                    "Comic Book",
                    "Digital Art",
                    "Fantasy Art",
                    "Isometric",
                    "Line Art",
                    "Low Poly",
                    "Modeling Compound",
                    "Neon Punk",
                    "Origami",
                    "Photographic",
                    "Pixel Art",
                    "Tile Texture",
                  ].map((style) => (
                    <ToggleGroupItem
                      key={style}
                      value={style.toLowerCase().replace(" ", "-")}
                      aria-label={style}
                      className="w-[5rem]"
                    >
                      {style}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </PopoverContent>
            </Popover>

            <Textarea
              {...register("prompt", { required: "Prompt is required" })}
              placeholder="Enter prompt"
              defaultValue="A white camellia flower, lots  of petals in rich pattern. Light shines through the petal patterns, tilted at an angle. Dark background. The soft edges of this flower create beautiful curves, enhancing the overall aesthetic appeal. The background color seamlessly blends with the colors of various flower petals, creating a warm atmosphere."
              className="w-full text-lg pr-[6rem] pl-[6rem] h-fit"
            />
            <div className="flex flex-row w-full justify-between mt-3">
              <div>
                <Select
                  onValueChange={(value) => setModel(value)}
                  value={model}
                >
                  <SelectTrigger
                    id="model"
                    className="items-start border-none text-muted-foreground focus:outline-none focus:ring-0 p-0 m-0 h-fit"
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable-image-core">
                      Stable Image Core{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.03 per image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-medium">
                      SD3 Medium{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.035 per image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-large-turbo">
                      SD3 Large Turbo{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.04 per image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-large">
                      SD3 Large{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.065 per image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="stable-image-ultra">
                      Stable Image Ultra{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.08 per image
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex flex-row items-center justify-between gap-2 text-muted-foreground">
                  <Sprout className="w-5 h-5 flex-none" />
                  <Input
                    type="number"
                    id="seed"
                    min={0}
                    max={4294967294}
                    value={seed !== null ? seed : ""}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    placeholder="Random"
                    className="border-none focus:outline-none focus:ring-0 p-0 m-0 h-fit w-fit"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setSeed(Math.floor(Math.random() * 4294967294))
                    }
                    className="p-0 m-0 h-fit"
                  >
                    <Dices className="w-5 h-5 flex-none" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 flex space-x-2">
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting || isSaving}
              >
                {isSubmitting ? (
                  <span
                    className="loader"
                    style={
                      {
                        "--loader-size": "18px",
                        "--loader-color": "#000",
                        "--loader-color-dark": "#fff",
                      } as React.CSSProperties
                    }
                  ></span>
                ) : (
                  "New"
                )}
              </Button>
            </div>
          </form>
          {errors.prompt && (
            <p className="text-red-500 mt-2">{errors.prompt.message}</p>
          )}
          <div className="flex flex-row h-full grow">
            <div className="flex h-full grow overflow-auto">
              {image ? (
                <ResponsiveImage image={image} aspectRatio={aspectRatio} />
              ) : (
                <AspectRatioPreview
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                />
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <ImageHistory onImageSelect={handleImageSelect} />
            </div>
          </div>
        </div>

        {/* <Alert className="flex-col grow h-full max-w-xs">
          <form className="grid w-full items-start gap-6">
            <div className="grid gap-3">
              <Label htmlFor="negative-prompt">Exclude</Label>
              <Textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Enter what you don't want to see in the image"
              />
            </div>
          </form>
        </Alert> */}
      </div>
    </main>
  );
}

const AspectRatioPreview = ({
  aspectRatio,
  setAspectRatio,
}: {
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
}) => {
  const [width, height] = aspectRatio.split(":").map(Number);
  const ratio = width / height;
  const [maxSize, setMaxSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateMaxSize = () => {
      const containerWidth = window.innerWidth * 0.7; // Adjust this multiplier as needed
      const containerHeight = window.innerHeight * 0.7; // Adjust this multiplier as needed

      if (containerWidth / ratio > containerHeight) {
        // Height constrained
        setMaxSize({ width: containerHeight * ratio, height: containerHeight });
      } else {
        // Width constrained
        setMaxSize({ width: containerWidth, height: containerWidth / ratio });
      }
    };

    updateMaxSize();
    window.addEventListener("resize", updateMaxSize);
    return () => window.removeEventListener("resize", updateMaxSize);
  }, [ratio]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        style={{
          width: `${maxSize.width}px`,
          height: `${maxSize.height}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        className="relative flex items-center justify-center border-2 border-dashed border-border rounded-lg"
      >
        <ToggleGroup
          type="single"
          className="w-fit grid grid-cols-3 text-muted-foreground"
          value={aspectRatio}
          onValueChange={setAspectRatio}
        >
          <ToggleGroupItem value="21:9" aria-label="21:9">
            21:9
          </ToggleGroupItem>
          <ToggleGroupItem value="16:9" aria-label="16:9">
            16:9
          </ToggleGroupItem>
          <ToggleGroupItem value="3:2" aria-label="3:2">
            3:2
          </ToggleGroupItem>

          <ToggleGroupItem value="4:3" aria-label="4:3">
            4:3
          </ToggleGroupItem>
          <ToggleGroupItem value="5:4" aria-label="5:4">
            5:4
          </ToggleGroupItem>
          <ToggleGroupItem value="1:1" aria-label="1:1">
            1:1
          </ToggleGroupItem>
          <ToggleGroupItem value="4:5" aria-label="4:5">
            4:5
          </ToggleGroupItem>

          <ToggleGroupItem value="2:3" aria-label="2:3">
            2:3
          </ToggleGroupItem>

          <ToggleGroupItem value="9:16" aria-label="9:16">
            9:16
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

const ResponsiveImage = ({
  image,
  aspectRatio,
}: {
  image: string;
  aspectRatio: string;
}) => {
  const [width, height] = aspectRatio.split(":").map(Number);
  const ratio = width / height;
  const [maxSize, setMaxSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateMaxSize = () => {
      const containerWidth = window.innerWidth * 0.7;
      const containerHeight = window.innerHeight * 0.7;

      if (containerWidth / ratio > containerHeight) {
        setMaxSize({ width: containerHeight * ratio, height: containerHeight });
      } else {
        setMaxSize({ width: containerWidth, height: containerWidth / ratio });
      }
    };

    updateMaxSize();
    window.addEventListener("resize", updateMaxSize);
    return () => window.removeEventListener("resize", updateMaxSize);
  }, [ratio]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div
        style={{
          width: `${maxSize.width}px`,
          height: `${maxSize.height}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        className="relative flex items-center justify-center rounded-lg overflow-hidden"
      >
        <Image
          src={image}
          alt="Generated image"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="absolute top-4 left-4 ">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <ImageOff className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Remove Background</Label>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <Replace className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Search and Replace</Label>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <Eraser className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Erase Object</Label>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <Maximize2 className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Outpaint</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

function ImageHistory({
  onImageSelect,
}: {
  onImageSelect: (image: GeneratedImage) => void;
}) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

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

      const limit = 10; // Number of images per page
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      if (data.length < limit) {
        setHasMore(false);
      }

      setImages((prevImages) => [...prevImages, ...(data as GeneratedImage[])]);
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Error loading images");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      fetchImages();
    }
  }, [inView, hasMore]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col items-start gap-2 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="border rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onImageSelect(image)}
          >
            <Image
              src={`${image.image_url}?width=100`} // Request a smaller version
              alt={image.prompt}
              width={50}
              height={50}
              className="w-fit object-cover"
            />
          </div>
        ))}
        {hasMore && <div ref={ref}>Loading more...</div>}
      </div>
    </div>
  );
}
