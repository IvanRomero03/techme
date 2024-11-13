"use client";

import { RefreshCcw, Send, Download } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "t/components/ui/button";
import { Card, CardContent } from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { saveAs } from "file-saver";
import { api } from "techme/trpc/react";
import { useState, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function Proposals({ projectId }: { projectId: string }) {
  const [proposalsContent, setProposalsContent] = useState<string>("");
  const [estimateContent, setEstimateContent] = useState<string>("");
  const [checklistContent, setChecklistContent] = useState<string>("");

  const [proposalsChat, setProposalsChat] = useState<{ role: string; content: string }[]>([]);
  const [estimateChat, setEstimateChat] = useState<{ role: string; content: string }[]>([]);
  const [checklistChat, setChecklistChat] = useState<{ role: string; content: string }[]>([]);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Consultas y mutaciones de TRPC
  const proposalsQuery = api.projectProposals.getProjectProposal.useQuery(
    { projectId: Number(projectId) }
  );

  const estimatesQuery = api.projectEstimate.getProjectEstimate.useQuery(
    { projectId: Number(projectId) }
  );

  const checklistQuery = api.projectChecklist.getProjectChecklist.useQuery(
    { projectId: Number(projectId) }
  );

  const { mutateAsync: refreshProposals } = api.projectProposals.unsetCacheProjectProposal.useMutation();
  const { mutateAsync: refreshEstimates } = api.projectEstimate.unsetCacheProjectEstimate.useMutation();
  const { mutateAsync: refreshChecklist } = api.projectChecklist.unsetCacheProjectChecklist.useMutation();
  const { mutateAsync: sendMessageToAI } = api.projectProposals.sendMessageToAI.useMutation();

  const utils = api.useContext();

  // useEffect para actualizar el contenido cuando los datos sean recibidos
  useEffect(() => {
    if (proposalsQuery.data) {
      console.log("Proposals Data:", proposalsQuery.data);
      setProposalsContent(proposalsQuery.data.join("") || "No content available.");
    }
  }, [proposalsQuery.data]);

  useEffect(() => {
    if (estimatesQuery.data) {
      console.log("Estimates Data:", estimatesQuery.data);
      setEstimateContent(estimatesQuery.data.join("") || "No content available.");
    }
  }, [estimatesQuery.data]);

  useEffect(() => {
    if (checklistQuery.data) {
      console.log("Checklist Data:", checklistQuery.data);
      setChecklistContent(checklistQuery.data.join("") || "No content available.");
    }
  }, [checklistQuery.data]);

  const handleSendMessage = async (section: "proposals" | "estimate" | "checklist") => {
    if (inputMessage.trim() === "") return;

    const newMessage = { role: "user", content: inputMessage };
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await sendMessageToAI({ projectId: Number(projectId), message: inputMessage });

      if (section === "proposals") {
        setProposalsChat((prevMessages) => [...prevMessages, newMessage, { role: "assistant", content: response }]);
        setProposalsContent(response);
      } else if (section === "estimate") {
        setEstimateChat((prevMessages) => [...prevMessages, newMessage, { role: "assistant", content: response }]);
        setEstimateContent(response);
      } else if (section === "checklist") {
        setChecklistChat((prevMessages) => [...prevMessages, newMessage, { role: "assistant", content: response }]);
        setChecklistContent(response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleExportToDocx = () => {
    try {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: "Proposals", heading: "Heading1" }),
              new Paragraph({ text: proposalsContent }),
              new Paragraph({ text: "Estimate", heading: "Heading1" }),
              new Paragraph({ text: estimateContent }),
              new Paragraph({ text: "Checklist", heading: "Heading1" }),
              new Paragraph({ text: checklistContent }),
            ],
          },
        ],
      });

      void Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "Project_Responses.docx");
      });
    } catch (error) {
      console.error("Error generating DOCX file:", error);
      alert("Error generating DOCX file. Please check the console for more details.");
    }
  };

  return (
    <CardContent className="flex h-full w-full flex-col gap-8">
      {/* Botón de Exportación */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportToDocx} variant="ghost">
          <Download className="h-4 w-4 mr-2" />
          Export to DOCX
        </Button>
      </div>

      {/* Proposals Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex justify-between items-center p-4">
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

      {/* Chat for Proposals */}
      <Card className="w-full bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Chat with AI - Proposals</h2>
        <div className="max-h-[150px] overflow-auto border p-2 mb-2 rounded bg-white">
          {proposalsChat.map((msg, idx) => (
            <p key={idx} className={`text-sm ${msg.role === "user" ? "text-blue-500" : "text-gray-700"}`}>
              <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
              {msg.content}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
          />
          <Button onClick={() => handleSendMessage("proposals")} disabled={isSending || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Estimates Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex justify-between items-center p-4">
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

      {/* Chat for Estimates */}
      <Card className="w-full bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Chat with AI - Estimates</h2>
        <div className="max-h-[150px] overflow-auto border p-2 mb-2 rounded bg-white">
          {estimateChat.map((msg, idx) => (
            <p key={idx} className={`text-sm ${msg.role === "user" ? "text-blue-500" : "text-gray-700"}`}>
              <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
              {msg.content}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
          />
          <Button onClick={() => handleSendMessage("estimate")} disabled={isSending || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Checklist Section */}
      <Card className="relative w-full overflow-auto">
        <div className="flex justify-between items-center p-4">
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

      {/* Chat for Checklist */}
      <Card className="w-full bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Chat with AI - Checklist</h2>
        <div className="max-h-[150px] overflow-auto border p-2 mb-2 rounded bg-white">
          {checklistChat.map((msg, idx) => (
            <p key={idx} className={`text-sm ${msg.role === "user" ? "text-blue-500" : "text-gray-700"}`}>
              <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
              {msg.content}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="flex-grow"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
          />
          <Button onClick={() => handleSendMessage("checklist")} disabled={isSending || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </CardContent>
  );
}
