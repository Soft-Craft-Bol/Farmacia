import React from 'react';

export default function DashboardIcon({ icon: Icon, iconColor, bgColor }) {
  const iconStyle = {
    backgroundColor: bgColor,
    color: iconColor,
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50px',
    height: '50px',
  };

  return (
    <div style={iconStyle}>
      <Icon size={24} />
    </div>
  );
}
