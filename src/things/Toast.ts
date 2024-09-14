import toast from "react-hot-toast";

const successToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    duration: 3000,
    // we need duration or else it won't show
    icon: "🎉",
  });
};

const errorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    duration: 3000,
    icon: "💥",
  });
};

export { successToast, errorToast };