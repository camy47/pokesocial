import React from 'react'

const NavBar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => (
  <nav className="nav-bar">
    <div className="nav-logo">
      <span className="logo-icon">⚡</span> PokéGram
    </div>
    <div className="nav-search">
      <input 
        type="text" 
        placeholder="Search Pokemon, types, or locations..." 
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className="nav-buttons">
      {['home', 'explore', 'profile'].map(tab => (
        <button 
          key={tab}
          className={`nav-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'home' ? '🏠' : tab === 'explore' ? '🔍' : '👤'}
        </button>
      ))}
    </div>
  </nav>
)

export default NavBar 