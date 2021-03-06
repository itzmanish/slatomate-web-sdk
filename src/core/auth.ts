import { ApolloQueryResult, FetchResult } from "@apollo/client";
import {
    CHANGE_USER_PASSWORD,
    EXTERNAL_AUTHENTICATION_URL,
    EXTERNAL_LOGOUT,
    EXTERNAL_REFRESH,
    EXTERNAL_VERIFY_TOKEN,
    LOGIN,
    OBTAIN_EXTERNAL_ACCESS_TOKEN,
    REQUEST_PASSWORD_RESET,
    REFRESH_TOKEN,
    REGISTER,
    SET_PASSWORD,
    VERIFY_TOKEN,
} from "../apollo/mutations";
import {
    ExternalAuthenticationUrlMutation,
    ExternalAuthenticationUrlMutationVariables,
    ExternalLogoutMutation,
    ExternalLogoutMutationVariables,
    ExternalObtainAccessTokensMutation,
    ExternalObtainAccessTokensMutationVariables,
    ExternalRefreshMutation,
    ExternalRefreshMutationVariables,
    ExternalVerifyMutation,
    ExternalVerifyMutationVariables,
    LoginMutation,
    LoginMutationVariables,
    PasswordChangeMutation,
    PasswordChangeMutationVariables,
    RefreshTokenMutation,
    RefreshTokenMutationVariables,
    RegisterMutation,
    RegisterMutationVariables,
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables,
    SetPasswordMutation,
    SetPasswordMutationVariables,
    VerifyTokenMutation,
    VerifyTokenMutationVariables,
} from "../apollo/types";
import { SaleorClientMethodsProps } from "./types";
import {
    ChangeUserPasswordOpts,
    ExternalAuthOpts,
    LoginOpts,
    RefreshTokenOpts,
    RegisterOpts,
    RequestPasswordResetOpts,
    SetPasswordOpts,
} from "./types";
import { storage } from "./storage";
import { USER } from "../apollo/queries";

export interface AuthSDK {
    changePassword: (
        opts: ChangeUserPasswordOpts
    ) => Promise<FetchResult<PasswordChangeMutation>>;
    login: (opts: LoginOpts) => Promise<FetchResult<LoginMutation>>;
    logout: () => Promise<ApolloQueryResult<null>[] | null>;
    refreshToken: (
        opts?: RefreshTokenOpts
    ) => Promise<FetchResult<RefreshTokenMutation>>;
    register: (opts: RegisterOpts) => Promise<FetchResult<RegisterMutation>>;
    requestPasswordReset: (
        opts: RequestPasswordResetOpts
    ) => Promise<FetchResult<RequestPasswordResetMutation>>;
    setPassword: (
        opts: SetPasswordOpts
    ) => Promise<FetchResult<SetPasswordMutation>>;
    verifyToken: (token: string) => Promise<FetchResult<VerifyTokenMutation>>;
    getExternalAuthUrl: (
        opts: ExternalAuthOpts
    ) => Promise<FetchResult<ExternalAuthenticationUrlMutation>>;
    getExternalAccessToken: (
        opts: ExternalAuthOpts
    ) => Promise<FetchResult<ExternalObtainAccessTokensMutation>>;
    logoutExternal: (
        opts: ExternalAuthOpts
    ) => Promise<FetchResult<ExternalLogoutMutation>>;
    refreshExternalToken: (
        opts: ExternalAuthOpts
    ) => Promise<FetchResult<ExternalRefreshMutation>>;
    verifyExternalToken: (
        opts: ExternalAuthOpts
    ) => Promise<FetchResult<ExternalVerifyMutation>>;
}

type AuthKey = keyof AuthSDK;

