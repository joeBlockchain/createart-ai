import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="h-screen mx-5">
      <nav className="">
        <SiteHeader />
      </nav>
      <section className="w-full py-[5rem]">
        <div className="">
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
                <Link href="/signin/password_signin">Get Started</Link>
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
        </div>
      </section>
      <footer className="w-full py-6 bg-background fixed bottom-0 left-0 right-0">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2024 CreateArt-AI. All rights reserved.
              </p>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
