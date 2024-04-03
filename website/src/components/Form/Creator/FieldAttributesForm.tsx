import React, { useEffect, useState } from "react";
import FormBuilder from "@/components/Form/FormBuilder";
import { FormStructure, FormField, FormFieldType } from "@/types/models/Form";

interface FieldAttributesFormProps {
  fieldType: FormFieldType;
  onAddField: (field: FormField) => void;
  initialAttributes?: FormField;
}

const FieldAttributesForm: React.FC<FieldAttributesFormProps> = ({
  fieldType,
  onAddField,
  initialAttributes,
}) => {
  const [formFields, setFormFields] = useState<FormStructure>();

  useEffect(() => {
    const formStructure = createFormStructure(fieldType, initialAttributes);
    setFormFields(formStructure);
  }, [fieldType, initialAttributes]);

  const handleFormSubmission = (formData: Record<string, any>) => {
    const newField: FormField = {
      question: formData.question,
      type: fieldType as FormFieldType,
      key: "", // filled out with uuid in FormCreator
      defaultValue: formData.defaultValue,
      options: formData.options,
      required: formData.required === true,
      isInternal: formData.isInternal === true,
    };

    // Call the onAddField function passed from FormCreator
    onAddField(newField);
  };

  const createFormStructure = (
    fieldType: FormFieldType,
    initialAttributes?: FormField
  ): FormStructure => {
    var attrs: FormField[] = [
      {
        key: "question",
        question: "Field Label/Question",
        type: "text",
        required: true,
        defaultValue: initialAttributes?.question,
      },
    ];

    switch (fieldType) {
        case "select":
        case "multiselect":
        case "customselect":
        case "custommultiselect":
            attrs.push({
                key: "options",
                question: "Options",
                type: "custommultiselect",
                required: true,
                options: initialAttributes?.options,
                defaultOptions: initialAttributes?.options,
            });
            break;
        default:
            break;
    }
    

    attrs.push({
      key: "defaultValue",
      question: "Default Value",
      type: fieldType === "number" ? "number" : "text",
      required: false,
      defaultValue: initialAttributes?.defaultValue,
    });
    attrs.push({
      key: "required",
      question: "Is this field required?",
      type: "checkbox",
      required: false,
      defaultValue: initialAttributes?.required,
    });

    attrs.push({
      key: "isInternal",
      question: "Is this an internal field?",
      description: "Internal fields are not shown to the user, and only appear in the form submission data.",
      type: "checkbox",
      required: false,
      defaultValue: initialAttributes?.isInternal,
    });

    console.log(attrs)

    return { attrs: attrs };
  };

  if (!formFields) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    <FormBuilder
      formStructure={formFields}
      submissionFunction={handleFormSubmission}
    />
    </div>
  );
};

export default FieldAttributesForm;
