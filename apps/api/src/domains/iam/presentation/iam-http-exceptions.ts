import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import {
  IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH,
  IAM_IDENTITY_PROVIDER_UNAVAILABLE,
  IAM_PROFILE_INCOMPLETE,
  IAM_PROFILE_NOT_BOOTSTRAPPED,
  IAM_UNSUPPORTED_PRINCIPAL,
  IAM_WORKSPACE_FORBIDDEN,
  IAM_WORKSPACE_INVALID_INPUT,
  IAM_WORKSPACE_LAST_IN_ORGANIZATION,
  IAM_WORKSPACE_NOT_FOUND,
  IamApplicationError,
} from "../application/iam.errors";

export function toIamHttpException(error: unknown) {
  if (!(error instanceof IamApplicationError)) {
    return error;
  }

  if (error.code === IAM_PROFILE_NOT_BOOTSTRAPPED) {
    return new NotFoundException({ code: error.code });
  }

  if (
    error.code === IAM_PROFILE_INCOMPLETE ||
    error.code === IAM_WORKSPACE_LAST_IN_ORGANIZATION
  ) {
    return new ConflictException({ code: error.code });
  }

  if (
    error.code === IAM_UNSUPPORTED_PRINCIPAL ||
    error.code === IAM_WORKSPACE_FORBIDDEN
  ) {
    return new ForbiddenException({ code: error.code });
  }

  if (error.code === IAM_WORKSPACE_INVALID_INPUT) {
    return new BadRequestException({ code: error.code });
  }

  if (error.code === IAM_WORKSPACE_NOT_FOUND) {
    return new NotFoundException({ code: error.code });
  }

  if (
    error.code === IAM_IDENTITY_PROVIDER_UNAVAILABLE ||
    error.code === IAM_IDENTITY_PROVIDER_SUBJECT_MISMATCH
  ) {
    return new BadGatewayException({ code: error.code });
  }

  return error;
}
