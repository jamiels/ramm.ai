import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {HeaderWrapper} from './components/header'
import {ScrollTop} from './components/scroll-top'
import {Content} from './components/content'
import {FooterWrapper} from './components/footer'
import {PageDataProvider} from './core'
import {reInitMenu} from '../helpers'
import MySorobanReactProvider from '../../app/soroban/provider'
import { WalletProvider } from './core/_WalletContext'
import { ToastContainer } from 'react-toastify'

const MasterLayout = () => {
  const location = useLocation()
  useEffect(() => {
    reInitMenu()
  }, [location.key])

  return (
    <PageDataProvider>
      <MySorobanReactProvider>
        <WalletProvider>
          <div className='d-flex flex-column flex-root app-root' id='kt_app_root'>
            <div className='app-page flex-column flex-column-fluid' id='kt_app_page'>
              <HeaderWrapper />
              <div className='app-wrapper flex-column flex-row-fluid' id='kt_app_wrapper'>
                {/* <Sidebar /> */}
                <div className='app-main flex-column flex-row-fluid' id='kt_app_main'>
                  <div className='d-flex flex-column flex-column-fluid'>
                    <Content>
                      <Outlet />
                    </Content>
                  </div>
                  <FooterWrapper />
                </div>
              </div>
            </div>
          </div>
          <ScrollTop />
          <ToastContainer />
        </WalletProvider>
      </MySorobanReactProvider>
    </PageDataProvider>
  )
}

export {MasterLayout}
