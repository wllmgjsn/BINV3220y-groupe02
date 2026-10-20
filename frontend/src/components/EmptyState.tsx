interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => <p className="state state-empty">{message}</p>;

export default EmptyState;
