import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

export const successToast = (message: string, toastId?: string) => {
  toast.success(message, {
    ...baseOptions,
    ...(toastId ? { toastId } : {}),
  });
};

export const errorToast = (message: string, toastId?: string) => {
  toast.error(message, {
    ...baseOptions,
    ...(toastId ? { toastId } : {}),
  });
};

export const infoToast = (message: string, toastId?: string) => {
  toast.info(message, {
    ...baseOptions,
    ...(toastId ? { toastId } : {}),
  });
};

export const warningToast = (message: string, toastId?: string) => {
  toast.warning(message, {
    ...baseOptions,
    ...(toastId ? { toastId } : {}),
  });
};

export const apiErrorToast = (error: any) => {
  const message = 
    error?.response?.data?.message || 
    error?.message || 
    'Something went wrong, try again';
  errorToast(message);
};
