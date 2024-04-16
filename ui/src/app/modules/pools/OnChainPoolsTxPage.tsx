import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {scValToNative, xdr} from 'soroban-client'
import {Network} from '../../soroban/default_data'
import {getEvents} from '../../soroban/getEvents'
import {KTIcon} from '../../../_metronic/helpers'

const OnChainPoolsTxPage = () => {
  const [latestLedger, setLatestLedger] = useState<number | undefined>()
  const [poolTransactions, setPoolTransactions] = useState<[] | undefined>(undefined)

  const {pool_id} = useParams()

  useEffect(() => {
    getLatestLedger()
    getPoolLedgers(pool_id)
  }, [pool_id, latestLedger])

  const getLatestLedger = async () => {
    let requestBody = {
      jsonrpc: '2.0',
      id: 8675309,
      method: 'getLatestLedger',
    }
    let res = await fetch(`${Network}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    let json = await res.json()
    setLatestLedger(json?.result?.sequence)
  }

  const getPoolLedgers = async (poolId: string | undefined) => {
    if (latestLedger != undefined) {
      let data = await getEvents(latestLedger - 16500, poolId)
      if (!data?.message) {
        setPoolTransactions(data)
      } else {
        console.log(data?.message)
      }
    }
  }

  return (
    <div className='row gy-5 gx-xl-8'>
      <div className='col-xl-12'>
        <div className={`card card-xxl-stretch mb-5 mb-xl-8`}>
          {/* begin::Header */}
          <div className='card-header border-0 pt-5'>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>On-chain Pool Transactions</span>
            </h3>
          </div>
          {/* end::Header */}
          {/* begin::Body */}
          <div className='card-body py-3'>
            <div className='table-responsive'>
              {/* begin::Table */}
              <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                {/* begin::Table head */}
                <thead>
                  <tr className='fw-bold text-muted'>
                    <th className='min-w-130px'>Ledger</th>
                    <th className='min-w-130px'>Type</th>
                    <th className='min-w-130px'>User Address</th>
                    <th className='min-w-130px'>In Secondary Mode</th>
                    <th className='min-w-130px'>Current X</th>
                    <th className='min-w-130px'>Price</th>
                    <th className='min-w-130px'>Ledger Close Time</th>
                    <th className='min-w-130px'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {poolTransactions == undefined ? (
                    <tr className=''>
                      <td colSpan={8} className='text-center ml-auto mr-auto'>
                        <span className='indicator-progress' style={{display: 'block'}}>
                          Please wait...{' '}
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </td>
                    </tr>
                  ) : poolTransactions.length == 0 ? (
                    <tr className=''>
                      <td colSpan={8} className='text-center ml-auto mr-auto'>
                        <p className='font-bold py-5 text-center flex items-center justify-center'>
                          Transaction Data Not Found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    poolTransactions.map((e, index) => {
                      return <TableRow key={index} props={e} />
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TableRow(props: any) {
  return (
    <>
      <tr className=' bg-white border-dashed border-b hover:bg-gray-50'>
        <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap '>
          {props?.props?.ledger}
        </th>
        <td className='px-6 py-4'>
          {scValToNative(xdr.ScVal.fromXDR(props?.props?.topic[0], 'base64')).substring(4)}
        </td>
        <td className='px-6 py-4'>
          {shortenString(scValToNative(xdr.ScVal.fromXDR(props?.props?.topic[1], 'base64')))}
        </td>
        <td className='px-6 py-4'>
          {scValToNative(xdr.ScVal.fromXDR(props?.props?.topic[2], 'base64')).toString()}
        </td>
        <td className='px-6 py-4'>
          {Number(scValToNative(xdr.ScVal.fromXDR(props?.props?.topic[3], 'base64'))).toString()}
        </td>
        <td className='px-6 py-4'>
          {parseInt(
            scValToNative(xdr.ScVal.fromXDR(props?.props?.value, 'base64')).toString().split(',')[0]
          ) /
            10 ** 9}
        </td>
        <td className='px-6 py-4'>{props?.props?.ledgerClosedAt.replace(/T/g, '  ')}</td>
        <td className='px-6 py-4 flex items-center'>
          <a target='_blank' href={`https://futurenet.steexp.com/ledger/${props?.props?.ledger}`}>
            <KTIcon className='fs-1' iconName='exit-right-corner' />
          </a>
        </td>
      </tr>
    </>
  )
}

const shortenString = (str: string) => {
  if (str.length > 25) {
    return str.substring(0, 30) + '...'
  } else {
    return str
  }
}

export default OnChainPoolsTxPage
