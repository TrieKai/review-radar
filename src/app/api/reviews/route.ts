import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shortUrl = searchParams.get("url"); // Input short URL

  if (!shortUrl) {
    return NextResponse.json(
      { error: "Missing Google Maps short URL" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Resolve short URL to get target URL
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    const longUrl = response.url;

    if (!longUrl.startsWith("https://www.google.com/maps/")) {
      return NextResponse.json(
        { error: "Invalid Google Maps URL" },
        { status: 400 }
      );
    }

    // Step 2: Launch Puppeteer and scrape reviews from target URL
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Visit the resolved long URL
    await page.goto(longUrl, { waitUntil: "networkidle2" });

    // Extract place name from URL
    const placeNameMatch = longUrl.match(/place\/([^/@]+)/);
    if (!placeNameMatch) {
      await browser.close();
      return NextResponse.json(
        { error: "Could not extract place name from URL" },
        { status: 400 }
      );
    }

    const placeName = decodeURIComponent(placeNameMatch[1]);

    // Wait for and click the reviews button
    const reviewButtonText = `對「${placeName}」的評論`;
    await page.waitForSelector(
      `button[role="tab"][aria-label="${reviewButtonText}"]`
    );
    await page.click(`button[role="tab"][aria-label="${reviewButtonText}"]`);

    // Wait for and click the sort button
    await page.waitForSelector(
      'button[aria-label="排序評論"][data-value="排序"]'
    );
    await page.click('button[aria-label="排序評論"][data-value="排序"]');

    // Wait for sort menu and click "Most Recent" option
    await page.waitForSelector('div[role="menu"][id="action-menu"]');
    await page.evaluate(() => {
      const menuItems = document.querySelectorAll(
        'div[role="menu"][id="action-menu"] div'
      );
      for (const item of menuItems) {
        if (item.textContent?.includes("最新")) {
          (item as HTMLElement).click();
          break;
        }
      }
    });

    // Scroll to load more reviews
    await page.evaluate(async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const mainDiv = document.querySelector('div[role="main"]');
      const container = mainDiv?.children[1]; // Select the second child element

      for (let i = 0; i < 10; i++) {
        // Scroll 10 times or adjust as needed
        if (container) {
          container.scrollTo(0, container.scrollHeight);
          await delay(1000); // Wait 1 second for new content to load
        }
      }
    });

    // Step 3: Scrape review data
    const reviews = await page.evaluate(() => {
      // Find all review containers by their semantic structure
      const reviewElements = document.querySelectorAll("div[aria-label]");
      return Array.from(reviewElements)
        .filter((review) => review.hasAttribute("data-review-id"))
        .map((review) => {
          // Get reviewer name from the profile link
          const userName =
            review
              .querySelector('button[aria-label$="的相片"]')
              ?.getAttribute("aria-label")
              ?.replace("的相片", "") || "Anonymous";

          // Get rating from the star display element
          const ratingElement = review.querySelector('span[role="img"]');
          const rating =
            ratingElement?.getAttribute("aria-label") || "No rating";

          // Get timestamp from the review metadata
          const time =
            review.querySelector('span[class="rsqaWe"]')?.textContent || "";

          // Get review content from the text container
          const content =
            review.querySelector('span[class="wiI7pd"]')?.textContent || "";

          // Get photos from the image buttons
          const photoButtons = review.querySelectorAll(
            'button[aria-label*="相片"]'
          );
          const photos = Array.from(photoButtons)
            .map((button) => {
              const style = button.getAttribute("style") || "";
              const urlMatch = style.match(/url\("([^"]+)"\)/);
              return urlMatch ? urlMatch[1] : null;
            })
            .filter((url) => url !== null);

          return {
            user: userName,
            rating,
            time,
            content,
            photos: photos.length > 0 ? photos : [],
          };
        });
    });

    await browser.close();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error during scraping:", error);
    return NextResponse.json(
      { error: "Failed to process the URL" },
      { status: 500 }
    );
  }
}
