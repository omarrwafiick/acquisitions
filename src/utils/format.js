export const formatValidationError = error => {
  return (
    error?.issues?.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    })) ?? null
  );
};
export const formatError = err => ({
  name: err.name || 'ServerError',
  message: err.message || 'Unknown error',
  details: err.details ?? null,
});
