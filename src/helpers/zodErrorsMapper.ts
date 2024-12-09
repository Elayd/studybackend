interface FormErrors {
  [key: string]: string[] | undefined;
}

interface MappedErrors {
  [key: string]: string;
}
export const zodErrorsMapper = (formErrors: FormErrors): MappedErrors => {
  const errorsObject: MappedErrors = {};

  for (const [key, value] of Object.entries(formErrors)) {
    if (Array.isArray(value) && value.length > 0) {
      errorsObject[key] = value[0];
    }
  }
  return errorsObject;
};
