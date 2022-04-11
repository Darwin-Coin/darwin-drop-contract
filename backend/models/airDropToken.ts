import { airDropType, User } from "@prisma/client";

type AirDropToken = {
    user : User
    coinName : String
    chainName : String
    createdAt : Date
    userId : number
    status : String
    endTime : Date
    coinSymbol : String
    type : airDropType
}