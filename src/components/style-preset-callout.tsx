/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vBPyWUcUSNZ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";

export default function StylePresetCallout() {
  const presets = [
    {
      name: "Black & White",
      image: "/placeholder.svg",
      className: "grayscale",
    },
    {
      name: "Sepia",
      image: "/placeholder.svg",
      className: "sepia",
    },
    {
      name: "Vintage",
      image: "/placeholder.svg",
      className: "contrast-125 brightness-75 saturate-75",
    },
    {
      name: "Vibrant",
      image: "/placeholder.svg",
      className: "saturate-150 brightness-110",
    },
    {
      name: "Moody",
      image: "/placeholder.svg",
      className: "contrast-150 brightness-75 hue-rotate-15",
    },
    {
      name: "Dreamy",
      image: "/placeholder.svg",
      className: "blur-2 brightness-110 saturate-150",
    },
    {
      name: "Cinematic",
      image: "/placeholder.svg",
      className: "contrast-150 brightness-90 sepia-50",
    },
    {
      name: "Retro",
      image: "/placeholder.svg",
      className: "hue-rotate-15 saturate-150 grayscale-50",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {presets.map((preset, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg group cursor-pointer"
        >
          <img
            src="/placeholder.svg"
            alt={preset.name}
            width={400}
            height={400}
            className={`w-full h-60 object-cover transition-all duration-300 group-hover:opacity-50 ${preset.className}`}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-semibold text-white mb-2">
              {preset.name}
            </h3>
            <Button size="sm">Apply Preset</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
