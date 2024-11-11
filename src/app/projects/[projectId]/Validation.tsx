"use client";

import { Field, Form, Formik, FieldArray } from "formik";
import { Button } from "t/components/ui/button";
import { Label } from "t/components/ui/label";
import { Textarea } from "t/components/ui/textarea";
import { Input } from "t/components/ui/input";
import { api } from "techme/trpc/react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "t/components/ui/dialog";

interface Document {
  id?: number;
  name: string;
  file: File | null; 
  url?: string; 
  uploadedBy: string;
  notes?: string;
}

interface Review {
  id: number;
  name: string;
  userId: string;
  documents: Document[];
  createdAt: Date | null;
  isFinal: boolean | null;
  completedAt: Date | null;
}

interface ValidationProps {
  validationId: number;
}

export default function Validation({ validationId }: ValidationProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const utils = api.useUtils();

  const { mutateAsync: addReview } = api.validation.createReview.useMutation({
    onSuccess: async () => {await utils.validation.getAllReviews.invalidate();
      await utils.notifications.getAll.invalidate();
    },
  });

  const { mutateAsync: finalizeReview } =
    api.validation.finalizeReview.useMutation({
      onSuccess: () => utils.validation.getAllReviews.invalidate(),
    });

  const { mutateAsync: deleteDocument } = api.validation.deleteDocument.useMutation({
    onSuccess: async () => {
      await utils.validation.getAllReviews.invalidate();
      await utils.notifications.getAll.invalidate();
    },
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para descargar el archivo directamente
  const downloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const uploadFile = async (file: File): Promise<string> => {
    return "URL_DEL_ARCHIVO_SUBIDO"; 
  };

  const handleAddReview = async (review: Omit<Review, "id">) => {
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const url = await uploadFile(doc.file);
          return { ...doc, url };
        }
        return { ...doc, url: doc.url ?? "" };
      }),
    );

    const newReviewData = await addReview({
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
      projectId: validationId
    });
    const newReview: Review = {
      id: newReviewData.id!,
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
      createdAt: new Date(),
      isFinal: false,
      completedAt: null,
    };

    setReviews((prevReviews) => [...prevReviews, newReview]);
  };
  const handleFinalizeReview = async (id: number) => {
    await finalizeReview({ reviewId: id, userId: userId ?? "", projectId: 0 });
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === id ? { ...review, isFinal: true } : review,
      ),
    );
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteDocument({ 
        documentId: documentId.toString(), 
        projectId: validationId 
      });
      
      // Update local state
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          documents: review.documents.filter((doc) => doc.id !== documentId),
        }))
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      // Optionally add error handling UI
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete document");
      }
    }
  };

  return (
    <>
      <div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">+ Add New Review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Review</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new review.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: "",
                documents: [
                  { name: "", file: null, notes: "", uploadedBy: userId ?? "" },
                ],
              }}
              onSubmit={async (values, { resetForm }) => {
                await handleAddReview({
                  name: values.name,
                  userId: userId ?? "",
                  documents: values.documents,
                  createdAt: null,
                  isFinal: null,
                  completedAt: null,
                });
                resetForm();
                setDialogOpen(false);
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Review Name</Label>
                    <Field
                      id="name"
                      name="name"
                      as={Input}
                      type="text"
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  <FieldArray name="documents">
                    {(arrayHelpers) => (
                      <div className="flex flex-col gap-2">
                        {values.documents.map((_, index: number) => (
                          <div key={index}>
                            <Label htmlFor={`documents.${index}.name`}>
                              Document Name
                            </Label>
                            <Field
                              id={`documents.${index}.name`}
                              name={`documents.${index}.name`}
                              as={Input}
                              type="text"
                              placeholder="Enter document name"
                              className="w-full rounded-md border p-2"
                            />
                            <Label htmlFor={`documents.${index}.file`}>
                              Upload Document
                            </Label>
                            <input
                              id={`documents.${index}.file`}
                              name={`documents.${index}.file`}
                              type="file"
                              onChange={(event) => {
                                const file =
                                  event.currentTarget.files?.[0] ?? null;
                                void setFieldValue(
                                  `documents.${index}.file`,
                                  file,
                                );
                              }}
                              className="w-full rounded-md border p-2"
                            />
                            <Label htmlFor={`documents.${index}.notes`}>
                              Notes
                            </Label>
                            <Field
                              id={`documents.${index}.notes`}
                              name={`documents.${index}.notes`}
                              as={Textarea}
                              placeholder="Enter notes"
                              className="w-full rounded-md border p-2"
                            />
                            <div className="mt-4 flex gap-6">
                              <Button
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                                className="text-red-500"
                              >
                                Delete Document
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  arrayHelpers.push({
                                    name: "",
                                    file: null,
                                    notes: "",
                                    uploadedBy: userId ?? "",
                                  })
                                }
                                className="text-blue-500"
                              >
                                Add Document
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                  <DialogFooter className="mt-6">
                    <Button type="submit">Submit Review</Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        <div className="mt-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="mt-4 rounded-md border p-4 shadow-md"
            >
              <h3>{review.name}</h3>
              {review.documents.map((doc) => (
                <div key={doc.id}>
                  <Button onClick={() => downloadFile(doc.url!, doc.name)}>
                    Download {doc.name}
                  </Button>
                  {!review.isFinal && (
                    <Button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id!)}
                      className="ml-4 text-red-500"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
              {!review.isFinal && (
                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={() => handleFinalizeReview(review.id)}
                    className="text-green-500"
                  >
                    Final Review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
