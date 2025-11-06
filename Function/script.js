const API_KEY = 'DEMO_KEY';

// SECTION HANDLING 
function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(sectionName).classList.add('active');
  document.querySelector(`.nav-btn[data-section="${sectionName}"]`).classList.add('active');
}

// NASA IMAGE LIBRARY
async function searchNASA() {
  const searchTerm = document.getElementById('searchInput').value;
  const results = document.getElementById('searchResults');
  const loader = document.getElementById('searchLoader');

  if (!searchTerm) {
    results.innerHTML = '<div class="error-message">Please enter a search term.</div>';
    return;
  }

  results.innerHTML = '';
  loader.classList.remove('hidden');

  try {
    const response = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=image`
    );
    const data = await response.json();

    loader.classList.add('hidden');

    if (data.collection.items && data.collection.items.length > 0) {
      data.collection.items.slice(0, 12).forEach(item => {
        if (item.links && item.links[0]) {
          const itemData = item.data[0];
          const galleryItem = createGalleryItem(
            item.links[0].href,
            itemData.title || 'NASA Image',
            (itemData.description || 'No description available').substring(0, 150) + '...',
            itemData // send full data for modal
          );
          results.appendChild(galleryItem);
        }
      });
    } else {
      results.innerHTML = '<div class="error-message">No results found. Try a different search term.</div>';
    }
  } catch (error) {
    loader.classList.add('hidden');
    results.innerHTML = '<div class="error-message">Error searching NASA library. Please try again.</div>';
    console.error('Error:', error);
  }
}

// ASTEROID DATA
async function fetchAsteroids() {
  const dateInput = document.getElementById('asteroidDate').value;
  const asteroidInfo = document.getElementById('asteroidInfo');
  const loader = document.getElementById('asteroidLoader');

  if (!dateInput) {
    asteroidInfo.innerHTML = '<div class="error-message">Please select a date.</div>';
    return;
  }

  asteroidInfo.innerHTML = '';
  loader.classList.remove('hidden');

  try {
    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateInput}&end_date=${dateInput}&api_key=${API_KEY}`
    );
    const data = await response.json();

    loader.classList.add('hidden');

    const asteroids = data.near_earth_objects[dateInput];
    
    if (asteroids && asteroids.length > 0) {
      asteroids.forEach(asteroid => {
        const card = createAsteroidCard(asteroid);
        asteroidInfo.appendChild(card);
      });
    } else {
      asteroidInfo.innerHTML = '<div class="error-message">No asteroids found for this date.</div>';
    }
  } catch (error) {
    loader.classList.add('hidden');
    asteroidInfo.innerHTML = '<div class="error-message">Error fetching asteroid data. Please try again.</div>';
    console.error('Error:', error);
  }
}

// ===== GALLERY ITEM CREATION =====
function createGalleryItem(imageSrc, title, description, itemData) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.innerHTML = `
      <img src="${imageSrc}" alt="${title}" 
        onerror="this.src='https://via.placeholder.com/300x250/1a1a3e/667eea?text=Image+Not+Available'">
      <div class="gallery-item-info">
          <h3>${title}</h3>
          <p>${description}</p>
      </div>
  `;

  // Open modal on click
  item.addEventListener('click', () => {
    showImageModal(imageSrc, title, description, itemData);
  });

  return item;
}

// ===== ASTEROID CARD CREATION =====
function createAsteroidCard(asteroid) {
  const card = document.createElement('div');
  card.className = 'asteroid-card';
  const approachData = asteroid.close_approach_data[0];
  const hazardous = asteroid.is_potentially_hazardous_asteroid;

  card.innerHTML = `
      <h3>${asteroid.name}</h3>
      <div class="asteroid-info">
          <div class="info-item">
              <span>Estimated Diameter</span>
              <strong>${Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min)} - ${Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max)} m</strong>
          </div>
          <div class="info-item">
              <span>Velocity</span>
              <strong>${Math.round(approachData.relative_velocity.kilometers_per_hour)} km/h</strong>
          </div>
          <div class="info-item">
              <span>Miss Distance</span>
              <strong>${Math.round(approachData.miss_distance.kilometers)} km</strong>
          </div>
          <div class="info-item">
              <span>Magnitude</span>
              <strong>${asteroid.absolute_magnitude_h.toFixed(2)}</strong>
          </div>
      </div>
      ${hazardous ? '<span class="hazardous">⚠️Potentially Hazardous</span>' : ''}
  `;
  return card;
}

// ===== IMAGE MODAL HANDLER =====
function showImageModal(imageSrc, title, description, itemData) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalExtra = document.getElementById('modalExtra');

  // Fill modal with details
  modalImg.src = imageSrc;
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  modalExtra.innerHTML = `
    <p><strong>Date Created:</strong> ${itemData.date_created || 'N/A'}</p>
    <p><strong>Center:</strong> ${itemData.center || 'Unknown'}</p>
    <p><strong>Photographer:</strong> ${itemData.photographer || 'Not listed'}</p>
  `;

  // Show modal & disable scroll
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Default asteroid date
  document.getElementById('asteroidDate').value = new Date().toISOString().split('T')[0];
  
  // Navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showSection(btn.dataset.section);
    });
  });

  // Search and asteroid buttons
  document.getElementById('searchBtn').addEventListener('click', searchNASA);
  document.getElementById('asteroidBtn').addEventListener('click', fetchAsteroids);

  // Keyboard search
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNASA();
  });

  // ===== MODAL CLOSE HANDLERS =====
  const modal = document.getElementById('imageModal');
  const closeBtn = modal.querySelector('.close-btn');

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
});
