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
import { parse } from "partial-json";
import { Skeleton } from "t/components/ui/skeleton";
import Markdown from "react-markdown";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
  organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION ?? "",
  dangerouslyAllowBrowser: true,
});

const ASSISTANT_ID = "asst_lX1CxKABQX3ktPhmclqt3cGi";
const schema = zodResponseFormat(
  z.object({
    fases: z.array(
      z.object({
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
  const [loadingEsts, setLoadingEsts] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [summmary, setSummary] = useState<string>("");
  const [estimaciones, setEstimaciones] = useState<
    (typeof schema)["__output"]["fases"]
  >([]);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!(e.target.files && e.target.files.length > 0 && e.target.files[0])) {
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setText(e.target?.result as string);
        console.log("text", e.target?.result as string);
      };
      reader.readAsText(file);
    }
    setFile(file);
  };

  const handleGet = async () => {
    if (file && text) {
      setLoadingEsts(true);
      setIsStreaming(true);
      setEstimaciones([]);

      const thread = await openai.beta.threads.create({
        messages: [{ role: "user", content: text }],
      });
      const res = openai.beta.threads.runs
        .stream(
          thread.id,
          {
            assistant_id: ASSISTANT_ID,
            model: "gpt-4o-mini",
            response_format: schema,
            temperature: 1,
            top_p: 1,
            tools: [],
          },
          { stream: true },
        )
        .on("textDelta", (message, snapshot) => {
          if (!message.value) {
            return;
          }
          try {
            const prev = parse(snapshot.value) as (typeof schema)["__output"];
            console.log("prev", prev);
            if (prev.fases) {
              if (prev.fases.length > 0) {
                const previewPrev = [] as (typeof schema)["__output"]["fases"];
                for (const fase of prev.fases) {
                  try {
                    if (
                      fase.descripcion &&
                      fase.nombre &&
                      fase.time_estimation &&
                      fase.manforce
                    ) {
                      previewPrev.push(fase);
                    }
                  } catch (error) {}
                }
                setLoadingEsts(previewPrev.length === 0);
                setEstimaciones(previewPrev);
              }
            }
          } catch (error) {}
        })
        .on("textDone", (message, snapshot) => {
          const texto = message.value;
          try {
            const respuesta = schema.$parseRaw(texto);
            setLoadingEsts(false);
            setEstimaciones(respuesta.fases);
            setIsStreaming(false);
          } catch (error) {}
        });
      setLoadingEsts(false);
      await res.done();
    }
  };

  const handleGetSummary = async () => {
    if (file && text) {
      setLoadingSummary(true);
      const res = openai.beta.chat.completions
        .stream({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Tu tarea es dar un resumen detallado pero conciso de un documento de negocios. Brinda información importante y relevante que le pueda servir a un Project Manager para entender el documento y dar sus mejores contribuciones a las fases del proyecto y a la estimación de tiempo y recursos. Debes hacer el resultado lo mas corto posible. Usa algunos bullet points (con - ).",
            },
            { role: "user", content: text },
          ],
          stream: true,
        })
        .on("content.delta", (lis) => {
          setLoadingSummary(false);
          setSummary(lis.snapshot);
        })
        .on("content.done", (lis) => {
          setLoadingSummary(false);
          console.log("lisRES", lis);
          setSummary(lis.content);
        });
      console.log("res", res);
      setLoadingSummary(false);
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
                className={cn("my-2 w-full px-4 py-2")}
                variant={activeMenuItem === item ? "default" : "outline"}
                onClick={() => handleMenuClick(item)}
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
              <Button
                disabled={!file}
                className="w-full"
                onClick={() => {
                  void Promise.all([void handleGet(), void handleGetSummary()]);
                }}
              >
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
          <CardContent className="max-h-72 overflow-y-auto">
            {loadingSummary ? (
              <Skeleton className="h-8 w-[250px]" />
            ) : (
              <Markdown>{summmary}</Markdown>
            )}
          </CardContent>
        </Card>
        <Separator className="my-4" />
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Estimations</CardTitle>
          </CardHeader>

          <div className="flex flex-wrap justify-evenly">
            {loadingEsts && (
              <Card className="m-4 max-w-lg bg-white">
                <CardHeader>
                  <Skeleton className="h-8 w-[250px]" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-[250px]" />
                  <Skeleton className="h-4 w-[250px]" />
                </CardContent>
              </Card>
            )}
            {estimaciones.map((fase) => (
              <Card key={fase.nombre} className="m-4 max-w-lg bg-gray-50">
                <CardHeader>
                  <CardTitle>{fase.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex w-full flex-col items-center justify-center space-y-2">
                    <div className="flex w-full">
                      <Button variant="outline">
                        {fase.time_estimation.tiempo}{" "}
                        {fase.time_estimation.unidad}{" "}
                      </Button>
                    </div>
                    <div className="flex w-full flex-wrap space-x-2">
                      {fase.manforce.map((mf) => (
                        <Button key={mf.nombre} variant="outline">
                          {mf.cantidad} {mf.nombre}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{fase.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>

        <Separator className="my-4" />
      </div>
    </div>
  );
}
