import {MenuItem} from './MenuItem'
import { useAuth } from '../../../../../app/modules/auth'
import { FaucetUSDC } from '../../../../../app/soroban/faucetUSDC';
import { server, useWallet } from '../../../core';

export function MenuInner() {
  const { logout } = useAuth();
  const { walletConnectKit } = useWallet();
  return (
    <>
      <MenuItem title={"Simulated Pools"} to='/dashboard' />
      <MenuItem title={"On-chain Pools"} to='/onchain-pools' />
      <MenuItem title={"Create Simulated Pool"} to='/create-pool' />
      <MenuItem title={"Create On-chain Pool"} to='/create-onchain-pool' />
      <MenuItem title={"Send 10 USDC"} to='' onClick={() => FaucetUSDC(server,walletConnectKit)} />
      <MenuItem title={"Simulated Wallets"} to='' />
      <MenuItem title={"Logout"} to='' onClick={logout}/>
    </>
  )
}
