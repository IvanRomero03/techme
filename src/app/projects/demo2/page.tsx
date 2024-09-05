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

import { api } from "techme/trpc/react";
import CrearTabReact from "./_comp";

export default function ProjectMenu() {
  const tabla = api.tabla.listar.useQuery();

  const mut = api.tabla.crear.useMutation();
  const utils = api.useUtils();
  const [te, setTe] = useState("");
  return (
    <>
      <div className="mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
        {/* Estimations Section */}
        {/* Summary */}
        <Input
          type="text"
          onChange={(e) => {
            setTe(e.target.value);
          }}
        />
        <Button
          onClick={async () => {
            await mut.mutateAsync({ name: te });
            await utils.tabla.listar.invalidate();
          }}
        >
          Asd
        </Button>
        <Separator className="my-4" />
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Tabla</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {tabla?.data?.map((tab) => <p key={tab.id}>{tab.name}</p>)}
          </CardContent>
        </Card>

        <Separator className="my-4" />
      </div>
    </>
  );
}
