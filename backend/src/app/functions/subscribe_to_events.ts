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

    let coinName = event.returnValues.AirDropToken.name;
    let chainName = event.returnValues.AirDropToken.name;
    let coinSymbol = event.returnValues.AirDropToken.name;
    let type = event.returnValues.AirDropToken.type;
    let requirementType = event.returnValues.AirDropToken.requirementType;
    let startTime = event.returnValues.AirDropToken.startTime;
    let endTime = event.returnValues.AirDropToken.endTime;
    let maxNumber = event.returnValues.AirDropToken.maxNumber;
    let status = event.returnValues.AirDropToken.status;
    let wallet = event.returnValues.creatorAddress;


    let User = context.prisma.user.findUnique({
        where : wallet
    })
    
    
    
    


    await context.prisma.airDropToken.create({
        data : {
           coinName,
                    chainName,
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



