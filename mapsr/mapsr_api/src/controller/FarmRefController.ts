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
export class FarmRefController extends BaseController<FarmReferece>{
  private _repository_FarmReferece: Repository<FarmReferece>;
  private _repository_FarmDefaultReferece: Repository<farmDefaultReference>;
  private _repository_User: Repository<User>;
  constructor() {
    super(FarmReferece, false);
    this._repository_FarmReferece = getRepository<FarmReferece>(FarmReferece);
    this._repository_FarmDefaultReferece = getRepository<farmDefaultReference>(farmDefaultReference);
    this._repository_User = getRepository<User>(User);
  }
  async createFarmRef(request: Request) {
    let { referenceName, farmId, car_shp, car_shx, car_prj , car_dfb, app_shp,app_shx,app_prj,app_dfb, biomas } = request.body;
    //     return { status: 400, errors: ['Selecione a forma de pagamento'] }
    if (!referenceName)
      return { status: 400, errors: ['Preencha o nome da Referência'] }
    if (!car_shp || !car_shx||  !car_prj || !car_dfb)
      return { status: 400, errors: ['Adicione todos arquivos Car'] }
    if (!app_shp || !app_shx || !app_prj || !app_dfb)
      return { status: 400, errors: ['Adicione todos arquivos App'] }
    if (!biomas)
      return { status: 400, errors: ['Adicione o arquivo Biomas'] }
   let token = request.body.token || request.query.token || request.headers['x-token-access'];
    let _userAuth: any;
    _userAuth = this._validateToken(token);
    // _userAuth = _userAuth.uid;
    let _farmRef = <FarmReferece>request.body;
    _farmRef.requestingUser = _userAuth.uid;
    let file ='';
    let fileName ='';
    if(_farmRef.app_shp){
      try {
        file = await FileHelper.fileBase64(app_shp, 'shp', null);
        fileName = file.substring(0, file.length-4);
        _farmRef.app_shp = file;
        if(_farmRef.app_dfb){
          file = await FileHelper.fileBase64(app_dfb, 'dfb', fileName);
          _farmRef.app_dfb = file;
        }
        if(_farmRef.app_prj){
          file = await FileHelper.fileBase64(app_prj, 'prj', fileName);
          _farmRef.app_prj = file;
        }
        if(_farmRef.app_shx){
          file = await FileHelper.fileBase64(app_shx, 'shx', fileName);
          _farmRef.app_shx = file;
        }
    } catch (error) {
        console.log('erro base64', error)
    }
    }
    if(_farmRef.biomas){
      try {
        file = await FileHelper.fileBase64(biomas, 'tif', null);
       
        // fileName = file.substring(0, file.length-4);
        _farmRef.biomas = file;
      } catch (error) {
      }
      }
    if(_farmRef.car_shp){
      try {
        file = await FileHelper.fileBase64(car_shp, 'shp', null);
        fileName = file.substring(0, file.length-4);
        _farmRef.car_shp = file;
        if(_farmRef.car_dfb){
          file = await FileHelper.fileBase64(car_dfb, 'dfb', fileName);
          _farmRef.car_dfb = file;
        }
        if(_farmRef.car_prj){
          file = await FileHelper.fileBase64(car_prj, 'prj', fileName);
          _farmRef.car_prj = file;
        }
        if(_farmRef.car_shx){
          file = await FileHelper.fileBase64(car_shx, 'shx', fileName);
          _farmRef.car_shx = file;
        }
    } catch (error) {
        console.log('erro base64', error)
    }
    }
    let res
    try {
      const repo = getRepository(FarmReferece);
       res = await repo.save(_farmRef);
    } catch (err) {
      console.log('err.message :>> ', err.message);
      return { status: 400, errors: ['Erro ao salvar'] }
      // return response.status(400).send();
    }
    return res;
  }
  async one2(request: Request) {
    console.log(request.params.id)
    try {
      if (this.checkNotPermission(request)) return this.errorRoot;
      return this._repository_FarmReferece.findOne({
        where: {
          deleted: false,
          uid: request.params.id,
        }
      });
    } catch {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
  }
  async save(request: Request) {
    let { uid, referenceName, farmId, car_shp, car_shx, car_prj , car_dfb, app_shp,app_shx,app_prj,app_dfb, biomas } = request.body;
    //     return { status: 400, errors: ['Selecione a forma de pagamento'] }
    if (!referenceName)
      return { status: 400, errors: ['Preencha o nome da Referência'] }
    if (!car_shp || !car_shx||  !car_prj || !car_dfb)
      return { status: 400, errors: ['Adicione todos arquivos Car'] }
    if (!app_shp || !app_shx || !app_prj || !app_dfb)
      return { status: 400, errors: ['Adicione todos arquivos App'] }
    if (!biomas)
      return { status: 400, errors: ['Adicione o arquivo Biomas'] }
    let _farmRef = <FarmReferece>request.body;
    const validate = await getRepository(FarmReferece).findOne({ uid: uid });
    const validate1 = await getRepository(FarmReferece).findOne({ uid: uid, deleted: true });
    const validate2 = await getRepository(Farm).findOne({ uid: farmId });
    if (!validate2)
      return { status: 400, errors: ['Fazenda não encontrada'] }
    if (validate) {
      //se já estiver cadastrado (tiver uid), passa
      _farmRef.uid = uid;
    } else if (validate1) {
      _farmRef.deleted = false
      _farmRef.uid = validate1.uid;
    }
    if (!validate2) {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
    let file ='';
    let fileName ='';
    if(_farmRef.app_shp){
      try {
        file = await FileHelper.fileBase64(app_shp, 'shp', null);
       
        fileName = file.substring(0, file.length-4);
        _farmRef.app_shp = file;
        if(_farmRef.app_dfb){
          file = await FileHelper.fileBase64(app_shp, 'dfb', fileName);
          _farmRef.app_shp = file;
        }
        if(_farmRef.app_prj){
          file = await FileHelper.fileBase64(app_shp, 'prj', fileName);
          _farmRef.app_prj = file;
        }
        if(_farmRef.app_shx){
          file = await FileHelper.fileBase64(app_shp, 'shx', fileName);
          _farmRef.app_shx = file;
        }
    } catch (error) {
        console.log('erro base64', error)
    }
    }
    if(_farmRef.biomas){
        file = await FileHelper.fileBase64(biomas, 'tif', null);
        fileName = file.substring(0, file.length-4);
        _farmRef.app_shp = file;
      }
    if(_farmRef.car_shp){
      try {
        file = await FileHelper.fileBase64(car_shp, 'shp', null);
        fileName = file.substring(0, file.length-4);
        _farmRef.car_shp = file;
        if(_farmRef.car_dfb){
          file = await FileHelper.fileBase64(car_shp, 'dfb', fileName);
          _farmRef.car_shp = file;
        }
        if(_farmRef.car_prj){
          file = await FileHelper.fileBase64(car_shp, 'prj', fileName);
          _farmRef.car_prj = file;
        }
        if(_farmRef.car_shx){
          file = await FileHelper.fileBase64(car_shp, 'shx', fileName);
          _farmRef.car_shx = file;
        }
    } catch (error) {
        console.log('erro base64', error)
    }
    }
    // const repo = getRepository(Farm);
    let res = await this._repository_FarmReferece.save(_farmRef);
    return res
  };
  async setDefault(request: Request) {
    let {farmId, defaultReference } = request.body;
    // const validate = await getRepository(farmDefaultReference).findOne({ uid: uid });

    //verifica se já possui farmDefaultReference para farmId
    const validate1 = await getRepository(farmDefaultReference).findOne({ farmId: farmId});
    const validate3 = await getRepository(Farm).findOne({ uid: farmId });
    if (!validate3) {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
    const validate2 = await getRepository(FarmReferece).findOne({ farmId: farmId, uid: defaultReference });
    if (!validate2) {
      const validate4 = await getRepository(FarmReferece).findOne({ uid: defaultReference });
      if(validate4){
        return { status: 404, errors: ['Referência não corresponde a fazenda informada'] }
      }else{
        return { status: 404, errors: ['Referência não encontrada '] }
      }
     
    }
    let _farmDefaultRef: farmDefaultReference = new farmDefaultReference();
    if (validate1) {
      //se já estiver cadastrado (tiver uid)
      _farmDefaultRef.uid = validate1.uid;
    } 
    _farmDefaultRef.farmId = farmId;
    _farmDefaultRef.defaultReference = defaultReference;


    // const repo = getRepository(Farm);
    let res = await this._repository_FarmDefaultReferece.save(_farmDefaultRef);
    return res
  };

  
  async oneDefault(request: Request) {
   
    try {
      // if (this.checkNotPermission(request)) return this.errorRoot;
      return await this._repository_FarmDefaultReferece.findOne({
        where: {
          farmId: request.params.id,
        }
      });
    } catch {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
  }

  async allRefFromFarm(request: Request) {
   
    try {
      // if (this.checkNotPermission(request)) return this.errorRoot;
      return await this._repository_FarmReferece.find({
        where: {
          farmId: request.params.id,
        }
      });
    } catch {
      return { status: 404, errors: ['Fazenda não encontrada'] }
    }
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