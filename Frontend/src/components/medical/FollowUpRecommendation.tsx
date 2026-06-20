import React, { useMemo } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Calendar, Clock, Bell, Activity } from "lucide-react";

interface FollowUpRecommendationProps {
  riskLevel: "low" | "medium" | "high";
  onSetReminder?: () => void;
  onSchedule?: () => void;
}

export function FollowUpRecommendation({
  riskLevel,
  onSetReminder,
  onSchedule,
}: FollowUpRecommendationProps) {

  // حساب عدد الأيام الموصى بها بناءً على مستوى الخطر
  const recommendedDays = useMemo(() => {
    switch (riskLevel) {
      case "high":
        return 7;   // متابعة عاجلة بعد أسبوع
      case "medium":
        return 30;  // متابعة بعد شهر
      case "low":
      default:
        return 90;  // متابعة روتينية بعد 3 أشهر
    }
  }, [riskLevel]);

  // حساب التاريخ المقترح بناءً على اليوم الحالي + recommendedDays
  const suggestedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + recommendedDays);
    return date.toLocaleDateString(); // يمكن استخدام toLocaleString أو تنسيق آخر إذا أردت
  }, [recommendedDays]);

  const getRiskColor = () => {
    switch (riskLevel) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-orange-200 bg-orange-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getRiskMessage = () => {
    switch (riskLevel) {
      case "high":
        return "Your scan shows patterns that require urgent medical follow-up.";
      case "medium":
        return "Some irregularities were detected. Monitoring your condition is recommended.";
      case "low":
        return "No significant risk detected, but routine monitoring is still advised.";
      default:
        return "";
    }
  };

  return (
    <Card className={`p-6 border-2 ${getRiskColor()}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* LEFT SIDE */}
        <div className="flex-1">

          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Follow-up Recommendation
            </h3>
          </div>

          {/* Risk message */}
          <p className="text-gray-700 mb-2">
            {getRiskMessage()}
          </p>

          {/* Days */}
          <p className="text-gray-700">
            Recommended follow-up scan in
            <span className="font-bold ml-1">
              {recommendedDays} days
            </span>
          </p>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Clock className="w-4 h-4" />
            <span>
              Suggested date:
              <span className="font-medium text-gray-900 ml-1">
                {suggestedDate}
              </span>
            </span>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

          <Button
            variant="outline"
            onClick={onSetReminder}
            className="flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Set Reminder
          </Button>

          <Button
            variant="primary"
            onClick={onSchedule}
            className="flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Follow-up
          </Button>

        </div>

      </div>
    </Card>
  );
}
