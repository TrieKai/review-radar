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

export const browserOptions =
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
        executablePath: await chromium.executablePath(),
        defaultViewport: null,
        headless: chromium.headless,
      };
