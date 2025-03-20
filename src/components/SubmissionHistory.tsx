import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Eye, Filter, Search } from "lucide-react";

interface Submission {
  id: string;
  type: "Support Ticket" | "Hardware Request" | "Software Request";
  title: string;
  date: Date;
  status: "Pending" | "In Progress" | "Complete";
  priority?: "Low" | "Medium" | "High" | "Critical";
  description: string;
}

interface SubmissionHistoryProps {
  submissions?: Submission[];
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions = [
    {
      id: "1",
      type: "Support Ticket",
      title: "Email not working",
      date: new Date(2023, 5, 15),
      status: "In Progress",
      priority: "High",
      description: "Unable to send or receive emails since this morning.",
    },
    {
      id: "2",
      type: "Hardware Request",
      title: "New laptop",
      date: new Date(2023, 5, 10),
      status: "Pending",
      description: "Request for a new development laptop with 32GB RAM.",
    },
    {
      id: "3",
      type: "Software Request",
      title: "Adobe Creative Suite",
      date: new Date(2023, 5, 5),
      status: "Complete",
      description:
        "License request for Adobe Creative Suite for the design team.",
    },
    {
      id: "4",
      type: "Support Ticket",
      title: "VPN Connection Issues",
      date: new Date(2023, 5, 1),
      status: "Complete",
      priority: "Medium",
      description: "Cannot connect to the company VPN from home office.",
    },
    {
      id: "5",
      type: "Hardware Request",
      title: "Monitor",
      date: new Date(2023, 4, 25),
      status: "In Progress",
      description: "Request for a 27-inch 4K monitor for remote work setup.",
    },
  ],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter submissions based on search term and filters
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || submission.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      format(submission.date, "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "In Progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            In Progress
          </Badge>
        );
      case "Complete":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Complete
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    switch (priority) {
      case "Low":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
          >
            Low
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Medium
          </Badge>
        );
      case "High":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-300"
          >
            High
          </Badge>
        );
      case "Critical":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Critical
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Submission details component
  const SubmissionDetailsView = ({
    submission,
  }: {
    submission: Submission;
  }) => (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">{submission.title}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p>{submission.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p>{submission.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p>{format(submission.date, "PPP")}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Priority</p>
          <p>{submission.priority || "N/A"}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500">Description</p>
        <p className="mt-1">{submission.description}</p>
      </div>
    </div>
  );

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Submission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search submissions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Filter:</span>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Support Ticket">Support Ticket</SelectItem>
                  <SelectItem value="Hardware Request">
                    Hardware Request
                  </SelectItem>
                  <SelectItem value="Software Request">
                    Software Request
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[130px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? (
                      format(dateFilter, "PPP")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                  className="h-8 px-2"
                >
                  Clear Date
                </Button>
              )}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.type}</TableCell>
                      <TableCell>{submission.title}</TableCell>
                      <TableCell>
                        {format(submission.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {getPriorityBadge(submission.priority)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={
                            isDetailsOpen &&
                            selectedSubmission?.id === submission.id
                          }
                          onOpenChange={setIsDetailsOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(submission)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            {selectedSubmission && (
                              <SubmissionDetailsView
                                submission={selectedSubmission}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionHistory;
