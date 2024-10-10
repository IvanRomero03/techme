"use client";

import React, { useState } from "react";
import { Formik, Field, Form } from "formik";
import { Input } from "t/components/ui/input";
import { Button } from "t/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "techme/trpc/react";

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

// Props de la página Validation
interface ValidationProps {
  validationId: number;
}

// Componente principal para la página de validación
export default function ValidationPage({ validationId }: ValidationProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Obtener el contexto de TRPC para invalidar caché
  const utils = api.useContext();

  // Query para obtener todos los reviews asociados con un validationId específico
  const { data: reviews, isLoading: isLoadingReviews, isError: isErrorReviews } =
    api.reviews.getAllSubmissions.useQuery(
      { validationId: validationId ?? 0 }, // Asegúrate de pasar un valor numérico por defecto
      {
        enabled: validationId !== undefined && validationId !== null, // Solo ejecuta si validationId es válido
      }
    );

  // Mutación para crear un nuevo review
  const { mutateAsync: addReview } = api.reviews.createSubmission.useMutation({
    onSuccess: () => {
      utils.reviews.getAllSubmissions.invalidate(); // Invalidar la cache para actualizar los datos
    },
  });

  // Mutación para finalizar y guardar todos los reviews
  const { mutateAsync: finalizeReviews } = api.reviews.submitAllReviews.useMutation({
    onSuccess: () => {
      utils.reviews.getAllSubmissions.invalidate(); // Invalidar la cache para actualizar los datos
    },
  });

  // Función para manejar la adición de un nuevo review
  const handleAddReview = async (review: ReviewSubmission) => {
    if (!validationId) {
      console.error("validationId is undefined or null");
      return;
    }

    await addReview({
      validationId: validationId ?? 0,  // Asegúrate de que nunca sea undefined o null
      reviewCount: reviews?.length ? reviews.length + 1 : 1, // Calcula el número de reviews
      finalReview: review.finalReview ?? false,
      submittedBy: userId ?? "",
    });
  };

  // Función para agregar un nuevo documento con nota
  const handleAddDocument = (file: File, note: string) => {
    const newDocument: Document = {
      id: documents.length + 1,
      name: file.name,
      likedBy: [],
      note,
    };
    setDocuments([...documents, newDocument]);
    setSelectedFile(null); // Reiniciar el archivo seleccionado después de agregar
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

  return (
    <div className="container mx-auto mt-8 relative">
      {!isLoadingReviews && !isErrorReviews && reviews && reviews.length > 0 ? (
        <div>
          {reviews.map((review: ReviewSubmission) => (
            <div key={review.id} className="mb-4 p-4 border rounded-md">
              <h3 className="font-bold">Review #{review.reviewCount ?? "N/A"}</h3>
              <p>Final Review: {review.finalReview ? "Yes" : "No"}</p>
              <p>Submitted By: {review.submittedBy ?? "Unknown"}</p>
              {review.submittedAt && (
                <p>Submitted At: {new Date(review.submittedAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Botón para agregar un nuevo review */}
      <Button onClick={() => setDialogOpen(true)} className="text-sm active:bg-black">+ Add New Review</Button>

      {/* Diálogo para agregar un nuevo review y subir documentos */}
      {dialogOpen && (
        <div className="modal mt-6">
          <Formik
            initialValues={{
              validationId: validationId ?? 0,  // Proporciona un valor por defecto
              finalReview: false,
              file: null,
              note: "",
            }}
            onSubmit={async (values, { resetForm }) => {
              if (values.file) {
                handleAddDocument(values.file, values.note);
              }
              resetForm();
              // No cerrar el diálogo automáticamente
            }}
          >
            {({ setFieldValue, values }) => (
              <Form className="p-4 border rounded-md shadow-lg bg-white w-full">
                <div className="space-y-4">
                  {/* Mostrar el número del review */}
                  <div>
                    <p className="font-bold">Review #{reviews?.length ? reviews.length + 1 : 1}</p>
                  </div>

                  {/* Sección de archivos */}
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="file-upload"
                      style={{ display: 'none' }}  // Ocultamos el input
                      onChange={(event: any) => {
                        const file = event.currentTarget.files[0];
                        if (file) {
                          setFieldValue("file", file);
                          setSelectedFile(file.name);
                        }
                      }}
                    />
                    {/* Label asociado al input, que abre el diálogo de archivos */}
                    <label htmlFor="file-upload">
                      <Button type="button" variant="default" className="text-sm active:bg-black">
                        {selectedFile ? "Cambiar archivo" : "Seleccionar archivo"}
                      </Button>
                    </label>

                    <Button type="submit" variant="default" className="text-sm active:bg-black">
                      Add Document
                    </Button>
                  </div>

                  {/* Mostrar campo de notas solo si hay un archivo seleccionado */}
                  {selectedFile && (
                    <div>
                      <Field name="note" as={Input} type="text" placeholder="Enter your note" />
                    </div>
                  )}

                  {/* Checkbox de "Final Review" */}
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 text-lg">
                      <Field name="finalReview" type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Final Review</span>
                    </label>
                  </div>

                  {/* Lista de documentos subidos dentro del recuadro */}
                  {documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold">Uploaded Documents</h3>
                      {documents.map((doc) => (
                        <div key={doc.id} className="mb-4 p-4 border rounded-md">
                          <p><strong>Document Name:</strong> {doc.name}</p>
                          <p><strong>Note:</strong> {doc.note}</p>
                          <p><strong>Liked By:</strong> {doc.likedBy.join(", ") || "No likes yet"}</p>
                          <Button onClick={() => handleLikeDocument(doc.id)} className="text-sm active:bg-black">Like</Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón para guardar el review */}
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="default"
                      onClick={() => {
                        handleAddReview({
                          validationId: validationId ?? 0,  // Aquí aseguramos un valor por defecto
                          reviewCount: reviews?.length ? reviews.length + 1 : 1,
                          finalReview: true,
                          submittedBy: userId ?? "",
                        });
                      }}
                      className="text-sm active:bg-black"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Botón para abrir el cuadro de confirmación para guardar todos los reviews */}
      <div className="flex justify-center mt-4">
        <Button variant="default" onClick={() => setConfirmDialogOpen(true)} className="text-sm active:bg-black">Guardar Todos los Reviews</Button>
      </div>

      {/* Cuadro de confirmación para guardar todos los reviews */}
      {confirmDialogOpen && (
        <div className="modal">
          <h2 className="text-lg font-bold">Confirmar acción</h2>
          <p>Estás a punto de subir {reviews?.length ?? 0} reviews. ¿Deseas continuar?</p>
          <div className="flex justify-between mt-4">
            <Button variant="destructive" onClick={() => setConfirmDialogOpen(false)} className="text-sm active:bg-black">Cancelar</Button>
            <Button
              variant="default"
              onClick={() => {
                finalizeReviews({ validationId: validationId ?? 0 });  // Asegurarse de que validationId nunca sea undefined
                setConfirmDialogOpen(false);
              }}
              className="text-sm active:bg-black"
            >
              Confirmar y Subir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
