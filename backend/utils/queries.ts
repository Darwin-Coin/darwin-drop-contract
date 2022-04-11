import { AirDropToken, User } from "@prisma/client";

type Query = {
    airDrops : [AirDropToken]
    airDrop (id: number): AirDropToken
    users : [User]
    user (id : number): User

}