interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => (
  <p className="state state-error" role="alert">
    {message}
  </p>
);

export default ErrorState;
