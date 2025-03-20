import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  User,
  X,
} from "lucide-react";

interface SubmissionDetailsProps {
  isOpen?: boolean;
  onClose?: () => void;
  submission?: {
    id: string;
    title: string;
    type: "Support Ticket" | "Hardware Request" | "Software Request";
    status: "Pending" | "In Progress" | "Complete";
    description: string;
    priority?: "Low" | "Medium" | "High" | "Critical";
    createdAt: string;
    updatedAt: string;
    submittedBy: string;
    attachments?: { name: string; url: string }[];
    comments?: { author: string; text: string; timestamp: string }[];
  };
}

const SubmissionDetails = ({
  isOpen = true,
  onClose = () => {},
  submission = {
    id: "TICKET-1234",
    title: "Network connectivity issues",
    type: "Support Ticket",
    status: "In Progress",
    description:
      "Unable to connect to the company VPN from my laptop. I've tried restarting and updating the VPN client but still experiencing issues.",
    priority: "High",
    createdAt: "2023-06-15T09:30:00",
    updatedAt: "2023-06-15T14:45:00",
    submittedBy: "John Smith",
    attachments: [
      { name: "error_screenshot.png", url: "#" },
      { name: "vpn_logs.txt", url: "#" },
    ],
    comments: [
      {
        author: "Support Agent",
        text: "We're looking into this issue. Could you please provide your laptop model and OS version?",
        timestamp: "2023-06-15T10:15:00",
      },
      {
        author: "John Smith",
        text: "It's a Dell XPS 13, running Windows 11 Pro.",
        timestamp: "2023-06-15T11:30:00",
      },
    ],
  },
}: SubmissionDetailsProps) => {
  const [newComment, setNewComment] = React.useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Complete":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-gray-100 text-gray-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleAddComment = () => {
    // This would typically call an API to add the comment
    console.log("Adding comment:", newComment);
    setNewComment("");
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              {submission.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {submission.type === "Support Ticket" ? (
                <MessageSquare className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              {submission.type}
            </Badge>
            <Badge className={`${getStatusColor(submission.status)}`}>
              {submission.status}
            </Badge>
            {submission.priority && (
              <Badge className={`${getPriorityColor(submission.priority)}`}>
                Priority: {submission.priority}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission details */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700">{submission.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">Submitted by:</span>
                <span>{submission.submittedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">Created:</span>
                <span>{formatDate(submission.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">Last updated:</span>
                <span>{formatDate(submission.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {submission.attachments && submission.attachments.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {submission.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="font-medium mb-2">Comments</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {submission.comments &&
                submission.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-gray-500">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))}
            </div>

            {/* Add comment */}
            <div className="mt-4">
              <Textarea
                placeholder="Add a comment..."
                className="min-h-[80px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {submission.status !== "Complete" && (
            <Button variant="destructive">Cancel Submission</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetails;
