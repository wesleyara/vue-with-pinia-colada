/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import { httpClient } from "../lib/axios";
import {
  CreateAccountProps,
  GetAccountProps,
  LoginAccountProps,
} from "./models/auth-service.model";

export class AuthService {
  async createAccount(data: CreateAccountProps): Promise<any> {
    try {
      const response = await httpClient.post("/accounts/create", data);

      return response.data;
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };

      throw new Error(err.response.data.message);
    }
  }

  async loginAccount(data: LoginAccountProps): Promise<any> {
    try {
      const response = await httpClient.post("/accounts/login", data);

      return response.data;
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };

      throw new Error(err.response.data.message);
    }
  }

  async getAccount({ token }: GetAccountProps): Promise<any> {
    try {
      const response = await httpClient.get("/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };

      throw new Error(err.response.data.message);
    }
  }
}
