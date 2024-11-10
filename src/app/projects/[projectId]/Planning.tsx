"use client";

import { useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import { api } from "techme/trpc/react";
import { useSession } from "next-auth/react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "t/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "t/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandList, CommandItem, CommandEmpty } from "t/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "t/components/ui/avatar";
import { XCircle } from "lucide-react";

type Member = {
    id: string;
    name?: string | null;
    email?: string;
    image?: string | null;
};

export default function Planning({ projectId }: { projectId: number }) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id; 

    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingDescription, setMeetingDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Map<string, Member>>(new Map());
    const [openMembers, setOpenMembers] = useState<boolean>(false);

    const { data: meetings, isLoading, error } = api.meetings.getProjectMeetings.useQuery({
        projectId,
    });

    const { data: members} = api.members.getAuthorizedMembers.useQuery();
    const { mutate: addMeeting, status: addMeetingStatus } = api.meetings.addMeeting.useMutation();
    const isAdding = addMeetingStatus === 'pending';

    const { mutate: deleteMeeting, status: deleteMeetingStatus } = api.meetings.deleteMeeting.useMutation();
    const isDeleting = deleteMeetingStatus === 'pending';

    const utils = api.useUtils();

    const handleAddMeeting = async () => {
        if (!meetingTitle || !meetingDate || !meetingDescription) {
          console.log("Please provide meeting title, date, and description.");
          return;
        }
      
        try {
          await addMeeting({
            projectId,
            title: meetingTitle,
            date: meetingDate,
            description: meetingDescription,
            createdBy: currentUserId ?? "Unknown",
            attendees: Array.from(selectedMembers.keys())
          });
      
          setMeetingTitle("");
          setMeetingDate("");
          setMeetingDescription(""); 
          setSelectedMembers(new Map());
          
          
          await utils.meetings.getProjectMeetings.invalidate();
          await utils.notifications.getAll.invalidate();
          
          console.log("Meeting scheduled successfully!");
        } catch (error) {
          console.log("Failed to schedule the meeting. Try again.");
        }
      };

    const handleDialogClose = async () => {
        try {
            utils.meetings.getProjectMeetings.refetch({ projectId });
        } catch (error) {
            console.error("Failed to refetch meetings:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Meetings</h2>

                <Dialog onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button className="mt-4">Add Meeting</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>Schedule a Meeting</DialogTitle>
                        <DialogDescription>Fill in the details to schedule a new meeting and invite members.</DialogDescription>

                        <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                            <div>
                                <Label>Meeting Title</Label>
                                <Input
                                    value={meetingTitle}
                                    onChange={(e) => setMeetingTitle(e.target.value)}
                                    placeholder="Enter meeting title"
                                    disabled={isAdding}
                                />
                            </div>
                            <div>
                                <Label>Meeting Date</Label>
                                <Input
                                    type="date"
                                    value={meetingDate}
                                    onChange={(e) => setMeetingDate(e.target.value)}
                                    disabled={isAdding}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Meeting Description</Label>
                                <Input
                                    value={meetingDescription}
                                    onChange={(e) => setMeetingDescription(e.target.value)}
                                    placeholder="Enter meeting description"
                                    disabled={isAdding}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Invite Members</Label>
                                <Popover open={openMembers} onOpenChange={setOpenMembers}>
                                    <PopoverTrigger>
                                        <Button
                                            onClick={() => setOpenMembers(true)}
                                            variant="outline"
                                            type="button"
                                        >
                                            Add Members
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Command>
                                            <CommandInput placeholder="Search members to add" />
                                            <CommandList>
                                                <CommandEmpty>No members found.</CommandEmpty>
                                                <CommandGroup>
                                                    {members?.map((member) => (
                                                        <CommandItem
                                                            key={member.id}
                                                            value={member.name ?? undefined}
                                                            onSelect={() => {
                                                                if (selectedMembers.has(member.id)) {
                                                                    const newMembers = new Map(selectedMembers);
                                                                    newMembers.delete(member.id);
                                                                    setSelectedMembers(newMembers);
                                                                } else {
                                                                    setSelectedMembers(new Map(selectedMembers.set(member.id, member)));
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-x-4">
                                                                <Avatar>
                                                                    <AvatarImage src={member.image ?? undefined} />
                                                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p>{member.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {member.email}
                                                                    </p>
                                                                </div>
                                                                {selectedMembers.has(member.id) && (
                                                                    <Button variant="ghost">
                                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="m-8 flex flex-wrap gap-4">
                            {Array.from(selectedMembers.values()).map((member) => (
                                <div key={member.id} className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={member.image ?? undefined} />
                                        <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p>{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const newMembers = new Map(selectedMembers);
                                            newMembers.delete(member.id);
                                            setSelectedMembers(newMembers);
                                        }}
                                        variant="ghost"
                                    >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleAddMeeting} disabled={isAdding} className="mt-4">
                                {isAdding ? "Scheduling..." : "Schedule Meeting"}
                            </Button>
                            <DialogClose asChild>
                                <Button className="mt-4 ml-2" variant="outline">
                                    Close
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Upcoming Meetings</h3>
                {isLoading ? (
                    <p>Loading meetings...</p>
                ) : error ? (
                    <p className="text-red-600">Failed to load meetings. Please try again.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {meetings && meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <Card key={meeting.id} className="bg-gray-100">
                                    <CardHeader>
                                        <CardTitle className="flex w-full items-center justify-between">
                                            <p className="font-medium">{meeting.title}</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={async () => {
                                                        deleteMeeting({ id: meeting.id });
                                                        await utils.meetings.getProjectMeetings.refetch({
                                                            projectId,
                                                        });
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? "Deleting..." : "Delete"}
                                                </Button>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{new Date(meeting.date).toLocaleDateString()}</p>
                                        <p>{meeting.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p>No meetings scheduled yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

