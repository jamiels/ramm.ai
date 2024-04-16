import React, {FC, useEffect, useState} from 'react'
import {server, useWallet} from '../../../_metronic/layout/core'
import {KTIcon, useRouter} from '../../../_metronic/helpers'
import {getAllPools} from '../../soroban/getAllPools'
import {Link} from 'react-router-dom'
import {getBalance} from '../../soroban/getBalance'
import {getBuyPrice} from '../../soroban/getBuyPrice'
import {getSellPrice} from '../../soroban/getSellPrice'
import {Modal} from 'react-bootstrap'
import {buyPVTTOken} from '../../soroban/buyPVTToken'
import {sellPVTToken} from '../../soroban/sellPVTToken'
import {toast} from 'react-toastify'
import {startPool} from '../../soroban/startPool'
import {stopPool} from '../../soroban/stopPool'
import {expandPool} from '../../soroban/expandPool'
import {withdrawPoolFund} from '../../soroban/withdrawFund'
import {archivePool} from '../../soroban/archivePool'
import {unarchivePool} from '../../soroban/unarchivePool'

interface tableRowProps {
  index: number
  pool_name: string
  pool_id: string
  pool_owner: string
  pool_address: string
  primary_max_qty: number
  secondary_max_qty: number
  primary_max_price: number
  secondary_max_price: number
  initial_price: number
  primary_steepness: number
  secondary_steepness: number
  treasury: number
  pvttokens: number
  pool_status: number
  archived: boolean
}

export interface Root {
  [key: string]: RammPool0
}

export interface RammPool0 {
  c_primary_steepness: string
  owner: string
  pool_address: string
  pool_id: string
  pool_name: string
  pvt_price_initial_primary: number
  pvt_price_max_primary: number
  pvt_price_max_secondary: number
  pvt_qty_max_primary: number
  pvt_qty_max_secondary: number
  treasury: number
  x: string
  pool_status: number
  archived: boolean
}

