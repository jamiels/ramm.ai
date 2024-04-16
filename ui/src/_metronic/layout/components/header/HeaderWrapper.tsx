/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {server, useLayout, useWallet} from '../../core'
import {Header} from './Header'
import {useEffect, useState} from 'react'
import {getBalanceUSDC} from '../../../../app/soroban/getBalanceUSDC'

export function HeaderWrapper() {
  const {config, classes} = useLayout()

  const {walletConnectKit, activePubkey, connectWallet} = useWallet()
  const [usdcbalance, setUSDCBalance] = useState<number>(0)

  const itemClass = 'ms-1 ms-md-4'
  const btnClass = 'btn btn-info'

  useEffect(() => {
    GetUSDCBalance()
  }, [])

  async function GetUSDCBalance() {
    await getBalanceUSDC(server, walletConnectKit)
      .then((result) => {
        // console.log("Balance",result)
        setUSDCBalance(parseInt(result) / 10 ** 9)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div id='kt_app_header' className='app-header'>
      <div
        id='kt_app_header_container'
        className={clsx(
          'app-container flex-lg-grow-1',
          classes.headerContainer.join(' '),
          config.app?.header?.default?.containerClass
        )}
      >
        <div className='d-flex align-items-center d-lg-none ms-n2 me-2' title='Show sidebar menu'>
          <div
            className='btn btn-icon btn-active-color-primary w-35px h-35px'
            id='kt_app_sidebar_mobile_toggle'
          >
            <KTIcon iconName='abstract-14' className=' fs-1' />
          </div>
          <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
            <Link to='/dashboard' className='d-lg-none'>
              <img
                alt='Logo'
                src={toAbsoluteUrl('/media/logos/default-small.svg')}
                className='h-30px'
              />
            </Link>
          </div>
        </div>

        <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0 me-lg-15'>
          <Link to='/dashboard'>
            <span style={{fontSize: 25}}>RAMM</span>
          </Link>
        </div>

        <div
          id='kt_app_header_wrapper'
          className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'
        >
          <div
            className='app-header-menu app-header-mobile-drawer align-items-stretch'
            data-kt-drawer='true'
            data-kt-drawer-name='app-header-menu'
            data-kt-drawer-activate='{default: true, lg: false}'
            data-kt-drawer-overlay='true'
            data-kt-drawer-width='225px'
            data-kt-drawer-direction='end'
            data-kt-drawer-toggle='#kt_app_header_menu_toggle'
            data-kt-swapper='true'
            data-kt-swapper-mode="{default: 'append', lg: 'prepend'}"
            data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_wrapper'}"
          >
            <Header />
          </div>

          <div className='app-navbar flex-shrink-0'>
            <div className={clsx('app-navbar-item', itemClass)}>
              {!activePubkey && (
                <button
                  className={clsx('position-relative', btnClass)}
                  id='kt_drawer_chat_toggle'
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
              {activePubkey && (
                <div className="dropdown">
                  <button className={`${btnClass}`} type="button" id="dropdownTopMenuButton" data-bs-toggle="dropdown">
                    <svg style={{marginRight: 10}} className='rounded-circle' xmlns="http://www.w3.org/2000/svg" x="0" y="0" height="24" width="24"><rect x="0" y="0" rx="0" ry="0" height="24" width="24" transform="translate(3.58064099454198 3.52187167729838) rotate(155.9 12 12)" fill="#2477e1"></rect><rect x="0" y="0" rx="0" ry="0" height="24" width="24" transform="translate(7.0247189465624436 -14.358447255034422) rotate(393.3 12 12)" fill="#c7145c"></rect><rect x="0" y="0" rx="0" ry="0" height="24" width="24" transform="translate(-17.38126979634894 -8.666666587006299) rotate(289.4 12 12)" fill="#f3ad00"></rect><rect x="0" y="0" rx="0" ry="0" height="24" width="24" transform="translate(15.569874656032885 -23.697661207793633) rotate(438.4 12 12)" fill="#fc1975"></rect></svg>
                    {activePubkey.substring(0, 7) + '...'}
                  </button>
                  <div className="dropdown-menu" aria-labelledby="dropdownTopMenuButton" style={{width: '100%', padding: 30}}>
                    <p className='h3 text-center'>USDC</p>
                    <p className='h5 text-center mb-0 mt-3'>{usdcbalance}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
