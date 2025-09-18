'use client';

import { useState } from "react";
import Button from "../Buttons/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";

interface InfoCardProps {
  title: string;
  subtitle: string;
  dialogContent?: React.ReactNode;
}

export default function InfoCard({
  title,
  subtitle,
  dialogContent,
}: InfoCardProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="rounded-2xl card_border p-6 max-w-[336px] w-full transition hover:shadow-[var(--migratio_box_shadow)] hover:border-[var(--migratio_primary)]">
      <div>
        <h3 className="text-[var(--black_color)] text-margin-zero" style={{
          fontSize: "var(--font-size-h4)",
          lineHeight: "var(--line-height-heading)",
        }}>
          {title}
        </h3>
        <p className="text-[var(--migratio_text)] opacity-60 mt-1 text-margin-zero" style={{
          fontSize: "var(--font-size-p-small)",
          lineHeight: "var(--line-height-p)",
        }}>
          {subtitle}
        </p>
      </div>

      <div className="mt-6 flex justify-start">
        <Button variant="primary" onClick={() => setShowDialog(true)}>
          READ MORE
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">{dialogContent}</div>

          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
