"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";

interface FrameworkContract {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  lastModifiedBy: string;
}

interface AnalysisProps {
  projectId: string; 
}

const placeholderContracts: FrameworkContract[] = [
  {
    id: 1,
    name: "Contract A",
    description: "Description for Contract A",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "Active",
    lastModifiedBy: "User A",
  },
  {
    id: 2,
    name: "Contract B",
    description: "Description for Contract B",
    startDate: "2023-06-15",
    endDate: "2024-06-15",
    status: "Inactive",
    lastModifiedBy: "User B",
  },
];

const Analysis: React.FC<AnalysisProps> = ({ projectId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  
  const filteredContracts = placeholderContracts.filter(
    (contract) =>
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Framework Contracts Analysis for Project {projectId}</h1>

      {/* Input para buscar contratos marco */}
      <div className="mb-4">
        <Label htmlFor="search">Search Contracts</Label>
        <Input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by contract name or description"
        />
      </div>

      {/* Mostrar contratos filtrados */}
      <div className="space-y-2">
        {filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => (
            <div key={contract.id} className="p-4 rounded-lg shadow-md bg-gray-50">
              <h2 className="text-xl font-semibold">{contract.name}</h2>
              <p>{contract.description}</p>
              <p>
                <strong>Status:</strong> {contract.status}
              </p>
              <p>
                <strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Modified By:</strong> {contract.lastModifiedBy}
              </p>
            </div>
          ))
        ) : (
          <p>No contracts found</p>
        )}
      </div>
    </div>
  );
};

export default Analysis;
