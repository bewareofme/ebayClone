import React from 'react'
import { useAddress, useDisconnect,useMetamask } from '@thirdweb-dev/react'
import Link from 'next/link';
import {
  ChevronDownIcon,
  BellIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image';
type Props = {}

function Header({}: Props) {
  const address = useAddress();
  const disconnect=useDisconnect();
  const connectWithMetamask=useMetamask();
  return (
    <div className='max-w-6xl mx-auto p-2'>
    <nav className='flex justify-between'>
        <div className='flex items-center space-x-4 text-sm'>
          {address? (
            <button className='connectWalletBtn' onClick={disconnect}>Hi i am {address.slice(0,5)+'...'+address.slice(-4)}</button>
            
        ):(
            <button className='connectWalletBtn' onClick={connectWithMetamask}>Connect Your wallet</button>
        )
        }
        <p className='header-link'>Daily Deals</p>
        <p className='header-link'>Help and contact</p>
        </div>
        <div className='flex items-center space-x-4 text-sm'>
          <p className='header-link'>Ship to</p>
          <p className='header-link'>Sell</p>
          <p className='header-link'>Watchlist</p>

        <Link className='flex items-center hover:link' href="/addItem">
        Add to inventory
        <ChevronDownIcon className='h-4'/>
        </Link>
        <BellIcon className ='h-6 w-6'/>
        <ShoppingCartIcon className='h-6 w-6'/>
        </div>
    </nav>
    <hr className='mt-2' />
    <section className='flex items-center space-x-2 py-5'>
      <div className='w-16 h-16 sm:w-28 md:w-44 cursor-pointer flex-shrink-0'>
        <Link href='/'>
          <Image
          className='w-full h-full object-contain'
          alt="thirdweb logo"
          src="https://links.papareact.com/bdb"
          width={100}
          height={100}
          />
        </Link>
      </div>
      <button className=' hidden lg:flex items-center space-x-2 w-20'>
        <p>
        Shop By Category
        </p>
        <ChevronDownIcon className='h-4 flex-shrink-0'/>
      </button>
        <div className='flex items-center px-2 space-x-2 md:px-5 py-2 border-black border-2 flex-1'>
          <MagnifyingGlassIcon className='w-5 text-gray-400'/>
          <input type="text" placeholder='Search for anything' className='flex-1 outline-none' />
        </div>
        <button className='hidden sm:inline bg-blue-500 text-white px-5 md:px-10 py-2 border-2 border-blue-500 '>Search</button>
        <Link href='/create'>
        <button className='hover:bg-blue-500/50 px-5 md:px-10 py-2  border-blue-500 border-2 hover:text-white'>List Item</button>
        </Link>
    </section>
    <hr />
    <section className='flex py-3 space-x-6 text-xs md:text-sm whitespace-nowrap justify-center px-6'>
    <p className='link '>Home</p>
    <p className='link '>Electronics</p>
    <p className='link '>Computers</p>
    <p className='link hidden sm:inline '>Video Games</p>
    <p className='link hidden sm:inline '>Home and Gardens</p>
    <p className='link hidden md:inline '>Health and Beauty</p>
    <p className='link hidden lg:inline '>Collectibles and Art</p>
    <p className='link hidden lg:inline '>Books</p>
    <p className='link hidden lg:inline'>Music</p>
    <p className='link hidden xl:inline'>Deals</p>
    <p className='link hidden xl:inline'>Other</p>
    <p className='link '>More</p>
    </section>
    </div>
  )
}

export default Header