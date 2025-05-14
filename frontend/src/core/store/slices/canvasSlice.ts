import { createSlice } from "@reduxjs/toolkit";
import { CanvasElement } from "../../../types/canvasElement";

const initialState: { elements: Array<CanvasElement>, uploadSource: 'form' | 'gallery' } = {
  elements: [],
  uploadSource: 'form'
}

export const canvasSlice = createSlice({
  reducers: {
    addToCanvas(state, { payload }: { payload: CanvasElement }) {
      state.elements.push({ ...payload })
    },

    setUploadSource(state, { payload }) {
      state.uploadSource = payload
    },
    reorderElements(state, { payload }: { payload: CanvasElement[] }) {
      state.elements = payload;
    },

    resetCanvas(state) {
      state.elements = []
    },

    setCanvas(state, { payload }: { payload: CanvasElement[] }) {
      state.elements = payload
    }

  },
  name: "canvas",
  initialState,
})

export const { addToCanvas, setUploadSource, reorderElements, resetCanvas, setCanvas } = canvasSlice.actions