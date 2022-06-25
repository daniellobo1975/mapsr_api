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
export class ClientController extends BaseController<Client>{
    private _repository2: Repository<Client>;
    private _repository_Farm: Repository<Farm>;
    private _repository_FarmReferece: Repository<FarmReferece>;
    private _repository_User: Repository<User>;

    constructor() {
        super(Client, false);
        this._repository2 = getRepository<Client>(Client);
        this._repository_Farm = getRepository<Farm>(Farm);
        this._repository_FarmReferece = getRepository<FarmReferece>(FarmReferece);
        this._repository_User = getRepository<User>(User);
     
    }



    
    async createClient(request: Request) {
        let {clientName, photo,email, uid  } = request.body;
        let token = request.body.token || request.query.token || request.headers['x-token-access'];
        let _userAuth: any;
        _userAuth = this._validateToken(token);
      
        
        // _userAuth = _userAuth.uid;
        let _client = <Client>request.body;
        // if(typeof(_client.addressNumber))
        super.isRequired(_client.clientName, 'O nome do cliente é obrigatório');
        const validate1 = await getRepository(Client).findOne({ uid: uid, deleted: true });
        const validate2 = await getRepository(Client).findOne({ clientName: clientName });
        const validate3 = await getRepository(Client).findOne({ email: email });
  
        if (validate2){
          if(validate2.deleted ===true){
            _client.deleted = false;
            _client.uid = validate2.uid;
          }else{
            return { status: 400, errors: ['Nome já cadastrado'] }
          }
        }
        
          if (validate3){
            if(validate3.deleted ===true){
              _client.deleted = false;
              _client.uid = validate3.uid
            }else{
              return { status: 400, errors: ['Email já cadastrado'] }
            }
          }
          
      
        if (validate1) {
          _client.deleted = false
          _client.uid = validate1.uid;
        }
        if (photo) {
            let pictureCreatedResult = await FileHelper.writePicture(_client.photo);
            if (pictureCreatedResult)
            _client.photo = pictureCreatedResult
          }
        try {
            const repo = getRepository(Client);
            let res = await repo.save(_client);
        } catch (err) {
            console.log('err.message :>> ', err.message);
            // return response.status(400).send();
        }
        if (_client.clientFarms) {
            await Promise.all(_client.clientFarms.map(async (farm) => {
                farm.clientId = _client.uid;
                let repo2 = getRepository(Farm);
                try {
                    let res2 = await repo2.save(farm);
                } catch (err) {
                    return { status: 400, errors: ['Dados incompletos Fazenda', farm] };
                }
                if (farm.farmReferences) {
                    await Promise.all(farm.farmReferences.map(async (farmRef) => {
                      farmRef.farmId = farm.uid;
                      farmRef.requestingUser = _userAuth.uid
                      if (!farmRef.referenceName)
                      return { status: 400, errors: ['Preencha o nome da Referência'] }
                    if (!farmRef.car_shp || !farmRef.car_shx||  !farmRef.car_prj || !farmRef.car_dfb)
                      return { status: 400, errors: ['Adicione todos arquivos Car'] }
                    if (!farmRef.app_shp || !farmRef.app_shx || !farmRef.app_prj || !farmRef.app_dfb)
                      return { status: 400, errors: ['Adicione todos arquivos App'] }
                    if (!farmRef.biomas)
                      return { status: 400, errors: ['Adicione o arquivo Biomas'] }
                      let file ='';
                      let fileName ='';
                      if(farmRef.app_shp){
                        try {
                          file = await FileHelper.fileBase64(farmRef.app_shp, 'shp', null);
                          fileName = file.substring(0, file.length-4);
                          farmRef.app_shp = file;
                          if(farmRef.app_dfb){
                            file = await FileHelper.fileBase64(farmRef.app_dfb, 'dfb', fileName);
                            farmRef.app_dfb = file;
                          }
                          if(farmRef.app_prj){
                            file = await FileHelper.fileBase64(farmRef.app_prj, 'prj', fileName);
                            farmRef.app_prj = file;
                          }
                          if(farmRef.app_shx){
                            file = await FileHelper.fileBase64(farmRef.app_shx, 'shx', fileName);
                            farmRef.app_shx = file;
                          }
                      } catch (error) {
                          console.log('erro base64', error)
                      }
                      }
                      if(farmRef.biomas){
                        try {
                          file = await FileHelper.fileBase64(farmRef.biomas, 'tif', null);
                          // fileName = file.substring(0, file.length-4);
                          farmRef.biomas = file;
                        } catch (error) {
                        }
                        }
                      if(farmRef.car_shp){
                        try {
                          file = await FileHelper.fileBase64(farmRef.car_shp, 'shp', null);
                          fileName = file.substring(0, file.length-4);
                          farmRef.car_shp = file;
                          if(farmRef.car_dfb){
                            file = await FileHelper.fileBase64(farmRef.car_dfb, 'dfb', fileName);
                            farmRef.car_dfb = file;
                          }
                          if(farmRef.car_prj){
                            file = await FileHelper.fileBase64(farmRef.car_prj, 'prj', fileName);
                            farmRef.car_prj = file;
                          }
                          if(farmRef.car_shx){
                            file = await FileHelper.fileBase64(farmRef.car_shx, 'shx', fileName);
                            farmRef.car_shx = file;
                          }
                      } catch (error) {
                          console.log('erro base64', error)
                      }
                      }
                      
                        let repo3 = getRepository(FarmReferece);
                        try {
                            let res3 = await repo3.save(farmRef);
                        } catch (err) {
                            return { status: 400, errors: ['Dados incompletos Complemento Referência Fazenda:', farmRef] };
                        }
                    }));
                }
            }));
        }
      
        return _client;
    }
    // async pushNotification(request: Request) {
    //     let { uid, pushNotification } = request.body;
    //     try {
    //         const _order = await getRepository(Orders).findOne({ uid: uid });
    //         _order.pushNotification = pushNotification;
    //         return (super.save(_order, request));
    //     } catch (err) {
    //         console.log(err);
    //         return { status: 400, errors: ['Pedido não encontrado'] }
    //     }
    // }
    async one2(request: Request) {
        try {
            if (this.checkNotPermission(request)) return this.errorRoot;
            return this._repository2.find({
                where: {
                    deleted: false,
                    uid: request.params.id,
                }
            });
        } catch {
            return { status: 404, errors: ['Cliente não encontrado'] }
        }
    }
    async save(request: Request) {
        let { uid, clientName, photo, email, phone, addressCEP, addressPlace, addressNumber, addressDistrict, addressComplement, addressCity } = request.body;
        
        
        //     return { status: 400, errors: ['Selecione a forma de pagamento'] }
        if (!clientName)
            return { status: 400, errors: ['Informe o nome do Cliente'] }
        
        

        let _client = <Client>request.body;
        const validate = await getRepository(Client).findOne({ uid: uid });
        const validate1 = await getRepository(Client).findOne({ uid: uid, deleted: true });
        if (validate) {
            //se já estiver cadastrado (tiver uid), passa
        } else if (validate1) {
            _client.deleted = false
            _client.uid = validate1.uid;
        } else {
            return { status: 404, errors: ['Cliente não encontrado'] }
        }
        const repo = getRepository(Client);
        let res = await this.repostitory.save(_client);
  
        return res
    };


  


    async _validateToken(token: any){
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