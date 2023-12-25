interface ModalProps {
  children: React.ReactNode;
}
const Modal = ({ children }: ModalProps) => (
  <div className="fixed top-0 left-0 z-10 flex items-center justify-center w-full h-full">
    <div className="fixed w-full h-full bg-black opacity-60" />
    <div className="container mx-auto w-auto rounded-[1.25rem] bg-white md:py-6 md:px-8 px-3 relative">
      {children}
    </div>
  </div>
);
export default Modal;
