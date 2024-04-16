'use client'
import {ISupportedWallet, StellarWalletsKit, WalletNetwork, WalletType} from '@sekmet/stellar-wallets-kit'
import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  createContext,
  ReactNode,
  useContext,
} from 'react'

import {SorobanRpc} from '@stellar/stellar-sdk'
import {getNetwork} from '@stellar/freighter-api'
import globalConfig from '../../../config'
import {toast} from 'react-toastify'

const {Server} = SorobanRpc

type ContextType = {
  activePubkey: string | undefined
  setActivePubKey: Dispatch<SetStateAction<string | undefined>>
  walletConnectKit: StellarWalletsKit | undefined,
  connectWallet: () => void,
}

const DefaultContextData: ContextType = {
  activePubkey: undefined,
  setActivePubKey: (): string => '',
  walletConnectKit: undefined,
  connectWallet: () => {},
}

export const server = new Server(globalConfig.TESTNET_DETAILS.networkUrl, {allowHttp: true})

const WalletContext = createContext<ContextType>(DefaultContextData)

type PropsWithOptionalChildren<P = unknown> = P & {children?: ReactNode}

export default function WalletProvider(props: PropsWithOptionalChildren) {
  const {children} = props
  const [walletConnectKit] = useState(
    new StellarWalletsKit({
      network: globalConfig.TESTNET_DETAILS.networkPassphrase as unknown as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    })
  )

  const [activePubkey, setActivePubKey] = useState<string | undefined>(undefined)

  useEffect(() => {
    get_wallet_pubkey()
  }, [activePubkey])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function get_wallet_pubkey() {
    let network = await getNetwork()
    if (
      network == globalConfig.TESTNET_DETAILS.SUPPORTED_NETWORK1 ||
      network == globalConfig.TESTNET_DETAILS.SUPPORTED_NETWORK2
    ) {
      if (walletConnectKit) {
        const key = await walletConnectKit.getPublicKey()
        if (key != undefined) {
          setActivePubKey(key)
        }
      }
    } else {
      toast('You are connected to TESTNET switch to FUTURENET')
    }
  }

  async function connectWallet() {

    if (walletConnectKit != undefined) {

        let d = await walletConnectKit.getSessions();

        console.log(d);

        await walletConnectKit.openModal({

            modalTitle: "Connect Wallet",
            allowedWallets: [
                WalletType.FREIGHTER,
            ],
            onWalletSelected: async (option: ISupportedWallet) => {
                try {
                    console.log(option);
                    // Set selected wallet,  network, and public key
                    await walletConnectKit.setWallet(option.type);

                    const publicKey = await walletConnectKit.getPublicKey();

                    setActivePubKey(publicKey.toString());

                } catch (error) {
                    console.log(error);

                }
            },
        });

    }

}

  return (
    <WalletContext.Provider value={{activePubkey, setActivePubKey, walletConnectKit, connectWallet}}>
      {children}
    </WalletContext.Provider>
  )
}

export {WalletContext, WalletProvider}

export function useWallet() {
  return useContext(WalletContext)
}
