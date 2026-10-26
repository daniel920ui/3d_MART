package com.nearmart.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "package_size", nullable = false, length = 100)
    private String packageSize;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer aisle = 1;

    @Column(name = "shelf_section", length = 5)
    private String shelfSection = "A";

    @Column(name = "model_3d", length = 30)
    private String model3D = "box";

    @Column(name = "color_3d", length = 20)
    private String color3D = "#16a34a";

    public Product() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPackageSize() { return packageSize; }
    public void setPackageSize(String packageSize) { this.packageSize = packageSize; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Integer getAisle() { return aisle; }
    public void setAisle(Integer aisle) { this.aisle = aisle; }
    public String getShelfSection() { return shelfSection; }
    public void setShelfSection(String shelfSection) { this.shelfSection = shelfSection; }
    public String getModel3D() { return model3D; }
    public void setModel3D(String model3D) { this.model3D = model3D; }
    public String getColor3D() { return color3D; }
    public void setColor3D(String color3D) { this.color3D = color3D; }
}
