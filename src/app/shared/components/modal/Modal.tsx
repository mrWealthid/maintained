"use client";
import React, {
  cloneElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { createContext } from "react";
import { X } from "lucide-react";

import { ModalContextProps, ModalProps, WindowProps } from "./model/modal";
import { useOutsideClick } from "../../hooks/useOutSideClick";

// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ModalContext = createContext<ModalContextProps>({
  openName: "",
  data: null,
  close: () => {},
  open: (_name: string, _data?: unknown) => {},
});

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = useState("");
  const [data, setData] = useState<unknown>(null);

  const open = (name: string, payload?: unknown) => {
    setData(payload ?? null);
    setOpenName(name);
  };

  const close = () => {
    setOpenName("");
    setData(null);
  };

  const value = useMemo(
    () => ({ openName, data, open, close }),
    [openName, data]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

/**
 * Modal.Open
 * - New prop: `payload` (any) – passed to Modal.Window via context
 * - Preserves child's onClick and forwards ref
 */
const Open = React.forwardRef<
  HTMLButtonElement,
  {
    opens: string;
    payload?: unknown;
    children: React.ReactElement<any>;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, opens, payload, ...props }, ref) => {
  const { open } = useContext(ModalContext);

  return React.cloneElement(children, {
    ...props,
    ref,
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      open(opens, payload);
    },
  });
});
Open.displayName = "Open";

/**
 * Modal.Window
 * - Uses shadcn Card for the modal chrome (header, description, content)
 * - Children can be:
 *   a) a function → receives ({ onCloseModal, data })
 *   b) a React element → receives { onCloseModal, data } as props
 */
const Window = ({
  name,
  children,
  size = "w-full md:w-1/2 2xl:w-1/3",
  title,
  description,
  closeOnOutsideClick,
}: WindowProps) => {
  const { openName, close, data } = useContext(ModalContext);

  const modalRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(modalRef, close, closeOnOutsideClick);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (openName === name) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openName, name, close]);

  if (name !== openName) return null;

  return createPortal(
    <section aria-hidden={openName !== name}>
      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${
          openName === name
            ? "visible scale-100 opacity-100"
            : "invisible scale-50 opacity-0"
        } fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-all duration-150 ease-in-out`}
      >
        {/* Focus/size wrapper */}
        <div ref={modalRef} className={`${size} relative p-4 sm:p-6`}>
          {/* shadcn Card shell */}
          <Card className="relative rounded-2xl shadow-lg">
            {/* Header */}
            {(title || description) && (
              <CardHeader className="pr-12">
                {title && <CardTitle>{title}</CardTitle>}
                {description && (
                  <CardDescription className="text-xs sm:text-sm">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>
            )}

            {/* Close button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 h-8 w-8"
              onClick={close}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>

            <Separator />

            {/* Content */}
            <CardContent className="max-h-[80vh] overflow-y-auto">
              {React.isValidElement(children)
                ? cloneElement(children as any, {
                    onCloseModal: close,
                    data,
                  })
                : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>,
    document.body
  );
};

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
