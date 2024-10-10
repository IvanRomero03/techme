"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Label } from "t/components/ui/label";
import { Textarea } from "t/components/ui/textarea";
import { Input } from "t/components/ui/input";
import { api } from "techme/trpc/react"; // TRPC API importado para manejar los requests
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "t/components/ui/dialog";
import { Field, Form, Formik } from "formik";

interface FrameworkContract {
  id: number;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  lastModifiedBy: string | null;
}

interface AnalysisProps {
  projectId: string;
}

const Analysis: React.FC<AnalysisProps> = ({ projectId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  
  const { data: contracts = [], isLoading } = api.frameworkContracts.getAllContracts.useQuery({
    projectId: parseInt(projectId),
  });

  
  const utils = api.useUtils();

  
  const { mutateAsync: addContract } = api.frameworkContracts.addContract.useMutation({
    onSuccess: () => {
      utils.frameworkContracts.getAllContracts.invalidate(); 
    },
  });

  
  const handleAddContract = async (values: any) => {
    await addContract({
      projectId: parseInt(projectId),
      name: values.name,
      description: values.description || null,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status || "active",
    });
  };

  
  const filteredContracts = contracts.filter(
    (contract: { framework_contracts: FrameworkContract }) =>
      contract.framework_contracts.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.framework_contracts.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Framework Contracts Analysis for Project {projectId}</h1>

      
      <div className="flex justify-between items-center mb-4">
        <div>
          <Label htmlFor="search">Search Contracts</Label>
          <Input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by contract name or description"
          />
        </div>

        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-4">+ Add Contract</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[1200px]">
            <DialogHeader>
              <DialogTitle>Add New Contract</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new framework contract.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                status: "active",
              }}
              onSubmit={async (values, { resetForm }) => {
                await handleAddContract(values); 
                resetForm(); 
                setDialogOpen(false); 
              }}
            >
              {({ values, handleChange }) => (
                <Form>
                  <div className="mb-4 flex flex-col gap-2 rounded-md border p-4">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      name="name"
                      as={Input}
                      type="text"
                      placeholder="Enter a name"
                      className="w-full rounded-md border p-2"
                      onChange={handleChange}
                    />
                    <Label htmlFor="description">Description</Label>
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Enter a description"
                      className="w-full rounded-md border p-2"
                      onChange={handleChange}
                    />
                    <Label htmlFor="startDate">Start Date</Label>
                    <Field
                      name="startDate"
                      as={Input}
                      type="date"
                      className="w-full rounded-md border p-2"
                      onChange={handleChange}
                    />
                    <Label htmlFor="endDate">End Date</Label>
                    <Field
                      name="endDate"
                      as={Input}
                      type="date"
                      className="w-full rounded-md border p-2"
                      onChange={handleChange}
                    />
                    <Label htmlFor="status">Status</Label>
                    <Field
                      name="status"
                      as={Input}
                      type="text"
                      placeholder="active/inactive"
                      className="w-full rounded-md border p-2"
                      onChange={handleChange}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Contract</Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mostrar contratos filtrados */}
      <div className="space-y-2">
        {isLoading ? (
          <p>Loading contracts...</p>
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => (
            <div key={contract.framework_contracts.id} className="p-4 rounded-lg shadow-md bg-gray-50">
              <h2 className="text-xl font-semibold">{contract.framework_contracts.name}</h2>
              <p>{contract.framework_contracts.description}</p>
              <p>
                <strong>Status:</strong> {contract.framework_contracts.status}
              </p>
              <p>
                <strong>Start Date:</strong> {new Date(contract.framework_contracts.startDate!).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong> {new Date(contract.framework_contracts.endDate!).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No contracts available</p>
        )}
      </div>
    </div>
  );
};

export default Analysis;
