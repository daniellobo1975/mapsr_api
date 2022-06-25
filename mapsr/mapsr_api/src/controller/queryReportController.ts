import { Connection, getRepository, Repository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./BaseController";
import { verify } from 'jsonwebtoken';
import config from '../configuration/config';
import { Client } from "../entity/Client";
import { Farm } from "../entity/Farm";
import { FarmReferece } from "../entity/FarmReferece";
import { User } from "../entity/User";
import { FileHelper } from "../helpers/fileHelper";
import { farmDefaultReference } from "../entity/farmDefaultReference";
import { queryReport } from "../entity/queryReport";
// import * as R from 'r-integration';
const R = require('r-integration');

export class queryReportController extends BaseController<FarmReferece>{

  private _repository_FarmReferece: Repository<FarmReferece>;
  private _repository_QueryReport: Repository<queryReport>;
  private _repository_User: Repository<User>;
  constructor() {
    super(FarmReferece, false);
    this._repository_FarmReferece = getRepository<FarmReferece>(FarmReferece);
    this._repository_QueryReport = getRepository<queryReport>(queryReport);
    this._repository_User = getRepository<User>(User);
  }
  async createQueryReport(request: Request) {
    // let { farmRef } = request.body;
    // if (!farmRef)
    //   return { status: 400, errors: ['Referência não encontrada'] }
    let uid = request.params.id;
    let qResult: queryReport = new queryReport();
   
    // let _queryReport = <queryReport>request.body;

    // const validate1 = await getRepository(queryReport).findOne({ uid: uid, deleted: true });
    // const _farmReference = await getRepository(FarmReferece).findOne({ uid: uid });

    const _farmReference = await this._repository_FarmReferece.findOne({
      where: {
        uid: request.params.id,
      }
    });

   
    if (!_farmReference)
      return { status: 400, errors: ['Referência não encontrada'] }
    
    let farm: any = _farmReference.farmId;
    const _farm = await getRepository(Farm).findOne({ uid: farm.uid});

    //   _queryReport.deleted = false
    //   _queryReport.uid = validate1.uid;
    // }
    let resultScript
       try {
    
      resultScript = await this.executeRScript(_farmReference.uid, _farm.fCar, _farmReference.biomas, _farmReference.app_shp, _farmReference.car_shp)
    if(resultScript){
      qResult.farmRef = _farmReference.uid;
      qResult.result_csv = `${_farmReference.uid}.csv`;
      qResult.result_mapPdf = `${_farmReference.uid}.pdf`;
      qResult.result_shapefile_shp = `${_farmReference.uid}.shp`;
      qResult.result_shapefile_shx = `${_farmReference.uid}.shx`;
      qResult.result_shapefile_prj = `${_farmReference.uid}.prj`;
      qResult.result_shapefile_dfb = `${_farmReference.uid}.dfb`;
      qResult.status = 3;
      this._repository_QueryReport
    }
    } catch (error) {
      qResult.farmRef = _farmReference.uid;
      qResult.status = 5;
      this._repository_QueryReport.save(qResult);
      return { status: 404, errors: ['Erro no processamento dos arquivos'] }
     }
    return resultScript;
    let res
    // try {
    //   const repo = getRepository(queryReport);
    //   res = await repo.save(_queryReport);

    // } catch (err) {
    //   console.log('err.message :>> ', err.message);
    //   return { status: 400, errors: ['Erro ao salvar'] }
    //   // return response.status(400).send();
    // }
    return res;

  }
  async one(request: Request) {
    try {
      // if (this.checkNotPermission(request)) return this.errorRoot;
      return this._repository_QueryReport.find({
        where: {
          deleted: false,
          uid: request.params.id,
        }
      });
    } catch {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
  }

  async executeRScript(fileName: any, fcar: any, biomas: any, app: any, car: any) {
    let result = await R.callMethod("/Users/macboook/Projetos Dev/R/api_projetoR/src/script_R/script.R", "x", { outputFileName: fileName, fcar_farm: fcar, biomas_farm: biomas, app_farm: app, car_farm: car });
   
   return result
  }





  async _validateToken(token: any) {
    if (token) { //se existe
      try {
        const _userToken = verify(token, config.secretyKey);
        try {
          let _user = await this._repository_User.findOne({ email: _userToken.email });
          if (_user) {
            //ok, passa
            return _userToken;
            // if (_user.isRoot === false) {
            //     return { status: 400, errors: ['Você não possui permissão para acessar tal recurso'] }
            // }
          } else {
            return { status: 400, errors: ['Usuário nao encontrado'] }
          }
        } catch (error) {
          console.log(error)
          return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }
        }
      } catch (error) {
        return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }
      }
    } else { //se nao enviado token, recusa acesso
      return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] };
    }
  }



}