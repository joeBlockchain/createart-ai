import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      aspectRatio,
      stylePreset,
      negativePrompt,
      seed,
      aiImprovePrompt,
      model,
    } = body;

    let apiEndpoint: string;
    let payload = new FormData();

    switch (model) {
      case "sd3-medium":
      case "sd3-large":
      case "sd3-large-turbo":
        apiEndpoint =
          "https://api.stability.ai/v2beta/stable-image/generate/sd3";
        payload.append("model", model);
        break;
      case "stable-image-core":
        apiEndpoint =
          "https://api.stability.ai/v2beta/stable-image/generate/core";
        break;
      case "stable-image-ultra":
        apiEndpoint =
          "https://api.stability.ai/v2beta/stable-image/generate/ultra";
        break;
      default:
        throw new Error("Invalid model selected");
    }

    payload.append("prompt", prompt);
    payload.append("output_format", "png");
    payload.append("aspect_ratio", aspectRatio);
    if (negativePrompt) payload.append("negative_prompt", negativePrompt);
    if (seed !== 0) payload.append("seed", seed.toString());

    // SD3 Large Turbo doesn't support negative_prompt
    if (model === "sd3-large-turbo") {
      payload.delete("negative_prompt");
    }

    // Style Preset only works with Stable Image Core
    if (model === "stable-image-core") {
      payload.append("style_preset", stylePreset);
    }

    console.log("payload", payload);

    console.log("payload", payload.get("style_preset"));

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
      },
      body: payload,
    });

    if (response.ok) {
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");

      return NextResponse.json(
        {
          image: `data:image/webp;base64,${base64Image}`,
          message: "Image generated successfully",
        },
        { status: 200 }
      );
    } else {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the image" },
      { status: 500 }
    );
  }
}