const OnChainPoolsPage = () => {
  const {activePubkey, setActivePubKey, walletConnectKit} = useWallet()

  const [pools, setPools] = useState<Root | {}>()

  const [buyPrice, setBuyPrice] = useState(0)
  const [sellPrice, setSellPrice] = useState(0)
  const [buyOrSell, setBuyOrSell] = useState(true)
  const [inSecondaryMode, setInSecondaryMode] = useState(false)
  const [openModel, setOpenModel] = useState(false)
  const [poolID, setPoolID] = useState<string | undefined>(undefined)
  const [usdcBalance, setUSDCBalance] = useState(0)
  const [pvtBalance, setPVTBalance] = useState(0)

  const router = useRouter()

  async function getAvailablePools() {
    if (walletConnectKit) {
      await getAllPools(server, walletConnectKit)
        .then((e) => {
          if (e != undefined) {
            setPools(e)
          }
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }

  async function PoolBalance(poolId: string) {
    await getBalance(server, walletConnectKit, poolId)
      .then((e) => {
        console.log(e)
        setUSDCBalance(parseInt(e[0]) / 10 ** 9)
        setPVTBalance(parseInt(e[1]) / 10 ** 9)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  async function InitBuy(pool_id: string) {
    await PoolBalance(pool_id)

    await getBuyPrice(server, walletConnectKit, pool_id)
      .then((e) => {
        setBuyPrice(parseInt(e.toString()) / 10 ** 9)
        setPoolID(pool_id)
        setBuyOrSell(true)
        setOpenModel(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  async function InitSell(pool_id: string) {
    await PoolBalance(pool_id)

    await getSellPrice(server, walletConnectKit, pool_id)
      .then((e) => {
        setSellPrice(parseInt(e[1]) / 10 ** 9)
        setInSecondaryMode(e[0].toString() == 'false' ? false : true)
        setPoolID(pool_id)
        setBuyOrSell(false)
        setOpenModel(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  async function SellPVTTOken(poolId: string) {
    await sellPVTToken(server, walletConnectKit, poolId)
      .then((e) => {
        setOpenModel(false)
        toast.success(`Token sold successfully`)
        getAvailablePools()
      })
      .catch((e) => {
        setOpenModel(false)
        toast.error(`Pool not in secondary mode`)
      })
  }

  async function BuyPVTTOken(poolId: string) {
    await buyPVTTOken(server, walletConnectKit, poolId)
      .then((e) => {
        setOpenModel(false)
        toast.success(`Token bought successfully`)
        getAvailablePools()
      })
      .catch((e) => {
        setOpenModel(false)
        toast.error(`Please check balance`)
      })
  }

  async function StartPool(poolId: string) {
    await startPool(server, walletConnectKit, poolId)
      .then((e) => {
        toast.success(`Pool started`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Something went wrong`)
      })
  }

  async function StopPool(poolId: string) {
    await stopPool(server, walletConnectKit, poolId)
      .then((e) => {
        toast.success(`Pool stop`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Something went wrong`)
      })
  }

  async function ArchivePool(poolId: string) {
    await archivePool(server, walletConnectKit, poolId)
      .then((e) => {
        toast.success(`Pool successfully archive`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Something went wrong`)
      })
  }

  async function UnarchivePool(poolId: string) {
    await unarchivePool(server, walletConnectKit, poolId)
      .then((e) => {
        toast.success(`Pool successfully unarchive`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Something went wrong`)
      })
  }

  async function ExpandPool(poolId: string, amount: number) {
    await expandPool(server, walletConnectKit, poolId, amount)
      .then((e) => {
        toast.success(`Pool expanded by ${amount}`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Quantity exceeding secondary capacity`)
      })
  }

  async function WithdrawFund(poolId: string) {
    await withdrawPoolFund(server, walletConnectKit, poolId)
      .then((e) => {
        toast.success(`Successfully withdraw pool fund`)
        getAvailablePools()
      })
      .catch((e) => {
        toast.error(`Something went wrong`)
      })
  }

  useEffect(() => {
    getAvailablePools()
  }, [])

  function TableRow(props: tableRowProps) {
    // let pvtBalance = PoolBalance(props.pool_id.toString()).then((e)=>{return e[1]});

    return (
      <>
        <tr className='bg-white border-dashed border-b hover:bg-gray-50'>
          <td scope='row' className='px-6 py-4 font-medium  whitespace-nowrap '>
            {props.index}
          </td>
          <td>{props.pool_name}</td>
          <td>{(Number(props.primary_max_qty) / 10 ** 9).toString()}</td>
          <td>{(Number(props.secondary_max_qty) / 10 ** 9).toString()}</td>
          <td>{(Number(props.primary_max_price) / 10 ** 9).toString()}</td>
          <td>{(Number(props.secondary_max_price) / 10 ** 9).toString()}</td>
          <td>{(Number(props.initial_price) / 10 ** 9).toString()}</td>
          <td>{props.primary_steepness.toString()}</td>
          <td>{props.secondary_steepness.toString()}</td>
          <td>{(Number(props.pvttokens) / 10 ** 9).toString()}</td>
          <td>{(Number(props.treasury) / 10 ** 9).toString()}</td>
          <td className='text-end'>
            <div className='dropdown'>
              <button
                className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary'
                type='button'
                id='dropdownMenuButton1'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <KTIcon iconName='bi bi-three-dots' className='fs-2' />
              </button>
              <div
                className='dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold w-200px'
                aria-labelledby='dropdownMenuButton1'
              >
                <div className='menu-item px-3'>
                  <Link to={`/txns/${props?.pool_address}`} className='menu-link'>
                    Transactions
                  </Link>
                </div>
                <div className='menu-item px-3'>
                  <span
                    className='menu-link'
                    onClick={() => {
                      InitBuy(props.pool_id.toString())
                    }}
                  >
                    Buy
                  </span>
                </div>
                <div className='menu-item px-3'>
                  <span
                    className='menu-link'
                    onClick={() => {
                      InitSell(props.pool_id.toString())
                    }}
                  >
                    Sells
                  </span>
                </div>

                {props.pool_status == 0 && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        StartPool(props.pool_id.toString())
                      }}
                    >
                      Start Pool
                    </span>
                  </div>
                )}

                {props.pool_status == 1 && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        StopPool(props.pool_id.toString())
                      }}
                    >
                      Stop Pool
                    </span>
                  </div>
                )}

                {!props.archived && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        ArchivePool(props.pool_id.toString())
                      }}
                    >
                      Archive
                    </span>
                  </div>
                )}

                {props.archived && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        UnarchivePool(props.pool_id.toString())
                      }}
                    >
                      Unarchive
                    </span>
                  </div>
                )}
                {props.pool_status == 1 && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        ExpandPool(props.pool_id.toString(), 100)
                      }}
                    >
                      Expand by 100
                    </span>
                  </div>
                )}
                {props.pool_status == 1 && activePubkey == props.pool_owner && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        ExpandPool(props.pool_id.toString(), 500)
                      }}
                    >
                      Expand by 500
                    </span>
                  </div>
                )}

                {props.pool_status == 2 && activePubkey == props.pool_owner && props.treasury != 0 && (
                  <div className='menu-item px-3'>
                    <span
                      className='menu-link'
                      onClick={() => {
                        WithdrawFund(props.pool_id.toString())
                      }}
                    >
                      Withdraw Fund
                    </span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      </>
    )
  }

  const BuySellModal = () => {
    return (
      <Modal
        id='kt_modal_create_app'
        tabIndex={-1}
        aria-hidden='true'
        dialogClassName='modal-dialog'
        show={openModel}
        onHide={() => setOpenModel(!openModel)}
        backdrop={true}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h2>{buyOrSell ? 'Buy' : 'Sell'}</h2>
            {/* begin::Close */}
            <div
              className='btn btn-sm btn-icon btn-active-color-primary'
              onClick={() => setOpenModel(!openModel)}
            >
              <KTIcon className='fs-1' iconName='cross' />
            </div>
            {/* end::Close */}
          </div>
          <div className='modal-body py-lg-10 px-lg-10'>
            <div className='fv-row mb-10'>
              <p>{buyOrSell ? <>{buyPrice} USDC ≈ 1 PVT</> : <>1 PVT ≈ {sellPrice} USDC</>}</p>
            </div>

            <div className='fv-row mb-10'>
              <input
                type='number'
                className='form-control form-control-lg form-control-solid'
                disabled={true}
                value={buyOrSell ? buyPrice : sellPrice}
              />
            </div>

            <div className='fv-row mb-0'>
              <p>PVT Balance : {pvtBalance}</p>
              <p>USDC Balance : {usdcBalance}</p>
            </div>
          </div>
          <div className='modal-footer'>
            {buyOrSell ? (
              usdcBalance >= buyPrice ? (
                <button
                  onClick={() => {
                    poolID && BuyPVTTOken(poolID)
                  }}
                  className='btn btn-dark btn-block w-100'
                >
                  Buy
                </button>
              ) : (
                <button className='btn btn-dark disabled btn-block w-100' disabled={true}>
                  Insufficient Balance
                </button>
              )
            ) : inSecondaryMode ? (
              pvtBalance >= 1 ? (
                <button
                  onClick={() => {
                    poolID && SellPVTTOken(poolID)
                  }}
                  className='btn btn-dark btn-block w-100'
                >
                  Sell
                </button>
              ) : (
                <button className='btn btn-dark disabled btn-block w-100' disabled={true}>
                  Insufficient Balance
                </button>
              )
            ) : (
              <button className='btn btn-dark disabled btn-block w-100' disabled={true}>
                NOT IN SECONDARY MODE
              </button>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className='row gy-5 gx-xl-8'>
      <div className='col-xl-12'>
        <div className={`card card-xxl-stretch mb-5 mb-xl-8`}>
          {/* begin::Header */}
          <div className='card-header border-0 pt-5'>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>On-chain Pools</span>
            </h3>
          </div>

          <div className='card-body py-3'>
            <div className='table-responsive'>
              <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                <thead>
                  <tr className='fw-bold text-muted'>
                    <th className='min-w-130px'>Index</th>
                    <th className='min-w-130px'>Pool Name</th>
                    <th className='min-w-130px'>Primary Max Qty</th>
                    <th className='min-w-130px'>Secondary Max Qty</th>
                    <th className='min-w-130px'>Primary Max Price</th>
                    <th className='min-w-130px'>Secondary Max Price</th>
                    <th className='min-w-130px'>Initial Price</th>
                    <th className='min-w-130px'>Primary Steepness</th>
                    <th className='min-w-130px'>Secondary Steepness</th>
                    <th className='min-w-130px'>PVT Tokens</th>
                    <th className='min-w-130px'>Treasury</th>
                    <th className='min-w-130px'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pools == undefined ? (
                    <tr className=''>
                      <td colSpan={12} className='text-center ml-auto mr-auto'>
                        <span className='indicator-progress' style={{display: 'block'}}>
                          Please wait...{' '}
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </td>
                    </tr>
                  ) : (
                    Object.entries(pools).map((value, index) => {
                      return (
                        <TableRow
                          key={index + 1}
                          index={index + 1}
                          pool_address={value[1]['pool_address']}
                          pool_id={value[1]['pool_id']}
                          pool_name={value[1]['pool_name']}
                          pool_owner={value[1]['owner']}
                          primary_max_qty={value[1]['pvt_qty_max_primary']}
                          secondary_max_qty={value[1]['pvt_qty_max_secondary']}
                          primary_max_price={value[1]['pvt_price_max_primary']}
                          secondary_max_price={value[1]['pvt_price_max_secondary']}
                          initial_price={value[1]['pvt_price_initial_primary']}
                          primary_steepness={parseInt(value[1]['c_primary_steepness'])}
                          secondary_steepness={parseInt(value[1]['c_primary_steepness'])}
                          treasury={value[1]['treasury']}
                          pvttokens={parseInt(value[1]['x'])}
                          pool_status={value[1]['pool_status']}
                          archived={value[1]['archived']}
                        />
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <BuySellModal />
    </div>
  )
}

export default OnChainPoolsPage
