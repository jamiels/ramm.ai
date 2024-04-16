import React from 'react'
import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import {useGetTransactions} from '../../../api/pools'
import {useParams} from 'react-router-dom'

const Transactions: FC = () => {
  const {pool_id} = useParams()
  const [showAllTransaction, setShowAllTransaction] = useState(false)

  const {transactions, transactionsLoading} = useGetTransactions(pool_id)

  return (
    <div className={`card card-xxl-stretch mb-5 mb-xl-8`}>
      {/* begin::Header */}
      <div className='card-header border-0 pt-0'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>Transactions</span>
          {transactions.length > 0 && (
            <span className='text-muted mt-1 fw-semibold fs-7'>
              Showing {showAllTransaction ? transactions.length : transactions.slice(0, 25).length}{' '}
              of {transactions.length} transactions
            </span>
          )}
        </h3>
      </div>
      {/* end::Header */}
      {/* begin::Body */}
      <div className='card-body py-0'>
        {/* begin::Table container */}
        <div className='table-responsive'>
          {/* begin::Table */}
          <table className='table table-sm table-row-dashed table-row-gray-300 align-middle gs-0'>
            {/* begin::Table head */}
            <thead>
              <tr className='fw-bold text-muted'>
                <th className='min-w-130px text-nowrap'>Tx Seq ID</th>
                <th className='min-w-130px text-nowrap'>Secondary mode</th>
                <th className='min-w-130px'>Double Prime</th>
                <th className='min-w-130px'>Prime</th>
                <th className='min-w-130px'>Un</th>
                <th className='min-w-130px'>Price</th>
                <th className='min-w-130px'>Primary Price</th>
                <th className='min-w-130px'>Secondary Price</th>
                <th className='min-w-130px'>Bought</th>
                <th className='min-w-130px'>Sold</th>
                <th className='min-w-130px'>Timestamp</th>
                <th className='min-w-130px'>Treasury</th>
              </tr>
            </thead>
            {/* end::Table head */}

            {/* begin::Table body */}
            <tbody>
              {transactionsLoading && (
                <tr>
                  <td colSpan={11} className='text-center py-5'>
                    <span className='indicator-progress mx-auto' style={{display: 'block'}}>
                      Loading...
                      <span className='spinner-border spinner-border-sm align-middle mx-auto'></span>
                    </span>
                  </td>
                </tr>
              )}
              {transactions &&
                transactions
                  .slice(0, showAllTransaction ? transactions.length : 25)
                  .map((el: any, index: number) => (
                    <tr key={index}>
                      <td className='min-w-140px'>{el.tx_seq_id}</td>
                      <td className='min-w-140px text-center'>
                        {el.is_secondary_mode ? (
                          <span className='badge badge-light-success'>True</span>
                        ) : (
                          <span className='badge badge-light-danger'>False</span>
                        )}
                      </td>
                      <td>{el.p_doubleprime}</td>
                      <td>{el.p_prime}</td>
                      <td>{el.p_un}</td>
                      <td>{el.price}</td>
                      <td>{el.price_if_primary}</td>
                      <td>{el.price_if_secondary}</td>
                      <td>{el.rt_bought}</td>
                      <td>{el.rt_sold}</td>
                      <td>{el.timestamp}</td>
                      <td>{el.treasury}</td>
                    </tr>
                  ))}
            </tbody>
            {/* end::Table body */}
          </table>
          {/* end::Table */}
        </div>
        {!showAllTransaction && transactions.length > 25 && (
          <div className='d-flex align-items-center mt-5 w-100'>
            <button
              className='btn btn-sm btn-success mx-auto'
              onClick={() => setShowAllTransaction(true)}
            >
              VIEW ALL TRANSACTIONS
              <KTIcon iconName='arrow-right' className='fs-2 ms-2' />
            </button>
          </div>
        )}
        {/* end::Table container */}
      </div>
      {/* begin::Body */}
    </div>
  )
}

export default Transactions
