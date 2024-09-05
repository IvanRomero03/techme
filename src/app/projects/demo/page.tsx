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

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
  organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION ?? "",
  dangerouslyAllowBrowser: true,
});

const ASSISTANT_ID = "asst_AoTYS0oMGnGEpU7qb41y83Im";
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
  const [preview, setPreview] = useState<string>("");
  const [estimaciones, setEstimaciones] = useState<
    (typeof schema)["__output"]["fases"]
  >([]);

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
          },
          { stream: true },
        )
        // .on("messageDelta", (message, snapshot) => {})
        .on("textDelta", (message, snapshot) => {
          // setPreview(snapshot.value);
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
                      // console.log("fase", fase);
                      previewPrev.push(fase);
                    }
                  } catch (error) {}
                }
                setEstimaciones(previewPrev);
              }
            }
          } catch (error) {}
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
          <p>{preview}</p>
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
