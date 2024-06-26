import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useToast, ToastType } from '@/components/Toast/ToastContext';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import FormBuilder from '@/components/Form/FormBuilder';
import { EmailSecret, EventSecrets } from '@/types/models/EventSecret';
import {
  createOrUpdateEventSecret,
  getEventSecrets,
} from '@/services/EventService';
import { FormField, FormStructure } from '@/types/models/Form';
import { IsObjectIDNotNull } from '@/utils/conversions';
import { RootState } from '@/store';

interface EventSecretsSettings {
  onDone: () => void;
}

// Note: when we add multiple types of secrets we should refactor to be more like a switch statement
const EventSecretsSettings: React.FC<EventSecretsSettings> = ({ onDone }) => {
  const eventDetails = useSelector(
    (state: RootState) => state.event.eventDetails,
  );

  const [eventSecrets, setEventSecrets] = useState<EventSecrets | undefined>();
  const { showToast } = useToast();

  useEffect(() => {
    if (!eventDetails) {
      return;
    }
    getEventSecrets(eventDetails.ID)
      .then((res) => {
        if (!IsObjectIDNotNull(res.data.eventSecrets.eventID)) {
          // This means that the event secrets do not exist yet
          setEventSecrets({
            eventID: eventDetails.ID,
            email: {},
          });
          return;
        }
        setEventSecrets(res.data.eventSecrets);
      })
      .catch(() => showToast('Failed to load event secrets', ToastType.Error));
  }, [eventDetails, showToast]);

  if (eventDetails == null) {
    return <p>Event details not found in state</p>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleSecretsSubmission = (formData: Record<string, any>) => {
    const eventSecretsData: EventSecrets = {
      eventID: eventDetails.ID,
      email: {
        smtpServer: formData.smtpServer,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        updatedAt: new Date().toISOString(),
      },
    };

    createOrUpdateEventSecret(eventDetails.ID, eventSecretsData)
      .then(() => {
        showToast('Event secrets updated successfully', ToastType.Success);
        onDone();
      })
      .catch(() =>
        showToast('Failed to update event secrets', ToastType.Error),
      );
  };

  const createFormStructure = (emailSecret?: EmailSecret): FormStructure => {
    const fields: FormField[] = [
      {
        key: 'smtpServer',
        question: 'SMTP Server',
        type: 'text',
        required: true,
        defaultValue: emailSecret?.smtpServer,
      },
      {
        key: 'port',
        question: 'Port',
        type: 'number',
        required: true,
        defaultValue: emailSecret?.port,
      },
      {
        key: 'username',
        question: 'Username',
        type: 'text',
        required: true,
        defaultValue: emailSecret?.username,
      },
      {
        key: 'password',
        question: 'Password',
        type: 'text',
        required: !emailSecret?.updatedAt,
        additionalOptions: {
          isPassword: true,
        },
      },
    ];

    return { attrs: fields };
  };

  if (!eventSecrets) {
    return <LoadingOverlay />;
  }

  const formStructure = createFormStructure(eventSecrets.email);

  return (
    <>
      <FormBuilder
        formStructure={formStructure}
        submissionFunction={handleSecretsSubmission}
        buttonText="Update SMTP Settings"
      />
    </>
  );
};

export default EventSecretsSettings;
