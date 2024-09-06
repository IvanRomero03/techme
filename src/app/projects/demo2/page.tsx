"use client";

import { useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { Separator } from "t/components/ui/separator";

import { api } from "techme/trpc/react";

export default function ProjectMenu() {
  const tabla = api.tabla.listar.useQuery();

  const mut = api.tabla.crear.useMutation();
  const utils = api.useUtils();
  const [inputText, setInputText] = useState("");
  return (
    <>
      <div className="mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
        <Input
          type="text"
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
        <Button
          onClick={async () => {
            await mut.mutateAsync({ name: inputText });
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
