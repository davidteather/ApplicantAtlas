import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { GetEmailTemplates } from "@/services/EmailTemplateService";
import { EventModel } from "@/types/models/Event";
import React, { useEffect, useState } from "react";
import CreateNewEmailTemplate from "./CreateNewEmailTemplate";
import ListEmailTemplates from "./ListEmailTemplates";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import SelectEmailTemplate from "./SelectEmailTemplate";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { resetEmailTemplateState } from "@/store/slices/emailTemplateSlice";

interface EmailTemplatesProps {
  eventDetails: EventModel | null;
}

const EmailTemplates: React.FC<EmailTemplatesProps> = ({ eventDetails }) => {
  const dispatch: AppDispatch = useDispatch();
  const selectedEmailTemplate = useSelector((state: RootState) => state.emailTemplate.emailTemplateState);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[] | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (eventDetails !== null) {
      GetEmailTemplates(eventDetails.ID)
        .then((f) => {
          setEmailTemplates(f.data.email_templates);
        })
        .catch(() => {});
    }
  }, [refresh])

  if (eventDetails === null || emailTemplates === undefined) {
    return (
      <>
      <p>Loading...</p>
        <LoadingSpinner />
      </>
    );
  }

  // List Forms
  const onNewEmailTemplateCreated = () => {
    setRefresh(true);
    setShowCreateForm(false);
  };

  const NewEmailTemplateButton = (
    <button
      className="btn btn-outline btn-primary mb-4"
      onClick={() => {
        setShowCreateForm(true);
      }}
    >
      Create New Template
    </button>
  );

  if (showCreateForm) {
    return (
      <>
        <CreateNewEmailTemplate
          eventDetails={eventDetails}
          onSubmit={onNewEmailTemplateCreated}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            setShowCreateForm(false);
          }}
        >
          Cancel
        </button>
      </>
    );
  }

  const onDeletedTemplate = () => {
    setRefresh(true);
    dispatch(resetEmailTemplateState());
  }

  if (selectedEmailTemplate !== null) {
    return (
      <>
        <SelectEmailTemplate
          onDelete={onDeletedTemplate}
          eventDetails={eventDetails}
        />
        <button
          className="btn btn-error mt-4"
          onClick={() => {
            dispatch(resetEmailTemplateState());
          }}
        >
          Go Back
        </button>
      </>
    );
  }

  if (emailTemplates.length === 0) {
    return (
      <>
        <p>This event has no email templates yet.</p>
        {NewEmailTemplateButton}
      </>
    );
  }

  return (
    <>
      {NewEmailTemplateButton}
      <ListEmailTemplates templates={emailTemplates}/>
    </>
  );
};

export default EmailTemplates;
