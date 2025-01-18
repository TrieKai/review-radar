import { Page } from "puppeteer-core";

export const optimizePage = async (page: Page): Promise<void> => {
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
};
