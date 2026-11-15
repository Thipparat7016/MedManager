import React from 'react'
import { getThaiWelcomeDate } from '../../utils/dateUtils'

export default function Topbar({ adminProfile }) {
  return (
    <header className="topbar">
      <div className="topbar-welcome">
        {getThaiWelcomeDate()}
      </div>

      <div className="topbar-actions" />
    </header>
  )
}
