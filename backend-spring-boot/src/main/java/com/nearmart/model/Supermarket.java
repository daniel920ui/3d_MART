package com.nearmart.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supermarkets")
public class Supermarket {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String locality;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "opening_hours", nullable = false, length = 100)
    private String openingHours;

    @Column(name = "delivery_available", nullable = false)
    private Boolean deliveryAvailable = true;

    @Column(name = "pickup_available", nullable = false)
    private Boolean pickupAvailable = true;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating = new BigDecimal("4.8");

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "min_order", precision = 10, scale = 2)
    private BigDecimal minOrder = new BigDecimal("15.00");

    public Supermarket() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public Boolean getDeliveryAvailable() { return deliveryAvailable; }
    public void setDeliveryAvailable(Boolean deliveryAvailable) { this.deliveryAvailable = deliveryAvailable; }
    public Boolean getPickupAvailable() { return pickupAvailable; }
    public void setPickupAvailable(Boolean pickupAvailable) { this.pickupAvailable = pickupAvailable; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getMinOrder() { return minOrder; }
    public void setMinOrder(BigDecimal minOrder) { this.minOrder = minOrder; }
}
