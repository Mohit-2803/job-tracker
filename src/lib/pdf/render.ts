import { chromium } from "playwright";

export async function renderPdfFromUrl(url: string): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 794, height: 1123 }, // ~A4 at 96dpi
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // Per-page margins so multi-page resumes have consistent breathing room.
      // Without these, the second page slams content against the paper edge
      // because the template's `py-*` only applies once at document scope.
      margin: {
        top: "14mm",
        right: "14mm",
        bottom: "14mm",
        left: "14mm",
      },
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
