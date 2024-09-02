// src/project-view/page.tsx

"use client";

import React from "react";
// Corrected import statement for the default export
import ProjectView from "../_components/ProjectView"; 

export default function Page() {
  return (
    <div className="p-4">
      <ProjectView />
    </div>
  );
}
