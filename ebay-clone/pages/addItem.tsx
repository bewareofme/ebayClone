import React,{useState,FormEvent} from 'react'
import Header from '../components/Header'
import { useAddress, useContract } from '@thirdweb-dev/react'
import { useRouter } from 'next/router';

type Props = {}

function addItem({}: Props) {
    const address =useAddress();
    const {contract}=useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,'nft-collection')
    const [preview,setPreview] =useState<string>();
    const [image,setImage]= useState<File>();
    const router=useRouter()
    
    const mintNft= async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!contract || !address) return
        if(!image){
            alert('please select an image')
            return
        }
        const target=e.target as typeof e.target & {
            name:{value:string}
            description:{value:string}
        }
        const metadata={
            name:target.name.value,
            description:target.description.value,
            image:image
        }
        try {
            const tx=contract.mintTo(address,metadata)
            const receipt=(await tx).receipt
            const tokenId=(await tx).id
            const nft=(await tx).data();
            console.log(receipt,tokenId,nft)
            router.push('/')

        } catch (error) {
            console.error(error)
        }
    }


  return (
    <div>
    <Header/>
    <main className='max-w-6xl mx-auto p-10 border'>
        <h1 className='text-4xl font-bold'>Add an item to the marketplace</h1>
        <h2 className='text-xl font-semibold pt-5'>Item Details</h2>
        <p>By adding an item to the marketplace you are essentially minting an nft,which we can then use to list for sale</p>
        <div className='flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-10'>
            <img className='border h-80 w-80 object-contain ' src={preview ||"https://links.papareact.com/ucj"} alt="" />
            <form action="" onSubmit={mintNft} className='flex flex-col flex-1 p-2 space-y-2'>
                <label className='font-light' htmlFor="">Name of Item</label>
                <input className='formfield' type="text" placeholder='Name of your item...' name='name' id='name'/>
                <label className='font-light' htmlFor="">Description</label>
                <input className='formfield' placeholder='Enter Description' type="text" name='description' id='description' />
                <label className='font-light' htmlFor="">Image of the item</label>
                <input type="file" onChange={e=>{
                    if (e.target.files?.[0]){
                        setPreview(URL.createObjectURL(e.target.files[0]))
                        setImage(e.target.files[0])
                    }
                }} /> 
                <button type='submit' className='bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 mt-5 md:mt-auto mx-auto md:ml-auto'>Add/Mint Item</button>
            </form>
        </div>
    </main>
    </div>
  )
}

export default addItem