import {FC} from 'react'
import {useLocation} from 'react-router'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {checkIsActive} from '../../../../helpers'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasArrow?: boolean
  hasBullet?: boolean
  isButton?: boolean
  onClick?: () => void
}

const MenuItem: FC<Props> = ({
  to = '',
  title,
  hasArrow = false,
  onClick = () => {},
}) => {
  const {pathname} = useLocation()
  return (
    <div className='menu-item me-lg-1' onClick={onClick}>
      {to && (
        <Link
          className={clsx('menu-link py-3', {
            'active menu-here': checkIsActive(pathname, to),
          })}
          to={to}
        >
          <span className='menu-title'>{title}</span>
          {hasArrow && <span className='menu-arrow'></span>}
        </Link>
      )}
      {!to && (
        <div
          className={clsx('menu-link py-3', {
            'active menu-here': checkIsActive(pathname, to),
          })}
        >
          <span className='menu-title'>{title}</span>
          {hasArrow && <span className='menu-arrow'></span>}
        </div>
      )}
    </div>
  )
}

export {MenuItem}
