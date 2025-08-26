// "use client";
// import React, {
//   cloneElement,
//   useContext,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { createContext } from "react";
// import { ModalContextProps, ModalProps, WindowProps } from "./model/modal";
// import { useOutsideClick } from "../../hooks/useOutSideClick";

// const ModalContext = createContext<ModalContextProps>({
//   openName: "",
//   close: () => {},
//   open: (name: string, data: unknown) => {},
//   title: "",
// });

// function Modal({ children }: ModalProps) {
//   const [openName, setOpenName] = useState("");
//   const [data, setData] = useState<unknown>(null);

//   // const close = () => setOpenName('');
//   // const open = setOpenName;

//   const open = (name: string, payload?: unknown) => {
//     setData(payload ?? null);
//     setOpenName(name);
//   };
//   const close = () => {
//     setOpenName("");
//     setData(null);
//   };

//   const value = useMemo(
//     () => ({ openName, data, open, close }),
//     [openName, data]
//   );

//   return (
//     <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
//   );
// }

// const Open = React.forwardRef<HTMLButtonElement, any>(
//   ({ children, opens, ...props }, ref) => {
//     const { open }: any = useContext(ModalContext);

//     return React.cloneElement(children, {
//       ...props,
//       ref,
//       onClick: () => open(opens),
//     });
//   }
// );

// Open.displayName = "Open";

// const Window = ({
//   name,
//   children,
//   size = "w-full md:w-1/2 2xl:w-1/3",
//   title,
//   description,
//   closeOnOutsideClick,
// }: WindowProps) => {
//   const { openName, close, open }: ModalContextProps = useContext(ModalContext);

//   const modalRef = useRef<HTMLDivElement | null>(null);
//   useOutsideClick(modalRef, close, closeOnOutsideClick);

//   if (name !== openName) return null;
//   return createPortal(
//     <section className="">
//       <div
//         className={` ${
//           openName === name
//             ? "visible scale-100 opacity-100"
//             : "invisible scale-50  opacity-0"
//         } overflow-y-auto w-full backdrop overflow-x-hidden   fixed bg-gray-800  top-0  bg-opacity-70 left-0 z-50 md:inset-0 h-modal h-full justify-center items-center flex transition-all ease-in-out duration-1500`}
//         id="popup-modal"
//       >
//         <div ref={modalRef} className={`${size} relative  p-6 h-auto`}>
//           <div className="card flex flex-col gap-6 border rounded-2xl shadow p-6">
//             <div className="flex justify-between">
//               <section className="flex flex-col gap-1">
//                 <h3>{title}</h3>
//                 {description && <p className="text-xs ">{description}</p>}
//               </section>

//               <div>
//                 <button
//                   className=" z-50   rounded-lg text-sm p-1.5  "
//                   data-modal-toggle="popup-modal"
//                   type="button"
//                 >
//                   <svg
//                     onClick={close}
//                     aria-hidden="true"
//                     className=" w-3 h-3  sm:w-5 sm:h-5"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       clipRule="evenodd"
//                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                       fillRule="evenodd"
//                     ></path>
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//             </div>
//             <hr className="" />
//             <div className="overflow-y-hidden  max-h-[80vh]">
//               {React.isValidElement(children)
//                 ? cloneElement(children, {
//                     onCloseModal: close,
//                   })
//                 : null}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>,
//     document.body
//   );
// };

// Modal.Open = Open;
// Modal.Window = Window;

// export default Modal;
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
import { ModalContextProps, ModalProps, WindowProps } from "./model/modal";
import { useOutsideClick } from "../../hooks/useOutSideClick";

const ModalContext = createContext<ModalContextProps>({
  openName: "",
  data: null,
  close: () => {},
  // open accepts an optional payload
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
      // preserve any existing handlers
      children.props?.onClick?.(e);
      //   props?.onClick?.(e);
      open(opens, payload);
    },
  });
});
Open.displayName = "Open";

/**
 * Modal.Window
 * - Children can be:
 *   a) a React element → receives { onCloseModal, data } as props
 *   b) a render function → called with ({ onCloseModal, data })
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

  // ESC to close (optional accessibility)
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${
          openName === name
            ? "visible scale-100 opacity-100"
            : "invisible scale-50 opacity-0"
        } overflow-y-auto w-full overflow-x-hidden fixed bg-gray-800 bg-opacity-70 top-0 left-0 z-50 md:inset-0 h-modal h-full justify-center items-center flex transition-all ease-in-out duration-150`}
        id="popup-modal"
      >
        <div ref={modalRef} className={`${size} relative p-6 h-auto`}>
          <div className="card flex flex-col gap-6 border rounded-2xl shadow p-6 bg-background">
            <div className="flex justify-between">
              <section className="flex flex-col gap-1">
                {title && <h3>{title}</h3>}
                {description && <p className="text-xs">{description}</p>}
              </section>

              <div>
                <button
                  className="z-50 rounded-lg text-sm p-1.5"
                  type="button"
                  onClick={close}
                >
                  <svg
                    aria-hidden="true"
                    className="w-3 h-3 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
            </div>

            <hr />

            {/* <div className="overflow-y-auto max-h-[80vh]">
              {typeof children === "function"
                ? (
                    children as (args: {
                      onCloseModal: () => void;
                      data?: unknown;
                    }) => React.ReactNode
                  )({ onCloseModal: close, data })
                : React.isValidElement(children)
                  ? cloneElement(children, { onCloseModal: close })
                  : null}
            </div> */}

            <div className="overflow-y-hidden max-h-[80vh]">
              {React.isValidElement(children)
                ? cloneElement(children as any, {
                    onCloseModal: close,
                    data, // <<< inject payload here
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </section>,
    document.body
  );
};

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
