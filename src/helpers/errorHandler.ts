import HttpStatusCode from '../enums/httpStatusCodes';
import { Response } from 'express';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { zodErrorsMapper } from './zodErrorsMapper';

process.on('uncaughtException', (error: Error) => {
  handler.handleError(error);
  if (!handler.isTrustedError(error)) process.exit(1);
});

export class AppError extends Error {
  public readonly error: unknown;
  public readonly isOperational: boolean;
  public readonly httpCode: HttpStatusCode | undefined;

  constructor(description: string, isOperational: boolean, error?: unknown, code?: HttpStatusCode) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.isOperational = isOperational;

    this.error = error;

    this.httpCode = code;

    Error.captureStackTrace(this);
  }
}

class ErrorHandler {
  public async handleError(appError: unknown, res?: Response): Promise<void> {
    if (appError instanceof AppError && res) {
      if (appError.error instanceof AppError) {
        res
          .status(appError.error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: appError.error.message });
        return;
      }

      if (appError.httpCode) {
        res.status(appError.httpCode).json({ message: appError.message });
        return;
      }
      const serviceError = appError.error;
      if (isAxiosError(serviceError)) {
        const status = serviceError.response?.status || HttpStatusCode.INTERNAL_SERVER_ERROR;
        const errorRes = serviceError.response?.data || 'An error occurred';
        res.status(status).json(errorRes);
        return;
      }

      if (serviceError instanceof z.ZodError) {
        const errors = zodErrorsMapper(serviceError.formErrors.fieldErrors);
        res.status(HttpStatusCode.BAD_REQUEST).json({ errors });
        return;
      }

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }

    return;
  }

  public isTrustedError(error: Error) {
    return error instanceof AppError && error.isOperational;
  }
}

export const handler = new ErrorHandler();
