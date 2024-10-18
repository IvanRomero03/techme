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

// Definición de los tipos para Review y Document
interface Document {
  id?: number;
  name: string;
  file: File | null; // Aquí almacenamos el archivo
  url?: string; // Ahora usamos la URL después de subir el archivo
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
    onSuccess: () => utils.validation.getAllReviews.invalidate(),
  });

  const { mutateAsync: finalizeReview } = api.validation.finalizeReview.useMutation({
    onSuccess: () => utils.validation.getAllReviews.invalidate(),
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Función para descargar el archivo directamente
  const downloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  // Función para manejar la subida de archivos a un servicio (como Supabase, Firebase, etc.)
  const uploadFile = async (file: File): Promise<string> => {
    return "URL_DEL_ARCHIVO_SUBIDO"; // Simulando una URL
  };

  const handleAddReview = async (review: Omit<Review, 'id'>) => {
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const url = await uploadFile(doc.file);
          return { ...doc, url };
        }
        return { ...doc, url: doc.url || "" };
      })
    );

    const newReviewData = await addReview({
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
    });

    const newReview: Review = {
      id: newReviewData.id,
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
    await finalizeReview({ reviewId: id, userId: userId ?? "" });
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === id ? { ...review, isFinal: true } : review
      )
    );
  };

  function handleDeleteDocument(arg0: number): void {
    throw new Error("Function not implemented.");
  }

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
                documents: [{ name: "", file: null, notes: "", uploadedBy: userId ?? "" }],
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
                    {({ remove, push }) => (
                      <div className="flex flex-col gap-2">
                        {values.documents.map((_, index: number) => (
                          <div key={index}>
                            <Label htmlFor={`documents.${index}.name`}>Document Name</Label>
                            <Field
                              id={`documents.${index}.name`}
                              name={`documents.${index}.name`}
                              as={Input}
                              type="text"
                              placeholder="Enter document name"
                              className="w-full rounded-md border p-2"
                            />
                            <Label htmlFor={`documents.${index}.file`}>Upload Document</Label>
                            <input
                              id={`documents.${index}.file`}
                              name={`documents.${index}.file`}
                              type="file"
                              onChange={(event) => {
                                const file = event.currentTarget.files?.[0] || null;
                                setFieldValue(`documents.${index}.file`, file);
                              }}
                              className="w-full rounded-md border p-2"
                            />
                            <Label htmlFor={`documents.${index}.notes`}>Notes</Label>
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
                                onClick={() => remove(index)}
                                className="text-red-500"
                              >
                                Delete Document
                              </Button>
                              <Button
                                type="button"
                                onClick={() => push({ name: '', file: null, notes: '', uploadedBy: userId ?? '' })}
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

        {/* Mostrar los reviews creados */}
        <div className="mt-4">
          {reviews.map((review) => (
            <div key={review.id} className="border p-4 rounded-md shadow-md mt-4">
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
