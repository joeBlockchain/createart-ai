-- Create the generated_images table
CREATE TABLE generated_images (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL,
    style_preset TEXT,
    negative_prompt TEXT,
    seed BIGINT NOT NULL,
    ai_improve_prompt BOOLEAN NOT NULL,
    model TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the created_at column for faster querying
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at);

-- Set up Row Level Security (RLS) to control access to the table
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to insert their own records
CREATE POLICY "Users can insert their own images"
ON generated_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth.uid());

-- Create a policy that allows users to select only their own records
CREATE POLICY "Users can view their own images"
ON generated_images FOR SELECT
TO authenticated
USING (auth.uid() = auth.uid());

-- Optional: Create a policy that allows users to update their own records
CREATE POLICY "Users can update their own images"
ON generated_images FOR UPDATE
TO authenticated
USING (auth.uid() = auth.uid());

-- Optional: Create a policy that allows users to delete their own records
CREATE POLICY "Users can delete their own images"
ON generated_images FOR DELETE
TO authenticated
USING (auth.uid() = auth.uid());