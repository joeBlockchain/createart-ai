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
  ChevronRight,
  Proportions,
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import NoneExampleStyle from "@/public/style-presets/none.webp";
import AnimeExampleStyle from "@/public/style-presets/anime.webp";
import CinematicExampleStyle from "@/public/style-presets/cinematic.webp";
import DigitalArtExampleStyle from "@/public/style-presets/digital-art.webp";
import FantasyArtExampleStyle from "@/public/style-presets/fantasy-art.webp";
import ThreeDModelExampleStyle from "@/public/style-presets/3d-model.webp";
import AnalogFilmExampleStyle from "@/public/style-presets/analog-film.webp";
import ComicBookExampleStyle from "@/public/style-presets/comic-book.webp";
import IsometricExampleStyle from "@/public/style-presets/isometric.webp";
import LineArtExampleStyle from "@/public/style-presets/line-art.webp";
import LowPolyExampleStyle from "@/public/style-presets/low-poly.webp";
import ModelingCompoundExampleStyle from "@/public/style-presets/modeling-compound.webp";
import NeonPunkExampleStyle from "@/public/style-presets/neon-punk.webp";
import OrigamiExampleStyle from "@/public/style-presets/origami.webp";
import PhotographicExampleStyle from "@/public/style-presets/photographic.webp";
import PixelArtExampleStyle from "@/public/style-presets/pixel-art.webp";
import TileTextureExampleStyle from "@/public/style-presets/tile-texture.webp";
import EnhanceExampleStyle from "@/public/style-presets/enhance.webp";

