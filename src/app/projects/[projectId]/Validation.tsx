import { Field, Form, Formik, FieldArray } from "formik";
import { Button } from "t/components/ui/button";
import { Label } from "t/components/ui/label";
import { Textarea } from "t/components/ui/textarea";
import { Input } from "t/components/ui/input";
import { api } from "techme/trpc/react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { FaStickyNote } from "react-icons/fa";
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
  createdAt?: string;
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showNotes, setShowNotes] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<number | null>(null);

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

  const uploadFile = async (file: File): Promise<{ url: string; createdAt: string }> => {
    const url = "URL_DEL_ARCHIVO_SUBIDO";
    const createdAt = new Date().toISOString();
    return { url, createdAt };
  };

  const handleAddReview = async (review: Omit<Review, "id">) => {
    const documentsWithUrls = await Promise.all(
      review.documents.map(async (doc) => {
        if (doc.file) {
          const { url, createdAt } = await uploadFile(doc.file);
          return { ...doc, url, createdAt };
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
      createdAt: new Date(),
      isFinal: false,
      completedAt: null,
    };

    setReviews((prevReviews) => [...prevReviews, newReview]);
    setDialogOpen(false);
    setEditingReview(null);
  };

  const handleFinalizeReview = async (reviewId: number) => {
    await finalizeReview({
      reviewId,
      userId: "",
      projectId: 0
    });
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, isFinal: true } : review
      )
    );
    setShowConfirmation(null); // Cierra el cuadro de confirmación
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
              <DialogTitle>Add New Review</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new review.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: editingReview?.name ?? "",
                documents: editingReview?.documents ?? [
                  { name: "", file: null, notes: "", uploadedBy: userId ?? "", createdAt: "" },
                ],
              }}
              enableReinitialize
              onSubmit={async (values, { resetForm }) => {
                if (editingReview) {
                  const documentsWithUrls = await Promise.all(
                    values.documents.map(async (doc) => {
                      if (doc.file) {
                        const { url, createdAt } = await uploadFile(doc.file);
                        return { ...doc, url, createdAt };
                      }
                      return { ...doc };
                    })
                  );

                  setReviews((prevReviews) =>
                    prevReviews.map((review) =>
                      review.id === editingReview.id
                        ? { ...review, documents: [...review.documents, ...documentsWithUrls] }
                        : review
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
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Review Name</Label>
                      <Field
                        id="name"
                        name="name"
                        as={Input}
                        type="text"
                        placeholder="Enter review name"
                        className="w-full rounded-md border p-2"
                      />
                    </div>
                    <FieldArray name="documents">
                      {(arrayHelpers) => (
                        <div className="flex flex-col gap-6">
                          {values.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="border rounded-md p-4 shadow-sm flex flex-col gap-4"
                            >
                              <div className="flex flex-col gap-2">
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
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor={`documents.${index}.file`}>
                                  Upload Document
                                </Label>
                                <input
                                  id={`documents.${index}.file`}
                                  name={`documents.${index}.file`}
                                  type="file"
                                  onChange={async (event) => {
                                    const file = event.currentTarget.files?.[0] ?? null;
                                    if (file) {
                                      const { url, createdAt } = await uploadFile(file);
                                      void setFieldValue(`documents.${index}.file`, file);
                                      void setFieldValue(`documents.${index}.url`, url);
                                      void setFieldValue(`documents.${index}.createdAt`, createdAt);                                      
                                    }
                                  }}
                                  className="w-full rounded-md border p-2"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor={`documents.${index}.notes`}>Notes</Label>
                                <Field
                                  id={`documents.${index}.notes`}
                                  name={`documents.${index}.notes`}
                                  as={Textarea}
                                  placeholder="Enter notes"
                                  className="w-full rounded-md border p-2"
                                />
                              </div>
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
                                  onClick={() =>
                                    arrayHelpers.push({
                                      name: "",
                                      file: null,
                                      notes: "",
                                      uploadedBy: userId ?? "",
                                      createdAt: "",
                                    })
                                  }
                                  className="bg-black text-white"
                                >
                                  Add Document
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit">Submit Review</Button>
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
              <p>Created at: {review.createdAt?.toLocaleDateString()}</p>
              <div className="flex flex-col gap-2">
                {review.documents.map((doc, index) => (
                  <div key={doc.id ?? index} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!review.isFinal) {
                            void downloadFile(doc.url ?? "", doc.name ?? "Unnamed Document");
                          }
                        }}
                        className={`rounded-md p-2 ${
                          review.isFinal
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-blue-500"
                        }`}
                        disabled={!!review.isFinal}
                      >
                        {doc.name || "Unnamed Document"}
                      </Button>
                      {doc.notes && (
                        <FaStickyNote
                          className="text-gray-500 cursor-pointer hover:text-gray-800"
                          size={20}
                          onClick={() => setShowNotes(showNotes === index ? null : index)}
                        />
                      )}
                    </div>
                    {doc.notes && showNotes === index && (
                      <div className="bg-gray-100 p-2 rounded-md mt-2 text-sm text-gray-800">
                        <Label className="text-gray-600 text-sm mb-1">Notes:</Label>
                        <p>{doc.notes}</p>
                      </div>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Uploaded at: {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "No date available"}
                    </p>
                  </div>
                ))}
              </div>
              {!review.isFinal && (
                <div className="mt-4 flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setEditingReview(review)}
                    className="bg-black text-white"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowConfirmation(review.id)}
                    className="bg-black text-white px-6 py-2 rounded-lg transition duration-200 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white"
                  >
                    Final Review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cuadro de confirmación */}
        {showConfirmation !== null && (
          <Dialog open={true} onOpenChange={() => setShowConfirmation(null)}>
            <DialogContent className="w-full max-w-[400px] p-6">
              <DialogHeader>
                <DialogTitle>Confirm Final Review</DialogTitle>
                <DialogDescription>
                  Are you sure you want to finalize this review? Once finalized,
                  no further changes can be made.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-4">
                <Button
                  onClick={() => setShowConfirmation(null)}
                  className="bg-gray-300 text-black"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleFinalizeReview(showConfirmation)}
                  className="bg-red-500 text-white"
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
