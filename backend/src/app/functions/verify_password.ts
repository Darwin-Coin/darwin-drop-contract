import { Prisma } from "@prisma/client"
import { context } from "../graphql/context"

export const verifyPassWord = async (password : string, dropId : number) => {

    const passwordProtected = await context.prisma.passwordProtected.findUnique(
        {
            where : {
                dropId : dropId
            }
        }

        
    )


    if(passwordProtected?.passwords.includes(password)) {
        return true;
    } else {
        return false;
    }
}