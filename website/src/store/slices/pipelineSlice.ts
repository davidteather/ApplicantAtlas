import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  PipelineAction,
  PipelineConfiguration,
  PipelineEvent,
} from '@/types/models/Pipeline';

interface PipelineState {
  pipelineState: PipelineConfiguration | null;
}

const initialState: PipelineState = {
  pipelineState: null,
};

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {
    setPipelineConfiguration(
      state,
      action: PayloadAction<PipelineConfiguration>,
    ) {
      state.pipelineState = action.payload;
    },
    updatePipelineConfiguration(
      state,
      action: PayloadAction<Partial<PipelineConfiguration>>,
    ) {
      const keys = Object.keys(action.payload) as Array<
        keyof PipelineConfiguration
      >;

      keys.forEach((key) => {
        const value = action.payload[key];
        if (value !== undefined) {
          if (state.pipelineState) {
            (state.pipelineState[key] as typeof value) = value;
          }
        }
      });
    },
    addOrUpdateAction(state, action: PayloadAction<PipelineAction>) {
      if (state.pipelineState) {
        const existingIndex = state.pipelineState.actions?.findIndex(
          (a) => a.id === action.payload.id,
        );

        if (
          existingIndex !== undefined &&
          existingIndex >= 0 &&
          state.pipelineState.actions
        ) {
          state.pipelineState.actions[existingIndex] = action.payload;
        } else {
          state.pipelineState.actions = [
            ...(state.pipelineState.actions || []),
            action.payload,
          ];
        }
      }
    },
    removeAction(state, action: PayloadAction<{ id: string }>) {
      if (state.pipelineState) {
        state.pipelineState.actions = state.pipelineState.actions?.filter(
          (a) => a.id !== action.payload.id,
        );
      }
    },
    setEvent(state, action: PayloadAction<PipelineEvent>) {
      if (state.pipelineState) {
        state.pipelineState.event = action.payload;
      }
    },
    resetPipelineState(state) {
      state.pipelineState = null;
    },
  },
});

export const {
  setPipelineConfiguration,
  updatePipelineConfiguration,
  addOrUpdateAction,
  removeAction,
  setEvent,
  resetPipelineState,
} = pipelineSlice.actions;
export default pipelineSlice.reducer;
