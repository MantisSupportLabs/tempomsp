import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SupportTicketForm from "./SupportTicketForm";
import RequestForm from "./RequestForm";

interface SubmissionFormProps {
  onSubmitTicket?: (values: any) => void;
  onSubmitRequest?: (values: any) => void;
  defaultTab?: "ticket" | "request";
  defaultStatus?: "pending" | "in-progress" | "complete";
}

const SubmissionForm = ({
  onSubmitTicket = () => {},
  onSubmitRequest = () => {},
  defaultTab = "ticket",
  defaultStatus = "pending",
}: SubmissionFormProps) => {
  const [activeTab, setActiveTab] = useState<"ticket" | "request">(defaultTab);
  const [status, setStatus] = useState<"pending" | "in-progress" | "complete">(
    defaultStatus,
  );
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(
    "email",
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as "ticket" | "request");
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as "pending" | "in-progress" | "complete");
  };

  const handleContactMethodChange = (value: string) => {
    setContactMethod(value as "email" | "phone");
  };

  const handleTicketSubmit = (values: any) => {
    onSubmitTicket({ ...values, status, contactMethod });
    // In a real implementation, this would send the data to a server
    // and potentially show a success message
    console.log("Support ticket submitted:", {
      ...values,
      status,
      contactMethod,
    });
  };

  const handleRequestSubmit = (values: any) => {
    onSubmitRequest({ ...values, status, contactMethod });
    // In a real implementation, this would send the data to a server
    // and potentially show a success message
    console.log("Request submitted:", { ...values, status, contactMethod });
  };

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-white rounded-t-xl pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Submit a New Request
          </CardTitle>
          <CardDescription>
            Choose the type of submission you want to create below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Status Selection */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Select Status:</h3>
            <RadioGroup
              defaultValue={status}
              onValueChange={handleStatusChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="text-amber-500 font-medium">
                  Pending
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-progress" id="in-progress" />
                <Label
                  htmlFor="in-progress"
                  className="text-blue-500 font-medium"
                >
                  In Progress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complete" id="complete" />
                <Label
                  htmlFor="complete"
                  className="text-green-500 font-medium"
                >
                  Complete
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Contact Method Selection */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">
              Preferred Contact Method:
            </h3>
            <RadioGroup
              defaultValue={contactMethod}
              onValueChange={handleContactMethodChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="font-medium">
                  Phone
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Form Type Tabs */}
          <Tabs
            defaultValue={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-gray-50">
              <TabsTrigger
                value="ticket"
                className="data-[state=active]:bg-white rounded-b-none py-3"
              >
                Support Ticket
              </TabsTrigger>
              <TabsTrigger
                value="request"
                className="data-[state=active]:bg-white rounded-b-none py-3"
              >
                Hardware/Software Request
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ticket" className="mt-0">
              <div className="p-1">
                <SupportTicketForm onSubmit={handleTicketSubmit} />
              </div>
            </TabsContent>
            <TabsContent value="request" className="mt-0">
              <div className="p-1">
                <RequestForm onSubmit={handleRequestSubmit} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionForm;
