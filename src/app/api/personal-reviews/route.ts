import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";
import { browserOptions } from "../_helpers/chrome";
import { optimizePage } from "../_helpers/page";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileUrl = searchParams.get("url");

  if (!profileUrl) {
    console.log("Error: Missing URL parameter");
    return NextResponse.json(
      { error: "Missing Google Maps profile URL" },
      { status: 400 }
    );
  }

  try {
    console.time("personal reviews API"); // start

    // Add language parameter and navigate to it
    const urlObj = new URL(profileUrl);
    urlObj.searchParams.set("hl", "zh-TW");

    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Optimizing page loading
    await optimizePage(page);

    console.time("domcontentloaded");
    await page.goto(urlObj.href, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.timeEnd("domcontentloaded");

    console.time("scroll");
    // Scroll to load more reviews
    await page.evaluate(async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const mainDiv = document.querySelector('div[role="main"]');
      const reviewContainer = mainDiv?.querySelector('div[role="tabpanel"]');

      for (let i = 0; i < 5; i++) {
        // Scroll 10 times or adjust as needed
        if (reviewContainer) {
          reviewContainer.scrollTo(0, reviewContainer.scrollHeight);
          await delay(300); // Wait 300 ms for new content to load
        }
      }
    });
    console.timeEnd("scroll");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // click all "more" buttons
    console.time("click more buttons");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll(
        'button[aria-label="顯示更多"], button[aria-label="See more"]'
      ) as NodeListOf<HTMLButtonElement>;
      buttons.forEach((button) => button.click());
    });
    console.timeEnd("click more buttons");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scrape review data
    console.time("scrape");
    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll("div[aria-label]");
      return Array.from(reviewElements)
        .filter((review) => review.hasAttribute("data-review-id"))
        .map((review) => {
          // Find user info button by data-review-id
          const reviewId = review.getAttribute("data-review-id");

          const ratingElement = review.querySelector('span[role="img"]');
          const rating =
            ratingElement?.getAttribute("aria-label") || "No rating";

          const timeElement = ratingElement?.nextElementSibling;
          const time = timeElement?.textContent || "";

          const contentWrapperElement = review.querySelector(
            `div[id="${reviewId}"]`
          );
          const content = contentWrapperElement?.firstChild?.textContent || "";

          // Get photos from the image buttons
          const photoButtons = review.querySelectorAll(
            'button[aria-label*="相片"], button[aria-label*="Photo"]'
          );
          const photos = Array.from(photoButtons)
            .map((button) => {
              const style = button.getAttribute("style") || "";
              const urlMatch = style.match(/url\("([^"]+)"\)/);
              return urlMatch ? urlMatch[1] : null;
            })
            .filter((url) => url !== null);

          return {
            rating: rating.replace(/\D/g, ""),
            time,
            content,
            photos: photos.length > 0 ? photos : [],
          };
        });
    });
    console.timeEnd("scrape");

    await browser.close();
    console.timeEnd("personal reviews API"); // end

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error getting personal reviews", error: error },
      { status: 500 }
    );
  }
}
