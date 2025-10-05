// script.js - FleetPro Dashboard Logic

const AppController = {
    bookingsData: [],
    
    init() {
        this.bookingsData.push(
            { id: 999991, status: 'ongoing', pickupLocation: 'Office Tower A', dropoffLocation: 'Downtown Hotel', tripDate: '2025-10-05', tripTime: '10:00', vehicleType: 'Sedan (4 Seater)', guestName: 'John Smith' },
            { id: 999992, status: 'completed', pickupLocation: 'Airport T3', dropoffLocation: 'Office Tower B', tripDate: '2025-10-04', tripTime: '18:30', vehicleType: 'SUV (6 Seater)', guestName: 'Alice Johnson' }
        );

        this.cacheDOM();
        this.bindEvents();
        this.setDefaultView();
        this.renderAllTabs();
    },

    cacheDOM() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.dashboard-section');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.bookingForm = document.getElementById('bookingForm');
        this.ongoingContainer = document.getElementById('ongoing');
        this.upcomingContainer = document.getElementById('upcoming');
        this.completedContainer = document.getElementById('completed');
    },

    bindEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.getAttribute('data-section'));
            });
        });

        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.showTab(button.getAttribute('data-tab'), button);
            });
        });

        this.bookingForm?.addEventListener('submit', this.handleFormSubmit.bind(this));
    },

    setDefaultView() {
        this.switchSection('bookings');
        this.showTab('ongoing');
    },

    switchSection(sectionId) {
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        targetSection?.classList.add('active');

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    },

    showTab(tabId, clickedButton) {
        document.querySelectorAll('.tab-content').forEach(div => {
            div.style.display = 'none';
        });

        const selectedTab = document.getElementById(tabId);
        selectedTab?.style.setProperty('display', 'block', 'important');

        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        if (clickedButton) {
            clickedButton.classList.add('active');
        } else {
            document.querySelector(`.tabs button[data-tab='${tabId}']`)?.classList.add('active');
        }
    },

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = {
            id: Date.now(),
            status: 'upcoming',
            pickupLocation: document.getElementById('pickupLocation').value,
            dropoffLocation: document.getElementById('dropoffLocation').value,
            tripDate: document.getElementById('tripDate').value,
            tripTime: document.getElementById('tripTime').value,
            vehicleType: document.getElementById('vehicleType').value,
            guestName: document.getElementById('guestName').value,
        };

        this.bookingsData.push(formData);

        this.renderAllTabs();
        
        alert("✅ Booking successfully submitted! Tracking reference: #TRP-" + Math.floor(formData.id / 100000));
        this.bookingForm.reset();
        
        this.switchSection('bookings');
        this.showTab('upcoming');
    },
    
    renderAllTabs() {
        const ongoing = this.bookingsData.filter(b => b.status === 'ongoing');
        const upcoming = this.bookingsData.filter(b => b.status === 'upcoming');
        const completed = this.bookingsData.filter(b => b.status === 'completed');

        this.renderTabContent(this.ongoingContainer, ongoing, 'Ongoing', 'fas fa-circle-notch fa-spin');
        this.renderTabContent(this.upcomingContainer, upcoming, 'Upcoming', 'fas fa-calendar-alt');
        this.renderTabContent(this.completedContainer, completed, 'Completed', 'fas fa-history');
        
        this.addCancelListeners();
    },
    
    renderTabContent(container, data, statusText, iconClass) {
        if (!container) return;
        
        if (data.length === 0) {
            container.innerHTML = 
                `<div class="empty-state"><i class="${iconClass}"></i> No ${statusText} trips found.</div>`;
            return;
        }

        let bookingsHTML = '<div class="booking-list">';
        
        data.forEach((booking) => {
            const refNumber = Math.floor(booking.id / 100000);
            const routeDisplay = `${booking.pickupLocation} &rarr; ${booking.dropoffLocation}`;
            const isOngoing = booking.status === 'ongoing';
            const isCompleted = booking.status === 'completed';

            bookingsHTML += `
                <div class="booking-item card" data-id="${booking.id}">
                    <div class="booking-header">
                        <span class="booking-ref">#TRP-${refNumber}</span>
                        <span class="booking-status status-${booking.status}">
                            <i class="${isOngoing ? 'fas fa-truck' : isCompleted ? 'fas fa-check-circle' : 'fas fa-hourglass-half'}"></i> 
                            ${isOngoing ? 'On Trip' : isCompleted ? 'Completed' : 'Awaiting Dispatch'}
                        </span>
                    </div>
                    <div class="booking-details">
                        <p><strong><i class="fas fa-calendar-day"></i> Date:</strong> ${booking.tripDate}</p>
                        <p><strong><i class="fas fa-clock"></i> Time:</strong> ${booking.tripTime}</p>
                        <p><strong><i class="fas fa-map-marker-alt"></i> Route:</strong> ${routeDisplay}</p>
                        <p><strong><i class="fas fa-car-side"></i> Vehicle:</strong> ${booking.vehicleType}</p>
                    </div>
                    ${!isCompleted ? `<button class="action-button cancel-button" data-id="${booking.id}"><i class="fas fa-times-circle"></i> Cancel Trip</button>` : ''}
                </div>
            `;
        });

        bookingsHTML += '</div>';
        container.innerHTML = bookingsHTML;
    },

    addCancelListeners() {
        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = parseInt(e.currentTarget.getAttribute('data-id'));
                if (confirm("Are you sure you want to cancel this booking?")) {
                    this.cancelBooking(bookingId);
                }
            });
        });
    },

    cancelBooking(id) {
        const index = this.bookingsData.findIndex(booking => booking.id === id);
        
        if (index !== -1) {
            this.bookingsData.splice(index, 1); 
            alert(`Booking #TRP-${Math.floor(id/100000)} has been cancelled.`);
            this.renderAllTabs();
        }
    }
};

function initMap() {
    const mapElement = document.getElementById("mapPlaceholder");
    if (!mapElement) return;

    const center = { lat: 28.6139, lng: 77.2090 };

    const mapInstance = new google.maps.Map(mapElement, {
        zoom: 12,
        center: center,
        disableDefaultUI: true, 
        zoomControl: true,
        styles: [ 
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#d1e0eb" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#808080" }] }
        ]
    });

    new google.maps.Marker({
        position: { lat: 28.625, lng: 77.218 },
        map: mapInstance, 
        icon: {
            path: google.maps.SymbolPath.CAR,
            scale: 8,
            fillColor: '#dc3545',
            fillOpacity: 1,
            strokeWeight: 0
        },
        title: "Live Cab: FLT-456"
    });
}

document.addEventListener("DOMContentLoaded", () => {
    AppController.init();
});