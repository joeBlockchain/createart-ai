import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/site-footer";
import { stylePresetExamples } from "@/lib/constants";
import Image from "next/image";

export default async function Home() {
  return (
    <main className=" max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav className="">
        <SiteHeader />
      </nav>
      <div>
        <section className="w-full py-[5rem]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="mx-3 space-y-2 lg:space-y-3 max-w-md md:max-w-2xl lg:max-w-3xl">
              <h1 className="leading-tight lg::leading-snug font-black text-5xl lg:text-7xl ">
                Create Stunning Art with AI
              </h1>
              <p className="leading-normal text-xl text-muted-foreground">
                CreateArt-AI is the ultimate AI Assisted art creation tool to
                enhance your creativity.
              </p>
            </div>
            <div className="flex flex-row items-center space-x-4 pt-4">
              <Button
                asChild
                variant="default"
                className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-lg lg:text-xl"
              >
                {/* <Link href="/signin/password_signin">Get Started</Link> */}
                <Link href="/create">Create!</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-xl lg:text-xl"
              >
                <Link href="/login">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-8 md:py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(stylePresetExamples)
                .slice(0, 16)
                .map(([style, image]) => (
                  <div
                    key={style}
                    className="aspect-square relative overflow-hidden rounded-lg"
                  >
                    <Image
                      src={image}
                      alt={`${style} Example Style`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-3">
                      <div className="text-xl text-center text-muted-foreground">
                        {style === "none"
                          ? "None"
                          : style === "modeling-compound"
                          ? "Clay"
                          : style
                              .split("-")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
