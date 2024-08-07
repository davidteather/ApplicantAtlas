import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { ToastType, useToast } from '@/components/Toast/ToastContext';
import { UpdatePipeline } from '@/services/PipelineService';
import { AppDispatch, RootState } from '@/store';
import { setPipelineConfiguration } from '@/store/slices/pipelineSlice';

import PipelineSettings from './PipelineSettings';
import PipelineBuilder from './PipelineBuilder';
import PipelineRuns from './PipelineRuns';

interface SelectPipelineProps {
  onDelete: () => void;
}

const SelectPipeline: React.FC<SelectPipelineProps> = ({ onDelete }) => {
  const dispatch: AppDispatch = useDispatch();
  const pipelineConfig = useSelector(
    (state: RootState) => state.pipeline.pipelineState,
  );

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date ? moment(date).format('MMMM Do, YYYY') : '';
  };

  const [pageSelected, setPageSelected] = useState<
    'view' | 'edit' | 'settings' | 'runs'
  >('view');

  const { showToast } = useToast();

  const updatePipeline = () => {
    if (pipelineConfig === null) {
      showToast('Pipeline not found in state', ToastType.Error);
      return;
    }

    UpdatePipeline(pipelineConfig)
      .then((r) => {
        const newPipelineConfig = { ...pipelineConfig };
        newPipelineConfig.lastUpdatedAt = r.data.lastUpdatedAt;
        dispatch(setPipelineConfiguration(newPipelineConfig));
        showToast('Successfully updated pipeline!', ToastType.Success);
      })
      .catch((_) => {});
  };

  const isActive = (page: string) =>
    page === pageSelected ? 'btn-active' : '';

  if (pipelineConfig === null) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded">
        <button
          className={`btn ${isActive('view')}`}
          onClick={() => setPageSelected('view')}
        >
          View
        </button>
        <button
          className={`btn ${isActive('edit')}`}
          onClick={() => setPageSelected('edit')}
        >
          Edit
        </button>
        <button
          className={`btn ${isActive('settings')}`}
          onClick={() => setPageSelected('settings')}
        >
          Settings
        </button>
        <button
          className={`btn ${isActive('runs')}`}
          onClick={() => setPageSelected('runs')}
        >
          Runs
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">
        {pipelineConfig?.name}
      </h2>

      {pageSelected === 'edit' && <PipelineBuilder onSubmit={updatePipeline} />}

      {pageSelected === 'view' && (
        <>
          {!pipelineConfig.enabled && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Pipeline is disabled</strong>
              <span className="block sm:inline">
                {' '}
                - Enable the pipeline in settings to resume pipeline runs.
              </span>
            </div>
          )}

          <div>
            <strong>Last Updated:</strong>{' '}
            {pipelineConfig.lastUpdatedAt
              ? formatDate(new Date(pipelineConfig.lastUpdatedAt))
              : ''}
          </div>
        </>
      )}

      {pageSelected === 'settings' && <PipelineSettings onDelete={onDelete} />}

      {pageSelected === 'runs' && <PipelineRuns />}

      {pageSelected !== 'edit' &&
        pageSelected !== 'runs' &&
        pageSelected !== 'view' &&
        pageSelected !== 'settings' && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectPipeline;