export const auth = ({
    apolloClient: client,
    channel,
}: SaleorClientMethodsProps): AuthSDK => {
    const authenticatingMutationStatus: Record<string, boolean> = {
        login: false,
        verifyToken: false,
    };

    const withLoadingAuthentication = async (
        key: AuthKey,
        mutation: Promise<FetchResult>
    ): Promise<FetchResult> => {
        authenticatingMutationStatus[key] = true;

        client.writeQuery({
            query: USER,
            data: {
                authenticating: true,
            },
        });

        const result = await mutation;
        authenticatingMutationStatus[key] = false;

        if (
            Object.keys(authenticatingMutationStatus).every(
                k => !authenticatingMutationStatus[k]
            )
        ) {
            client.writeQuery({
                query: USER,
                data: {
                    authenticating: false,
                },
            });
        }

        return result;
    };

    /**
     * Authenticates user with email and password.
     *
     * @param opts - Object with user's email and password.
     * @returns Promise resolved with CreateToken type data.
     */
    const login: AuthSDK["login"] = async opts => {
        const result = await withLoadingAuthentication(
            "login",
            client.mutate<LoginMutation, LoginMutationVariables>({
                mutation: LOGIN,
                variables: {
                    ...opts,
                },
            })
        );

        if (result.data?.tokenCreate?.token) {
            storage.setToken(result.data.tokenCreate.token);
        }

        return result;
    };

    /**
     * Clears stored token and Apollo store.
     *
     * @returns Apollo's native resetStore method.
     */
    const logout: AuthSDK["logout"] = () => {
        storage.setToken(null);
        return client.resetStore();
    };

    /**
     * Registers user with email and password.
     *
     * @param opts - Object with user's data. Email and password are required fields.
     * "channel" can be changed by using first "setChannel" method from api.
     * @returns Promise resolved with AccountRegister type data.
     */
    const register: AuthSDK["register"] = async opts =>
        await client.mutate<RegisterMutation, RegisterMutationVariables>({
            mutation: REGISTER,
            variables: {
                input: {
                    ...opts,
                    channel,
                },
            },
        });

    /**
     * Refresh JWT token. Mutation will try to take refreshToken from the function's arguments.
     * If it fails, it will try to use refreshToken from the http-only cookie called refreshToken.
     *
     * @param opts - Optional object with csrfToken and refreshToken. csrfToken is required when refreshToken is provided as a cookie.
     * @returns Authorization token.
     */
    const refreshToken: AuthSDK["refreshToken"] = async opts => {
        const result = await client.mutate<
            RefreshTokenMutation,
            RefreshTokenMutationVariables
        >({
            mutation: REFRESH_TOKEN,
            variables: {
                csrfToken: opts?.csrfToken,
                refreshToken: opts?.refreshToken,
            },
        });

        if (result.data?.tokenRefresh?.token) {
            storage.setToken(result.data.tokenRefresh.token);
        } else {
            logout();
        }

        return result;
    };

    /**
     * Verify JWT token.
     *
     * @param token - Token value.
     * @returns User assigned to token and the information if the token is valid or not.
     */
    const verifyToken: AuthSDK["verifyToken"] = async token => {
        const result = await withLoadingAuthentication(
            "verifyToken",
            client.mutate<VerifyTokenMutation, VerifyTokenMutationVariables>({
                mutation: VERIFY_TOKEN,
                variables: { token },
            })
        );

        if (!result.data?.tokenVerify?.isValid) {
            storage.setToken(null);
        }

        return result;
    };

    /**
     * Change the password of the logged in user.
     *
     * @param opts - Object with password and new password.
     * @returns Errors if the passoword change has failed.
     */
    const changePassword: AuthSDK["changePassword"] = async opts => {
        const result = await client.mutate<
            PasswordChangeMutation,
            PasswordChangeMutationVariables
        >({
            mutation: CHANGE_USER_PASSWORD,
            variables: { ...opts },
        });

        return result;
    };

    /**
     * Sends an email with the account password modification link.
     *
     * @param opts - Object with slug of a channel which will be used for notify user,
     * email of the user that will be used for password recovery and URL of a view
     * where users should be redirected to reset the password. URL in RFC 1808 format.
     *
     * @returns Errors if there were some.
     */
    const requestPasswordReset: AuthSDK["requestPasswordReset"] = async opts => {
        const result = await client.mutate<
            RequestPasswordResetMutation,
            RequestPasswordResetMutationVariables
        >({
            mutation: REQUEST_PASSWORD_RESET,
            variables: { ...opts },
        });

        return result;
    };

    /**
     * Sets the user's password from the token sent by email.
     *
     * @param opts - Object with user's email, password and one-time token required to set the password.
     * @returns User instance, JWT token, JWT refresh token and CSRF token.
     */
    const setPassword: AuthSDK["setPassword"] = async opts => {
        const result = await client.mutate<
            SetPasswordMutation,
            SetPasswordMutationVariables
        >({
            mutation: SET_PASSWORD,
            variables: { ...opts },
        });

        return result;
    };

    /**
     * Executing externalAuthenticationUrl mutation will prepare special URL which will redirect user to requested
     * page after successfull authentication. After redirection state and code fields will be added to the URL.
     *
     * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
     * JSON with redirectUrl - the URL where the user should be redirected after successful authentication.
     * @returns Authentication data and errors
     */
    const getExternalAuthUrl: AuthSDK["getExternalAuthUrl"] = async opts => {
        const result = await client.mutate<
            ExternalAuthenticationUrlMutation,
            ExternalAuthenticationUrlMutationVariables
        >({
            mutation: EXTERNAL_AUTHENTICATION_URL,
            variables: { ...opts },
        });

        return result;
    };

    /**
     * The externalObtainAccessTokens mutation will generate requested access tokens.
     *
     * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
     * JSON with code - the authorization code received from the OAuth provider and state - the state value received
     * from the OAuth provider
     * @returns Login authentication data and errors
     */
    const getExternalAccessToken: AuthSDK["getExternalAccessToken"] = async opts => {
        const result = await client.mutate<
            ExternalObtainAccessTokensMutation,
            ExternalObtainAccessTokensMutationVariables
        >({
            mutation: OBTAIN_EXTERNAL_ACCESS_TOKEN,
            variables: { ...opts },
        });

        if (result.data?.externalObtainAccessTokens?.token) {
            storage.setToken(result.data.externalObtainAccessTokens.token);
        }

        return result;
    };

    /**
     * The mutation will prepare the logout URL. All values passed in field input will be added as GET parameters to the logout request.
     *
     * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
     * JSON with returnTo - the URL where a user should be redirected
     * @returns Logout data and errors
     */
    const logoutExternal: AuthSDK["logoutExternal"] = async opts => {
        logout();

        const result = await client.mutate<
            ExternalLogoutMutation,
            ExternalLogoutMutationVariables
        >({
            mutation: EXTERNAL_LOGOUT,
            variables: { ...opts },
        });

        return result;
    };

    /**
     * The externalRefresh mutation will generate new access tokens when provided with a valid refresh token.
     * If the refresh token is not provided as an argument, the plugin will try to read it from a cookie
     * set by the tokenCreate mutation. In that case, a matching CSRF token is required.
     *
     * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
     * JSON with refreshToken - the refresh token which should be used to refresh the access token and
     * csrfToken - required when refreshToken is not provided as an input
     * @returns Token refresh data and errors
     */
    const refreshExternalToken: AuthSDK["refreshExternalToken"] = async opts => {
        const result = await client.mutate<
            ExternalRefreshMutation,
            ExternalRefreshMutationVariables
        >({
            mutation: EXTERNAL_REFRESH,
            variables: { ...opts },
        });

        if (result.data?.externalRefresh?.token) {
            storage.setToken(result.data.externalRefresh.token);
        } else {
            logout();
        }

        return result;
    };

    /**
     * The mutation will verify the authentication token.
     *
     * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
     * JSON with refreshToken - the refresh token which should be used to refresh the access token and
     * csrfToken - required when refreshToken is not provided as an input
     * @returns Token verification data and errors
     */
    const verifyExternalToken: AuthSDK["verifyExternalToken"] = async opts => {
        const result = await client.mutate<
            ExternalVerifyMutation,
            ExternalVerifyMutationVariables
        >({
            mutation: EXTERNAL_VERIFY_TOKEN,
            variables: { ...opts },
        });

        if (!result.data?.externalVerify?.isValid) {
            storage.setToken(null);
        }

        return result;
    };

    return {
        changePassword,
        getExternalAccessToken,
        getExternalAuthUrl,
        login,
        logout,
        logoutExternal,
        refreshExternalToken,
        refreshToken,
        register,
        requestPasswordReset,
        setPassword,
        verifyExternalToken,
        verifyToken,
    };
};
