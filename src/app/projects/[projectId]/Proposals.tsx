"use client";

import { RefreshCcw, Send, Download, Loader } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "t/components/ui/button";
import { Card, CardContent } from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { saveAs } from "file-saver";
import { api } from "techme/trpc/react";
import { useState, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { getOpenAIBrowser } from "techme/server/chatgpt/openai";
import marpExporter, { marpExporterHTML } from "./marpExporter";

export default function Proposals({ projectId }: { projectId: string }) {
  const [proposalsContent, setProposalsContent] = useState<string>("");
  const [estimateContent, setEstimateContent] = useState<string>("");
  const [checklistContent, setChecklistContent] = useState<string>("");

  const [proposalsChat, setProposalsChat] = useState<
    { role: string; content: string }[]
  >([]);
  const [estimateChat, setEstimateChat] = useState<
    { role: string; content: string }[]
  >([]);
  const [checklistChat, setChecklistChat] = useState<
    { role: string; content: string }[]
  >([]);

  const [inputProposals, setInputProposals] = useState("");
  const [inputEstimates, setInputEstimates] = useState("");
  const [inputChecklist, setInputChecklist] = useState("");

  const [isSending, setIsSending] = useState(false);

  const proposalsQuery = api.projectProposals.getProjectProposal.useQuery({
    projectId: Number(projectId),
  });
  const estimatesQuery = api.projectEstimate.getProjectEstimate.useQuery({
    projectId: Number(projectId),
  });
  const checklistQuery = api.projectChecklist.getProjectChecklist.useQuery({
    projectId: Number(projectId),
  });

  const { mutateAsync: refreshProposals } =
    api.projectProposals.unsetCacheProjectProposal.useMutation();
  const { mutateAsync: refreshEstimates } =
    api.projectEstimate.unsetCacheProjectEstimate.useMutation();
  const { mutateAsync: refreshChecklist } =
    api.projectChecklist.unsetCacheProjectChecklist.useMutation();
  const { mutateAsync: sendMessageToAI } =
    api.projectProposals.sendMessageToAI.useMutation();

  const utils = api.useContext();

  useEffect(() => {
    if (proposalsQuery.data) {
      setProposalsContent(
        proposalsQuery.data.join("") || "No content available.",
      );
    }
  }, [proposalsQuery.data]);

  useEffect(() => {
    if (estimatesQuery.data) {
      setEstimateContent(
        estimatesQuery.data.join("") || "No content available.",
      );
    }
  }, [estimatesQuery.data]);

  useEffect(() => {
    if (checklistQuery.data) {
      setChecklistContent(
        checklistQuery.data.join("") || "No content available.",
      );
    }
  }, [checklistQuery.data]);

  const handleSendMessage = async (
    section: "proposals" | "estimate" | "checklist",
  ) => {
    let inputMessage = "";

    if (section === "proposals") inputMessage = inputProposals;
    else if (section === "estimate") inputMessage = inputEstimates;
    else if (section === "checklist") inputMessage = inputChecklist;

    if (inputMessage.trim() === "") return;

    const newMessage = { role: "user", content: inputMessage };
    if (section === "proposals") setInputProposals("");
    else if (section === "estimate") setInputEstimates("");
    else if (section === "checklist") setInputChecklist("");

    setIsSending(true);

    try {
      const response = await sendMessageToAI({
        projectId: Number(projectId),
        message: inputMessage,
      });

      if (section === "proposals") {
        setProposalsChat((prevMessages) => [
          ...prevMessages,
          newMessage,
          { role: "assistant", content: response },
        ]);
        setProposalsContent(response);
      } else if (section === "estimate") {
        setEstimateChat((prevMessages) => [
          ...prevMessages,
          newMessage,
          { role: "assistant", content: response },
        ]);
        setEstimateContent(response);
      } else if (section === "checklist") {
        setChecklistChat((prevMessages) => [
          ...prevMessages,
          newMessage,
          { role: "assistant", content: response },
        ]);
        setChecklistContent(response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleExportToDocx = async () => {
    const processContent = (content: string) => {
      const paragraphs: Paragraph[] = [];
      const lines = content.split("\n");

      lines.forEach((line) => {
        if (line.startsWith("### ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("### ", ""),
              heading: "Heading3",
            }),
          );
        } else if (line.startsWith("#### ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("#### ", ""),
              heading: "Heading4",
            }),
          );
        } else if (line.startsWith("- ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("- ", ""),
              bullet: { level: 0 },
            }),
          );
        } else if (line.startsWith("[ ]") || line.startsWith("[x]")) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace(/\[.\] /, ""),
                }),
              ],
            }),
          );
        } else if (line.trim() !== "") {
          paragraphs.push(new Paragraph({ text: line }));
        }
      });

      return paragraphs;
    };

    try {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: "Proposals", heading: "Heading1" }),
              ...processContent(proposalsContent),
              new Paragraph({ text: "Estimate", heading: "Heading1" }),
              ...processContent(estimateContent),
              new Paragraph({ text: "Checklist", heading: "Heading1" }),
              ...processContent(checklistContent),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc); // Usa await para manejar la promesa
      saveAs(blob, "Project_Responses.docx");
    } catch (error) {
      console.error("Error generating DOCX file:", error);
      alert(
        "Error generating DOCX file. Please check the console for more details.",
      );
    }
  };
  const [isExporting, setIsExporting] = useState(false);
  const handleExportToPptx = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const openai = getOpenAIBrowser();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a markdown document to marp converter. conver the next content to a marp presentation, ONLY the content of the marp slides, not any other text and DONT wrap the content inside any ` or ```, just the marp code being directly to be rendered.",
        },
        { role: "user", content: proposalsContent },
        { role: "user", content: estimateContent },
        { role: "user", content: checklistContent },
      ],
    });
    const content = res.choices[0]?.message.content;
    console.log("Generated PPTX content:", content);
    if (!content) {
      alert(
        "Error generating PPTX file. Please check the console for more details.",
      );
      setIsExporting(false);
      return;
    }
    try {
      const blob = new Blob([await marpExporter(content)], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const fileName = "Project_Responses.pptx";
      saveAs(blob, fileName);

      const htmlExp = new Blob([await marpExporterHTML(content)], {
        type: "text/html",
      });
      const htmlFileName = "Project_Responses.html";
      saveAs(htmlExp, htmlFileName);
    } catch (error) {
      console.error("Error generating PPTX file:", error);
      alert(
        "Error generating PPTX file. Please check the console for more details.",
      );
    }
    setIsExporting(false);
  };

  return (
    <CardContent className="flex h-full w-full flex-col gap-8">
      {/* Botón de Exportación */}
      <div className="mb-4 flex justify-end">
        <Button onClick={handleExportToDocx} variant="ghost">
          <Download className="mr-2 h-4 w-4" />
          Export to DOCX
        </Button>
        {!isExporting ? (
          <Button onClick={handleExportToPptx} variant="ghost">
            <Download className="mr-2 h-4 w-4" />
            Export to PPTX
          </Button>
        ) : (
          <Button variant="ghost" disabled>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </Button>
        )}
      </div>

      {/* Proposals Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Proposals</h1>
          <Button
            onClick={async () => {
              await refreshProposals({ projectId: Number(projectId) });
              await proposalsQuery.refetch();
            }}
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="max-h-[50vh] overflow-auto">
          {proposalsQuery.isLoading ? (
            <p>Loading Proposals...</p>
          ) : (
            <Markdown>{proposalsContent || "No content available."}</Markdown>
          )}
        </CardContent>
      </Card>
      <Card className="w-full rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-bold">Chat with AI - Proposals</h2>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputProposals}
            onChange={(e) => setInputProposals(e.target.value)}
            disabled={isSending}
          />
          <Button
            onClick={() => handleSendMessage("proposals")}
            disabled={isSending || !inputProposals.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Estimates Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Estimate</h1>
          <Button
            onClick={async () => {
              await refreshEstimates({ projectId: Number(projectId) });
              await estimatesQuery.refetch();
            }}
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="max-h-[50vh] overflow-auto">
          {estimatesQuery.isLoading ? (
            <p>Loading Estimates...</p>
          ) : (
            <Markdown>{estimateContent || "No content available."}</Markdown>
          )}
        </CardContent>
      </Card>
      <Card className="w-full rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-bold">Chat with AI - Estimates</h2>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputEstimates}
            onChange={(e) => setInputEstimates(e.target.value)}
            disabled={isSending}
          />
          <Button
            onClick={() => handleSendMessage("estimate")}
            disabled={isSending || !inputEstimates.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Checklist Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Checklist</h1>
          <Button
            onClick={async () => {
              await refreshChecklist({ projectId: Number(projectId) });
              await checklistQuery.refetch();
            }}
            variant={"ghost"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="max-h-[50vh] overflow-auto">
          {checklistQuery.isLoading ? (
            <p>Loading Checklist...</p>
          ) : (
            <Markdown>{checklistContent || "No content available."}</Markdown>
          )}
        </CardContent>
      </Card>
      <Card className="w-full rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-bold">Chat with AI - Checklist</h2>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputChecklist}
            onChange={(e) => setInputChecklist(e.target.value)}
            disabled={isSending}
          />
          <Button
            onClick={() => handleSendMessage("checklist")}
            disabled={isSending || !inputChecklist.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </CardContent>
  );
}
