import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PaperclipIcon } from "lucide-react";

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
  itemType: z.string({
    required_error: "Please select an item type",
  }),
  itemName: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  specifications: z.string().min(10, {
    message: "Specifications must be at least 10 characters.",
  }),
  justification: z.string().min(20, {
    message: "Please provide a detailed justification for this request.",
  }),
  urgency: z.string({
    required_error: "Please select an urgency level",
  }),
});

interface RequestFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
}

const RequestForm = ({ onSubmit = () => {} }: RequestFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemType: "",
      itemName: "",
      specifications: "",
      justification: "",
      urgency: "normal",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    console.log(values);
    // In a real implementation, this would send the data to a server
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="peripheral">Peripheral</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category of item you are requesting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide the specific name or model of the item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specifications</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter detailed specifications"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include details such as model, version, size, or any specific
                  requirements
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justification</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain why this item is needed"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed explanation of why this item is necessary
                  for your work
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low - Within 30 days</SelectItem>
                    <SelectItem value="normal">
                      Normal - Within 14 days
                    </SelectItem>
                    <SelectItem value="high">High - Within 7 days</SelectItem>
                    <SelectItem value="urgent">
                      Urgent - Within 48 hours
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Indicate how urgently you need this item
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <PaperclipIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">
                Attach Files (Optional)
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here or click to browse. Max file size: 10MB
            </p>
            <Input
              type="file"
              className="mt-2"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RequestForm;
