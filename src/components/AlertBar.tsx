import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AlertBarProps {
  message: string;
  type: 'warning' | 'info' | 'success';
  onDismiss?: () => void;
}

export function AlertBar({ message, type, onDismiss }: AlertBarProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return "border-warning/30 bg-warning/10 text-warning";
      case 'info':
        return "border-info/30 bg-info/10 text-info";
      case 'success':
        return "border-success/30 bg-success/10 text-success";
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 border ${getColors()}`}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm flex-1">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}