"use client";
import { Button } from "t/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "t/components/ui/select";
import { readableRole, UserRole } from "techme/util/UserRole";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "t/components/ui/form";
import { api } from "techme/trpc/react";
import { useToast } from "t/hooks/use-toast";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
});

export function InviteMember() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.ProjectManager,
    },
  });

  const { mutateAsync: inviteMember } = api.members.inviteMembers.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const res = await inviteMember(values);
    console.log(res);
    if (res.success) {
      form.reset();
      toast({
        title: "Member invited",
        description: `${values.name} with the email: ${values.email} has been invited to join your team with role ${readableRole(values.role)}.`,
      });
    } else {
      toast({
        title: "Failed to invite member",
        description: "An error occurred while trying to invite the member.",
      });
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="m-4 flex w-2/4 self-center">
          Invite new member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite new member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your team, they will receive an email
            with the confirmation link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The name to display in the invite email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The email address to send the invite to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={(e) => {
                          field.onChange(e);
                        }}
                      >
                        <SelectTrigger>
                          {readableRole(field.value)}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(UserRole).map((role) => (
                            <SelectItem key={role} value={role}>
                              {readableRole(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      The role the user will have. This can be changed later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Invite</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
