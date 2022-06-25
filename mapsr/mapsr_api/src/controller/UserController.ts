import { getRepository, Repository, useContainer } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { BaseController } from "./BaseController";
import { sign } from 'jsonwebtoken';
import config from "../configuration/config";
import * as md5 from 'md5';
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
import { verify } from 'jsonwebtoken';


import * as fs from 'fs'
import * as jimp from 'jimp'
import { Readable } from 'stream'
import variables from '../configuration/config';
import { UtilsHelper } from '../helpers/utilHeper';
import { FileHelper } from "../helpers/fileHelper";
export class UserController extends BaseController<User>{
    private _repository2: Repository<User>;

    constructor() {
        super(User);
        this._repository2 = getRepository<User>(User);
    }
    // async base64(request: Request) {
    //     // async base64(base64Data: string,fileType:string) {
    //     let { base64Data, fileType, fileDefaltName } = request.body;
    //     try {
    //         let res = await FileHelper.fileBase64(base64Data, fileType, fileDefaltName);
    //         console.log(res.substring(0, res.length-4))
    //         return res;
    //     } catch (error) {
    //         console.log('erro base64', error)
    //     }





    // }



    async all(request: Request) {
        let token = request.body.token || request.query.token || request.headers['x-token-access'];
        let _userAuth: any;
        _userAuth = await this._validateToken(token);

        if (!_userAuth.isRoot || _userAuth.isRoot === false)    
            return { status: 400, errors: ['Para acessar tal recurso você deve ser administrador'] }
        return await this._repository2.find({
            where: {
                deleted: false
            }
        });
    }
    async auth(request: Request) {
        let { email, password } = request.body;
        if (!email || !password)
            return { status: 400, message: 'Informe o email e a senha para efetuar o login' };
        let user = await this.repostitory.findOne({ email: email, password: md5(password) });
        if (user) {
            let _payload = {
                attendantName: user.attendantName,
                email: user.email,
                isRoot: user.isRoot
            };

            return {
                status: 200,
                message: {
                    user: _payload,
                    token: sign({
                        ..._payload,
                        tm: new Date().getTime()
                    }, config.secretyKey)
                }
            }
        } else
            return { status: 404, message: 'E-mail ou senha inválidos' }
    }
    async createUser(request: Request) {
        let { photo, attendantName, email, password, confirmPassword } = request.body;

        super.isRequired(email, 'Informe o e-mail');
        super.isRequired(password, 'Informe a senha');
        super.isRequired(confirmPassword, 'Informe a confirmação da senha');

        const validation1 = await getRepository(User).findOne({ email: email });
        // valida se email já está cadastrado
        if (validation1) {
            return { status: 400, message: 'Inválido: Email já está cadastrado.' };
            // valida email, se já cadastrado

        } else if (await this.validateEmail(email) == false) {
            return { status: 400, message: 'Email invalido' };
        }

        let _user = new User();
        _user.photo = photo;
        _user.email = email;
        _user.attendantName = attendantName;
        if (password != confirmPassword)
            return { status: 400, errors: ['A senha e a confirmação são diferente'] }
        if (password)
            _user.password = md5(password);
        //nao permite criar usuário root diretamente
        //por questoes de segurança
        _user.isRoot = false;
        return super.save(_user, request);
    }
    // async save(request: Request) {
    //     let _user = <User>request.body;
    //     return super.save(_user, request);
    // }

