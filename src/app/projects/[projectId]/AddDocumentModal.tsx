import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Button } from "t/components/ui/button";
import { Card } from "t/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "t/components/ui/dialog";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";

export default function AddDocumentModal({
  projectId,
  preloadedFile,
}: {
  projectId: number;
  preloadedFile?: File;
}) {
  const [open, setOpen] = useState(false);
  // const { mutateAsync: createDocument } = api.projectDocuments.createDocument.useMutation();
  const [isOverDragging, setIsOverDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    window.addEventListener("dragover", (e) => {
      console.log("aaaa", e);
      e.preventDefault();
      setIsOverDragging(true);
      // if (e.dataTransfer?.files[0]) {
      //   console.log("bbbb");
      //   setIsOverDragging(true);
      //   // setFile(e.dataTransfer.files[0]);
      // }
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("drop", e);
      if (e.dataTransfer?.files[0]) {
        setIsOverDragging(false);
        setFile(e.dataTransfer.files[0]);
      }
    });
    window.addEventListener("dragleave", (e) => {
      e.preventDefault();
      console.log("leeaving");
      setIsOverDragging(false);
    });
    // }, []);
  }, []);
  // }, [
  //   () => {
  //     window.removeEventListener("dragover", () => {});
  //     // window.removeEventListener("drop", () => {});
  //     // window.removeEventListener("dragleave", () => {});
  //   },
  // ]);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="m-4 flex w-11/12">Add Document</Button>
      </DialogTrigger>
      <DialogContent className="min-h-[550px] min-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>Add a document to the project</DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col items-center justify-center">
          <Formik
            initialValues={{
              file: file ? file : (preloadedFile ?? null),
              name: "",
            }}
            onSubmit={async (values) => {
              // await createDocument({ projectId, ...values });
              setOpen(false);
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form className="m-4 w-full gap-4 space-y-4">
                <div>
                  <Label htmlFor="name">Document name</Label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Document name"
                    as={Input}
                  />
                </div>
                {isOverDragging && (
                  <div className="h-16 w-full border-2 border-dotted">
                    Drop your files
                  </div>
                )}
                {!isOverDragging && (
                  <Field name="file" type="file" as={Input} />
                )}
              </Form>
            )}
          </Formik>
          <Button className="m-4">Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
