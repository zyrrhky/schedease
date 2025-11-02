import { useState, useCallback } from "react";

export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});


  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const setValuesMultiple = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);


  const setError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);


  const setErrorsMultiple = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  /**
   * Resets form to initial values and clears errors
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    setValues: setValuesMultiple,
    setError,
    setErrors: setErrorsMultiple,
    reset,
  };
}
