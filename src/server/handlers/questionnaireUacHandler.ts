import { isAxiosError } from "axios";
import { type Auth } from "blaise-login-react-server";
import { type BusClient } from "blaise-uac-service-node-client";
import express, { type Request, type Response, type Router } from "express";
import multer from "multer";

import { type AuditLog } from "../auditLogger.js";
import { getUsername } from "../helpers/getUsername.js";
import { type GoogleStorage, SampleFileExistsError } from "../storage/googleStorageFunctions.js";
import { addUacsToFile, getCaseIdsFromFile } from "../utils/csvParser.js";
import {
  CsvValidationError,
  hasErrorMessage,
  isValidQuestionnaireName,
  isValidSampleFileName,
} from "../validation.js";

import type { Config } from "../config.js";

const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB

type AuditLoggerLike = {
  info: (logger: Request["log"], message: string) => void;
  error: (logger: Request["log"], message: string) => void;
  getLogs?: () => Promise<AuditLog[]>;
};

function normaliseSampleFileName(fileName: string): string {
  const questionnairePart = fileName.replace(/\.csv$/i, "");

  return `${questionnairePart.toUpperCase()}.csv`;
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (hasErrorMessage(data)) {
      return data.error;
    }

    if (typeof data === "string" && data.length > 0) return data;
  }

  return error instanceof Error ? error.message : "An unexpected error occurred";
}

export class QuestionnaireUacHandler {
  constructor(
    private readonly busClient: BusClient,
    private readonly googleStorage: GoogleStorage,
    private readonly config: Config,
    private readonly auth?: Auth,
    private readonly auditLogger?: AuditLoggerLike,
  ) {}

