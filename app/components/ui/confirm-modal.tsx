"use client";

import {
  Root,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Cancel,
  Action,
} from "@radix-ui/react-alert-dialog";
import { cn } from "@/app/lib/utils";
import { Button } from "./index";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2",
            "bg-bg-secondary border border-border-primary rounded-2xl p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <Title className="text-lg font-bold text-text-primary">
            {title}
          </Title>
          {description && (
            <Description className="mt-2 text-sm text-text-muted">
              {description}
            </Description>
          )}
          <div className="mt-6 flex gap-3 justify-end">
            <Cancel asChild>
              <Button variant="secondary" size="sm">
                {cancelLabel}
              </Button>
            </Cancel>
            <Action asChild>
              <Button
                variant={variant}
                size="sm"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Action>
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
