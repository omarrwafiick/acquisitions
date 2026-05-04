export default function formatValidationError(errors){
  if (!errors || !errors.issues) return null;
  else if (Array.isArray(errors.issues))
    return errors.issues.map(i => i.message).join(', ');
  else return JSON.stringify(errors);
};
