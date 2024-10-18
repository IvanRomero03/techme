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

  const { mutateAsync: updateReview } = api.validation.updateReview.useMutation({
    onSuccess: () => utils.validation.getAllReviews.invalidate(),
  });

  const { mutateAsync: finalizeReview } = api.validation.finalizeReview.useMutation({
    onSuccess: () => utils.validation.getAllReviews.invalidate(),
  });

  const { mutateAsync: deleteDocument } = api.validation.deleteDocument.useMutation({
    onSuccess: () => utils.validation.getAllReviews.invalidate(),
  });

  // Función para manejar la subida de archivos a un servicio (como Supabase, Firebase, etc.)
  const uploadFile = async (file: File): Promise<string> => {
    // Aquí puedes implementar la subida de archivos
    // Esta función debe devolver la URL del archivo subido
    // Ejemplo (Supabase):
    // const { data, error } = await supabase.storage.from('your-bucket').upload(`documents/${file.name}`, file);
    // if (error) throw new Error(error.message);
    // return data.publicUrl; 
    return "URL_DEL_ARCHIVO_SUBIDO"; // Simulando una URL
  };

  const handleAddReview = async (review: Omit<Review, 'id'>) => {
    // Asegúrate de que todos los documentos tengan una URL válida
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const url = await uploadFile(doc.file); // Subir archivo y obtener URL
          return { ...doc, url };  // Reemplazar `file` por `url` después de la subida
        }
        return { ...doc, url: doc.url || "" };  // Si no hay archivo, asegura que 'url' no sea undefined
      })
    );
  
    await addReview({
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
    });
  };
  
  const handleUpdateReview = async (review: Review) => {
    if (!review.id) return;
  
    // Asegúrate de que todos los documentos tengan una URL válida
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const url = await uploadFile(doc.file); // Subir archivo y obtener URL
          return { ...doc, url };  // Reemplazar `file` por `url` después de la subida
        }
        return { ...doc, url: doc.url || "" };  // Si no hay archivo, asegura que 'url' no sea undefined
      })
    );
  
    await updateReview({
      id: review.id,
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
    });
  };
  

  const handleFinalizeReview = async (id: number) => {
    await finalizeReview({ reviewId: id, userId: userId ?? "" });
  };

  const handleDeleteDocument = async (docId: number) => {
    await deleteDocument({ documentId: docId.toString() });
  };

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
                                const file = event.currentTarget.files?.[0] || null;
                                setFieldValue(`documents.${index}.file`, file);
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
      </div>
    </>
  );
}
