import { apiClient } from '../client';

export interface WebAuthnCredentialItem {
  id: number;
  name: string;
  createtime: number;
}

export interface WebAuthnRegisterBeginResponse {
  session_id: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export interface WebAuthnRegisterFinishRequest {
  session_id: string;
  name: string;
  credential: string;
}

export interface WebAuthnLoginBeginResponse {
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface WebAuthnPasswordlessBeginResponse {
  challenge_id: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

// JSON types matching WebAuthn spec for options

type PublicKeyCredentialCreationOptionsJSON = any;

type PublicKeyCredentialRequestOptionsJSON = any;

class WebAuthnService {
  private readonly basePath = '/auth/webauthn';

  /** Registration: begin ceremony */
  async registerBegin() {
    return apiClient.post<WebAuthnRegisterBeginResponse>(
      `${this.basePath}/register/begin`,
      {},
    );
  }

  /** Registration: finish ceremony */
  async registerFinish(data: WebAuthnRegisterFinishRequest) {
    return apiClient.post<void>(`${this.basePath}/register/finish`, data);
  }

  /** List user's registered passkeys */
  async listCredentials() {
    return apiClient.get<{ list: WebAuthnCredentialItem[] }>(
      `${this.basePath}/credentials`,
    );
  }

  /** Rename a passkey */
  async renameCredential(credentialId: number, name: string) {
    return apiClient.put<void>(`${this.basePath}/credentials/${credentialId}`, {
      name,
    });
  }

  /** Delete a passkey */
  async deleteCredential(credentialId: number) {
    return apiClient.delete<void>(
      `${this.basePath}/credentials/${credentialId}`,
    );
  }

  /** 2FA login: begin */
  async loginBegin(sessionToken: string) {
    return apiClient.post<WebAuthnLoginBeginResponse>(
      `${this.basePath}/login/begin`,
      {
        session_token: sessionToken,
      },
    );
  }

  /** 2FA login: finish */
  async loginFinish(sessionToken: string, credential: string) {
    return apiClient.post<void>(`${this.basePath}/login/finish`, {
      session_token: sessionToken,
      credential,
    });
  }

  /** Passwordless login: begin */
  async passlessBegin() {
    return apiClient.post<WebAuthnPasswordlessBeginResponse>(
      `${this.basePath}/passless/begin`,
      {},
    );
  }

  /** Passwordless login: finish */
  async passlessFinish(challengeId: string, credential: string) {
    return apiClient.post<void>(`${this.basePath}/passless/finish`, {
      challenge_id: challengeId,
      credential,
    });
  }
}

export const webauthnService = new WebAuthnService();
