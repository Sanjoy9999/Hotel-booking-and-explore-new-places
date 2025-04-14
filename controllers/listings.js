const listing = require("../models/listing");

module.exports.index = async (req, res) => {
  try {
    let listings = await listing.find({});
    res.render("listings/index", { listings });
  } catch (err) {
    console.error("Error in index route:", err);
    req.flash("error", "Failed to load listings, please try again");
    res.redirect("/");
  }
};

// This function is used to render the new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listings = await listing
      .findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listings) {
      req.flash("error", "listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show", { listings });
  } catch (err) {
    console.error("Error in show listing:", err);
    next(err);
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    const { default: fetch } = await import("node-fetch");
    const location = req.body.listing.location;
    let geoLocation = null;

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        location
      )}&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (geoData.length > 0) {
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        geoLocation = {
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)],
        };
      } else {
        console.log("Location not found for geocoding.");
      }
    } catch (geoError) {
      console.error("Error with geocoding:", geoError);
      // Continue without geometry data
    }

    let url = req.file ? req.file.path : "";
    let filename = req.file ? req.file.filename : "";
    const Newlisting = new listing(req.body.listing);
    Newlisting.owner = req.user._id;

    if (req.file) {
      Newlisting.image = { url, filename };
    }

    if (geoLocation) {
      Newlisting.Geometry = geoLocation;
    }

    let saveListing = await Newlisting.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings`);
  } catch (err) {
    console.error("Error in create listing:", err);
    next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  if (!listings) {
    req.flash("error", "listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listings.image.url;
  originalImageUrl = originalImageUrl.replace("upload", "upload/w_200,");
  res.render("listings/edit", { listings, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let newUpdateListing = await listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newUpdateListing.image = { url, filename };
    await newUpdateListing.save();
  }
  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};
