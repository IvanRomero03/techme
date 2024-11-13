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
    onSuccess: async () => {
      await utils.validation.getAllReviews.invalidate();
      await utils.notifications.getAll.invalidate();
    },
  });

  const { mutateAsync: finalizeReview } = api.validation.finalizeReview.useMutation({
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
  const [editingReview, setEditingReview] = useState<Review | null>(null); // Estado para el review en edición
  const [error, setError] = useState<string | null>(null);

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
    return "URL_DEL_ARCHIVO_SUBIDO"; // Aquí va el código real de subida para generar el URL del archivo
  };

  const handleAddReview = async (review: Omit<Review, "id">) => {
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const url = await uploadFile(doc.file);
          console.log("URL del documento subido:", url); // Depuración
          return { ...doc, url };
        }
        return { ...doc, url: doc.url ?? "" };
      })
    );

    const newReviewData = await addReview({
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
      projectId: validationId,
    });

    const newReview: Review = {
      id: newReviewData.id!,
      name: review.name,
      userId: userId ?? "",
      documents: documentsWithUrls,
      createdAt: new Date(), // Asigna la fecha actual
      isFinal: false,
      completedAt: null,
    };

    setReviews((prevReviews) => [...prevReviews, newReview]);
    setDialogOpen(false);
    setEditingReview(null); // Cierra el diálogo de edición
    console.log("Reviews después de agregar:", [...reviews, newReview]);
  };

  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review); // Establece el review en edición
    setDialogOpen(true); // Abre el diálogo
  };

  const handleFinalizeReview = async (id: number) => {
    try {
      await finalizeReview({ reviewId: id, userId: userId ?? "", projectId: validationId });
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id ? { ...review, isFinal: true } : review,
        ),
      );
    } catch (error) {
      console.error("Error finalizing review:", error);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteDocument({ 
        documentId: documentId.toString(), 
        projectId: validationId 
      });

      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          documents: review.documents.filter((doc) => doc.id !== documentId),
        }))
      );
    } catch (error) {
      console.error("Error deleting document:", error);
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
          <DialogContent className="w-full max-w-[800px] p-8">
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Add New Review"}</DialogTitle>
              <DialogDescription>
                {editingReview ? "Edit the review details below." : "Fill in the details below to add a new review."}
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: editingReview?.name || "",
                documents: editingReview?.documents || [
                  { name: "", file: null, notes: "", uploadedBy: userId ?? "" },
                ],
              }}
              enableReinitialize
              onSubmit={async (values, { resetForm }) => {
                if (editingReview) {
                  const documentsWithUrls = await Promise.all(
                    values.documents.map(async (doc) => {
                      if (doc.file) {
                        const url = await uploadFile(doc.file);
                        return { ...doc, url };
                      }
                      return { ...doc };
                    })
                  );
  
                  const updatedReview = {
                    ...editingReview,
                    documents: [...editingReview.documents, ...documentsWithUrls],
                  };
  
                  setReviews((prevReviews) =>
                    prevReviews.map((review) =>
                      review.id === editingReview.id ? updatedReview : review
                    )
                  );
                } else {
                  await handleAddReview({
                    name: values.name,
                    userId: userId ?? "",
                    documents: values.documents,
                    createdAt: null,
                    isFinal: null,
                    completedAt: null,
                  });
                }
                resetForm();
                setDialogOpen(false);
                setEditingReview(null);
              }}
            >
              {({ values, setFieldValue, resetForm }) => (
                <Form>
                  <div className="flex flex-col gap-6">
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
                        <div className="flex flex-col gap-6">
                          <div className="max-h-[400px] overflow-y-auto pr-4">
                            {values.documents.map((_, index: number) => (
                              <div key={index} className="flex flex-col gap-4 p-4 border rounded-md mb-4">
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
                                <div className="mt-4 flex gap-4">
                                  <Button
                                    type="button"
                                    onClick={() => arrayHelpers.remove(index)}
                                    className="bg-black text-white"
                                  >
                                    Delete Document
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      arrayHelpers.push({
                                        name: "",
                                        file: null,
                                        notes: "",
                                        uploadedBy: userId ?? "",
                                      });
                                    }}
                                    className="bg-black text-white"
                                  >
                                    Add Document
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit">{editingReview ? "Save Changes" : "Submit Review"}</Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
  
        <div className="mt-4 flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="mt-4 rounded-md border p-4 shadow-md flex flex-col gap-2"
            >
              <h3>{review.name}</h3>
              <p>Created at: {review.createdAt?.toLocaleDateString()}</p> {/* Muestra la fecha de creación */}
              <div className="flex flex-col gap-2">
                {review.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        downloadFile(doc.url ?? "", doc.name ?? "Unnamed Document");
                      }}
                      className="bg-black text-blue-500 rounded-md p-2"
                    >
                      {doc.name || "Unnamed Document"}
                    </Button>
                  </div>
                ))}
              </div>
  
              {!review.isFinal && (
                <div className="mt-4 flex gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingReview(review);
                      setDialogOpen(true);
                    }}
                    className="bg-black text-white"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleFinalizeReview(review.id)}
                    className="bg-black text-white"
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
