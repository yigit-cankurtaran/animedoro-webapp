import toast from "react-hot-toast";

// export function showToast(message: string, type: "success" | "error") {
//   toast(message, {
//     position: "top-right",
//     duration: 3000,
//     style: {
//       background: type === "success" ? "#00FF00" : "#FF0000",
//     },
//   });
// }

const successToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    duration: 3000,
    style: {
      background: "#1f2937",
      color: "#f9fafb",
      border: "1px solid #1f2937",
      borderRadius: "4px",
    },
  });
};

const errorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    duration: 3000,
    style: {
      background: "#1f2937",
      color: "#f9fafb",
      border: "1px solid #1f2937",
      borderRadius: "4px",
    },
  });
};

export { successToast, errorToast };