const stylePresetExamples = {
  none: NoneExampleStyle,
  anime: AnimeExampleStyle,
  cinematic: CinematicExampleStyle,
  "digital-art": DigitalArtExampleStyle,
  "fantasy-art": FantasyArtExampleStyle,
  "3d-model": ThreeDModelExampleStyle,
  "analog-film": AnalogFilmExampleStyle,
  "comic-book": ComicBookExampleStyle,
  isometric: IsometricExampleStyle,
  "line-art": LineArtExampleStyle,
  "low-poly": LowPolyExampleStyle,
  "modeling-compound": ModelingCompoundExampleStyle,
  "neon-punk": NeonPunkExampleStyle,
  origami: OrigamiExampleStyle,
  photographic: PhotographicExampleStyle,
  "pixel-art": PixelArtExampleStyle,
  "tile-texture": TileTextureExampleStyle,
  enhance: EnhanceExampleStyle,
};

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
  const [aspectRatio, setAspectRatio] = useState("5:4");
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
              <PopoverTrigger asChild>
                <div className="absolute h-[5rem] w-[5rem] top-3 left-3 border border-border rounded-lg flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary">
                  <Image
                    src={
                      stylePresetExamples[
                        stylePreset as keyof typeof stylePresetExamples
                      ] || stylePresetExamples["none"]
                    }
                    alt={`${stylePreset || "None"} Example Style`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
                    <div className="text-xs font-semibold text-center">
                      {stylePreset === "none" || !stylePreset
                        ? "None"
                        : stylePreset === "modeling-compound"
                        ? "Clay"
                        : stylePreset
                            .split("-")
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-fit h-fit">
                <ToggleGroup
                  type="single"
                  value={stylePreset}
                  onValueChange={handleStylePresetChange}
                  className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                >
                  {Object.entries(stylePresetExamples).map(([style, image]) => (
                    <ToggleGroupItem
                      key={style}
                      value={style}
                      aria-label={style}
                      className={cn(
                        "w-[5rem] h-[5rem] p-0 relative overflow-hidden",
                        "hover:border-primary hover:border-2",
                        "data-[state=on]:border-primary data-[state=on]:border-2"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${style} Example Style`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
                        <div className="text-xs font-semibold text-center">
                          {style === "modeling-compound"
                            ? "Clay"
                            : style
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                        </div>
                      </div>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </PopoverContent>
            </Popover>

            <Textarea
              {...register("prompt", { required: "Prompt is required" })}
              placeholder="Describe your desired image in as descriptive and imaginative a way as possible. Include details like colors, textures, and styles that you want to see in the image. This will help the AI generate an image that is both visually appealing and fits your description."
              defaultValue=""
              className="w-full text-lg pr-[6rem] pl-[6.5rem] h-[6.5rem]"
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
                      SD Core{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.03 / image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-medium">
                      SD3 Medium{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.035 / image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-large-turbo">
                      SD3 Turbo{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.04 / image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="sd3-large">
                      SD3 Large{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.065 / image
                      </Badge>
                    </SelectItem>
                    <SelectItem value="stable-image-ultra">
                      SD Ultra{" "}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        $0.08 / image
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
                <ResponsiveImage
                  image={image}
                  aspectRatio={aspectRatio}
                  prompt={currentPrompt}
                  stylePreset={stylePreset}
                  negativePrompt={negativePrompt}
                  seed={seed ?? 0}
                  aiImprovePrompt={aiImprovePrompt}
                  model={model}
                  setImage={setImage}
                  setAspectRatio={setAspectRatio}
                />
              ) : (
                <AspectRatioPreview
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                />
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="h-[70vh] overflow-y-auto">
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

const AspectRatioOverlay = ({
  currentRatio,
  selectedRatio,
}: {
  currentRatio: string;
  selectedRatio: string | null;
}) => {
  if (!selectedRatio || selectedRatio === currentRatio) return null;

  const [currentWidth, currentHeight] = currentRatio.split(":").map(Number);
  const [selectedWidth, selectedHeight] = selectedRatio.split(":").map(Number);

  const currentAspect = currentWidth / currentHeight;
  const selectedAspect = selectedWidth / selectedHeight;

  let width, height;
  if (selectedAspect > currentAspect) {
    width = "100%";
    height = `${(currentAspect / selectedAspect) * 100}%`;
  } else {
    width = `${(selectedAspect / currentAspect) * 100}%`;
    height = "100%";
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        width,
        height,
        border: "2px dashed white",
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
      }}
    />
  );
};

const ResponsiveImage = ({
  image,
  aspectRatio,
  prompt,
  stylePreset,
  negativePrompt,
  seed,
  aiImprovePrompt,
  model,
  setImage,
  setAspectRatio,
}: {
  image: string;
  aspectRatio: string;
  prompt: string;
  stylePreset: string;
  negativePrompt: string;
  seed: number;
  aiImprovePrompt: boolean;
  model: string;
  setImage: (image: string) => void;
  setAspectRatio: (aspectRatio: string) => void;
}) => {
  const [width, height] = aspectRatio.split(":").map(Number);
  const ratio = width / height;
  const [maxSize, setMaxSize] = useState({ width: 0, height: 0 });
  const [isSearchReplaceDialogOpen, setIsSearchReplaceDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string | null>(
    null
  );

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

  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeletingBG, setIsDeletingBG] = useState(false);

  const handleRemoveBackground = async () => {
    console.log("Removing background");

    setIsEditing(true);
    setIsDeletingBG(true);
    try {
      const formData = await createFormData(image);
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to remove background");
      }

      const data = await response.json();

      setImage(data.image);

      toast({
        title: "Background removed",
        description: "The image has been updated in your history.",
      });
    } catch (error) {
      console.error("Error removing background:", error);
      toast({
        title: "Error",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
      setIsDeletingBG(false);
    }
  };

  const createFormData = async (imageSource: string): Promise<FormData> => {
    const formData = new FormData();
    let imageBlob: Blob;

    if (imageSource.startsWith("data:image")) {
      // It's a base64 encoded image
      imageBlob = base64ToBlob(imageSource);
    } else {
      // It's a URL, fetch the image first
      const response = await fetch(imageSource);
      imageBlob = await response.blob();
    }

    formData.append("image", imageBlob, "image.png");
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", aspectRatio);
    formData.append("style_preset", stylePreset);
    formData.append("negative_prompt", negativePrompt);
    formData.append("seed", seed.toString());
    formData.append("ai_improve_prompt", aiImprovePrompt.toString());
    formData.append("model", model);

    console.log(formData);

    return formData;
  };

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const handleSearchReplace = async () => {
    setIsSearchReplaceDialogOpen(false);
    setIsEditing(true);
    setIsSearching(true);
    try {
      const formData = await createFormData(image);
      formData.append("search_prompt", searchTerm);
      formData.append("replace_prompt", replaceTerm);

      const response = await fetch("/api/search-replace", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to perform search and replace");
      }

      const data = await response.json();
      setImage(data.image);

      toast({
        title: "Search and Replace completed",
        description: "The image has been updated in your history.",
      });
    } catch (error) {
      console.error("Error performing search and replace:", error);
      toast({
        title: "Error",
        description: "Failed to perform search and replace. Please try again.",
      });
    } finally {
      setIsEditing(false);
      setIsSearching(false);
    }
  };

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
        <AspectRatioOverlay
          currentRatio={aspectRatio}
          selectedRatio={selectedAspectRatio}
        />
      </div>
      <div className="absolute top-4 left-4 ">
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-12"
              onClick={handleRemoveBackground}
              disabled={isEditing}
            >
              {isDeletingBG ? (
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
                <ImageOff className="w-6 h-6 flex-none" strokeWidth={1} />
              )}
            </Button>
            <div className="hidden md:flex flex-col items-start gap-2 ">
              <Label className="">Delete Background</Label>
              <Badge variant="outline" className="bg-background/70">
                $0.02
              </Badge>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-12"
              onClick={() => setIsSearchReplaceDialogOpen(true)}
              disabled={isEditing}
            >
              {isSearching ? (
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
                <Replace className="w-6 h-6" strokeWidth={1} />
              )}
            </Button>
            <div className="hidden md:flex flex-col items-start gap-2 ">
              <Label className="">Find and Replace</Label>
              <Badge variant="outline" className="bg-background/70">
                $0.04
              </Badge>
            </div>
          </div>

          {/* <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <Eraser className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Erase Object</Label>
          </div> */}

          {/* <div className="flex flex-row items-center gap-2">
            <Button variant="outline" size="icon" className="">
              <Maximize2 className="w-6 h-6" strokeWidth={1} />
            </Button>
            <Label className="hidden md:block">Outpaint</Label>
          </div> */}

          {/* <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-row items-center gap-2">
                <Button variant="outline" size="icon" className="">
                  <Proportions className="w-6 h-6" strokeWidth={1} />
                </Button>
                <Label className="hidden md:block">Aspect Ratio</Label>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-fit h-fit">
              <ToggleGroup
                type="single"
                className="w-fit grid grid-cols-3 text-muted-foreground"
                value={selectedAspectRatio || aspectRatio}
                onValueChange={setSelectedAspectRatio}
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
              <div className="mt-3 flex w-full justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedAspectRatio) {
                      setAspectRatio(selectedAspectRatio);
                      setSelectedAspectRatio(null);
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover> */}
        </div>
      </div>
      <Dialog
        open={isSearchReplaceDialogOpen}
        onOpenChange={setIsSearchReplaceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search and Replace</DialogTitle>
            <DialogDescription>
              Enter the terms to search for and replace in the image.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                Search for
              </Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="replace" className="text-right">
                Replace with
              </Label>
              <Input
                id="replace"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSearchReplace}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    <>
      {/* Desktop view */}
      <div className="hidden md:flex flex-col items-start gap-2 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onImageSelect(image)}
            >
              <Image
                src={`${image.image_url}?width=100`}
                alt={image.prompt}
                width={50}
                height={50}
                className="w-fit object-cover"
              />
            </div>
          ))}
          {hasMore && (
            <div
              ref={ref}
              className="text-xs text-muted-foreground text-center"
            >
              Loading
            </div>
          )}
        </div>
      </div>

      {/* Mobile view */}
      <div className="">
        <Sheet>
          <SheetTrigger asChild className="absolute top-[10rem] right-[0rem]">
            <Button
              variant="outline"
              className="md:hidden rounded-l-full w-10 p-0 mt-10"
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[8rem]">
            {/* <SheetHeader>
              <SheetTitle>Generated Images</SheetTitle>
              <SheetDescription>
                Your previously generated images
              </SheetDescription>
            </SheetHeader> */}
            <div className="flex flex-col items-start gap-2 overflow-y-auto mt-4 h-[94vh]">
              <div className="grid grid-cols-1 gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      onImageSelect(image);
                      // Close the sheet after selection
                      const closeEvent = new Event("close-sheet");
                      window.dispatchEvent(closeEvent);
                    }}
                  >
                    <Image
                      src={`${image.image_url}?width=100`}
                      alt={image.prompt}
                      width={50}
                      height={50}
                      className="w-fit object-cover"
                    />
                  </div>
                ))}
                {hasMore && (
                  <div
                    ref={ref}
                    className="text-xs text-muted-foreground text-center"
                  >
                    Loading
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
