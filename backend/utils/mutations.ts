import { AirDropToken, airDropType, User } from "@prisma/client";


type Mutation = {
    createAirDrop(coinName : String, chainName : String, status : String, startTime : Date, endTime : Date, coinSymbol : String, userId : number, type : airDropType) : AirDropToken
    deleteAirDrop(id : String) : AirDropToken
    createUser(wallet : String) : User
    
}