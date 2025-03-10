import {
  AccountApi,
  AuthApi,
  CompletedWorkoutsApi,
  Configuration,
  DashboardApi,
  ExercisesApi,
  PlannedWorkoutsApi,
  SetupIntentApi,
  SignupApi,
  TraineeInvitationsApi,
  TraineesApi,
  UsersApi,
} from "@/generated-client";

import axios from "axios";
import { createStore } from "zustand";

export const ApiClient = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const accessTokenStore = createStore<string | null>(() => null);
export const configuration = new Configuration({
  basePath: process.env.API_URL,
  middleware: [
    {
      async pre(context) {
        context.init.headers = getHeaders(accessTokenStore.getState());
      },
    },
  ],
});

export const usersApi = new UsersApi(configuration);
export const traineesApi = new TraineesApi(configuration);
export const traineeInvitationsApi = new TraineeInvitationsApi(configuration);
export const plannedWorkoutsApi = new PlannedWorkoutsApi(configuration);
export const completedWorkoutApi = new CompletedWorkoutsApi(configuration);
export const authApi = new AuthApi(configuration);
export const signupApi = new SignupApi(configuration);
export const dashboardApi = new DashboardApi(configuration);
export const accountApi = new AccountApi(configuration);
export const setupIntentApi = new SetupIntentApi(configuration);
export const exercisesApi = new ExercisesApi(configuration);

export const getHeaders = (
  accessToken: string | null | undefined
): HeadersInit => ({
  Authorization: accessToken ? `Bearer ${accessToken}` : "",
  "Content-Type": "application/json",
});
