import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Function to extract text content from different file types
async function extractTextContent(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    switch (fileExtension) {
      case 'txt':
      case 'md':
        return await file.text();
      
      case 'pdf':
        // For PDF files, we'll return a placeholder since we'd need a PDF parser
        // In production, you'd want to use a library like pdf-parse or pdf2pic
        return `[PDF File: ${file.name} - Content extraction not implemented yet. Please copy and paste the text content.]`;
      
      case 'doc':
      case 'docx':
        // For Word documents, we'd need a library like mammoth
        return `[Word Document: ${file.name} - Content extraction not implemented yet. Please copy and paste the text content.]`;
      
      default:
        return `[File: ${file.name} - Content extraction not supported for this file type.]`;
    }
  } catch (error) {
    console.error('Error extracting text content:', error);
    return `[Error reading file: ${file.name}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (50MB limit for better support)
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800'); // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    // Check file type
    const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'pdf,txt,doc,docx,md').split(',');
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Extract text content from the file
    const textContent = await extractTextContent(file);
    
    // Read file content for storage
    const arrayBuffer = await file.arrayBuffer();
    const content = Buffer.from(arrayBuffer).toString('base64');

    const attachment = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      textContent, // Add extracted text content
      uploadedAt: new Date(),
    };

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
