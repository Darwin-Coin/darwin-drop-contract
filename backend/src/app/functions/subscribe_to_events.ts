import Web3 from 'web3';
import NotDrop from '../contracts/NotDrop.json'
import { AbiItem } from 'web3-utils'

import {context} from '../graphql/context'

let window: any;
let web3 : Web3

let webUrl : any;

export const  setWebUrl = (url : any) =>  {
    webUrl = url
}



web3 = new Web3(webUrl);

window.ethereum.enable();


const myContract = new web3.eth.Contract(
    NotDrop.abi as AbiItem[], ''
);

myContract.events.AirDropTokenCreated({})
.on('data', async function(event : any){
    console.log(event.returnValues);

    let coinName = event.returnValues.airdrop.name;
    let chainName = event.returnValues.airdrop.name;
    let coinSymbol = event.returnValues.airdrop.name;
    let type = event.returnValues.airdrop.type;
    let requirementType = event.returnValues.airdrop.requirementType;
    let startTime = event.returnValues.airdrop.startTime;
    let endTime = event.returnValues.airdrop.endTime;
    let maxNumber = event.returnValues.airdrop.maxNumber;
    let status = event.returnValues.airdrop.status;
    let ownerWallet = event.returnValues.msg.sender;
    let chainId = event.returnValuses.chainId;
    let dropdetailsId = event.returnValuses.dropDetailsId;
    let dropId = event.returnvalues.dropId;


    await context.prisma.dropDetails.update({
        where : {
            id : dropdetailsId
        }, 
        data : {
            dropId : dropId
        }
    })
    
    
    
    


    await context.prisma.airDropToken.create({
        data : {
                    coinName,
                    chainName,
                    chainId,
                    ownerWallet,
                    coinSymbol,
                    type,
                    requirementType,
                    status,
                    startTime,
                    endTime,
                    maxNumber 
        }
    })
    
})
.on('error', console.error);


myContract.events.TokenCancelled({})
.on('data', async function(event : any){

    
    console.log(event.returnValues);

    let id = event.returnValues.id;

    await context.prisma.airDropToken.update({
        where : {
            id : id
        }, 
        data : {
            status : {
                set : 'Cancelled'
            }
        }
    })

}).on('error', console.error);              



