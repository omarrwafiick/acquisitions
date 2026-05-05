export const formatValidationError = (errors) => {
  if (!errors || !errors.issues) 
    return null;
  else if (Array.isArray(errors.issues))
    return errors.issues.map(i => i.message).join(', ');
  else 
    return JSON.stringify(errors);
};

export const errorFormater = (error) => {
  return {
    message: error.message,
    name: error.name||'ServerError'
  }
}