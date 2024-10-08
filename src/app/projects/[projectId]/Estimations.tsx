"use client";

import React from "react";

import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";

export default function Estimations() {
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-5">
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Phase</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Button variant="outline">Time Estimation</Button>
            <Button variant="outline">Manforce</Button>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Phase</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Button variant="outline">Time Estimation</Button>
            <Button variant="outline">Manforce</Button>
          </CardContent>
        </Card>
      </div>

      {/* New Phase Button */}
      <div className="mb-6 flex">
        <Button variant="default">New Phase</Button>
      </div>

      {/* Total Estimation Section */}
      <h3 className="mb-4 text-xl font-bold">Total Estimation</h3>
      <div className="flex space-x-4">
        <Button variant="outline">Time Estimation</Button>
        <Button variant="outline">Manforce</Button>
      </div>
    </>
  );
}
