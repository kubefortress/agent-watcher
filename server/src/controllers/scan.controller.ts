import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as scanService from '../services/scan.service';
import { ScanResult } from 'shared';

// Active scans with their status
const scanStore: Record<string, {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: ScanResult[];
  error?: string;
}> = {};

/**
 * Handle file uploads and initiate scanning
 */
export const scanFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded'
      });
    }
    
    // Extract scan options from request
    const deepAnalysis = req.body.deepAnalysis === 'true';
    
    // Generate a unique scan ID
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Register the scan as pending
    scanStore[scanId] = {
      status: 'pending'
    };
    
    // Return the scan ID immediately
    res.status(202).json({
      message: 'Files received for scanning',
      scanId
    });
    
    // Process files asynchronously
    processScan(scanId, files, { deepAnalysis });
    
  } catch (error) {
    console.error('Error scanning files:', error);
    res.status(500).json({
      error: 'Failed to process uploaded files'
    });
  }
};

/**
 * Get the status and results of a scan
 */
export const getScanStatus = (req: Request, res: Response) => {
  const { scanId } = req.params;
  
  if (!scanStore[scanId]) {
    return res.status(404).json({
      error: 'Scan not found'
    });
  }
  
  const scan = scanStore[scanId];
  
  res.status(200).json({
    scanId,
    status: scan.status,
    results: scan.status === 'completed' ? scan.results : undefined,
    error: scan.error
  });
};

/**
 * Process a scan asynchronously
 */
async function processScan(
  scanId: string, 
  files: Express.Multer.File[], 
  options: { deepAnalysis: boolean }
): Promise<void> {
  try {
    // Update status to processing
    scanStore[scanId].status = 'processing';
    
    const results: ScanResult[] = [];
    
    // Process each file
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        
        // Analyze the file content
        const result = await scanService.analyzeFile(
          content, 
          file.originalname, 
          options
        );
        
        results.push(result);
        
        // Clean up the temporary file
        fs.unlinkSync(file.path);
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        // Continue processing other files even if one fails
      }
    }
    
    // Update the store with completed results
    scanStore[scanId] = {
      status: 'completed',
      results
    };
    
    // Clean up scan results after 30 minutes
    setTimeout(() => {
      delete scanStore[scanId];
    }, 30 * 60 * 1000);
    
  } catch (error) {
    console.error('Error processing scan:', error);
    
    // Update the store with error
    scanStore[scanId] = {
      status: 'failed',
      error: (error as Error).message
    };
    
    // Clean up scan error after 15 minutes
    setTimeout(() => {
      delete scanStore[scanId];
    }, 15 * 60 * 1000);
  }
}
