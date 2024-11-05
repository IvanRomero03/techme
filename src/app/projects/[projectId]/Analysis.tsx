"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Label } from "t/components/ui/label";
import { Textarea } from "t/components/ui/textarea";
import { Input } from "t/components/ui/input";
import { api } from "techme/trpc/react"; 
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

interface ContractValues {
  name: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  status?: string;
}

const Analysis: React.FC<AnalysisProps> = ({ projectId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<FrameworkContract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: contracts = [], isLoading } = api.frameworkContracts.getAllContracts.useQuery({
    projectId: Number(projectId),
  });

  const utils = api.useUtils();

  const { mutateAsync: addContract } = api.frameworkContracts.addContract.useMutation({
    onSuccess: async () => {
      await utils.frameworkContracts.getAllContracts.invalidate(); 
    },
  });

  const { mutateAsync: updateContract } = api.frameworkContracts.updateContract.useMutation({
    onSuccess: async () => {
      await utils.frameworkContracts.getAllContracts.invalidate();
    },
  });
  
  const { mutateAsync: deleteContract } = api.frameworkContracts.deleteContract.useMutation({
    onSuccess: async () => {
      await utils.frameworkContracts.getAllContracts.invalidate();
    },
  });

  const handleAddContract = async (values: ContractValues) => {
    try {
      await addContract({
        projectId: Number(projectId),
        name: values.name,
        description: values.description ?? undefined,
        startDate: values.startDate!,
        endDate: values.endDate!,
        status: values.status ?? "active",
      });
    } catch (error) {
      console.error("Error adding contract:", error);
    }
  };

  const handleUpdateContract = async (id: number, values: ContractValues) => {
    try {
      await updateContract({
        id,
        name: values.name,
        description: values.description ?? undefined,
        startDate: values.startDate!,
        endDate: values.endDate!,
        status: values.status ?? "active",
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating contract:", error);
    }
  };

  const handleDeleteContract = async (id: number) => {
    try {
      await deleteContract({ id });
      setConfirmationOpen(false); 
      setContractToDelete(null); 
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  const filteredContracts = contracts.filter(
    (contract: { framework_contracts: FrameworkContract }) =>
      contract.framework_contracts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false ?? 
      contract.framework_contracts?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
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
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
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
              {({ handleChange }) => (
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

      <div className="space-y-2">
        {isLoading ? (
          <p>Loading contracts...</p>
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => (
            <div key={contract.framework_contracts.id} className="p-4 rounded-lg shadow-md bg-gray-50">
              <h2 className="text-xl font-semibold">{contract.framework_contracts.name}</h2>
              <p>{contract.framework_contracts.description}</p>
              <p><strong>Status:</strong> {contract.framework_contracts.status}</p>
              <p><strong>Start Date:</strong> {contract.framework_contracts.startDate?.toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {contract.framework_contracts.endDate?.toLocaleDateString()}</p>
              <div className="space-x-2">
              <Button onClick={() => { setSelectedContract(contract.framework_contracts); setEditDialogOpen(true); }}>
                Update Contract
              </Button>
              <Button onClick={() => { setContractToDelete(contract.framework_contracts.id); setConfirmationOpen(true); }}>
                Delete Contract
              </Button>
              </div>
            </div>
          ))
        ) : (
          <p>No contracts available</p>
        )}
      </div>
  
      {confirmationOpen && contractToDelete !== null && (
        <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this contract? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => handleDeleteContract(contractToDelete)}
                className="bg-black text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setConfirmationOpen(false)} 
                className="bg-white text-black border"
              >
                No
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
  
      {selectedContract && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contract</DialogTitle>
              <DialogDescription>Modify the details of the contract.</DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: selectedContract.name,
                description: selectedContract.description,
                startDate: selectedContract.startDate ? selectedContract.startDate.toISOString().split('T')[0] : "",
                endDate: selectedContract.endDate ? selectedContract.endDate.toISOString().split('T')[0] : "",
                status: selectedContract.status ?? "active",
              }}
              onSubmit={async (values) => {
                await handleUpdateContract(selectedContract.id, values);
              }}
            >
              {({ handleChange }) => (
                <Form>
                  <div className="mb-4 flex flex-col gap-2 rounded-md border p-4">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      name="name"
                      as={Input}
                      type="text"
                      placeholder="Enter a name"
                      onChange={handleChange}
                    />
                    <Label htmlFor="description">Description</Label>
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Enter a description"
                      onChange={handleChange}
                    />
                    <Label htmlFor="startDate">Start Date</Label>
                    <Field
                      name="startDate"
                      as={Input}
                      type="date"
                      onChange={handleChange}
                    />
                    <Label htmlFor="endDate">End Date</Label>
                    <Field
                      name="endDate"
                      as={Input}
                      type="date"
                      onChange={handleChange}
                    />
                    <Label htmlFor="status">Status</Label>
                    <Field
                      name="status"
                      as={Input}
                      type="text"
                      placeholder="active/inactive"
                      onChange={handleChange}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};  

export default Analysis;

