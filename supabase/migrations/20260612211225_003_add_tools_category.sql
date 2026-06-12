-- Add missing Tools category
INSERT INTO categories (name, slug, description, display_order) VALUES
('Tools & Hardware', 'tools', 'Professional-grade tools and equipment for every project', 9)
ON CONFLICT (slug) DO NOTHING;