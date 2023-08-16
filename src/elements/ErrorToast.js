import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const errorToast = (message) => {
  toast.error(message, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export default errorToast;
