import { useMutation, useQuery } from "@pinia/colada";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  CreateAccountProps,
  CreateAccountResponse,
  LoginAccountProps,
  LoginAccountResponse,
} from "../services/models/auth-service.model";
// import { AuthService } from "../services/Auth.service";
import { AuthMockService } from "../services/AuthMock.service";

export const useAuth = () => {
  // const authService = new AuthService();
  const authService = new AuthMockService();

  const router = useRouter();

  const accessToken = ref(localStorage.getItem("accessToken") || "");
  const mutationIsLoading = ref(false);
  const mutationError = ref<Error | null>(null);

  // TODO: propriedade enabled não está realizando o fetch ao alterar o valor
  const getAccount = useQuery({
    key: () => ["account", accessToken.value],
    query: () =>  authService.getAccount({ token: accessToken.value }),
    enabled: !!accessToken.value,
  });


  // TODO: possível solução para o problema de fetch ao alterar o valor do accessToken
  // const getAccount = useQuery({
  //   key: () => ["account", accessToken.value],
  //   query: () => {
  //     if (accessToken.value) {
  //       return authService.getAccount({ token: accessToken.value });
  //     }

  //     return new Promise(resolve => resolve(null));
  //   },
  // });

  const account = computed(() => getAccount.data.value || null);
  const accountIsLoading = computed(
    () => getAccount.isLoading.value && !account.value,
  );

  watch(
    () => getAccount.error.value,
    error => {
      if (error) {
        localStorage.removeItem("accessToken");
        router.push({ name: "LoginAccount" });
      }
    },
    { immediate: true },
  );

  const createAccountMutation = useMutation<
    CreateAccountResponse,
    CreateAccountProps,
    Error
  >({
    mutation: data => authService.createAccount(data),
    onMutate: () => {
      mutationIsLoading.value = true;
      mutationError.value = null;
    },
    onSettled: () => {
      mutationIsLoading.value = false;
    },
    onSuccess: response => {
      console.log(response);
      console.log("Account created successfully");
    },
    onError: error => {
      mutationError.value = error;
      console.error(error);
    },
  });

  const loginAccountMutation = useMutation<
    LoginAccountResponse,
    LoginAccountProps,
    Error
  >({
    mutation: async data => {
      const response = await authService.loginAccount(data);

      return response;
    },
    onSuccess: data => {
      accessToken.value = data.token;
      localStorage.setItem("accessToken", data.token);

      console.log(data);
      console.log("Account logged in successfully");
    },
    onMutate: () => {
      mutationIsLoading.value = true;
    },
    onSettled: () => {
      mutationIsLoading.value = false;
    },
    onError: error => {
      mutationError.value = error;
      console.error(error);
    },
  });

  return {
    getAccount,
    account,
    accountIsLoading,
    createAccount: createAccountMutation,
    loginAccount: loginAccountMutation,
  };
};
