import { UserCircleIcon } from '@heroicons/react/24/solid'
import { 
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useOffers,
  useMakeOffer,
  useBuyNow,
  useListing
} from '@thirdweb-dev/react'
import { ListingType, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from '@thirdweb-dev/sdk'
import { useRouter } from 'next/router'
import { stringify } from 'querystring'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Countdown from 'react-countdown'
import network from '../../utils/network'
import { ethers } from 'ethers'

type Props = {}

function ListingPage({}: Props) {
    const router=useRouter()
    const {listingId}=router.query as {listingId:string}
    const [bidAmount,setBidAmount]=useState('')
    const networkMismatch=useNetworkMismatch();
    const [ , switchNetwork]=useNetwork()
    const {contract}=useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,'marketplace')
    const {mutate: makeOffer} = useMakeOffer(contract);
    const { data: offers} = useOffers(contract, listingId);
    const { mutate: buyNow} = useBuyNow(contract);
    const { data: listing, isLoading, error } = useListing(contract, listingId);
    const {mutate: makeBid} = useMakeBid(contract);
    const buyNft=async()=>{
      if(networkMismatch){
        switchNetwork && switchNetwork(network)
        return
      }
      if(!contract || !listing ||!listingId)return
      await buyNow({
        id:listingId,
        buyAmount:1,
        type:listing.type
      },{
        onSuccess(data,variables,context){
          alert('nft bought successfully')
          console.log('Success:',data,context,variables)
          router.replace('/')
        },
        onError(error,variables,context){
          alert('nft could not be bought')
          console.log('error',error,variables,context)
        }
      })
    }
    const createBidOrOffer=async()=>{
      try {
        if(networkMismatch){
          switchNetwork && switchNetwork(network)
          return
        }
        // direct listing
        if(listing?.type===ListingType.Direct){
          if(listing.buyoutPrice.toString()===ethers.utils.parseEther(bidAmount).toString()){
            console.log("Buyout Price met, buying nft");
            buyNft();
            return
          }
          console.log("buyout price not met,making an offer")
          
           makeOffer({
            quantity:1,listingId,pricePerToken:bidAmount
          },{
            onSuccess(data,variables,context){
              console.log("offer made succesfully",data,variables,context)
              setBidAmount('')
            },
              onError(error,variables,context){
                console.log("error Offer could not be made",variables,error,context)
              }
            })}

        // auction listing
        if(listing?.type===ListingType.Auction){
          console.log("making bid...");
          await makeBid({
            bid:bidAmount,
            listingId:listingId
          },{
            onSuccess(data,variables,context){
              alert("bid make succesfully")
              console.log("Success",data,variables,context)
              setBidAmount('')
            },onError(error, variables, context) {
              alert("bid could not be made")
              console.log("Error bid unsuccesful",error,variables,context)
            },
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    const [minimumNextBid,setMinimumNextBid]=useState<{
      displayValue:string,
      symbol:string
    }>()
    const formatPlaceholder=()=>{
      if(!listing)return
      if (listing.type===ListingType.Direct){
        return "Enter an offer amount"
      }
      if (listing.type===ListingType.Auction){
        return Number(minimumNextBid?.displayValue) === 0 ?"Enter bid amount" :
        `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`
      }
      // Todo Improve bid amount
    }
    useEffect(()=>{
      if(!listingId ||!contract ||!listing)return

      if(listing.type===ListingType.Auction){
        fetchMinNextBid()
      }
    },[listingId,contract,listing])

    const fetchMinNextBid=async()=>{
      if(!listingId||!contract)return
      const {displayValue,symbol}=await contract.auction.getMinimumNextBid(listingId)
      setMinimumNextBid({
        displayValue:displayValue,
        symbol:symbol
      })
    }

    if(isLoading){
      return(
        <div>
          <Header/>
            <div>
              <p className='text-center animate-pulse text-blue-500'>
                Loading...
              </p>
           </div>
        </div>
      )
    }
    if(!listing){
      return <div>Listing not found</div>
    }
  return (
    <div>
        <Header/>
        <main className='max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10'>
          <div className='p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl'>
            <MediaRenderer src={listing?.asset.image}/>
          </div>
          <section className='flex-1 space-y-5 pb-20 lg:pb-0'>
            <div className=''>
              <h1 className='text-xl font-bold'>{listing.asset.name}</h1>
              <p className='text-gray-600'>{listing.asset.description}</p>
              <p className='flex items-center text-xs sm:text-base'>
                <UserCircleIcon className='h-5'/>
                <span className='font-bold pr-1'>Seller:</span>
                {listing.sellerAddress}
              </p>
            </div>
            <div className='grid grid-cols-2 items-center py-2'>
              <p className='font-bold'>Listing Type:</p>
              <p>{listing.type===ListingType.Direct
              ?"Direct Listing"
              :"Auction Lisiting"
              }
              </p>
              <p className='font-bold'>Buy it now price:</p>
              <p className='text-4xl font-bold whitespace-nowrap'>{listing.buyoutCurrencyValuePerToken.displayValue} {listing.buyoutCurrencyValuePerToken.symbol}
              </p>
              <button onClick={buyNft} className='col-start-2 bg-blue-600 rounded-full text-white font-bold w-44 py-4 px-10 mt-2'>Buy now</button>
            </div>
            {/* Direct shows offer here */}
            {(listing.type===ListingType.Direct)&& offers &&(
              <div className='grid grid-cols-2 gap-y-2'>
                <p className='font-bold'>Offers: </p>
                <p>{offers.length>0?offers.length:0}</p>
                {offers.map((offer)=>(
                  <>
                  <p>
                    <UserCircleIcon className='h-3 mr-2'/>
                    {offer.offeror.slice(0,5)+'...'+offer.offeror.slice(-5)}
                  </p>
                  <div>
                    <p>
                      {ethers.utils.formatEther(offer.totalOfferAmount)}{""}
                      {NATIVE_TOKENS[network].symbol}
                    </p>
                  </div>
                  </>
                ))}
              </div>
            )
            }
            <div className='grid grid-cols-2 space-y-2 items-center justify-end'>
              <hr className='col-span-2'/>
                <p className='col-span-2 font-bold'>{listing.type===ListingType.Direct
                ?"Make and Offer"
                :"Bid on this auction"}
                </p>
                {/* Remaining Time on auction goes here */}
                {listing.type===ListingType.Auction && (
                  <>
                    <p>Current Minimum bid</p>
                    <p>{minimumNextBid?.displayValue} {minimumNextBid?.symbol}</p>
                    <p>Minimum Bid</p>
                    <Countdown date={Number(listing.endTimeInEpochSeconds.toString())*1000}/>
                  </>
                )}
                <input className='border p-2 rounded-lg mr-5' type="text" placeholder={formatPlaceholder()} onChange={e=>setBidAmount(e.target.value)} />
                <button onClick={createBidOrOffer} className='bg-red-600 py-4 px-10 rounded-full text-white font-bold w-44'>{listing.type===ListingType.Direct
                ?"Offer"
                :"Bid"
                }
                </button>
            </div>
          </section>
        </main>
    </div>
  )
}

export default ListingPage