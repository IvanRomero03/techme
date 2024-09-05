"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";

import { api, HydrateClient } from "techme/trpc/server";
import { asd } from "./__func";

export default function CrearTabReact() {
  const [texto, setText] = useState("");
  return (
    <>
      <form action={asd}>
        <input
          type="text"
          onChange={(e) => setText(e.target.value)}
          name="texto"
        />
        <Button onClick={() => setText("")}>asd</Button>
      </form>
    </>
  ) as React.ReactNode;
}
