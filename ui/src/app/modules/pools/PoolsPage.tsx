/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, SetStateAction, useEffect, useState} from 'react'
import {KTIcon, useRouter} from '../../../_metronic/helpers'
import {getExpandPoolsList, getPoolsList, getTransactions, useGetPoolsList} from '../../api/pools'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SimulateModal from './components/SimulateModal'

type DropdownPropsType = {
  pool_id: string
  name: string
  refreshPools: Function
  handleSimulate: Function
}
const Dropdown: FC<DropdownPropsType> = ({pool_id, name, refreshPools, handleSimulate}) => {
  const handleClickExpand = async (amount: number) => {
    await getExpandPoolsList(pool_id, amount)
    refreshPools()
    toast(`Expand pools by ${amount} success!`, {type: 'success'})
  }

  const headers = [
    {label: 'Tx Seq ID', key: 'tx_seq_id'},
    {label: 'Secondary mode', key: 'is_secondary_mode'},
    {label: 'Double Prime', key: 'p_doubleprime'},
    {label: 'Prime', key: 'p_prime'},
    {label: 'Un', key: 'p_un'},
    {label: 'Price', key: 'price'},
    {label: 'Primary Price', key: 'price_if_primary'},
    {label: 'Secondary Price', key: 'Price_if_secondary'},
    {label: 'Bought', key: 'rt_bought'},
    {label: 'Sold', key: 'rt_sold'},
    {label: 'Timestamp', key: 'timestamp'},
    {label: 'Treasury', key: 'treasury'},
  ]

  const convertJsonToCsv = (items: any[]) => {
    const headerRow = headers.map((header) => header.label)
    const csvRows = items.map((item) => headers.map((header) => item[header.key]).join(','))
    const csv = [headerRow.join(','), ...csvRows].join('\n')
    return csv
  }

  const handleDownload = async () => {
    const data = await getTransactions(pool_id)
    const csv = convertJsonToCsv(data)
    const blob = new Blob([csv], {type: 'text/csv'})
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}_transaction.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold w-200px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <span className='menu-link px-3' onClick={() => handleClickExpand(100)}>
          Expand By 100
        </span>
      </div>

      <div className='menu-item px-3'>
        <span className='menu-link px-3' onClick={() => handleClickExpand(500)}>
          Expand By 500
        </span>
      </div>

      <div className='menu-item px-3'>
        <span className='menu-link px-3' onClick={() => handleSimulate()}>
          Simulate
        </span>
      </div>

      <div className='menu-item px-3'>
        <span className='menu-link px-3' onClick={() => handleDownload()}>Download TXs</span>
      </div>
    </div>
  )
}

type CellPropsType = {
  pool_id: string
  value: string
}

const PoolsPage: FC = () => {
  const router = useRouter()
  const [poolsData, setPoolsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [simulateId, setSimulateId] = useState(null)

  const {pools, poolsLoading} = useGetPoolsList()

  useEffect(() => {
    setPoolsData(pools)
    setLoading(poolsLoading)
  }, [pools, poolsLoading])

  const showDetail = (pool_id: string) => {
    router.push(`/pools/${pool_id}`)
  }

  const RenderCell: FC<CellPropsType> = ({pool_id, value}) => {
    return (
      <td style={{cursor: 'pointer'}} onClick={() => showDetail(pool_id)}>
        {value}
      </td>
    )
  }

  const handleRefreshList = async () => {
    const poolsList = await getPoolsList()
    setPoolsData(poolsList)
  }

  const handleSimulateOpen = (pool_id: SetStateAction<null>) => {
    setSimulateId(pool_id)
  }

  const handleSimulateSuccess = () => {
    handleRefreshList()
    setSimulateId(null)
    toast('Running simulate success!', {type: 'success'})
  }
  return (
    <>
      {/* <PageTitle breadcrumbs={[]}>Pools</PageTitle> */}

      {/* begin::Row */}
      <div className='row gy-5 gx-xl-8'>
        <div className='col-xl-12'>
          <div className={`card card-xxl-stretch mb-5 mb-xl-8`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Simulated Pools</span>
              </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3'>
              {/* begin::Table container */}
              <div className='table-responsive'>
                {/* begin::Table */}
                <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                  {/* begin::Table head */}
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th className='min-w-130px'>Pool Seq ID</th>
                      <th className='min-w-130px'>Pool Name</th>
                      <th className='min-w-130px'>Primary Max Qty</th>
                      <th className='min-w-130px'>Secondary Max Qty</th>
                      <th className='min-w-130px'>Primary Max Price</th>
                      <th className='min-w-130px'>Secondary Max Price</th>
                      <th className='min-w-130px'>Initial Price</th>
                      <th className='min-w-130px'>Primary Steepness</th>
                      <th className='min-w-130px'>Secondary Steepness</th>
                      <th className='min-w-130px'>Treasury</th>
                      <th className='min-w-130px'>Actions</th>
                    </tr>
                  </thead>
                  {/* end::Table head */}
                  {/* begin::Table body */}
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={11} className='text-center py-5'>
                          <span className='indicator-progress mx-auto' style={{display: 'block'}}>
                            Loading...
                            <span className='spinner-border spinner-border-sm align-middle mx-auto'></span>
                          </span>
                        </td>
                      </tr>
                    )}
                    {poolsData &&
                      Object.keys(poolsData).map((el) => (
                        <tr key={el}>
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pool_seq_id}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pool_name}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pvt_qty_max_primary}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pvt_qty_max_secondary}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pvt_price_max_primary}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pvt_price_max_secondary}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].pvt_price_initial_primary}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].c_primary_steepness}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].c_secondary_steepness}
                          />
                          <RenderCell
                            pool_id={poolsData[el].pool_id}
                            value={poolsData[el].treasury}
                          />
                          <td className='text-end'>
                            <button
                              type='button'
                              className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary'
                              data-kt-menu-trigger='click'
                              data-kt-menu-placement='bottom-end'
                              data-kt-menu-flip='top-end'
                            >
                              <KTIcon iconName='bi bi-three-dots' className='fs-2' />
                            </button>
                            <Dropdown
                              pool_id={poolsData[el].pool_id}
                              name={poolsData[el].pool_name}
                              refreshPools={handleRefreshList}
                              handleSimulate={() => handleSimulateOpen(poolsData[el].pool_id)}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  {/* end::Table body */}
                </table>
                {/* end::Table */}
              </div>
              {/* end::Table container */}
            </div>
            {/* begin::Body */}
          </div>
        </div>
      </div>
      <SimulateModal
        pool_id={simulateId}
        show={simulateId !== null}
        handleClose={() => setSimulateId(null)}
        handleSuccess={() => handleSimulateSuccess()}
      />
      {/* end::Row */}
    </>
  )
}

export default PoolsPage
