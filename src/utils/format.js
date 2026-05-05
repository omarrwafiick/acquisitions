export const formatValidationError = (error) => {
  return error?.issues?.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  })) ?? null;
};
export const formatError = (error) => {
  return {
    message: error.message,
    name: error.name || 'ServerError',
    details: error.details ?? null,
  };
};