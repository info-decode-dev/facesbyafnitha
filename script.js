// --------- LOAD DATA FROM JSON ---------
let SITE_DATA = null;

function fetchSiteData() {
  return fetch('data.json')
    .then(res => res.json())
    .then(data => {
      SITE_DATA = data;
      renderAll();
    });
}

function renderAll() {
  if (!SITE_DATA) return;
  renderHeader();
  renderPackages();
  renderPortfolio();
  renderContact();
}

function renderHeader() {
  document.querySelector('h1').textContent = SITE_DATA.header.title;
  document.querySelector('.subtitle').textContent = SITE_DATA.header.subtitle;
}

// RENDER BRIDAL PACKAGES
function renderPackages() {
  const pkgGrid = document.getElementById('packages');
  pkgGrid.innerHTML = "";
  const filteredPackages = filterPackages(SITE_DATA.packages);
  if (filteredPackages.length === 0) {
    pkgGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#b59f7b;font-size:1.1em;">No packages found.</div>';
    return;
  }
  filteredPackages.forEach((pkg, i) => {
    // Use a placeholder or cycle through portfolio images for now
    const imgSrc = SITE_DATA.portfolio[i % SITE_DATA.portfolio.length] || 'assets/p1.jpg';
    pkgGrid.innerHTML += `
      <div class="package-card">
        <div class="package-image">
          <img src="${imgSrc}" alt="${pkg.name} image">
        </div>
        <div class="package-content">
          <div>
            ${pkg.offerTitle ? `<div class=\"package-offer-title\">${pkg.offerTitle}</div>` : ''}
            <div class="package-title">${pkg.name}
              ${pkg.bestSeller ? '<span class="package-badge glitter-badge">Best Seller</span>' : ''}
            </div>
            ${pkg.features ? `<ul class=\"package-features\">${pkg.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
          </div>
          <div class="package-actions">
            <div class="package-prices">
              <span class="package-actual-price">${pkg.actualPrice}</span>
              <span class="package-offer-price">${pkg.offerPrice}</span>
            </div>
            <button class="package-enquiry" data-pkg="${pkg.name}">Enquiry</button>
          </div>
        </div>
      </div>
    `;
  });
  // Add event listeners for Enquiry buttons
  setTimeout(() => {
    document.querySelectorAll('.package-enquiry').forEach(btn => {
      btn.onclick = function() {
        showEnquiryConfirm(this.getAttribute('data-pkg'));
      };
    });
  }, 0);
}

// Enquiry confirmation modal logic
function showEnquiryConfirm(pkgName) {
  // Reuse the whatsappModal for confirmation
  const whatsappModal = document.getElementById('whatsappModal');
  const packageForm = document.getElementById('packageForm');
  whatsappModal.style.display = "flex";
  packageForm.innerHTML = `
    <div style="margin-bottom:1.2em;">Send enquiry for <b>${pkgName}</b>?</div>
    <button type="button" class="modal-send" id="confirmEnquiryBtn">Yes, send via WhatsApp</button>
    <button type="button" class="modal-send" id="cancelEnquiryBtn">Cancel</button>
  `;
  document.getElementById('confirmEnquiryBtn').onclick = function() {
    sendEnquiryToWhatsApp(pkgName);
    whatsappModal.style.display = "none";
  };
  document.getElementById('cancelEnquiryBtn').onclick = function() {
    whatsappModal.style.display = "none";
  };
}

function sendEnquiryToWhatsApp(pkgName) {
  if (!SITE_DATA) return;
  const message = `Hello! I would like to know more about: ${pkgName}.`;
  const phoneNum = SITE_DATA.contact.phone.replace(/[^0-9+]/g, '');
  const whatsappURL = `https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
}

// RENDER PORTFOLIO
function renderPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  grid.innerHTML = "";
  SITE_DATA.portfolio.forEach(src => {
    grid.innerHTML += `
      <div class="portfolio-item"><img src="${src}" alt="Bridal work sample"></div>
    `;
  });
  // Add image view click event
  setTimeout(() => {
    document.querySelectorAll('.portfolio-item img').forEach(img => {
      img.onclick = function() {
        openImageViewModal(this.src);
      };
    });
  }, 0);
}

// Image view modal logic
function openImageViewModal(imgSrc) {
  const modal = document.getElementById('imageViewModal');
  const modalImg = document.getElementById('modalLargeImage');
  modalImg.src = imgSrc;
  modal.style.display = 'flex';
}
document.getElementById('closeImageModal').onclick = function() {
  document.getElementById('imageViewModal').style.display = 'none';
  document.getElementById('modalLargeImage').src = '';
};
document.getElementById('imageViewModal').onclick = function(e) {
  if (e.target === this) {
    this.style.display = 'none';
    document.getElementById('modalLargeImage').src = '';
  }
};

// UPDATE CONTACT INFO
function renderContact() {
  document.getElementById('contactPhone').textContent = SITE_DATA.contact.phone;
  document.getElementById('contactEmail').textContent = SITE_DATA.contact.email;
  const instaLink = document.getElementById('instagramLink');
  instaLink.href = SITE_DATA.contact.instagram.url;
  instaLink.textContent = SITE_DATA.contact.instagram.handle;
}

// WHATSAPP MODAL + REDIRECTION
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappModal = document.getElementById('whatsappModal');
const closeModal = document.getElementById('closeModal');
const packageForm = document.getElementById('packageForm');

whatsappBtn.onclick = () => {
  whatsappModal.style.display = "flex";
  renderModalForm();
};
closeModal.onclick = () => whatsappModal.style.display = "none";
window.onclick = (e) => {
  if (e.target === whatsappModal) whatsappModal.style.display = "none";
};

function renderModalForm() {
  packageForm.innerHTML = "";
  if (!SITE_DATA) return;
  SITE_DATA.packages.forEach((pkg, idx) => {
    packageForm.innerHTML += `
      <label>
        <input type="checkbox" name="package" value="${pkg.name}">
        ${pkg.name}
      </label>
    `;
  });
  packageForm.innerHTML += `
    <button type="submit" class="modal-send">Send Inquiry</button>
  `;
}

packageForm.onsubmit = (e) => {
  e.preventDefault();
  if (!SITE_DATA) return;
  const selected = Array.from(packageForm.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  let message = "Hello! I am interested in your bridal package.";
  if (selected.length) {
    message = `Hello! I would like to know more about: ${selected.join(", ")}.`;
  }
  // WhatsApp redirection
  const phoneNum = SITE_DATA.contact.phone.replace(/[^0-9+]/g, ''); // Clean number for URL
  const whatsappURL = `https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
};

// --------- FILTER LOGIC ---------
function getFilterValues() {
  return {
    name: document.getElementById('filterName').value.trim().toLowerCase(),
    price: document.getElementById('filterPrice').value,
    feature: document.getElementById('filterFeature').value.trim().toLowerCase(),
    bestSeller: document.getElementById('filterBestSeller').checked
  };
}

function filterPackages(packages) {
  const { name, price, feature, bestSeller } = getFilterValues();
  return packages.filter(pkg => {
    // Name filter
    if (name && !pkg.name.toLowerCase().includes(name)) return false;
    // Price filter
    if (price) {
      // Remove non-digits for price comparison
      const offerPrice = parseInt(pkg.offerPrice.replace(/[^0-9]/g, ''));
      if (price === 'lt10000' && !(offerPrice < 10000)) return false;
      if (price === '10000-20000' && !(offerPrice >= 10000 && offerPrice <= 20000)) return false;
      if (price === '20000-30000' && !(offerPrice > 20000 && offerPrice <= 30000)) return false;
      if (price === 'gt30000' && !(offerPrice > 30000)) return false;
    }
    // Feature filter
    if (feature) {
      const features = (pkg.features || []).map(f => f.toLowerCase());
      if (!features.some(f => f.includes(feature))) return false;
    }
    // Best seller filter
    if (bestSeller && !pkg.bestSeller) return false;
    return true;
  });
}

// Listen for filter changes
window.addEventListener('DOMContentLoaded', function() {
  const filterForm = document.getElementById('packageFilterForm');
  if (filterForm) {
    filterForm.addEventListener('input', () => {
      renderPackages();
    });
  }
});

// INITIAL RENDER
fetchSiteData();
  