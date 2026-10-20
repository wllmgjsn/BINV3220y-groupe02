interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Chargement…" }: LoadingStateProps) => (
  <p className="state state-loading" role="status">
    {message}
  </p>
);

export default LoadingState;
