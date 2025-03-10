/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExerciseResponse,
  ExercisesCreateRequest,
  ExercisesDeleteRequest,
  ExercisesGetRequest,
  ExercisesSearchRequest,
  ExercisesStarRequest,
  InitOverrideFunction,
  PaginatedResponseOfExerciseResponse,
} from "@/generated-client";

import { exercisesApi } from "@/services/client";

import { createContext, ReactNode, useContext } from "react";

export type ExerciseProviderValue = {
  starred: typeof exercisesApi.exercisesStarred;
  star: typeof exercisesApi.exercisesStar;
  search: typeof exercisesApi.exercisesSearch;
  get: typeof exercisesApi.exercisesGet;
  delete: typeof exercisesApi.exercisesDelete;
  create: typeof exercisesApi.exercisesCreate;
};

type Props = {
  value: ExerciseProviderValue;
  children: ReactNode;
};

const context = createContext<ExerciseProviderValue>({
  starred: function (
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<PaginatedResponseOfExerciseResponse> {
    throw new Error("Function not implemented.");
  },
  star: function (
    requestParameters: ExercisesStarRequest,
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  search: function (
    requestParameters: ExercisesSearchRequest,
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<PaginatedResponseOfExerciseResponse> {
    throw new Error("Function not implemented.");
  },
  get: function (
    requestParameters?: ExercisesGetRequest,
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<PaginatedResponseOfExerciseResponse> {
    throw new Error("Function not implemented.");
  },
  delete: function (
    requestParameters: ExercisesDeleteRequest,
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<ExerciseResponse> {
    throw new Error("Function not implemented.");
  },
  create: function (
    requestParameters: ExercisesCreateRequest,
    initOverrides?: RequestInit | InitOverrideFunction
  ): Promise<ExerciseResponse> {
    throw new Error("Function not implemented.");
  },
});

export function useExerciseProvider() {
  return useContext(context);
}

export function ExerciseProvider({ value, children }: Props) {
  return <context.Provider value={value} children={children} />;
}
