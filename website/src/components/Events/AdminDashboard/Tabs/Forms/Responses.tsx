import { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';

import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import {
  DownloadResponses,
  GetResponses,
  UpdateResponse,
} from '@/services/ResponsesService';
import { FieldValue, FormField } from '@/types/models/Form';
import ArrowDownTray from '@/components/Icons/ArrowDownTray';
import { RenderFormField } from '@/components/Form/FormBuilder';
import EditIcon from '@/components/Icons/EditIcon';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import Checkbox from '@/components/Form/inputs/Checkbox';
import { RootState } from '@/store';
import { FormResponse } from '@/types/models/Response';
import { getSelectorOptions } from '@/services/FormService';

interface ResponsesProps {}

const Responses = ({}: ResponsesProps) => {
  const form = useSelector((state: RootState) => state.form.formDetails);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form response
  const [responses, setResponses] = useState<Record<string, any>[]>([]);
  const [columnOrder, setColumnOrder] = useState<
    Record<string, FormField | undefined>[]
  >([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeletedColumns, setShowDeletedColumns] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const [fetchedOptions, setFetchedOptions] = useState<Record<string, any>>({});
  const { showToast } = useToast();

  const fetchSelector = (key: string) => {
    if (!fetchedOptions[key]) {
      getSelectorOptions(key)
        .then((options) => {
          setFetchedOptions((prevOptions) => ({
            ...prevOptions,
            [key]: options,
          }));
        })
        .catch((error) => console.error(error));
    }
  };

  const debouncersRef = useRef(new Map());
  const defaultFormColumns = [
    'Response ID',
    'Submitted At',
    'User ID',
    'Last Updated At',
  ];

  const getDebouncedOnSubmissionFieldChange = (key: string) => {
    if (!debouncersRef.current.has(key)) {
      debouncersRef.current.set(
        key,
        debounce((value, errorStr) => {
          const keyMap = JSON.parse(key);
          const submissionId = keyMap.submission_id;
          const question = keyMap.question;
          const attrKey = keyMap.attr_key;
          const fullKey = `${question}_attr_key:${attrKey}`;

          if (errorStr !== undefined) {
            showToast(
              `Error updating response: ${errorStr}
        Response ID: ${submissionId}`,
              ToastType.Error,
            );
            return;
          }

          // Go through responses to find the correct response and update it
          responses.map((response) => {
            if (response['Response ID'] === submissionId) {
              const oldValue = response[fullKey];
              const newValue = value;
              response[fullKey] = value;

              // Deep copy response to avoid mutating original form structure
              const newResponse = JSON.parse(JSON.stringify(response));

              // Drop the defaultFormColumns from the new response
              defaultFormColumns.forEach((column) => {
                delete newResponse[column];
              });

              // For each key remove the _attr_key: and replace with the actual key which follows it
              let shouldUpdate = false;
              Object.keys(newResponse).forEach((key) => {
                const id_val = key.split('_attr_key:')[1];

                if (oldValue !== newValue) {
                  shouldUpdate = true;
                }

                newResponse[id_val] = newResponse[key];
                delete newResponse[key];
              });

              if (shouldUpdate) {
                console.log('Updating response', response);
                const newResponseObj: FormResponse = {
                  id: submissionId,
                  formID: form?.id || '',
                  data: newResponse,
                  lastUpdatedAt: response['Last Updated At'],
                  createdAt: response['Submitted At'],
                };
                UpdateResponse(newResponseObj)
                  .then((r) => {
                    response['Last Updated At'] = r.data.lastUpdatedAt;
                    showToast(
                      'Successfully updated reponse',
                      ToastType.Success,
                    );
                  })
                  .catch(() => {});
              }
            }

            return response;
          });
        }, 500),
      );
    }
    return debouncersRef.current.get(key);
  };

  const onSubmissionFieldChange = (
    key: string,
    value: FieldValue,
    errorStr: string | undefined,
  ) => {
    const debouncedOnChange = getDebouncedOnSubmissionFieldChange(key);
    debouncedOnChange(value, errorStr);
  };

  useEffect(() => {
    const debouncers = debouncersRef.current;

    return () => {
      debouncers.forEach((debouncer) => debouncer.cancel());
    };
  }, []);

  useEffect(() => {
    GetResponses(form?.id || '', showDeletedColumns, pageNumber, pageSize)
      .then((r) => {
        const cleanedResponses = r.data.responses.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form response
          (response: Record<string, any>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form response
            const cleanedResponse: Record<string, any> = {};

            Object.entries(response).forEach(([key, value]) => {
              cleanedResponse[key] = value;
            });

            return cleanedResponse;
          },
        );

        setResponses(cleanedResponses);

        // Iterate over column order and match against form fields
        let columnOrder: Record<string, FormField | undefined>[] = [];
        if (r.data.columnOrder) {
          columnOrder = r.data.columnOrder.map((key: string) => {
            const id_val = key.split('_attr_key:')[1];
            const field = form?.attrs.find((f) => {
              return f.key === id_val;
            });

            return { [key]: field };
          });

          setColumnOrder(columnOrder);
        }
        setIsLoading(false);

        // If page and pageSize are different from the response, update them
        if (pageNumber !== r.data.page) {
          setPageNumber(r.data.page);
        }

        if (pageSize !== r.data.pageSize) {
          setPageSize(r.data.pageSize);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [form?.id, showDeletedColumns, form?.attrs, pageNumber, pageSize]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (responses.length === 0) {
    return <p>No responses yet.</p>;
  }

  const handleExportCSV = () => {
    DownloadResponses(form?.id || '', showDeletedColumns)
      .then((r) => {
        const blob = new Blob([r.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const currentISO = new Date().toISOString();
        link.download = `${form?.name}-${currentISO}-${form?.id}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((_) => {});
  };

  return (
    <div>
      <div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary mr-2 mb-2 h-min py-2 w-full sm:w-auto"
        >
          <EditIcon className="w-6 h-6" />
          {isEditing ? 'Stop Editing' : 'Edit Fields'}
        </button>

        <button
          onClick={handleExportCSV}
          className="btn btn-primary h-min py-2 w-full sm:w-auto"
        >
          <ArrowDownTray className="w-6 h-6" />{' '}
          <span className="min-w-0">Export as CSV</span>
        </button>
      </div>
      <Checkbox
        field={{
          key: 'showDeletedColumns',
          question: 'Show Deleted Columns',
          description:
            'Show responses to deleted columns, this happens if you modify the form structure after some responses have been submitted.',
          type: 'checkbox',
          required: false,
        }}
        inline={true}
        onChange={(k, v) => {
          setShowDeletedColumns(v as boolean);
        }}
        defaultValue={false}
      />
      <div className="overflow-x-auto">
        <table className="table table-sm table-pin-rows bg-white">
          <thead>
            <tr>
              {columnOrder.map((header) => (
                <th key={Object.keys(header)[0]}>
                  {Object.keys(header)[0].split('_attr_key:')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => {
              if (index === 0) return null;

              return (
                <tr key={response['Response ID'] || index} className="hover">
                  {columnOrder.map((columnHeaderAttrMap) => {
                    const header = Object.keys(columnHeaderAttrMap)[0];
                    const value = response[header];
                    let displayValue;

                    if (value !== null && typeof value === 'object') {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = value;
                    }

                    const field = columnHeaderAttrMap[header];
                    if (!isEditing || !field) {
                      return <td key={`${header}-${index}`}>{displayValue}</td>;
                    }

                    // Deep copy field to avoid mutating original form structure
                    const newField: FormField = JSON.parse(
                      JSON.stringify(field),
                    );
                    newField.defaultValue = value;
                    newField.defaultOptions = [value];

                    newField.key = JSON.stringify({
                      submission_id: response['Response ID'],
                      attr_key: field.key,
                      question: field.question,
                    });

                    if (newField.additionalOptions?.useDefaultValuesFrom) {
                      fetchSelector(
                        newField.additionalOptions.useDefaultValuesFrom,
                      );
                    }

                    return (
                      <td key={`${header}-${index}`}>
                        {RenderFormField(
                          newField,
                          fetchedOptions,
                          onSubmissionFieldChange,
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="join flex justify-center mt-4 ">
        <button
          className="btn join-item bg-white"
          onClick={() => {
            setPageNumber(pageNumber > 1 ? pageNumber - 1 : pageNumber);
          }}
        >
          «
        </button>
        <button className="btn join-item bg-white">Page {pageNumber}</button>
        <button
          className="btn join-item bg-white"
          onClick={() => {
            setPageNumber(pageNumber + 1);
          }}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Responses;
