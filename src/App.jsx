import { useState, useEffect, useRef } from 'react'
import './App.css'

// ==================== MOCK DATA ====================
// Random usernames and locations for community feel
const randomUsers = [
  { username: 'Ash_Ketchum', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { username: 'MistyWaterflower', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png' },
  { username: 'BrockRock', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png' },
  { username: 'GaryOak', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
  { username: 'ProfessorOak', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
  { username: 'TeamRocket', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' }
]

const locations = [
  'Pallet Town', 'Viridian City', 'Pewter City', 'Cerulean City',
  'Vermilion City', 'Lavender Town', 'Celadon City', 'Saffron City'
]

const randomComments = [
  'Amazing catch! 🌟',
  'Wow, so rare! ✨',
  'I have been looking for this one! 😍',
  'Great find! 🎉',
  'Beautiful Pokemon! 💫',
  'Lucky you! 🍀',
  'Perfect catch! 🎯',
  'This is awesome! 🔥'
]

// ==================== APP COMPONENT ====================
function App() {
  // ==================== STATE HOOKS ====================
  // Hooks
  const [pokemon, setPokemon] = useState(() => {
    const savedPokemon = localStorage.getItem('currentPokemon')
    return savedPokemon ? JSON.parse(savedPokemon) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [caughtPokemon, setCaughtPokemon] = useState(() => {
    const saved = localStorage.getItem('caughtPokemon')
    try {
      // Parse the saved data and ensure trainerPhoto is properly loaded
      const parsedData = saved ? JSON.parse(saved) : []
      return parsedData
    } catch (error) {
      console.error('Error loading caught Pokemon:', error)
      return []
    }
  })
  const [activeTab, setActiveTab] = useState('home')
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile')
    return savedProfile ? JSON.parse(savedProfile) : {
      username: 'Ash_Ketchum',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      bio: '🌟 Pokemon Trainer | Gotta catch em all! | Road to becoming a Pokemon Master',
      stats: {
        caught: 0,
        following: 151,
        followers: 898
      }
    }
  })
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [communityPosts, setCommunityPosts] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [activePostMenu, setActivePostMenu] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  // ==================== EFFECTS & DATA PERSISTENCE ====================
  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // Using Nominatim (OpenStreetMap) for reverse geocoding - no API key needed
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'PokemonApp/1.0' // Required by Nominatim's terms of use
              }
            }
          )
          const data = await response.json()
          if (data) {
            // Extract city and state/country for a cleaner location display
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb
            const state = data.address.state || data.address.country
            const locationString = city ? `${city}, ${state}` : state
            setUserLocation(locationString)
          }
        } catch (error) {
          console.error('Error getting location:', error)
          setUserLocation('Unknown Location')
        }
      }, (error) => {
        console.error('Error getting geolocation:', error)
        setUserLocation('Unknown Location')
      })
    } else {
      setUserLocation('Unknown Location')
    }
  }, [])

  // Generate random community posts
  useEffect(() => {
    const generateRandomPosts = async () => {
      const posts = []
      for (let i = 0; i < 10; i++) {
        try {
          // Fetch random Pokemon
          const randomId = Math.floor(Math.random() * 898) + 1
          const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
          const pokemonData = await pokemonResponse.json()

          // Fetch random user with photo
          const userResponse = await fetch('https://randomuser.me/api/')
          const userData = await userResponse.json()
          const randomUser = {
            username: userData.results[0].login.username,
            avatar: userData.results[0].picture.large,
            trainerPhoto: userData.results[0].picture.large
          }

          const randomLocation = locations[Math.floor(Math.random() * locations.length)]
          const hoursAgo = Math.floor(Math.random() * 24)
          const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
          const likes = Math.floor(Math.random() * 1000) + 50
          const commentCount = Math.floor(Math.random() * 5) + 1
          const comments = Array(commentCount).fill(null).map(() => {
            const commentUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]
            return {
              id: Math.random().toString(36).substr(2, 9),
              user: commentUser,
              text: randomComments[Math.floor(Math.random() * randomComments.length)],
              timestamp: new Date(Date.now() - Math.floor(Math.random() * hoursAgo) * 60 * 60 * 1000).toISOString()
            }
          })

          posts.push({
            id: `${pokemonData.id}-${timestamp}`,
            pokemon: pokemonData,
            user: randomUser,
            location: randomLocation,
            timestamp,
            likes,
            isLiked: Math.random() > 0.5,
            comments,
            trainerPhoto: randomUser.trainerPhoto,
            caption: `Just encountered this amazing ${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)} in ${randomLocation}! 🌟✨`
          })
        } catch (error) {
          console.error('Error generating post:', error)
        }
      }
      setCommunityPosts(posts)
    }

    generateRandomPosts()
    // Refresh posts every 5 minutes
    const interval = setInterval(() => {
      generateRandomPosts()
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon))
      userProfile.stats.caught = caughtPokemon.length
    } catch (error) {
      console.error('Error saving caught Pokemon:', error)
    }
  }, [caughtPokemon])

  useEffect(() => {
    if (pokemon) {
      localStorage.setItem('currentPokemon', JSON.stringify(pokemon))
    } else {
      localStorage.removeItem('currentPokemon')
    }
  }, [pokemon])

  // Save profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
  }, [userProfile])

  // Add this effect to capture the install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    });
  }, []);

  // ==================== CAMERA FUNCTIONS ====================
  // Function to start camera for profile picture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  // Function to stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  // Function to capture profile photo
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      
      // Flip horizontally for selfie mirror effect
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      setUserProfile(prev => ({
        ...prev,
        avatar: imageData
      }))
      stopCamera()
    }
  }

  const openCamera = () => {
    setShowCamera(true)
    startCamera()
  }

  // ==================== POKEMON INTERACTION FUNCTIONS ====================
  const getRandomPokemon = async () => {
    setIsLoading(true)
    try {
      const randomId = Math.floor(Math.random() * 898) + 1
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      const data = await response.json()
      setPokemon(data)
    } catch (error) {
      console.error('Error fetching Pokemon:', error)
    }
    setIsLoading(false)
  }

  const catchPokemon = () => {
    if (pokemon) {
      const timestamp = new Date().toISOString()
      const newCaughtPokemon = {
        ...pokemon,
        caught_at: timestamp,
        id: `${pokemon.id}-${timestamp}`,
        likes: Math.floor(Math.random() * 1000),
        isLiked: false,
        comments: [],
        location: userLocation || 'Unknown Location',
        caption: `Just caught a wild ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} in ${userLocation || 'Unknown Location'}! 🎉✨`,
        user: userProfile
      }

      setCaughtPokemon(prev => [newCaughtPokemon, ...prev])
      setPokemon(null)
    }
  }

  const toggleLike = (pokemonId) => {
    setCaughtPokemon(prev => prev.map(p => {
      if (p.id === pokemonId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        }
      }
      return p
    }))
  }

  const releasePokemon = (pokemonId) => {
    setCaughtPokemon(prev => prev.filter(p => p.id !== pokemonId))
  }

  // ==================== POST & FEED MANAGEMENT ====================
  // Filter posts based on search query and tab
  const filteredPosts = [...(activeTab === 'profile' ? caughtPokemon : [...caughtPokemon, ...communityPosts])]

  const togglePostMenu = (postId) => {
    setActivePostMenu(activePostMenu === postId ? null : postId)
  }

  // ==================== UI RENDERING FUNCTIONS ====================
  // Update renderNavBar to remove search components
  const renderNavBar = () => (
    <nav className="nav-bar">
      <div className="nav-logo">
        <span className="logo-icon">⚡</span> PokéGram
      </div>
      <div className="nav-buttons">
        <button 
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠
        </button>
        <button 
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤
        </button>
      </div>
    </nav>
  )

  // Update renderProfile to include camera functionality
  const renderProfile = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img src={userProfile.avatar} alt="Profile" className="profile-avatar" />
          <button className="change-avatar-btn" onClick={openCamera}>
            📸 Change Photo
          </button>
          <div className="profile-status">Online</div>
        </div>
        <div className="profile-info">
          <div className="profile-top">
            <h2>{userProfile.username}</h2>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
          <p className="profile-bio">{userProfile.bio}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{userProfile.stats.caught}</span>
              <span className="stat-label">Caught</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userProfile.stats.following}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userProfile.stats.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="camera-preview"
            />
            <div className="camera-controls">
              <button className="capture-button" onClick={capturePhoto}>
                📸 Take Photo
              </button>
              <button className="cancel-button" onClick={stopCamera}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Update renderPokemonFeed to show caught count when in profile
  const renderPokemonFeed = () => (
    <div className="pokemon-feed">
      {activeTab === 'profile' && (
        <div className="feed-header">
          <h3>Your Caught Pokemon ({caughtPokemon.length})</h3>
        </div>
      )}
      {filteredPosts.length === 0 && searchQuery ? (
        <div className="no-pokemon">
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No matches found</h3>
            <p>Try searching for a different Pokemon, type, or location</p>
          </div>
        </div>
      ) : filteredPosts.length === 0 && activeTab === 'profile' ? (
        <div className="no-pokemon">
          <div className="empty-state">
            <span className="empty-icon">📱</span>
            <h3>No Pokemon caught yet</h3>
            <p>Head to the home tab to start catching Pokemon!</p>
          </div>
        </div>
      ) : (
        filteredPosts.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.caught_at)
          const dateB = new Date(b.timestamp || b.caught_at)
          return dateB - dateA
        }).map(post => (
          <div key={post.id} className="pokemon-post">
            <div className="post-header">
              <div className="post-user">
                <img 
                  src={post.user ? post.user.avatar : userProfile.avatar} 
                  alt="User" 
                  className="post-avatar" 
                />
                <div className="post-user-info">
                  <span className="post-username">{post.user ? post.user.username : userProfile.username}</span>
                  <span className="post-location">{post.location || 'Pallet Town'}</span>
                </div>
              </div>
              <div className="post-menu-container">
                <button className="post-menu" onClick={() => togglePostMenu(post.id)}>•••</button>
                {activePostMenu === post.id && (
                  <div className="post-menu-dropdown">
                    <button className="menu-item" onClick={() => releasePokemon(post.id)}>
                      🔓 Release Pokemon
                    </button>
                    <button className="menu-item">
                      📤 Share
                    </button>
                    <button className="menu-item">
                      🔖 Save
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="post-image" onClick={() => setSelectedPokemon(post.pokemon || post)}>
              <div className="post-image-container">
                <img 
                  src={post.pokemon ? post.pokemon.sprites.front_default : post.sprites.front_default} 
                  alt={post.pokemon ? post.pokemon.name : post.name}
                  className="pokemon-sprite"
                />
                {post.trainerPhoto && (
                  <img 
                    src={post.trainerPhoto} 
                    alt="Trainer" 
                    className="trainer-photo"
                  />
                )}
              </div>
            </div>
            <div className="post-actions">
              <div className="action-buttons">
                <button 
                  className={`action-button ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  {post.isLiked ? '❤️' : '🤍'} {post.likes}
                </button>
                <button className="action-button">💭 {post.comments ? post.comments.length : 0}</button>
                <button className="action-button">📤</button>
              </div>
              <button className="action-button">🔖</button>
            </div>
            <div className="post-content">
              <p className="post-caption">
                <span className="caption-username">{post.user ? post.user.username : userProfile.username}</span> {post.caption}
              </p>
              {post.comments && post.comments.length > 0 && (
                <div className="post-comments">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <span className="comment-username">{comment.user.username}</span>
                      <span className="comment-text">{comment.text}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pokemon-details">
                <h3>{(post.pokemon ? post.pokemon.name : post.name).charAt(0).toUpperCase() + (post.pokemon ? post.pokemon.name : post.name).slice(1)}</h3>
                <div className="types">
                  {(post.pokemon ? post.pokemon.types : post.types).map(type => (
                    <span key={type.type.name} className={`type ${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>
                <p className="post-stats">
                  Height: {(post.pokemon ? post.pokemon.height : post.height) / 10}m | Weight: {(post.pokemon ? post.pokemon.weight : post.weight) / 10}kg
                </p>
              </div>
              <p className="post-time">
                {formatTimestamp(post.timestamp || post.caught_at)}
                {!post.user && (
                  <button 
                    className="release-button"
                    onClick={() => releasePokemon(post.id)}
                  >
                    Release
                  </button>
                )}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )

  // ==================== UTILITY FUNCTIONS ====================
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  // Add this function to handle direct download
  const handleDownload = () => {
    // Get the current state
    const appData = {
      userProfile,
      caughtPokemon,
      settings: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    };

    // Create a blob with the data
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pokegram-data.json';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install as an app:\n\n1. Open this website in Chrome or Edge\n2. Click the menu (⋮) in your browser\n3. Click "Install PokéGram" or "Install app"');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      alert('Thanks for installing PokéGram! You can now find it in your Start Menu/Desktop.');
    }
    
    // Clear the prompt so it can't be used again
    setDeferredPrompt(null);
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="app-container">
      {renderNavBar()}
      
      <main className="main-content">
        {activeTab === 'profile' ? (
          <>
            {renderProfile()}
            {renderPokemonFeed()}
          </>
        ) : (
          <>
            <div className="encounter-section">
              <div className="encounter-info">
                <h2>Catch wild Pokemon</h2>
                <p>click the Pokeball to encounter a random Pokemon!</p>
                <button 
                  className="download-app-button"
                  onClick={handleInstallClick}
                >
                  <span className="download-icon">💻</span>
                  Install as App
                </button>
              </div>
              <div 
                className={`pokeball ${isLoading ? 'shake' : ''}`} 
                onClick={getRandomPokemon}
              >
                <div className="pokeball-top"></div>
                <div className="pokeball-center">
                  <div className="pokeball-button"></div>
                </div>
                <div className="pokeball-bottom"></div>
              </div>

              {pokemon && (
                <div className="pokemon-card">
                  <div className="card-background"></div>
                  <img 
                    src={pokemon.sprites.front_default} 
                    alt={pokemon.name}
                    className="pokemon-sprite floating"
                  />
                  <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                  <div className="pokemon-stats">
                    <p>Height: {pokemon.height / 10}m</p>
                    <p>Weight: {pokemon.weight / 10}kg</p>
                  </div>
                  <div className="types">
                    {pokemon.types.map(type => (
                      <span key={type.type.name} className={`type ${type.type.name}`}>
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                  <button className="catch-button" onClick={catchPokemon}>
                    <span className="catch-icon">⚡</span> Catch Pokemon!
                  </button>
                </div>
              )}
            </div>

            {showCamera && (
              <div className="camera-modal">
                <div className="camera-container">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="camera-preview"
                  />
                  <div className="camera-controls">
                    <button className="capture-button" onClick={capturePhoto}>
                      📸 Take Photo
                    </button>
                    <button className="cancel-button" onClick={stopCamera}>
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {caughtPokemon.length === 0 ? (
              <div className="no-pokemon">
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <h3>No Pokemon caught yet</h3>
                  <p>Click the Pokeball above to start your journey!</p>
                </div>
              </div>
            ) : (
              renderPokemonFeed()
            )}
          </>
        )}
      </main>

      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedPokemon.sprites.front_default} 
              alt={selectedPokemon.name}
              className="modal-image"
            />
            <h2>{selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h2>
            <button className="modal-close" onClick={() => setSelectedPokemon(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
