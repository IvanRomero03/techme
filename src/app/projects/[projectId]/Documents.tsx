import { Form, Formik } from "formik";
import { File, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardHeader } from "t/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "t/components/ui/context-menu";
import { Input } from "t/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "t/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "t/components/ui/resizable";
import { Separator } from "t/components/ui/separator";
import { api } from "techme/trpc/react";
import AddDocumentModal from "./AddDocumentModal";

export function Documents({ projectId }: { projectId: number }) {
  const { data: documents } = api.documents.getDocuments.useQuery({
    projectId,
  });
  const { mutateAsync: removeDocument } =
    api.documents.removeDocument.useMutation();
  const { mutateAsync: renameDocument } =
    api.documents.renameDocument.useMutation();
  const utils = api.useUtils();
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    name: string;
    projectId: number | null;
    url: string;
    uploadedBy: string | null;
    uploadedAt: Date | null;
  } | null>(null);

  useEffect(() => {
    if (selectedDocument) {
      const findInDocuments = documents?.find(
        (document) => document.id === selectedDocument.id,
      );
      if (!findInDocuments) {
        setSelectedDocument(null);
      } else {
        if (findInDocuments.name !== selectedDocument.name) {
          setSelectedDocument(findInDocuments);
        }
      }
    }
  }, [documents]);
  return (
    <div className="flex h-[95%] w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
          <AddDocumentModal projectId={projectId} preloadedFile={null} />
          <Separator />
          {documents?.map((doc) => (
            <ContextMenu key={doc.id}>
              <ContextMenuTrigger>
                <div
                  key={doc.id}
                  className="flex items-center justify-start gap-4 border-b p-2 hover:cursor-pointer"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <File className="h-4 w-4" />
                  <p>{doc.name}</p>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem
                  inset
                  onClick={() => {
                    window.open(doc.url, "_blank");
                  }}
                >
                  Download
                </ContextMenuItem>
                <Separator />
                <ContextMenuItem
                  inset
                  onClick={async () => {
                    await navigator.clipboard.writeText(doc.url);
                  }}
                >
                  Copy Url
                </ContextMenuItem>
                <Separator />
                <div className="w-full">
                  <Formik
                    initialValues={{
                      name: doc.name,
                      _open: false,
                    }}
                    onSubmit={async (values) => {
                      await renameDocument({
                        documentId: doc.id,
                        name: values.name,
                      });
                      await utils.documents.getDocuments.refetch({
                        projectId,
                      });
                    }}
                  >
                    {({ values, setFieldValue }) => (
                      <Popover>
                        <PopoverTrigger className="w-full">
                          <div
                            className="p-2 pl-8 text-start text-sm hover:bg-gray-100"
                            id={"rename" + doc.id}
                          >
                            Rename
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="absolute -top-8 left-32">
                          <Form className="flex flex-col">
                            <Input
                              name="name"
                              className="w-full"
                              value={values.name}
                              onChange={async (e) => {
                                await setFieldValue("name", e.target.value);
                              }}
                            />
                            <Button type="submit">Rename</Button>
                          </Form>
                        </PopoverContent>
                      </Popover>
                    )}
                  </Formik>
                </div>
                <ContextMenuItem
                  inset
                  onClick={async () => {
                    await removeDocument({ documentId: doc.id });
                    await utils.documents.getDocuments.refetch({ projectId });
                  }}
                >
                  Remove
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          {selectedDocument && (
            <>
              <Card className="flex h-full w-full flex-col">
                <CardHeader className="flex flex-row items-center justify-between gap-2 font-bold">
                  <h1>{selectedDocument.name}</h1>
                  <Button
                    variant={"outline"}
                    onClick={() => setSelectedDocument(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <embed
                  src={selectedDocument.url}
                  className="flex h-full w-full"
                />
              </Card>
            </>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
