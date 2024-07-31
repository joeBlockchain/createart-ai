"use client";

import { useState } from "react";
import SiteHeader from "@/components/site-header";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import CreateButton from "./create-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dice1, Dices } from "lucide-react";

export default function Create() {
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [stylePreset, setStylePreset] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<number>(0);
  const [aiImprovePrompt, setAiImprovePrompt] = useState(false);
  const [model, setModel] = useState("stable-image-core");

  // In the handleCreateImage function:
  const handleCreateImage = (prompt: string) => {
    const { width, height } = calculateDimensions(aspectRatio, model);
    return {
      prompt,
      aspectRatio,
      stylePreset: stylePreset === "none" ? "" : stylePreset,
      negativePrompt,
      seed,
      aiImprovePrompt,
      model,
      width,
      height,
    };
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

  return (
    <main className="h-screen mx-5 flex flex-col">
      <nav>{/* <SiteHeader /> */}</nav>
      <div className="flex flex-row grow w-full space-x-4 mt-2">
        <div className="flex flex-col grow h-full space-y-4">
          <CreateButton onCreateImage={handleCreateImage} />
        </div>

        <Alert className="flex-col grow h-full max-w-xs">
          <form className="grid w-full items-start gap-6">
            <div className="grid gap-3">
              <Label htmlFor="model">Model</Label>
              <Select onValueChange={(value) => setModel(value)} value={model}>
                <SelectTrigger id="model" className="items-start">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable-image-core">
                    Stable Image Core{" "}
                    <Badge variant="secondary">$0.03 per image</Badge>
                  </SelectItem>
                  <SelectItem value="sd3-medium">
                    SD3 Medium{" "}
                    <Badge variant="secondary">$0.035 per image</Badge>
                  </SelectItem>
                  <SelectItem value="sd3-large-turbo">
                    SD3 Large Turbo{" "}
                    <Badge variant="secondary">$0.04 per image</Badge>
                  </SelectItem>
                  <SelectItem value="sd3-large">
                    SD3 Large{" "}
                    <Badge variant="secondary">$0.065 per image</Badge>
                  </SelectItem>

                  <SelectItem value="stable-image-ultra">
                    Stable Image Ultra{" "}
                    <Badge variant="secondary">$0.08 per image</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="style-preset">Style Preset</Label>
              <Select
                onValueChange={(value) => setStylePreset(value)}
                value={stylePreset}
              >
                <SelectTrigger id="style-preset" className="items-start">
                  <SelectValue placeholder="Select style preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="3d-model">3D Model</SelectItem>
                  <SelectItem value="analog-film">Analog Film</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="comic-book">Comic Book</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="enhance">Enhance</SelectItem>
                  <SelectItem value="fantasy-art">Fantasy Art</SelectItem>
                  <SelectItem value="isometric">Isometric</SelectItem>
                  <SelectItem value="line-art">Line Art</SelectItem>
                  <SelectItem value="low-poly">Low Poly</SelectItem>
                  <SelectItem value="modeling-compound">
                    Modeling Compound
                  </SelectItem>
                  <SelectItem value="neon-punk">Neon Punk</SelectItem>
                  <SelectItem value="origami">Origami</SelectItem>
                  <SelectItem value="photographic">Photographic</SelectItem>
                  <SelectItem value="pixel-art">Pixel Art</SelectItem>
                  <SelectItem value="tile-texture">Tile Texture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Select
                onValueChange={(value) => setAspectRatio(value)}
                value={aspectRatio}
              >
                <SelectTrigger id="aspect-ratio" className="items-start">
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="2:3">2:3</SelectItem>
                  <SelectItem value="3:2">3:2</SelectItem>
                  <SelectItem value="4:5">4:5</SelectItem>
                  <SelectItem value="5:4">5:4</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="21:9">21:9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="seed">Seed</Label>
              <div className="flex flex-row items-center justify-between gap-2">
                <Input
                  type="number"
                  id="seed"
                  min={0}
                  max={4294967294}
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    setSeed(Math.floor(Math.random() * 4294967294))
                  }
                >
                  <Dices className="w-5 h-5 flex-none" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="negative-prompt">Negative Prompt</Label>
              <Textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Enter what you don't want to see in the image"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-improve-prompt">AI Improve Prompt</Label>
              <Switch
                id="ai-improve-prompt"
                checked={aiImprovePrompt}
                onCheckedChange={setAiImprovePrompt}
              />
            </div>
          </form>
        </Alert>
      </div>
    </main>
  );
}
