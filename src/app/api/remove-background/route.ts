import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  console.log("Removing background");

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const outputFormat = (formData.get("output_format") as string) || "png";

    // Get the original image metadata
    const originalPrompt = formData.get("prompt") as string;
    const aspectRatio = formData.get("aspect_ratio") as string;
    const stylePreset = formData.get("style_preset") as string;
    const negativePrompt = formData.get("negative_prompt") as string;
    const seed = parseInt(formData.get("seed") as string);
    const aiImprovePrompt = formData.get("ai_improve_prompt") === "true";
    const model = formData.get("model") as string;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("sending image to remove background");

    // Prepare the request to Stability AI
    const apiUrl =
      "https://api.stability.ai/v2beta/stable-image/edit/remove-background";
    const payload = new FormData();
    payload.append("image", imageFile);
    payload.append("output_format", outputFormat);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
      },
      body: payload,
    });

    console.log("response", response);
    console.log("response.ok", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Save the image to Supabase
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const fileName = `bg_removed_${Date.now()}.${outputFormat}`;
    const { data, error } = await supabase.storage
      .from("generated-images")
      .upload(`${user.id}/${fileName}`, Buffer.from(imageBuffer), {
        contentType: `image/${outputFormat}`,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(`${user.id}/${fileName}`);

    // Save metadata to the database
    const { data: savedData, error: dbError } = await supabase
      .from("generated_images")
      .insert({
        user_id: user.id,
        image_url: publicUrlData.publicUrl,
        prompt: `${originalPrompt} (Background removed)`,
        aspect_ratio: aspectRatio,
        style_preset: stylePreset,
        negative_prompt: negativePrompt,
        seed: seed,
        ai_improve_prompt: aiImprovePrompt,
        model: model,
        created_at: new Date().toISOString(),
      })
      .select();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      image: `data:image/${outputFormat};base64,${base64Image}`,
      savedImage: savedData[0],
      message: "Background removed and image saved successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while removing the background" },
      { status: 500 }
    );
  }
}
