import { Button } from "t/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "t/components/ui/resizable";
import AddDocumentModal from "./AddDocumentModal";

export function Documents({ projectId }: { projectId: number }) {
  return (
    <div className="flex h-[95%] w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="max-w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
          <AddDocumentModal projectId={projectId} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex h-[200px] items-center justify-center p-6">
            <span className="font-semibold">Two</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
