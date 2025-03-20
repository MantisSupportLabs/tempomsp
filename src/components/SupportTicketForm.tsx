import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Paperclip } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  priority: z.string({
    required_error: "Please select a priority level.",
  }),
  attachments: z.any().optional(),
});

interface SupportTicketFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
}

const SupportTicketForm = ({ onSubmit = () => {} }: SupportTicketFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    console.log(values);
    // Reset form after submission
    form.reset();
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief title of your issue" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a short, descriptive title for your support ticket.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include any relevant details, error messages, or steps to
                  reproduce the issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low - Not urgent</SelectItem>
                    <SelectItem value="medium">
                      Medium - Affects work but has workaround
                    </SelectItem>
                    <SelectItem value="high">
                      High - Severely impacts work
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical - Complete work stoppage
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the appropriate priority level for your issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachments</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      className="cursor-pointer"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload screenshots, logs, or other relevant files (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SupportTicketForm;
