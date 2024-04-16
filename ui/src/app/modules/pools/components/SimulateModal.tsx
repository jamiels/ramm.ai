import React, {useState} from 'react'
import {Modal} from 'react-bootstrap'
import {KTIcon} from '../../../../_metronic/helpers'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {simulateData} from '../../../api/pools'

type Props = {
  pool_id: string | null
  show: boolean
  handleClose: () => void
  handleSuccess: () => void
}

interface SimulateDataTypes {
  buys: string | null
  sells: string | null
  buy_sells: string | null
}

const formSchema = Yup.object().shape({
  buys: Yup.string()
    .matches(/^[0-9]+$/gi, 'Must be a Number')
    .required('Buys is required'),
  sells: Yup.string()
    .matches(/^[0-9]+$/gi, 'Must be a Number')
    .required('Sells is required'),
  buy_sells: Yup.string()
    .matches(/^[0-9]+$/gi, 'Must be a Number')
    .required('Buy/Sells is required'),
})

const initialValues = {
  buys: '',
  sells: '',
  buy_sells: '',
}
const SimulateModal = ({pool_id, show, handleClose, handleSuccess}: Props) => {
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (values, {resetForm}) => {
    try {
      if (!saving) {
        setSaving(true)
        await simulateData(pool_id, values)
        setSaving(false)
        handleSuccess()
        resetForm()
      }
    } catch (error) {
      console.log('error', error)
      setSaving(false)
    }
  }
  const formik = useFormik<SimulateDataTypes>({
    initialValues,
    validationSchema: formSchema,
    onSubmit: handleSubmit,
  })

  return (
    <Modal
      id='kt_modal_create_app'
      tabIndex={-1}
      aria-hidden='true'
      dialogClassName='modal-dialog'
      show={show}
      onHide={handleClose}
      backdrop={true}
    >
      <div className='modal-content'>
        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          <div className='modal-header'>
            <h2>Simulate</h2>
            {/* begin::Close */}
            <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
              <KTIcon className='fs-1' iconName='cross' />
            </div>
            {/* end::Close */}
          </div>
          <div className='modal-body py-lg-10 px-lg-10'>
            <div className='fv-row mb-10'>
              <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                <span className='required'>Buys</span>
              </label>
              <input
                type='number'
                className='form-control form-control-lg form-control-solid'
                {...formik.getFieldProps('buys')}
              />
              {formik.touched.buys && formik.errors.buys && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.buys}</div>
                </div>
              )}
            </div>

            <div className='fv-row mb-10'>
              <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                <span className='required'>Sells</span>
              </label>
              <input
                type='number'
                className='form-control form-control-lg form-control-solid'
                {...formik.getFieldProps('sells')}
              />
              {formik.touched.sells && formik.errors.sells && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.sells}</div>
                </div>
              )}
            </div>

            <div className='fv-row mb-10'>
              <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
                <span className='required'>Buy/Sells</span>
              </label>
              <input
                type='number'
                className='form-control form-control-lg form-control-solid'
                {...formik.getFieldProps('buy_sells')}
              />
              {formik.touched.buy_sells && formik.errors.buy_sells && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.buy_sells}</div>
                </div>
              )}
            </div>
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-light-primary' onClick={handleClose}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary'>
              {!saving && 'Run Simulator'}
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
    </Modal>
  )
}

export default SimulateModal
