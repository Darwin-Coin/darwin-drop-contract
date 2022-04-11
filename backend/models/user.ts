import { AirDropToken, Role } from "@prisma/client";

type User = {
    id : number,
    createdAt : Date,
    wallet : String
    role : Role
    airDrops : [AirDropToken]
}