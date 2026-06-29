export const IAM_PROFILE_NOT_BOOTSTRAPPED = "IAM_PROFILE_NOT_BOOTSTRAPPED";
export const IAM_PROFILE_INCOMPLETE = "IAM_PROFILE_INCOMPLETE";
export const IAM_UNSUPPORTED_PRINCIPAL = "IAM_UNSUPPORTED_PRINCIPAL";
export const IAM_IDENTITY_PROVIDER_UNAVAILABLE =
  "IAM_IDENTITY_PROVIDER_UNAVAILABLE";
export const IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH =
  "IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH";

export class IamApplicationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class IamProfileNotBootstrappedError extends IamApplicationError {
  constructor() {
    super(
      IAM_PROFILE_NOT_BOOTSTRAPPED,
      "The authenticated identity has not been bootstrapped.",
    );
  }
}

export class IamProfileIncompleteError extends IamApplicationError {
  constructor() {
    super(
      IAM_PROFILE_INCOMPLETE,
      "The authenticated identity has an incomplete IAM profile graph.",
    );
  }
}

export class IamUnsupportedPrincipalError extends IamApplicationError {
  constructor() {
    super(
      IAM_UNSUPPORTED_PRINCIPAL,
      "This operation is not supported for the current principal.",
    );
  }
}

export class IamIdentityProviderUnavailableError extends IamApplicationError {
  constructor() {
    super(
      IAM_IDENTITY_PROVIDER_UNAVAILABLE,
      "The identity provider could not provide the requested user.",
    );
  }
}

export class IamIdentityProviderSubjectMismatchError extends IamApplicationError {
  constructor() {
    super(
      IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH,
      "The identity provider returned a different user than requested.",
    );
  }
}