    //Mudar email usuario logado
    async changeEmail(request: Request) {
        let { newEmail, newEmailConfirm, password } = request.body;
        if (newEmail != newEmailConfirm) {
            newEmail = null;
            super.isRequired(newEmail, 'Novo email não confere com confirmação email!');
        }
        let token = request.body.token || request.query.token || request.headers['x-token-access'];
        let _userAuth: any;
        if (token) { //se existe
            try {
                _userAuth = verify(token, config.secretyKey);
            } catch (error) {
                return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }

            }
        } else { //se nao enviado token login, recusa acesso
            return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] };
        }
        const email = _userAuth.email
        try {
            let _user = await this.repostitory.findOne({ email: email, password: md5(password) });
            if (_user) {
                _user.email = newEmail;
                return super.save(_user, request);
            } else {
                return { status: 400, errors: ['Usuário nao encontrado'] }
            }
        } catch (error) {
            return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }
        }
    }
    //Mudar senha usuario logado
    async changePassword(request: Request) {
        let { passwordActual, passwordNew, passwordNewConfirm } = request.body;
        if (passwordNew != passwordNewConfirm) {
            return { status: 400, message: 'Nova senha não confere com confirmação!' };

        }
        let token = request.body.token || request.query.token || request.headers['x-token-access'];
        let _userAuth: any;
        if (token) { //se existe
            try {
                _userAuth = verify(token, config.secretyKey);
            } catch (error) {
                return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }

            }
        } else { //se nao enviado token login, recusa acesso
            return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] };
        }
        const email = _userAuth.email;
        // const email = _userAuth.email;
        try {
            let _user = await this.repostitory.findOne({ email: email, password: md5(passwordActual) });
            if (_user) {
                if (_user.password === md5(passwordActual)) {
                    _user.password = md5(passwordNew);;
                    return super.save(_user, request);
                } else {
                    return { status: 400, errors: ['Senha atual incorreta!'] }
                }
            } else {
                return { status: 400, errors: ['Usuário nao encontrado'] }
            }
        } catch (error) {
            console.log(error)
            return { status: 401, errors: ['Para acessar esse recurso você precisa estar autenticado'] }
        }
    }
    async recoverMail(request: Request) {
        let { email } = request.body;
        super.isRequired(email, 'Informe o e-mail');
        let _user = await this.repostitory.findOne({ email: email });
        if (!_user)
            return { status: 404, message: 'Email não encontrado.' }
        const token = crypto.randomBytes(20).toString('hex');
        const expireToken = new Date(Date.now());
        expireToken.setHours(expireToken.getHours() + 1);
        _user.passwordResetToken = token;
        _user.passwordResetExpires = expireToken;
        // salvar junto model
        // passwordResetToken  ---- ocultar da requisição
        // passwordResetExpires  ( data, defalt: Date.now, )---- ocultar da requisição
        await super.save(_user, request)
        const transport = nodemailer.createTransport({
            host: config.mailCredencials.host,
            port: config.mailCredencials.port,
            auth: {
                user: config.mailCredencials.user,
                pass: config.mailCredencials.pass
            }
        });
        transport.use('compile', hbs({
            viewEngine: {
                defaultLayout: undefined,
                partialsDir: path.resolve('./src/resources/mail/')
            },
            viewPath: path.resolve('./src/resources/mail/'),
            extName: '.html',
        }));
        let link = config.mailCredencials.siteUrl;
        let res: any;
        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: config.mailCredencials.mailName,
                to: email,
                subject: config.mailCredencials.subject,
                template: 'auth/forgot_password',
                context: { token, link },
                // text: 'I hope this message gets delivered!'
            }, (err, info) => {
                if (info) {
                    resolve(true);
                }
                if (err) {
                    resolve(false);
                }
            });
        })
    }

    //para após recebido o token efetivar a mudança
    async resetPassword(request: Request) {
        let { passwordNew, passwordNewConfirm, passwordResetToken } = request.body;
        let _user = await this.repostitory.findOne({ passwordResetToken: passwordResetToken });
        if (!passwordResetToken)
            return { status: 404, message: 'Token é obrigatório.' }
        if (!_user)
            return { status: 404, message: 'Usuário não encontrado.' }
        const expireToken = new Date(Date.now());
        expireToken.setHours(expireToken.getHours());

        if (expireToken > _user.passwordResetExpires) {
            return { status: 400, errors: ['Token expirado'] }
        }
        if (passwordNew != passwordNewConfirm)
            return { status: 404, message: 'Nova senha não confere com confirmação!' }
        if (passwordNew) {
            _user.password = md5(passwordNew);
            _user.passwordResetExpires = expireToken;
        } else {
            return { status: 404, message: 'Nova senha é obrigatória' }
        }
        const res = await super.save(_user, request);
        if (res)
            return _user;


    }
    validateEmail(value) {
        var reg = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
        if (!reg.test(value))
            return false;
        else
            return true
    }



    async _validateToken(token: any) {
        if (token) { //se existe
            try {
                const _userToken = verify(token, config.secretyKey);
                try {
                    let _user = await this._repository2.findOne({ email: _userToken.email });
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