"use client";

import { Field, Form, Formik } from "formik";
import { Button } from "t/components/ui/button";
import { Input } from "t/components/ui/input";
import { api } from "techme/trpc/react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

// Interfaz para el Review
interface ReviewSubmission {
  id?: number;
  validationId: number | null;
  reviewCount: number | null;
  finalReview: boolean | null;
  submittedBy: string | null;
  submittedAt?: string | Date | null;
}

// Interfaz para Documentos
interface Document {
  id: number;
  name: string;
  likedBy: string[];
  note: string;
}

// Props para ReviewSubmissions
interface ReviewSubmissionsProps {
  validationId: number;
}

export default function ReviewSubmissions({ validationId }: ReviewSubmissionsProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const utils = api.useContext();

  const { data: submissions, isLoading, isError } = api.reviews.getAllSubmissions.useQuery({ validationId });
  const { mutateAsync: addSubmission } = api.reviews.createSubmission.useMutation({
    onSuccess: () => utils.reviews.getAllSubmissions.invalidate(),
  });

  // Función para agregar un nuevo documento con nota
  const handleAddDocument = (file: File, note: string) => {
    const newDocument: Document = {
      id: documents.length + 1,
      name: file.name,
      likedBy: [],
      note,
    };
    setDocuments([...documents, newDocument]);
  };

  // Función para "likear" un documento
  const handleLikeDocument = (documentId: number) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === documentId
          ? { ...doc, likedBy: [...doc.likedBy, userId ?? "Unknown"] }
          : doc
      )
    );
  };

  // Función para manejar la subida de la review
  const handleSubmitReview = async (review: ReviewSubmission) => {
    await addSubmission({
      validationId: review.validationId!,
      reviewCount: review.reviewCount!,
      finalReview: review.finalReview!,
      submittedBy: userId ?? "",
    });
    setConfirmDialogOpen(false); // Cerrar confirmación
  };

  return (
    <div>
      <h2 className="mt-8 text-xl font-bold">Review Submissions</h2>

      {isLoading ? (
        <p>Loading submissions...</p>
      ) : isError ? (
        <p>Error loading submissions.</p>
      ) : (
        <div>
          {submissions?.map((submission) => (
            <div key={submission.id} className="mb-4 flex flex-col gap-2 rounded-md border p-4">
              <h3 className="text-lg font-bold">Review #{submission.reviewCount ?? "N/A"}</h3>
              <p>Final Review: {submission.finalReview ? "Yes" : "No"}</p>
              <p>Submitted By: {submission.submittedBy ?? "Unknown"}</p>
              {submission.submittedAt && (
                <p>Submitted At: {new Date(submission.submittedAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar una nueva submission */}
      <Button onClick={() => setDialogOpen(true)}>+ Add New Submission</Button>

      {/* Diálogo para subir un archivo y agregar nota */}
      {dialogOpen && (
        <div className="modal">
          <Formik
            initialValues={{
              validationId,
              reviewCount: 0,
              finalReview: false,
              file: null,
              note: "",
            }}
            onSubmit={async (values, { resetForm }) => {
              if (values.file) {
                handleAddDocument(values.file, values.note); // Agregar documento con nota
              }
              resetForm();
              setDialogOpen(false);
            }}
          >
            {({ setFieldValue }) => (
              <Form>
                <div>
                  <Field name="reviewCount" as={Input} type="number" placeholder="Enter Review Count" />
                </div>
                <div>
                  <label>
                    <Field name="finalReview" type="checkbox" />
                    Final Review
                  </label>
                </div>
                <div className="my-2">
                  <Field
                    name="file"
                    type="file"
                    onChange={(event: any) => setFieldValue("file", event.currentTarget.files[0])}
                  />
                </div>
                <div>
                  <Field name="note" as={Input} type="text" placeholder="Enter your note" />
                </div>
                <Button type="submit">Add Document</Button>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Lista de documentos subidos */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Uploaded Documents</h3>
        {documents.map((doc) => (
          <div key={doc.id} className="mb-4 p-4 border rounded-md">
            <p><strong>Document Name:</strong> {doc.name}</p>
            <p><strong>Note:</strong> {doc.note}</p>
            <p><strong>Liked By:</strong> {doc.likedBy.join(", ") || "No likes yet"}</p>
            <Button onClick={() => handleLikeDocument(doc.id)}>Like</Button>
          </div>
        ))}
      </div>

      {/* Botón para subir la review */}
      <div className="mt-4">
        <Button onClick={() => setConfirmDialogOpen(true)}>Submit Review</Button>
      </div>

      {/* Cuadro de confirmación */}
      {confirmDialogOpen && (
        <div className="modal">
          <h2 className="text-lg font-bold">Confirm Submission</h2>
          <p>Are you sure you want to submit your review with {documents.length} documents?</p>
          <div className="flex justify-between mt-4">
            <Button variant="destructive" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={() => handleSubmitReview({ validationId, reviewCount: documents.length, finalReview: true, submittedBy: userId ?? "" })}>Confirm</Button>
          </div>
        </div>
      )}
    </div>
  );
}
