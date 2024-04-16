/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import Transactions from './components/Transactions'
import CurveChart from './components/CurveChart'
import { PageTitle } from '../../../_metronic/layout/core'

const PoolDetailPage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Pool Detail</PageTitle>

      {/* begin::Row */}
      <div className='row gy-5 gx-xl-8'>
        <div className='col-xl-4'>
          <CurveChart type='price-curve' title='Price Curve' />
        </div>

        <div className='col-xl-4'>
          <CurveChart type='treasury-curve' title='Treasury Curve' />
        </div>

        <div className='col-xl-4'>
          <CurveChart type='bonding-curve' title='Bonding Curve' />
        </div>

        <div className='col-xl-12'>
          <Transactions />
        </div>
      </div>
      {/* end::Row */}
    </>
  )
}

export default PoolDetailPage
