"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faCheckCircle,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { useRouter } from "next/navigation";

interface Stage {
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  route: string;
}

const stagesData: Stage[] = [
  {
    title: "Ingreso de Requerimientos",
    description:
      "Validar la completitud y viabilidad inicial del requerimiento.",
    isLocked: false,
    isCompleted: false,
    route: "/projects/detail-view", // Route to detail-view
  },
  // More stages...
];

const CardMenu = () => {
  const [stages, setStages] = useState(stagesData);
  const router = useRouter();

  const handleCompleteStage = (index: number) => {
    const updatedStages = stages.map((stage, idx) => {
      if (idx === index) {
        return { ...stage, isCompleted: true, isLocked: false };
      } else if (idx === index + 1) {
        return { ...stage, isLocked: false };
      }
      return stage;
    });

    setStages(updatedStages);
  };

  const handleGoToStage = (route: string) => {
    router.push(route);
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
      {stages.map((stage, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <CardTitle
              className={`flex items-center ${stage.isLocked ? "text-gray-500" : "text-black"}`}
            >
              {stage.isCompleted ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mr-2 text-green-500"
                />
              ) : stage.isLocked ? (
                <FontAwesomeIcon icon={faLock} className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faPlay} className="mr-2 text-blue-500" />
              )}
              {stage.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={stage.isLocked ? "text-gray-400" : ""}>
              {stage.description}
            </p>
            {!stage.isLocked && (
              <div className="mt-4 flex space-x-2">
                {!stage.isCompleted && (
                  <Button
                    variant="outline"
                    onClick={() => handleCompleteStage(index)}
                  >
                    Completar Etapa
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={() => handleGoToStage(stage.route)}
                >
                  Ir a Etapa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardMenu;
