import { ApiError } from "../lib/api";

// Shows an API error, plus the field-by-field list when the backend's validation sent one.
function FormErrors({ error }: { error: unknown }) {
  if (error === null || error === undefined) {
    return null;
  }
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const fieldErrors = error instanceof ApiError ? error.errors : [];

  return (
    <div className="form-error" role="alert">
      <p>{message}</p>
      {fieldErrors.length > 0 && (
        <ul>
          {fieldErrors.map((fieldError, index) => (
            <li key={index}>
              {fieldError.field && <strong>{fieldError.field}: </strong>}
              {fieldError.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FormErrors;
