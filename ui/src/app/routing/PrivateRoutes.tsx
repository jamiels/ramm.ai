import {FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import PoolsPage from '../modules/pools/PoolsPage'
import PoolDetailPage from '../modules/pools/PoolDetailPage'
import CreatePoolsPage from '../modules/pools/CreatePoolsPage'
import OnChainPoolsTxPage from '../modules/pools/OnChainPoolsTxPage'
import OnChainPoolsPage from '../modules/pools/OnChainPoolsPage'
import CreateOnChainPoolPage from '../modules/pools/CreateOnChainPoolPage'

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route
          path='dashboard'
          element={
            <SuspensedView>
              <PoolsPage />
            </SuspensedView>
          }
        />
        <Route
          path='pools/:pool_id'
          element={
            <SuspensedView>
              <PoolDetailPage />
            </SuspensedView>
          }
        />
        <Route
          path='create-pool'
          element={
            <SuspensedView>
              <CreatePoolsPage />
            </SuspensedView>
          }
        />
        <Route
          path='onchain-pools'
          element={
            <SuspensedView>
              <OnChainPoolsPage />
            </SuspensedView>
          }
        />
        <Route
          path='txns/:pool_id'
          element={
            <SuspensedView>
              <OnChainPoolsTxPage />
            </SuspensedView>
          }
        />
        <Route
          path='create-onchain-pool'
          element={
            <SuspensedView>
              <CreateOnChainPoolPage />
            </SuspensedView>
          }
        />
        {/* Lazy Modules */}

        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
