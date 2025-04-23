import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { browserOptions } from "../_helpers/chrome";
import { optimizePage } from "../_helpers/page";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shortUrl = searchParams.get("url");
  const sort = searchParams.get("sort") || "relevant";
  const fullContent = searchParams.get("fullContent");
  const scrollTimes = searchParams.get("scrollTimes");

  // Check if it's a cron job from GitHub Actions
  if (req.headers.get("user-agent")?.includes("GitHub-Actions")) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  if (!shortUrl) {
    console.log("Error: Missing URL parameter");
    return NextResponse.json(
      { error: "Missing Google Maps short URL" },
      { status: 400 }
    );
  }

  try {
    console.time("place reviews API"); // start
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

    // Add language parameter and navigate to it
    const urlObj = new URL(longUrl);
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

    // Extract place name
    const finalUrl = page.url();
    const placeNameMatch = finalUrl.match(/place\/([^/@]+)/);
    if (!placeNameMatch) {
      console.log("Error: Could not extract place name");
      await browser.close();
      return NextResponse.json(
        { error: "Could not extract place name from URL" },
        { status: 400 }
      );
    }

    const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));

    if (sort !== "relevant") {
      // Wait for and click the sort button
      console.time("wait for sort button");
      const sortButton = await page.waitForSelector(
        'button[aria-label="排序評論"][data-value="排序"], button[aria-label="Sort reviews"][data-value="Sort"]',
        { timeout: 10000 }
      );
      console.timeEnd("wait for sort button");

      if (!sortButton) {
        return NextResponse.json({
          placeName,
          reviews: [],
        });
      }

      console.time("click sort button");
      await sortButton.evaluate(async (b) => {
        b.scrollIntoView({ behavior: "instant", block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        b.click();
      });
      console.timeEnd("click sort button");

      // Wait for sort menu and click "Most Recent" option
      console.time("wait for sort menu");
      await page.waitForSelector('div[role="menu"][id="action-menu"]', {
        timeout: 10000,
      });
      console.timeEnd("wait for sort menu");

      console.time("click most recent");
      await page.evaluate((sort) => {
        const sortChineseText =
          sort === "newest"
            ? "最新"
            : sort === "highest"
            ? "評分最高"
            : "評分最低";
        const sortEnglishText =
          sort === "newest"
            ? "Newest"
            : sort === "highest"
            ? "Highest rating"
            : "Lowest rating";
        const menuItems = document.querySelectorAll(
          'div[role="menu"][id="action-menu"] div[role="menuitemradio"]'
        );
        for (const item of menuItems) {
          if (
            item.textContent?.includes(sortChineseText) ||
            item.textContent?.includes(sortEnglishText)
          ) {
            (item as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, sort);
      console.timeEnd("click most recent");
    } else {
      // Wait for and click the reviews button
      console.time("wait for reviews button");
      const reviewsButton = await page.waitForSelector(
        'button[role="tab"][aria-label*="的評論"], button[role="tab"][aria-label*="Reviews for"]',
        { timeout: 5000 }
      );
      console.timeEnd("wait for reviews button");
      if (!reviewsButton) {
        throw new Error("Reviews button not found");
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await reviewsButton.evaluate((b) => b.click());
    }

    const { totalRating, totalReviewCount } = await page.evaluate(() => {
      const reviewElement = document.querySelector(
        'div[role="img"][aria-label*="顆星"], div[role="img"][aria-label*="stars"]'
      );
      const reviewCountElement = reviewElement?.nextElementSibling;
      return {
        totalRating: reviewElement?.getAttribute("aria-label") || "No rating",
        totalReviewCount: reviewCountElement?.textContent || "0",
      };
    });

    console.time("reviews show up");
    await page.waitForSelector("div[aria-label][data-review-id]", {
      timeout: 60000,
    });
    console.timeEnd("reviews show up");

    // Scroll to load more reviews
    console.time("scroll");
    await page.evaluate(async (scrollTimes) => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const mainDiv = document.querySelector('div[role="main"]');
      const container = mainDiv?.children[1]; // Select the second child element

      const scrollTimesNumber = scrollTimes ? parseInt(scrollTimes) : 10;
      for (let i = 0; i < scrollTimesNumber; i++) {
        // Scroll down 10 times or adjust as needed
        if (container) {
          container.scrollTo(0, container.scrollHeight);
          await delay(300); // Wait 300 ms for new content to load
        }
      }
    }, scrollTimes);
    console.timeEnd("scroll");

    if (fullContent === "true") {
      // Wait for and click the "Show more" button
      console.time("click show more");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.evaluate(() => {
        const buttons = document.querySelectorAll(
          'button[aria-label="顯示更多"]'
        ) as NodeListOf<HTMLButtonElement>;
        buttons.forEach((button) => button.click());
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.timeEnd("click show more");
    }

    // Scrape review data
    console.time("scrape");
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
          const userUrl = userInfoButton?.getAttribute("data-href") || "";
          const infoDivs = userInfoButton?.querySelectorAll("div") || [];
          const [nameDiv, guideInfoDiv] = Array.from(infoDivs);

          const userAvatarButton = review.querySelector(
            'button[aria-label*="的相片"], button[aria-label*="Photo of"]'
          );
          const userAvatar =
            userAvatarButton?.children[0].getAttribute("src") || "";

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
            userName,
            userAvatar,
            userUrl,
            userInfo: guideInfo, // Now just a string like "在地嚮導 · 19 則評論 · 930 張相片"
            rating: rating.replace(/\D/g, ""),
            time,
            content,
            photos: photos.length > 0 ? photos : [],
          };
        });
    });
    console.timeEnd("scrape");

    await browser.close();
    console.timeEnd("place reviews API"); // end

    // Return both reviews and analysis
    return NextResponse.json({
      placeName,
      totalRating,
      totalReviewCount,
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
