-- Create storage bucket for options analyzer cache
INSERT INTO storage.buckets (id, name, public) 
VALUES ('options-analyzer', 'options-analyzer', true);

-- Create policies for public read access to the bucket
CREATE POLICY "Public read access for options analyzer" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'options-analyzer');