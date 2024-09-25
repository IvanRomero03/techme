// src/project-view/page.tsx

"use client";

import React from "react";

import ProjectMenu from "techme/app/_components/ProjectMenu";

export default function Page({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-4">
      <h1>Project Detail View {params.projectId}</h1>
      <ProjectMenu />
    </div>
  );
}
