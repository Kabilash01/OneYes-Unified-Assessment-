import { toast as toastify } from 'react-toastify';

/**
 * Custom hook for toast notifications
 * @description Wrapper around react-toastify with consistent styling
 */
export const useToast = () => {
  const toast = {
    success: (message, options = {}) => {
      toastify.success(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    },

    error: (message, options = {}) => {
      toastify.error(message, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    },

    warning: (message, options = {}) => {
      toastify.warning(message, {
        position: 'top-right',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    },

    info: (message, options = {}) => {
      toastify.info(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    },

    promise: async (promise, messages) => {
      return toastify.promise(
        promise,
        {
          pending: messages.pending || 'Processing...',
          success: messages.success || 'Success!',
          error: messages.error || 'Something went wrong',
        },
        {
          position: 'top-right',
        }
      );
    },
  };

  return toast;
};
