import express from "express";
import { validateFile } from "../../utils";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { ERRORTYPE } from "../../enums/ErrorType";
import { uploadToFireBase } from "../../services/firebase";


export const UploadSingle = (
  key: string,
  dest: string,
  validateParams: { ext: string[]; size?: number }
) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const file = req.file;
      if (file) {
        let validateFileProcess = validateFile(file, validateParams.ext);
        if (!validateFileProcess.status) {
          return res.status(HTTPSTATUS.BAD_REQUEST).send({
            name: ERRORTYPE.DATA_ERROR,
            issues: {
              message: validateFileProcess.message,
            },
          });
        }
      }

      let { fileName, downloadURL } = file
        ? (await uploadToFireBase(file, dest)).data
        : { fileName: null, downloadURL: null };

      req.body[key] = { fileName, downloadURL };
      next();
    } catch (error) {
      res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
    }
  };
};
