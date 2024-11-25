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

  // Extract theme properties from styleSheet
  const theme = {
    background: styleSheet.background_color ?? "#FFFFFF",
    color: styleSheet.color ?? "#333333",
    font_size: parseInt(styleSheet.font_size ?? "") ?? 18,
    font_family: styleSheet.font_family ?? "Arial",
    h1_size: parseInt(styleSheet.h1_font_size ?? "") ?? 36,
    h2_size: parseInt(styleSheet.h2_font_size ?? "") ?? 30,
    h3_size: parseInt(styleSheet.h3_font_size ?? "") ?? 24,
  };

  // Apply theme
  pres.defineLayout({ name: "MARP", width: 10, height: 5.625 });
  pres.layout = "MARP";

  // Helper function to process HTML content
  const processContent = (
    element: Element,
  ): { text: string; level: number; className?: string } => {
    const className = element.className;

    if (element.tagName === "H1")
      return { text: element.textContent ?? "", level: 1, className };
    if (element.tagName === "H2")
      return { text: element.textContent ?? "", level: 2, className };
    if (element.tagName === "H3")
      return { text: element.textContent ?? "", level: 3, className };
    if (element.tagName === "P")
      return { text: element.textContent ?? "", level: 0, className };
    if (element.tagName === "UL" || element.tagName === "OL") {
      const items = Array.from(element.children)
        .map((li) => `• ${li.textContent}`)
        .join("\n");
      return { text: items, level: 0, className };
    }
    return { text: element.textContent ?? "", level: 0, className };
  };

  // Function to get style properties for an element
  const getStyleForElement = (className: string | undefined, level: number) => {
    const classStyles = className
      ? (styleSheet[className] ?? {})
      : ({} as Record<string, string>);

    const fontSize =
      level === 1
        ? theme.h1_size
        : level === 2
          ? theme.h2_size
          : level === 3
            ? theme.h3_size
            : theme.font_size;

    return {
      fontSize,
      color:
        (typeof classStyles === "object" ? classStyles.color : undefined) ??
        theme.color,
      font_face:
        (typeof classStyles === "object"
          ? classStyles.font_family
          : undefined) ?? theme.font_family,
      align: level === 0 ? "left" : "center",
      bold: level > 0,
    };
  };

  // Process each slide
  slides.forEach((slide) => {
    const pptSlide = pres.addSlide();

    // Get slide-specific background if it exists
    const slideBackground =
      slide.getAttribute("data-background") ??
      styleSheet.slide_background ??
      theme.background;

    // Process slide content
    let yPos = 2;
    Array.from(slide.children).forEach((element) => {
      const { text, level, className } = processContent(element);
      if (text.trim()) {
        const styleProps = getStyleForElement(className, level);

        pptSlide.addText(text, {
          x: 0.5,
          y: yPos,
          w: "90%",
          h: undefined,
          ...styleProps,
          align:
            styleProps.align == "left"
              ? "left"
              : styleProps.align == "center"
                ? "center"
                : styleProps.align == "right"
                  ? "right"
                  : styleProps.align == "justify"
                    ? "justify"
                    : "left",
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
    pptSlide.background = { color: slideBackground };
  });

  // Generate PPTX as blob
  return (await pres.write({
    outputType: "blob",
  })) as Blob;
}

export async function marpExporterHTML(mdContent: string): Promise<Blob> {
  // Initialize Marp
  const marp = new Marp({
    html: true,
    markdown: {
      breaks: true,
    },
  });

  // Convert markdown to HTML/CSS using Marp
  const { html, css } = marp.render(mdContent);

  const newHtml = `${html}<style>${css}</style>`;
  const blob = new Blob([newHtml], { type: "text/html" });

  return blob;
}
