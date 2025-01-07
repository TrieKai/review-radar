import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Chromium setting
chromium.setGraphicsMode = false;
chromium.setHeadlessMode = true;

const getChromePath = () => {
  switch (process.platform) {
    case "win32":
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    case "darwin":
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    case "linux":
      return "/usr/bin/google-chrome";
    default:
      return "/usr/bin/google-chrome";
  }
};

const browserOptions =
  process.env.NODE_ENV === "development"
    ? {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--disable-extensions",
        ],
        executablePath: getChromePath(),
        defaultViewport: null,
      }
    : {
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--disable-extensions",
        ],
        defaultViewport: null,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shortUrl = searchParams.get("url");

  if (!shortUrl) {
    console.log("Error: Missing URL parameter");
    return NextResponse.json(
      { error: "Missing Google Maps short URL" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    const longUrl = response.url;

    if (!longUrl.startsWith("https://www.google.com/maps/")) {
      console.log("Error: Invalid Maps URL");
      return NextResponse.json(
        { error: "Invalid Google Maps URL" },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Optimizing page loading
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Block unnecessary resources
      const resourceType = request.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "stylesheet" ||
        resourceType === "font" ||
        resourceType === "media"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(longUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Extract place name
    const placeNameMatch = longUrl.match(/place\/([^/@]+)/);
    if (!placeNameMatch) {
      console.log("Error: Could not extract place name");
      await browser.close();
      return NextResponse.json(
        { error: "Could not extract place name from URL" },
        { status: 400 }
      );
    }

    const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));

    // Wait for and click the reviews button
    const reviewsButton = await page.waitForSelector(
      'button[role="tab"][aria-label*="的評論"], button[role="tab"][aria-label*="Reviews for"]',
      { timeout: 5000 }
    );

    if (!reviewsButton) {
      throw new Error("Reviews button not found");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    await reviewsButton.evaluate((b) => b.click());

    // Wait for and click the sort button
    await page.waitForSelector(
      'button[aria-label="排序評論"][data-value="排序"], button[aria-label="Sort reviews"][data-value="Sort"]',
      { timeout: 5000 }
    );

    const sortButton = await page.$(
      'button[aria-label="排序評論"][data-value="排序"], button[aria-label="Sort reviews"][data-value="Sort"]'
    );
    if (!sortButton) {
      throw new Error("Sort button not found");
    }
    await sortButton.evaluate((b) => b.click());

    // Wait for sort menu and click "Most Recent" option
    await page.waitForSelector('div[role="menu"][id="action-menu"]', {
      timeout: 5000,
    });
    await page.evaluate(() => {
      const menuItems = document.querySelectorAll(
        'div[role="menu"][id="action-menu"] div[role="menuitemradio"]'
      );
      for (const item of menuItems) {
        if (
          item.textContent?.includes("最新") ||
          item.textContent?.includes("Newest")
        ) {
          (item as HTMLElement).click();
          return true;
        }
      }
      return false;
    });

    console.time("reviews show up");
    await page.waitForSelector("div[aria-label][data-review-id]", {
      timeout: 60000,
    });
    console.timeEnd("reviews show up");

    // Scroll to load more reviews
    await page.evaluate(async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const mainDiv = document.querySelector('div[role="main"]');
      const container = mainDiv?.children[1]; // Select the second child element

      for (let i = 0; i < 15; i++) {
        // Scroll 15 times or adjust as needed
        if (container) {
          container.scrollTo(0, container.scrollHeight);
          await delay(300); // Wait 300 ms for new content to load
        }
      }
    });

    // Scrape review data
    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll("div[aria-label]");
      return Array.from(reviewElements)
        .filter((review) => review.hasAttribute("data-review-id"))
        .map((review) => {
          // Find user info button by data-review-id
          const reviewId = review.getAttribute("data-review-id");
          const userInfoButton = review.querySelectorAll(
            `button[data-review-id="${reviewId}"]`
          )[1];

          // Get all text content divs inside the button
          const infoDivs = userInfoButton?.querySelectorAll("div") || [];
          const [nameDiv, guideInfoDiv] = Array.from(infoDivs);

          const userName = nameDiv?.textContent || "Anonymous";
          const guideInfo = guideInfoDiv?.textContent || ""; // Keep the original guide info text

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
            user: userName,
            userInfo: guideInfo, // Now just a string like "在地嚮導 · 19 則評論 · 930 張相片"
            rating: rating.replace(/\D/g, ""),
            time,
            content,
            photos: photos.length > 0 ? photos : [],
          };
        });
    });

    await browser.close();

    // Return both reviews and analysis
    return NextResponse.json({
      placeName,
      reviews,
    });
  } catch (error) {
    console.error("Error occurred at step:", error);
    return NextResponse.json(
      { error: `Failed to process the URL: ${error}` },
      { status: 500 }
    );
  }
}
