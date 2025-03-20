import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

interface StatusItem {
  status: "pending" | "in-progress" | "complete";
  count: number;
}

interface StatusTrackerProps {
  items?: StatusItem[];
}

const StatusTracker = ({
  items = [
    { status: "pending", count: 3 },
    { status: "in-progress", count: 2 },
    { status: "complete", count: 5 },
  ],
}: StatusTrackerProps) => {
  const totalItems = items.reduce((acc, item) => acc + item.count, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-500 bg-amber-50";
      case "in-progress":
        return "text-blue-500 bg-blue-50";
      case "complete":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "in-progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "complete":
        return "Complete";
      default:
        return status;
    }
  };

  const getProgressPercentage = (count: number) => {
    return totalItems > 0 ? (count / totalItems) * 100 : 0;
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Status Tracker
            </h2>
            <span className="text-sm text-gray-500">
              {totalItems} Total Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(item.status)}`}
                    >
                      {getStatusIcon(item.status)}
                    </div>
                    <span className="font-medium text-gray-700">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {item.count}
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(item.count)}
                  className={`h-2 ${item.status === "pending" ? "bg-amber-100" : item.status === "in-progress" ? "bg-blue-100" : "bg-green-100"}`}
                  indicatorClassName={
                    item.status === "pending"
                      ? "bg-amber-500"
                      : item.status === "in-progress"
                        ? "bg-blue-500"
                        : "bg-green-500"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTracker;
