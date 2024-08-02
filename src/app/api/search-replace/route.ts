import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const searchPrompt = formData.get("search_prompt") as string;
    const outputFormat = (formData.get("output_format") as string) || "png";
    const negativePrompt = formData.get("negative_prompt") as string;
    const replacePrompt = formData.get("replace_prompt") as string;
    const seed = parseInt(formData.get("seed") as string) || 0;

    if (!imageFile || !prompt || !searchPrompt) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Prepare the request to Stability AI
    const apiUrl =
      "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace";
    const payload = new FormData();
    payload.append("image", imageFile);
    if (seed !== 0) payload.append("seed", seed.toString());
    payload.append("mode", "search");
    payload.append("output_format", outputFormat);
    payload.append("prompt", replacePrompt);
    payload.append("search_prompt", searchPrompt);
    if (negativePrompt) payload.append("negative_prompt", negativePrompt);

    console.log(payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
      },
      body: payload,
    });

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

    const fileName = `search_replace_${Date.now()}.${outputFormat}`;
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
        prompt: `${prompt} (Search and Replace: ${searchPrompt})`,
        aspect_ratio: formData.get("aspect_ratio") as string,
        style_preset: formData.get("style_preset") as string,
        negative_prompt: negativePrompt,
        seed: seed,
        ai_improve_prompt: formData.get("ai_improve_prompt") === "true",
        model: formData.get("model") as string,
        created_at: new Date().toISOString(),
      })
      .select();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      image: `data:image/${outputFormat};base64,${base64Image}`,
      savedImage: savedData[0],
      message: "Search and replace completed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while performing search and replace" },
      { status: 500 }
    );
  }
}
