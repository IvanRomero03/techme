import { Marp } from "@marp-team/marp-core";
import pptxgen from "pptxgenjs";

export default async function marpExporter(mdContent: string): Promise<Blob> {
  // Initialize Marp
  const marp = new Marp({
    html: true,
    markdown: {
      breaks: true,
    },
  });

  // Convert markdown to HTML/CSS using Marp
  const { html, css } = marp.render(mdContent);

  // Create temporary container to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const slides = doc.querySelectorAll("section");

  // Initialize pptxgen
  const pres = new pptxgen();

  // Convert CSS to PPTX theme
  const theme = {
    background: "#FFFFFF",
    color: "#333333",
    font_size: 18,
  };

  // Parse CSS for theme properties
  const styleSheet = css.split("\n").reduce(
    (acc, line) => {
      const [prop, value] = line.split(":").map((s) => s.trim());
      if (prop && value) {
        acc[prop.replace("-", "_")] = value.replace(";", "");
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  // Apply theme
  pres.defineLayout({ name: "MARP", width: 10, height: 5.625 });
  pres.layout = "MARP";

  // Helper function to process HTML content
  const processContent = (
    element: Element,
  ): { text: string; level: number } => {
    if (element.tagName === "H1")
      return { text: element.textContent ?? "", level: 1 };
    if (element.tagName === "H2")
      return { text: element.textContent ?? "", level: 2 };
    if (element.tagName === "H3")
      return { text: element.textContent ?? "", level: 3 };
    if (element.tagName === "P")
      return { text: element.textContent ?? "", level: 0 };
    if (element.tagName === "UL" || element.tagName === "OL") {
      const items = Array.from(element.children)
        .map((li) => `• ${li.textContent}`)
        .join("\n");
      return { text: items, level: 0 };
    }
    return { text: element.textContent ?? "", level: 0 };
  };

  // Process each slide
  slides.forEach((slide) => {
    const pptSlide = pres.addSlide();

    // Process slide content
    let yPos = 0.5;
    Array.from(slide.children).forEach((element) => {
      const { text, level } = processContent(element);
      if (text.trim()) {
        const fontSize =
          level === 0 ? theme.font_size : theme.font_size * (1.5 - level * 0.2);

        pptSlide.addText(text, {
          x: 0.5,
          y: yPos,
          w: "90%",
          h: undefined,
          fontSize: fontSize,
          color: theme.color,
          align: level === 0 ? "left" : "center",
          bold: level > 0,
        });

        yPos += 0.5;
      }
    });

    // Handle images
    const images = slide.querySelectorAll("img");
    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src?.startsWith("data:image")) {
        pptSlide.addImage({
          data: src,
          x: 0.5,
          y: yPos,
          w: "90%",
          h: "90%",
        });
        yPos += 2;
      }
    });

    // Apply background
    pptSlide.background = { color: theme.background };
  });

  // Generate PPTX as blob
  return (await pres.write({
    outputType: "blob",
  })) as Blob;
}
