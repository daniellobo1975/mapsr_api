import { Request } from 'express';
import variables from '../configuration/config';
import * as path from 'path';

const fsPromises = require("fs/promises");
export class StorageController {

  async getFile(req: Request) {
    const filePath = `${variables.folderStorage}/${req.params.filename}`;
    return { file: path.resolve(filePath) };
  }
  async getOutputFile(req: Request) {
    const filePath = `${variables.folderStorage}/output/${req.params.filename}`;
    return { file: path.resolve(filePath) };
  }

  async deleteFile(req: Request) {

    const filePath = `${variables.folderStorage}/${req.params.filename}`;
    try {
      await fsPromises.unlink(filePath);
      return { status: 200, errors: ['Arquivo removido com sucesso'] }
  
    } catch (err) {
      console.log(err);
      return { status: 404, errors: ['Arquivo não encontrado'] }
    }
  };
  

}