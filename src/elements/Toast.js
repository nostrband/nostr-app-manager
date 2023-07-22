import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({ text, type }) => {
  let toastId = null;

  const showToast = () => {
    switch (type) {
      case 'success':
        toastId = toast.success(text, { autoClose: 3000 });
        break;
      case 'error':
        toastId = toast.error(text, { autoClose: 3000 });
        break;
      case 'pending':
        toastId = toast(text, { autoClose: false });
        break;
      default:
        toastId = toast(text, { autoClose: 3000 });
    }
  };

  const updateToast = () => {
    if (toastId !== null) {
      switch (type) {
        case 'success':
          toast.update(toastId, {
            type: 'success',
            render: text,
            autoClose: 3000,
          });
          break;
        case 'error':
          toast.update(toastId, {
            type: 'error',
            render: text,
            autoClose: 3000,
          });
          break;
        case 'pending':
          toast.update(toastId, { render: text, autoClose: false });
          break;
        default:
          toast.update(toastId, { render: text, autoClose: 3000 });
      }
    } else {
      showToast();
    }
  };

  return (
    <>
      {updateToast()}
      <ToastContainer />
    </>
  );
};

export default Toast;
