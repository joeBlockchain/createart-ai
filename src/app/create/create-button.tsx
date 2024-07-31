"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

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

interface CreateButtonProps {
  onCreateImage: (prompt: string) => CreateImageParams;
}

export default function CreateButton({ onCreateImage }: CreateButtonProps) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const params = onCreateImage(data.prompt);
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

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex flex-row items-center justify-center"
      >
        <Textarea
          {...register("prompt", { required: "Prompt is required" })}
          placeholder="Enter prompt"
          defaultValue="A 9 year old girl with a solemn expression sitting in a horse-drawn carriage, looking down at her feet. A nervous-looking man beside her, vast prairie landscape in the background, warm sunset colors."
          className="w-full text-lg pr-[6rem] h-fit"
        />
        <Button
          type="submit"
          variant="secondary"
          className="absolute right-3 top-3"
          disabled={isSubmitting}
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
            "Create"
          )}
        </Button>
      </form>
      {errors.prompt && (
        <p className="text-red-500 mt-2">{errors.prompt.message}</p>
      )}
      <Alert className="flex h-full grow overflow-auto mt-4">
        {image && (
          <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
            <Image
              src={image}
              alt="Generated image"
              width={512}
              height={512}
              style={{ maxWidth: "100%", height: "auto" }}
              layout="responsive"
            />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </Alert>
    </>
  );
}