  generateUacsForSampleFile = async (req: Request, res: Response): Promise<Response> => {
    const questionnaireName = req.params.questionnaireName;

    if (typeof questionnaireName !== "string" || !isValidQuestionnaireName(questionnaireName)) {
      return res.status(400).json("Invalid questionnaire name");
    }

    const normalisedQuestionnaireName = questionnaireName.toUpperCase();

    const file = req.file;

    if (file === undefined) {
      return res.status(400).json("File not supplied");
    }

    const fileName = `${normalisedQuestionnaireName}.csv`;
    const overwrite = req.body.overwrite === "true";

    try {
      if (!overwrite && (await this.sampleFileAlreadyExists(fileName))) {
        return res
          .status(409)
          .json({ error: `A sample file already exists for ${normalisedQuestionnaireName}` });
      }

      await this.generateUacs(normalisedQuestionnaireName, file);
      await this.uploadSampleFile(fileName, file, overwrite);

      if (this.auth && this.auditLogger) {
        const username = getUsername(req, this.auth);

        this.auditLogger.info(
          req.log,
          `${username} uploaded sample file ${file.originalname} for questionnaire ${normalisedQuestionnaireName}`,
        );
      }

      return res.status(201).json("Success");
    } catch (error: unknown) {
      if (error instanceof SampleFileExistsError) {
        return res
          .status(409)
          .json({ error: `A sample file already exists for ${normalisedQuestionnaireName}` });
      }

      if (error instanceof CsvValidationError) {
        req.log.warn(
          { questionnaireName: normalisedQuestionnaireName, fileName, error: error.message },
          "Sample file validation failed",
        );

        return res.status(400).json({ error: error.message });
      }

      if (this.auth && this.auditLogger) {
        const username = getUsername(req, this.auth);

        this.auditLogger.error(
          req.log,
          `${username} failed to upload sample file ${file.originalname} for questionnaire ${normalisedQuestionnaireName}`,
        );
      }

      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Generate UACs for sample file failed",
      );

      return res.status(500).json({ error: extractErrorMessage(error) });
    }
  };

  getSampleFileWithUacs = async (req: Request, res: Response): Promise<Response> => {
    const questionnaireName = req.params.questionnaireName;
    const fileName = req.params.fileName;

    if (typeof questionnaireName !== "string" || !isValidQuestionnaireName(questionnaireName)) {
      return res.status(400).json("Invalid questionnaire name");
    }

    if (typeof fileName !== "string" || !isValidSampleFileName(fileName)) {
      return res.status(400).json("Invalid filename");
    }

    const normalisedQuestionnaireName = questionnaireName.toUpperCase();
    const normalisedFileName = normaliseSampleFileName(fileName);

    try {
      const fileBuffer = await this.getSampleFileBuffer(normalisedFileName);
      const questionnaireUacDetails = await this.busClient.getUacsByCaseId(
        normalisedQuestionnaireName,
      );
      const fileWithUacsArray = await addUacsToFile(fileBuffer, questionnaireUacDetails);

      return res.status(200).json(fileWithUacsArray);
    } catch (error: unknown) {
      if (error instanceof CsvValidationError) {
        req.log.warn(
          {
            questionnaireName: normalisedQuestionnaireName,
            fileName: normalisedFileName,
            error: error.message,
          },
          "Sample file parsing or validation failed",
        );

        return res.status(400).json({ error: error.message });
      }

      req.log.error(
        error instanceof Error ? error : new Error(String(error)),
        `Get sample file with UACs failed for ${questionnaireName}`,
      );

      return res
        .status(500)
        .json(`Get sample file with UACs failed for questionnaire ${normalisedQuestionnaireName}`);
    }
  };

  private async generateUacs(questionnaireName: string, file: Express.Multer.File): Promise<void> {
    const caseIds = await getCaseIdsFromFile(file.buffer);

    await this.busClient.generateUacs(questionnaireName, caseIds);
  }

  private async sampleFileAlreadyExists(fileName: string): Promise<boolean> {
    const canonicalFileName = normaliseSampleFileName(fileName);
    const lowerCaseFileName = canonicalFileName.toLowerCase();

    const upperCaseExists = await this.googleStorage.fileExistsInBucket(
      this.config.bucketName,
      canonicalFileName,
    );

    if (upperCaseExists || canonicalFileName === lowerCaseFileName) {
      return upperCaseExists;
    }

    return this.googleStorage.fileExistsInBucket(this.config.bucketName, lowerCaseFileName);
  }

  private async uploadSampleFile(
    fileName: string,
    file: Express.Multer.File,
    overwrite: boolean,
  ): Promise<void> {
    await this.googleStorage.uploadFileToBucket(
      this.config.bucketName,
      file,
      normaliseSampleFileName(fileName),
      overwrite,
    );
  }

  private async getSampleFileBuffer(fileName: string): Promise<Buffer> {
    const canonicalFileName = normaliseSampleFileName(fileName);

    try {
      return await this.googleStorage.getFileFromBucket(this.config.bucketName, canonicalFileName);
    } catch (upperCaseError: unknown) {
      const lowerCaseFileName = canonicalFileName.toLowerCase();

      if (canonicalFileName === lowerCaseFileName) {
        throw upperCaseError;
      }

      return this.googleStorage.getFileFromBucket(this.config.bucketName, lowerCaseFileName);
    }
  }
}

export default function createQuestionnaireUacHandler(
  busClient: BusClient,
  googleStorage: GoogleStorage,
  config: Config,
  auth: Auth,
  auditLogger?: AuditLoggerLike,
): Router {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: FILE_SIZE_LIMIT } });
  const handler = new QuestionnaireUacHandler(busClient, googleStorage, config, auth, auditLogger);

  router.post(
    "/api/v1/questionnaire/:questionnaireName/uac/sample",
    auth.middleware,
    upload.single("file"),
    handler.generateUacsForSampleFile,
  );
  router.get(
    "/api/v1/questionnaire/:questionnaireName/uac/sample/:fileName",
    auth.middleware,
    handler.getSampleFileWithUacs,
  );

  return router;
}
