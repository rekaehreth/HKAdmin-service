import React from 'react';
import { isConstructorTypeNode } from 'typescript';
import { UserConnector } from '../../entities/User/UserConnector';

const Connector = UserConnector;

function Korte( param : string ) : string {
    Connector.getUser(1);
    return param ? param : "Kortefa";
}

function Alma( props : any ) {
    return (
        <div className="Alma">
        Almafa { Korte(props.valami) }
        
    </div>
  );
}

export default Alma;
