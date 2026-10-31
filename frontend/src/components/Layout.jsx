import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BadgePercent, Boxes, FileStack, Gauge, LayoutTemplate, LogOut, Menu, Percent, ReceiptText, Repeat, Users, Wallet, Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const staffLinks = [
  { to: '/', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
  { to: '/invoices', label: 'Invoices', icon: ReceiptText },
  { to: '/payments', label: 'Payments', icon: Wallet },
]

const catalogLinks = [
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/plans', label: 'Plans', icon: Layers },
  { to: '/templates', label: 'Quotation templates', icon: LayoutTemplate },
  { to: '/discounts', label: 'Discounts', icon: BadgePercent },
  { to: '/taxes', label: 'Taxes', icon: Percent },
]

const customerLinks = [
  { to: '/portal', label: 'My subscriptions', icon: Repeat, end: true },
  { to: '/portal/invoices', label: 'My invoices', icon: FileStack },
]

function NavItem({ item, onClick }) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.end} onClick={onClick} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <Icon size={19} /> {item.label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, isStaff, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand"><span className="brand-mark" /> Brightloop</div>
        {isStaff ? (
          <>
            {staffLinks.map((item) => <NavItem key={item.to} item={item} onClick={close} />)}
            <div className="nav-group">Catalog</div>
            {catalogLinks.map((item) => <NavItem key={item.to} item={item} onClick={close} />)}
            {isAdmin && (
              <>
                <div className="nav-group">Admin</div>
                <NavItem item={{ to: '/team', label: 'Team', icon: Users }} onClick={close} />
              </>
            )}
          </>
        ) : (
          customerLinks.map((item) => <NavItem key={item.to} item={item} onClick={close} />)
        )}
        <div className="sidebar-footer">
          <strong>{user.name}</strong>
          <span>{user.role.toLowerCase()}</span>
          <button onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <main className="main">
        <button className="btn btn-ghost btn-sm menu-toggle" onClick={() => setOpen(!open)}><Menu size={18} /> Menu</button>
        <Outlet />
      </main>
    </div>
  )
}
