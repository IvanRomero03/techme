import { Marp } from "@marp-team/marp-core";
import PptxGenJS from "pptxgenjs";

export default async function marpExporter(mdContent: string): Promise<Blob> {
  // Initialize Marp to render Markdown
  const marp = new Marp();
  const { html, css } = marp.render(mdContent);

  // Create a new PowerPoint presentation
  const pres = new PptxGenJS();

  // Parse the rendered HTML to extract slides
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const slides = doc.querySelectorAll("section");
  const bgColorRegex = /background-color:\s*([^;]+)/;
  const textColorRegex = /color:\s*([^;]+)/;
  const bgColorMatch = bgColorRegex.exec(css);
  const textColorMatch = textColorRegex.exec(css);
  // Add each slide to the PowerPoint
  slides.forEach((slide, index) => {
    const presSlide = pres.addSlide();

    // Add slide content
    presSlide.addText(slide.textContent ?? "", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 6,
      color: textColorMatch ? textColorMatch[1] : "000000", // default to black if no color found
      fontFace: "Arial", // You can extract font from CSS if needed
    });

    // Set background color if found in CSS
    if (bgColorMatch) {
      presSlide.background = { color: bgColorMatch[1] };
    }
  });

  // Generate the PowerPoint file
  const blob = await pres.write({
    outputType: "blob",
  });

  return blob as Blob;
}
