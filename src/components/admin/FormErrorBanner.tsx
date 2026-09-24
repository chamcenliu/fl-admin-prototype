import "./FormErrorBanner.css";
export function FormErrorBanner({ message }: { message: string }) { return message ? <div className="fl-admin-form-error" role="alert">{message}</div> : null; }
