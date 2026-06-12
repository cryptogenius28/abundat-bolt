-- Seed initial categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Electronics', 'electronics', 'Gadgets, devices, and tech accessories', 1),
('Fashion', 'fashion', 'Clothing, shoes, and accessories', 2),
('Home & Garden', 'home-garden', 'Home decor, furniture, and garden supplies', 3),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 4),
('Beauty & Health', 'beauty-health', 'Skincare, makeup, and wellness products', 5),
('Toys & Games', 'toys-games', 'Toys, board games, and entertainment', 6),
('Books & Media', 'books-media', 'Books, music, and movies', 7),
('Automotive', 'automotive', 'Car accessories and parts', 8)
ON CONFLICT (slug) DO NOTHING;