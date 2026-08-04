import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";

interface ConfirmDeleteProps {
  title: string;
  onConfirm: () => Promise<void>;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  message?: string;
  description?: string;
}

export default function ConfirmDelete({
  onConfirm,
  title,
  className,
  isOpen,
  onClose,
  message,
  description,
}: ConfirmDeleteProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (onClose) onClose();
      if (!isControlled) setInternalOpen(false);
    } else {
      if (!isControlled) setInternalOpen(true);
    }
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
    handleOpenChange(false);
  };

  const displayDescription =
    message ||
    description ||
    `Are you sure you want to delete this ${title}? This action cannot be undone.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="destructive" className={className}>
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {title}?</DialogTitle>
          <DialogDescription>{displayDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
