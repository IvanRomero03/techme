import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Button } from "t/components/ui/button";
import { Card } from "t/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "t/components/ui/dialog";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import { api } from "techme/trpc/react";
import { z } from "zod";
import { toFormikValidate, toFormikValidationSchema } from "zod-formik-adapter";

export default function AddDocumentModal({
  projectId,
  preloadedFile,
}: {
  projectId: number;
  preloadedFile: File | null;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full">
        <Button className="m-4 flex w-full">Add Document</Button>
      </DialogTrigger>
      <DialogContent className="flex min-h-[500px] min-w-[400px] flex-col">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>Add a document to the project</DialogDescription>
        </DialogHeader>
        <div className="w-11/12 flex-col items-center justify-center">
          <Formik
            initialValues={{
              file: preloadedFile,
              name: "",
              _dragging: false,
            }}
            onSubmit={async (values) => {
              console.log(values);
              const file = values.file;
              if (file !== null) {
                const formData = new FormData();
                formData.set("projectId", projectId.toString());
                formData.set("name", values.name);
                formData.set("file", file);
                const res = await fetch("/api/upload-image", {
                  method: "POST",
                  body: formData,
                });
                console.log(res);
                await utils.documents.getDocuments.refetch({ projectId });
              }
              setOpen(false);
            }}
          >
            {({ values, setFieldValue, dirty, errors }) => (
              <Form className="m-4 flex w-full flex-col gap-4 space-y-4">
                <div
                  onDragOver={async (e) => {
                    e.preventDefault();
                    if (!values._dragging) {
                      await setFieldValue("_dragging", true);
                    }
                  }}
                  onDragLeave={async (e) => {
                    console.log("leave");
                    e.preventDefault();
                    if (values._dragging) {
                      await setFieldValue("_dragging", false);
                    }
                  }}
                  onDrop={async (e) => {
                    console.log("drop");
                    e.preventDefault();
                    e.stopPropagation();
                    await setFieldValue("_dragging", false);
                    await setFieldValue("file", e.dataTransfer.files[0]);
                    if (
                      (!values.name || values.name === "") &&
                      e.dataTransfer.files[0]
                    ) {
                      await setFieldValue("name", e.dataTransfer.files[0].name);
                    }
                  }}
                >
                  {values._dragging && (
                    <div className="flex justify-center">
                      <input
                        type="file"
                        className="absolute hidden h-screen w-screen"
                        onChangeCapture={(e) => {
                          console.log(e);
                        }}
                      />
                      <div className="flex h-[400px] w-[400px] items-center justify-center self-center border-2 border-dashed border-gray-400 bg-gray-200 bg-opacity-50">
                        <p>Drop file here</p>
                      </div>
                    </div>
                  )}
                  {!values._dragging && (
                    <>
                      <Label htmlFor="name">Document name</Label>
                      <Field
                        name="name"
                        type="text"
                        placeholder="Document name"
                        as={Input}
                        required
                      />
                      {errors.name && (
                        <p className="text-red-500">{errors.name}</p>
                      )}
                      <Label htmlFor="file">Document</Label>
                      <Input
                        type="file"
                        name="file"
                        onChange={async (e) => {
                          console.log(e);
                          if (!e.target.files) return;
                          if (
                            e.target.files.length === 0 ||
                            !e.target.files[0]
                          ) {
                            await setFieldValue("file", null);
                            return;
                          } else {
                            await setFieldValue("file", e.target.files[0]);
                            if (!values.name || values.name === "") {
                              await setFieldValue(
                                "name",
                                e.target.files[0].name,
                              );
                            }
                          }
                        }}
                        // required
                      />
                      {errors.file && (
                        <p className="text-red-500">{errors.file}</p>
                      )}
                      {values.file && (
                        <embed
                          src={URL.createObjectURL(values.file)}
                          className="m-2 h-64 w-full"
                        />
                      )}
                      <DialogFooter>
                        <Button
                          className="m-4"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="m-4"
                          type="submit"
                          // disabled={dirty || Object.keys(errors).length > 0}
                        >
                          Upload
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
}
