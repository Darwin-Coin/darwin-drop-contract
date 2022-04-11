import { AirDropToken, airDropType } from "@prisma/client";

type Mutation = {
    createAirDrop(coinName : String, chainName : String, status : String, startTime : Date, endTime : Date, coinSymbol : String, userId : number, type : airDropType) : AirDropToken
    deleteAirDrop(id : String) : AirDropToken
    updateAirDrop(coinName : String, chainName : String, status : String, startTime : Date, endTime : Date, coinSymbol : String, userId : number, type : airDropType) : AirDropToken

}