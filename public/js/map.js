// This file is part of the Real Estate Management System project.
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize map if the map container exists on the page
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    // We're not on a page with a map, exit gracefully
    return;
  }

  try {
    // Check if coordinates are defined and valid
    if (
      typeof geoCoordinates === "undefined" ||
      !Array.isArray(geoCoordinates) ||
      geoCoordinates.length < 2
    ) {
      console.warn("Invalid coordinates. Using default location.");
      geoCoordinates = [78.9629, 20.5937]; // Default to center of India
    }

    // Initialize the map
    var map = L.map("map").setView([geoCoordinates[1], geoCoordinates[0]], 13); // [latitude, longitude]

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Place the marker on the map using the coordinates provided
    L.marker([geoCoordinates[1], geoCoordinates[0]])
      .addTo(map)
      .bindPopup("<b>Listing Location</b><br>Location is here.")
      .openPopup();
  } catch (error) {
    console.error("Error initializing map:", error);
    if (mapContainer) {
      mapContainer.innerHTML =
        '<p class="text-danger">Map could not be loaded.</p>';
    }
  }
});
