
import { Avatar, Button, Flex, Heading, Popover, } from '@radix-ui/themes';
import { ISupportedWallet, StellarWalletsKit, WalletType } from '@sekmet/stellar-wallets-kit'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import ConnectWallet from './ConnectWallet';

interface ConnectWalletProp {
    activeWalletKey: string | undefined,
    setActiveWalletKey: React.Dispatch<React.SetStateAction<string | undefined>>,
    walletKit: StellarWalletsKit | undefined
}


export default function Header(prop: ConnectWalletProp) {

    const path = usePathname();

    return (
        <div className='flex justify-between px-5 py-6 items-center bg-slate-100'>
                <div className='flex'>
                    <div>
                        <div className='flex'>
                        <Image src={"https://www.pngall.com/wp-content/uploads/12/Swap-Exchange-PNG-Pic.png"}  alt='Not found' width={40} height={10} className='mr-2' />
                         <h2 className='font-extrabold text-2xl'>RAMM SWAP</h2>
                        </div>
                    </div>
                    <ul className='flex items-center font-bold ml-6'>
                    <Link href={"/"} className='mx-3 hover:text-slate-700'>Pools</Link>
                    <Link href={"/createpool"} className='mx-3 hover:text-slate-700'>Create Pool</Link>
                    {/* <Link href={""} className='mx-3 hover:text-slate-700'>Mint Futurenet USDC</Link> */}
                </ul>
                </div> 
                
                <ConnectWallet activeWalletKey={prop.activeWalletKey} setActiveWalletKey={prop.setActiveWalletKey} walletKit={prop.walletKit}></ConnectWallet>
               

        </div>
    )
}
