
import { ClientController } from "./controller/ClientController";
import { FarmController } from "./controller/FarmController";
import { FarmRefController } from "./controller/FarmRefController";
import { queryReportController } from "./controller/queryReportController";
import { StorageController } from "./controller/StorageController";
import { UserController } from "./controller/UserController";

export const Routes = [

    { method: "get", route: "/storage/:filename", controller: StorageController, action: "getFile" },
    { method: "get", route: "/storageoutput/:filename", controller: StorageController, action: "getOutputFile" },
    { method: "delete", route: "/storage/:filename", controller: StorageController, action: "deleteFile" },
 

    // Users 
    { method: "get", route: "/user", controller: UserController, action: "all" },
    { method: "get", route: "/user/:id", controller: UserController, action: "one" },
    { method: "post", route: "/user", controller: UserController, action: "save" },

    { method: "post", route: "/user/create", controller: UserController, action: "createUser" },
    // { method: "post", route: "/base64", controller: UserController, action: "base64" },
    { method: "delete", route: "/user/:id", controller: UserController, action: "remove" },

    //Recover
    { method: "post", route: "/user/recover", controller: UserController, action: "recoverMail" },
    { method: "post", route: "/user/reset", controller: UserController, action: "resetPassword" },
    //Recover - change
    { method: "post", route: "/user/changemail", controller: UserController, action: "changeEmail" },
    { method: "post", route: "/user/changepassword", controller: UserController, action: "changePassword" },
  
    //Auth
    { method: "post", route: "/user/auth", controller: UserController, action: "auth" },

//Cliente
{ method: "get", route: "/client", controller: ClientController, action: "all" },
{ method: "get", route: "/client/:id", controller: ClientController, action: "one" },
{ method: "post", route: "/client/create", controller: ClientController, action: "createClient" },

{ method: "post", route: "/client", controller: ClientController, action: "save" },
{ method: "delete", route: "/client/:id", controller: ClientController, action: "remove" },



//farm
{ method: "get", route: "/farm", controller: FarmController, action: "all" },
{ method: "get", route: "/farm/:id", controller: FarmController, action: "one" },
{ method: "post", route: "/farm/create", controller: FarmController, action: "createFarm" },
{ method: "post", route: "/farm", controller: FarmController, action: "save" },
{ method: "delete", route: "/farm/:id", controller: FarmController, action: "remove" },

// { method: "get", route: "/farmref", controller: FarmRefController, action: "all" },
{ method: "get", route: "/farmref/:id", controller: FarmRefController, action: "one2" },
{ method: "post", route: "/farmref/create", controller: FarmRefController, action: "createFarmRef" },
{ method: "post", route: "/farmref", controller: FarmRefController, action: "save" },
{ method: "delete", route: "/farmref/:id", controller: FarmRefController, action: "remove" },

///
{ method: "post", route: "/farmdefaultref/create", controller: FarmRefController, action: "setDefault" },
{ method: "get", route: "/farmdefaultref/:id", controller: FarmRefController, action: "oneDefault" },
{ method: "get", route: "/farmreferences/:id", controller: FarmRefController, action: "allRefFromFarm" },
// { method: "delete", route: "/farmdefaultref/:id", controller: FarmRefController, action: "remove" },

{ method: "post", route: "/queryreport/:id", controller: queryReportController, action: "createQueryReport" },

];