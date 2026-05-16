export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}