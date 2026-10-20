import type { ChangeEvent } from "react";

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchField = ({ label, value, onChange }: SearchFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="search-field">
      <span>{label}</span>
      <input type="search" value={value} onChange={handleChange} />
    </label>
  );
};

export default SearchField;
