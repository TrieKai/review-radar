import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Extract place name from URL for analysis only
    const placeNameMatch = longUrl.match(/place\/([^/@]+)/);
    if (!placeNameMatch) {
      await browser.close();
      return NextResponse.json(
        { error: "Could not extract place name from URL" },
        { status: 400 }
      );
    }

    const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));

    // Wait for and click the reviews button using wildcard
    await page.waitForSelector('button[role="tab"][aria-label*="的評論"]');
    await page.click('button[role="tab"][aria-label*="的評論"]');

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

      for (let i = 0; i < 5; i++) {
        // Scroll 10 times or adjust as needed
        if (container) {
          container.scrollTo(0, container.scrollHeight);
          await delay(1000); // Wait 1 second for new content to load
        }
      }
    });

    // Step 3: Scrape review data
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
            userInfo: guideInfo, // Now just a string like "在地嚮導 · 19 則評論 · 930 張相片"
            rating: rating.replace(/\D/g, ""),
            time,
            content,
            photos: photos.length > 0 ? photos : [],
          };
        });
    });

    await browser.close();

    // Filter reviews to only include essential data for analysis
    const filteredReviews = reviews.map((review) => ({
      userInfo: review.userInfo.replace(/\s/g, ""),
      rating: review.rating,
      time: review.time,
      content: review.content,
      photoCount: review.photos.length,
    }));

    // After getting reviews, analyze them with ChatGPT
    const analysisPrompt = `分析Google Maps上「${placeName}」的評論是否有洗評論的可能性。以下是該地點依序由新到舊的評論資料，請考慮發文時間、寫作風格、照片數量、評分模式、使用者資訊（是否為在地嚮導、過去評論的數量和過去上傳的照片數量）和內容品質。
        Reviews: ${JSON.stringify(filteredReviews)}

        Reply in JSON:
        {
          "suspicionScore": number,
          "findings": string[],
          "radarData": {
            "languageNaturalness": number,
            "relevance": number,
            "commentLength": number,
            "postingTimeConsistency": number,
            "userHistory": number
          }
        }`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "你是一位專業的評論分析專家，擅長偵測可疑的評論模式。請使用你的專業知識來分析評論資料，並提供詳細的分析結果，並將結果以JSON格式呈現，包含懷疑分數、發現的可疑點和各項指標的雷達數據。",
        },
        { role: "user", content: analysisPrompt },
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "");

    // Return both reviews and analysis
    return NextResponse.json({
      reviews,
      analysis,
    });
  } catch (error) {
    console.error("Error during processing:", error);
    return NextResponse.json(
      { error: "Failed to process the URL" },
      { status: 500 }
    );
  }
}
