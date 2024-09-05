"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { cn } from "lib/utils";
import { Input } from "t/components/ui/input";
import { Separator } from "t/components/ui/separator";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Stream } from "stream";
// import pdfToText from "react-pdftotext";
// import { pdfjs } from "react-pdf";
// // import type { PDFDocumentProxy } from "pdfjs-dist";
// import { TextItem, PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// const PdfExtractor = async (file: PDFDocumentProxy) => {
//   let text = "";
//   const pages = file.numPages;

//   for (let i = 1; i <= pages; i++) {
//     const page = await file.getPage(i);
//     const textContent = await page.getTextContent();
//     textContent.items.forEach((item) => {
//       // if item has str property, then it is a text item
//       if ((item as TextItem).str) {
//         text += (item as TextItem).str + " ";
//       }
//     });
//   }
//   return text;
// };

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION,
  dangerouslyAllowBrowser: true,
  //   project: process.env.OPENAI_PROJECT,
});

const ASSISTANT_ID = "asst_AoTYS0oMGnGEpU7qb41y83Im";
const schema = zodResponseFormat(
  z.object({
    fases: z.array(
      z.object({
        fase: z.object({
          nombre: z.string(),
          descripcion: z.string(),
          time_estimation: z.object({
            tiempo: z.string(),
            unidad: z.string(),
          }),
          manforce: z.array(
            z.object({ nombre: z.string(), cantidad: z.number() }),
          ),
        }),
      }),
    ),
  }),
  "fases_estimaciones",
);
export default function ProjectMenu() {
  const [activeMenuItem, setActiveMenuItem] = useState("Demo");

  const menuItems = [
    "Requirements",
    "Planning",
    "Analysis",
    "Estimations",
    "Proposals",
    "Validation",
    "Demo",
  ];

  const handleMenuClick = (item: string) => {
    setActiveMenuItem(item);
  };

  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!(e.target.files && e.target.files.length > 0 && e.target.files[0])) {
      //   setFile(e.target.files[0]);
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    //if .txt file
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setText(e.target?.result as string);
        console.log("text", e.target?.result as string);
      };
      reader.readAsText(file);
    }
    // if (file.type !== "application/pdf") {
    //   return;
    // }

    // const reader = new FileReader();

    // reader.onload = async (e) => {
    //   const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
    //   const pdf = await pdfjs.getDocument(typedArray).promise;
    //   const extractedText = await PdfExtractor(pdf);
    //   console.log(extractedText);
    //   setText(extractedText);
    // };

    // reader.readAsArrayBuffer(file);
    setFile(file);
  };
  const [estimaciones, setEstimaciones] = useState<
    (typeof schema)["__output"]["fases"]
  >([]);
  const handleGet = async () => {
    if (file && text) {
      //   const data = new FormData();
      //   data.append("file", file);

      //   const asd = await openai.beta.assistants.list();
      //   const stream = await openai.beta.assistants.create(
      //     {
      //       name: "Test PM Estimations Assistant",
      //       model: "gpt-4o-mini",
      //       instructions:
      //         "Eres un asistente en un sistema de manejo de preventa. Ayuda al proyect manager a resumir la información y destacar la información más importante. Despliega todas las fases que entraran en la planificación y desarrollo en torno a las necesidades del cliente y proyecto. Crea las fases no de manera generalizada, más específica en torno a la descripción del proyecto. Preferentemente solo incluye etapas que sean relacionadas a etapas dentro del desarrollo específico del proyecto.",
      //       temperature: 1,
      //       top_p: 1,
      //       response_format: zodResponseFormat(
      //         z.object({
      //           fases: z.array(
      //             z.object({
      //               fase: z.object({
      //                 nombre: z.string(),
      //                 descripcion: z.string(),
      //                 time_estimation: z.object({
      //                   tiempo: z.string(),
      //                   unidad: z.string(),
      //                 }),
      //                 manforce: z.array(
      //                   z.object({
      //                     nombre: z.string(),
      //                     cantidad: z.number(),
      //                   }),
      //                 ),
      //               }),
      //             }),
      //           ),
      //         }),
      //         "fases_estimaciones",
      //       ),
      //     },
      //     // { stream: true },
      //   );
      //   console.log(asd);
      //   for await (const chunk of stream) {
      //     process.stdout.write(chunk.choices[0]?.delta?.content || "");
      // }
      //   console.log("stream", stream);
      //   for await (const chunk of stream) {
      //     console.log("chunk", chunk);
      //   }
      //   const stream = await openai.beta.threads.create({
      //     messages: [{ role: "user", content: await file.text() }],
      //   },
      // {

      // });
      //   const texto = await pdfToText(file)
      //     .then((text) => {
      //       console.log(text);
      //       return text;
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       return "";
      //     });
      //   let texto = "";
      //   try {
      //     texto = pdfToText(file);
      //   } catch (error) {
      //     console.log(error);
      //     return;
      //   }

      console.log("aqui", text);

      const thread = await openai.beta.threads.create({
        messages: [{ role: "user", content: text }],
      });
      const res = openai.beta.threads.runs
        .stream(
          thread.id,
          {
            assistant_id: ASSISTANT_ID,
            // stream: true,
            model: "gpt-4o-mini",
            response_format: schema,
            temperature: 1,
            top_p: 1,
            tools: [],
            // tools: [
            //   {
            //     function: { name: "get_fases_estimaciones", strict: false },
            //     type: "function",
            //   },
            // ],
          },
          { stream: true },
        )
        .on("messageDelta", (message, snapshot) => {
          // console.log("msDelta[ms]", message);
          // console.log("msDelta[sn]", snapshot);
        })
        .on("textDelta", (message, snapshot) => {
          // console.log("txtDelta[ms]", message);
          // console.log("txtDelta[sn]", snapshot);
        })
        .on("textDone", (message, snapshot) => {
          // console.log("txtDone[ms]", message);
          const texto = message.value;
          try {
            const respuesta = schema.$parseRaw(texto);
            setEstimaciones(respuesta.fases);
            // console.log("respuesta", respuesta);
          } catch (error) {
            // console.log("json zod parse error", error);
          }
          // console.log("txtDone[sn]", snapshot);
        });
      await res.done();
      //   let data = [];
      // for await (const chunk of res) {
      //   console.log(chunk);
      //   // data.push(chunk.data.choices[0]?.delta?.content as any);
      //   // data.append(chunk.choices[0]?.delta?.content as any);
      // }
      //   console.log(data);
      //   const response = openai.beta.threads.createAndRun(
      //     {
      //       assistant_id: ASSISTANT_ID,
      //     },
      //     {
      //       stream: true,
      //     },
      //   );
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar Menu */}
      <div className="my-4 w-1/5 rounded-2xl bg-gray-100 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item}>
              <Button
                className={
                  cn("my-2 w-full px-4 py-2")
                  //   "w-full rounded-md px-4 py-2 text-left transition-colors",
                  //   activeMenuItem === item ? "bg-gray-200" : "bg-transparent",
                }
                variant={activeMenuItem === item ? "default" : "outline"}
                onClick={() => handleMenuClick(item)}
                // disabled={activeMenuItem === item }
                disabled={item !== "Demo"}
              >
                {item}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
        {/* Estimations Section */}
        <h2 className="mb-4 text-2xl font-bold">{activeMenuItem}</h2>

        <div className="mb-6 grid grid-cols-2 gap-5">
          {/* Example Phase Cards */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Upload Context</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <Input type="file" onChange={handleFileUpload} />
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Upload</CardTitle>
            </CardHeader>
            <CardContent className="flex w-full space-x-4">
              <Button disabled={!file} className="w-full" onClick={handleGet}>
                Get
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <p></p>
        </Card>
        <Separator className="my-4" />
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Estimations</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap justify-evenly">
            {estimaciones.map((fase) => (
              <Card key={fase.fase.nombre} className="m-4 max-w-lg bg-gray-50">
                <CardHeader>
                  <CardTitle>{fase.fase.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex w-full flex-col items-center justify-center space-y-2">
                    <div className="flex w-full">
                      <Button variant="outline">
                        {fase.fase.time_estimation.tiempo}{" "}
                        {fase.fase.time_estimation.unidad}{" "}
                      </Button>
                    </div>
                    <div className="flex w-full flex-wrap space-x-2">
                      {fase.fase.manforce.map((mf) => (
                        <Button key={mf.nombre} variant="outline">
                          {mf.cantidad} {mf.nombre}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{fase.fase.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>

        <Separator className="my-4" />

        {/* Total Estimation Section */}
        <h3 className="mb-4 text-xl font-bold">Total Estimation</h3>
        <div className="flex space-x-4">
          <Button variant="outline">Time Estimation</Button>
          <Button variant="outline">Manforce</Button>
        </div>
      </div>
    </div>
  );
}
