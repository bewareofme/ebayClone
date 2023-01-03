import React, { FormEvent, useState } from 'react'
import Header from '../components/Header'
import { 
    useAddress,
    useContract,
    MediaRenderer,
    useNetwork,
    useNetworkMismatch,
    useOwnedNFTs,
    useCreateAuctionListing,
    useCreateDirectListing
} from '@thirdweb-dev/react'
import { NFT,NATIVE_TOKENS,NATIVE_TOKEN_ADDRESS } from '@thirdweb-dev/sdk'
import network from '../utils/network'
import Router, { useRouter } from 'next/router'

type Props = {}

function Create({}: Props) {
    const router=useRouter()
    const address=useAddress()
    const {contract}=useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,'marketplace')
    const {contract: collectionContract}=useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,'nft-collection')
    const ownedNFTS=useOwnedNFTs(collectionContract,address)    
    const [selected,setSelected]=useState<NFT>()
    const networkMismatch=useNetworkMismatch();
    const [ , switchNetwork]=useNetwork()
    const {mutate:createDirectListing,isLoading:isLoadingDirect,error:errorDirect}=useCreateDirectListing(contract)
    const {mutate:createAuctionListing,isLoading,error}=useCreateAuctionListing(contract)
    const handleListing= async (e:FormEvent<HTMLFormElement>)=> {
        e.preventDefault()
        if(networkMismatch){
            switchNetwork && switchNetwork(network)
            return;
        }
        if(!selected)return;
        const target=e.target as typeof e.target &{
            elements:{
            listingType:{value:string},
            price:{value:number}
            }
        }
        const {listingType,price}=target.elements
        if(listingType.value==='directListing'){
            createDirectListing({
                assetContractAddress:process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId:selected.metadata.id,
                currencyContractAddress:NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds:60*60*24*7,
                quantity:1,
                buyoutPricePerToken:price.value,
                startTimestamp:new Date()
            },{
                onSuccess(data,variables,context){
                    console.log('SUCESS',data,variables,context)
                    router.push('/')
                },
                onError(error,variables,context){
                    console.log(error,variables,context)
                }
            })
        }
        if(listingType.value==='auction'){
            createAuctionListing({
                assetContractAddress:process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId:selected.metadata.id,
                currencyContractAddress:NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds:60*60*24*7,
                quantity:1,
                buyoutPricePerToken:price.value,
                startTimestamp:new Date(),
                reservePricePerToken:0
            },{
                onSuccess(data,variables,context){
                    console.log('SUCESS auction',data,variables,context)
                    router.push('/')
                },
                onError(error,variables,context){
                    console.log('Error: auction',error,variables,context)
                }
            }
            )
        }
    }
  return (
    <div>
        <Header/>
        <main className='max-w-6xl mx-auto p-10 pt-2'>
            <h1 className='text-4xl font-bold'>List an item</h1>
            <h2 className='text-xl font-semibold pt-5'>Select an item you would like to sell</h2>
            <hr className='mb-5'/>
            <p >Below you will find the NFT's you own in your wallet</p>
            <div className='flex overflow-x-scroll space-x-2 p-4'>
                {ownedNFTS?.data?.map(nft=>(
                    <div key={nft.metadata.id} className={`flex space-y-2 card min-w-fit border-2 bg-gray-100 flex-col ${selected?.metadata.id===nft.metadata.id && `border-black`}`} onClick={()=>
                    {if(selected?.metadata.id===nft.metadata.id){
                        setSelected(undefined);
                        return;
                        }
                        setSelected(nft)}}>
                        <MediaRenderer className='h-48 rounded-lg' src={nft.metadata.image}/>
                        <p className='text-lg truncate'>{nft.metadata.name}</p>
                        <p className='text-xs truncate'>{nft.metadata.description}</p>
                    </div>
                ))}
            </div>
            {selected && (
                <form action="" onSubmit={handleListing}>
                    <div className='flex flex-col p-10'>
                        <div className='grid grid-cols-2 gap-5'>
                            <label htmlFor="" className='border-r font-light whitespace-nowrap'>Direct Listing/Fixed price</label>
                            <input type="radio" name='listingType' value='directListing' />
                            <label htmlFor="" className='border-r font-light'>Auction</label>
                            <input type="radio" name='listingType' value='auction' />
                            <label placeholder='0.05' className='border-r font-light pt-5'>Price</label>
                            <input type="text" className='bg-gray-100 p-5' placeholder='0.05' name='price'/>
                        </div>
                        <button type='submit' className='bg-blue-600 text-white  p-4 mt-8' >List Item</button>
                    </div>
                </form>
            )}
        </main>
    </div>
  )
}

export default Create