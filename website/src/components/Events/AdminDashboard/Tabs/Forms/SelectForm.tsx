import FormCreator from "@/components/Form/Creator/FormCreator";
import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { updateForm } from "@/services/FormService";
import { EventModel } from "@/types/models/Event";
import { FormStructure } from "@/types/models/Form";
import { useState } from "react";

interface SelectFormProps {
  form: FormStructure;
  action: "responses" | "edit";
}

const SelectForm: React.FC<SelectFormProps> = ({ form, action }) => {
  const [pageSelected, setPageSelected] = useState<
    "edit" | "responses" | "preview"
  >(action);
  const [formStructure, setFormStructure] = useState<FormStructure>(form);

  // Edit
  const onFormStructureChange = (newFormStructure: FormStructure) => {
    updateForm(newFormStructure.id || "", newFormStructure)
      .then(() => {
        eventEmitter.emit("success", "Successfully updated form!");
        setFormStructure(newFormStructure);
      })
      .catch((err) => {});
  };

  const isActive = (page: string) => (page === pageSelected ? "btn-active" : "");
  return (
    <>
      <div className="flex space-x-2 bg-gray-100 p-2 rounded">
        <button
          className={`btn ${isActive("edit")}`}
          onClick={() => setPageSelected("edit")}
        >
          Edit
        </button>
        <button
          className={`btn ${isActive("responses")}`}
          onClick={() => setPageSelected("responses")}
        >
          Responses
        </button>
        <button
          className={`btn ${isActive("preview")}`}
          onClick={() => setPageSelected("preview")}
        >
          Preview
        </button>
      </div>

      {pageSelected === "edit" && (
        <FormCreator
          submissionFunction={onFormStructureChange}
          defaultFormStructure={formStructure}
          submissionButtonText="Save Form"
        />
      )}

      {pageSelected === "responses" && <p>Responses</p>}

      {pageSelected === "preview" && (
        <FormBuilder
          formStructure={formStructure}
          submissionFunction={(formData) => {console.log(formData)}}
          buttonText="Submit"
        />
      )}

      {pageSelected !== "edit" &&
        pageSelected !== "responses" &&
        pageSelected !== "preview" && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectForm;
