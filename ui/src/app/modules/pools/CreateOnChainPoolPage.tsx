import React, {useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {server, useWallet} from '../../../_metronic/layout/core'
import {createPool} from '../../soroban/createPool'

interface CreatePoolDataTypes {
  pool_name: string
  pvt_qty_max_primary: string
  pvt_price_max_primary: string
  pvt_available_secondary: string
  pvt_price_initial_primary: string
  steepness: string
}

const formSchema = Yup.object().shape({
  pool_name: Yup.string().required('Pool Name is required'),
  pvt_qty_max_primary: Yup.string()
    .matches(/^[0-9]+$/gi, 'Must be an integer number')
    .required('Max Primary Quantity is required'),
  pvt_price_max_primary: Yup.string()
    .matches(/^[0-9]+(\.[0-9]+)?$/, 'Must be a Number')
    .required('Max Primary Price is required'),
  pvt_available_secondary: Yup.string()
    .matches(/^[0-9]+$/gi, 'Must be an integer number')
    .required('Secondary Available is required'),
  pvt_price_initial_primary: Yup.string()
    .matches(/^[0-9]+(\.[0-9]+)?$/, 'Must be a Number')
    .required('Initial Primary Price is required'),
  steepness: Yup.number().required('Plese select Steepness'),
})

const initialValues = {
  pool_name: '',
  pvt_qty_max_primary: '',
  pvt_price_max_primary: '',
  pvt_available_secondary: '',
  pvt_price_initial_primary: '',
  steepness: '',
}

const CreateOnChainPoolPage = () => {
  const [saving, setSaving] = useState(false)
  const {activePubkey, walletConnectKit} = useWallet()

  const handleSubmit = async (values, {resetForm}) => {
    try {
      if (!saving && walletConnectKit) {
        setSaving(true)
        await createPool(
          server,
          walletConnectKit,
          values.pool_name,
          values.pvt_qty_max_primary,
          values.pvt_price_max_primary,
          values.pvt_available_secondary,
          values.pvt_price_initial_primary,
          parseInt(values.steepness)
        )
          .then((e) => {
            toast.success('Pool created!')
            resetForm()
            setSaving(false)
          })
          .catch((e) => {
            console.log('CreateOnChainPoolPage >> e', e)
            toast.error('Failed to create pool!')
            setSaving(false)
          })
      }
    } catch (error) {
      console.log('CreateOnChainPoolPage >> error', error)
      toast.error('Failed to create pool!')
      setSaving(false)
    }
  }
  const formik = useFormik<CreatePoolDataTypes>({
    initialValues,
    validationSchema: formSchema,
    onSubmit: handleSubmit,
  })

  return (
    <>
      <div className='row gy-5 gx-xl-8'>
        <div className='col-xl-12'>
          <div className={`card card-xxl-stretch mb-5 mb-xl-8`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Create On-Chain Pool</span>
              </h3>
            </div>
            {/* end::Header */}
            {/* begin::Body */}
            <div className='card-body py-3'>
              <form onSubmit={formik.handleSubmit} noValidate className='form'>
                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Pool Name</span>
                  </label>
                  <input
                    type='text'
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('pool_name')}
                  />
                  {formik.touched.pool_name && formik.errors.pool_name && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pool_name}</div>
                    </div>
                  )}
                </div>
                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Max Primary Quantity</span>
                  </label>
                  <input
                    type='number'
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('pvt_qty_max_primary')}
                  />
                  {formik.touched.pvt_qty_max_primary && formik.errors.pvt_qty_max_primary && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pvt_qty_max_primary}</div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Max Primary Price</span>
                  </label>
                  <input
                    type='number'
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('pvt_price_max_primary')}
                  />
                  {formik.touched.pvt_price_max_primary && formik.errors.pvt_price_max_primary && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pvt_price_max_primary}</div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Secondary Available</span>
                  </label>
                  <input
                    type='number'
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('pvt_available_secondary')}
                  />
                  {formik.touched.pvt_available_secondary && formik.errors.pvt_available_secondary && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.pvt_available_secondary}</div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Initial Primary Price</span>
                  </label>
                  <input
                    type='number'
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('pvt_price_initial_primary')}
                  />
                  {formik.touched.pvt_price_initial_primary &&
                    formik.errors.pvt_price_initial_primary && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>
                          {formik.errors.pvt_price_initial_primary}
                        </div>
                      </div>
                    )}
                </div>

                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Steepness</span>
                  </label>
                  <select
                    className='form-control form-control-lg form-control-solid'
                    {...formik.getFieldProps('steepness')}
                  >
                    <option value=''></option>
                    <option value='10000000'>STEEPNESS_FLATISH</option>
                    <option value='1000000'>STEEPNESS_MODERATE</option>
                    <option value='100000'>STEEPNESS_MEDIUM</option>
                    <option value='10000'>STEEPNESS_HIGH</option>
                    <option value='1000'>STEEPNESS_AGGRESSIVE</option>
                  </select>
                  {formik.touched.steepness && formik.errors.steepness && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.steepness}</div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-10'>
                  <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                    <span className='required'>Owner</span>
                  </label>
                  <input
                    type='text'
                    className='form-control form-control-lg form-control-solid'
                    value={activePubkey || ''}
                    readOnly
                  />
                </div>
                <div className='fv-row mb-10'>
                  <button type='submit' className='btn btn-primary float-end'>
                    {!saving && 'Create Pool'}
                    {saving && (
                      <span className='indicator-progress' style={{display: 'block'}}>
                        Please wait...{' '}
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateOnChainPoolPage
