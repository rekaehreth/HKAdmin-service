import axios from "axios";
import { Constants } from "../../utils/constants";
import { User } from "./User"

export const UserConnector = 
{
    getUser : async (userId : number) : Promise<any> => { 
        console.log( Constants.HOST_URL + `/user/${userId}` );
        axios.get( Constants.HOST_URL + `/user/${userId}`, { headers : Constants.DEFAUT_HEADERS } ).then( response => {
            console.log(response);
        } ).catch( error => {
            console.log(error);
        } );
        
        return undefined; 
    }
}

