import React, { useEffect, useState } from "react";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type TextInputProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue, errorString?: string) => void;
  defaultValue?: string;
};

const Text: React.FC<TextInputProps> = ({ field, onChange, defaultValue }) => {
  const [value, setValue] = useState<string>(defaultValue || "");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (defaultValue) {
      onChange(field.key, defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  
    // Reset custom validity
    e.target.setCustomValidity("");
  
    // Basic email pattern validation
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (field.additionalValidation?.isEmail?.isEmail && !emailPattern.test(inputValue)) {
      setError("Invalid email address");
      e.target.setCustomValidity("Invalid email address");
    } else if (field.additionalValidation?.isEmail) {
      const { requireDomain, allowSubdomains, allowTLDs } = field.additionalValidation.isEmail;
      let domainValid = true;
      let tldValid = true;
  
      if (requireDomain && requireDomain.length > 0) {
        const domainRegex = allowSubdomains
          ? new RegExp(`@([a-zA-Z0-9.-]+\\.)?(${requireDomain.join('|')})$`, 'i')
          : new RegExp(`@(${requireDomain.join('|')})$`, 'i');
        domainValid = domainRegex.test(inputValue);
      }
  
      if (allowTLDs && allowTLDs.length > 0) {
        const tldRegex = new RegExp(`\\.(${allowTLDs.join('|')})$`, 'i');
        tldValid = tldRegex.test(inputValue);
      }
  
      if (!domainValid) {
        const domainInvalidMsg = "Disallowed domain, allowed domains" + (allowSubdomains ? " and subdomains" : "") + ": " + (requireDomain !== undefined ? requireDomain.join(", "): "")
        setError(domainInvalidMsg);
        e.target.setCustomValidity(domainInvalidMsg);
      } else if (!tldValid) {
        const tldInvalidMsg = "Disallowed top-level domain, allowed top-level domains: " + (allowTLDs !== undefined ? allowTLDs.join(", "): "")
        setError(tldInvalidMsg);
        e.target.setCustomValidity(tldInvalidMsg);
      } else {
        setError(undefined);
      }
    } else {
      setError(undefined);
    }
  
    onChange(field.key, inputValue, error);
  };
  

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <input
        id={field.key}
        type={field.additionalOptions?.isPassword ? "password" : "text"}
        value={value}
        placeholder={field.description || ""}
        className={`input input-bordered ${error ? "input-error" : ""}`}
        onChange={handleInputChange}
        required={field.required}
      />
      {error && <p className="text-red-500 pl-2">{error}</p>}
    </div>
  );
};

export default Text;
