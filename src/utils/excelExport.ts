import * as FileSystem from 'expo-file-system';
import { Alert, Share } from 'react-native';
import ExcelJS from 'exceljs';
import { IDScanData } from './database';

// Function to export ID scan data to Excel
export const exportToExcel = async (data: IDScanData[]): Promise<void> => {
  try {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ID Scans');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'ID Number', key: 'idNumber', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Expiry Date', key: 'expiryDate', width: 15 },
      { header: 'Scan Date', key: 'scanDate', width: 20 },
      { header: 'Additional Info', key: 'additionalInfo', width: 30 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    data.forEach(item => {
      worksheet.addRow({
        name: item.name,
        dateOfBirth: item.dateOfBirth,
        idNumber: item.idNumber,
        address: item.address,
        issueDate: item.issueDate || '',
        expiryDate: item.expiryDate || '',
        scanDate: new Date(item.scanDate).toLocaleString(),
        additionalInfo: item.additionalInfo || ''
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Generate Excel file
    const fileName = `id_scans_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Convert buffer to base64
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Write the Excel file
    await FileSystem.writeAsStringAsync(filePath, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Share the file
    await shareExcelFile(filePath, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};

// Function to share the Excel file
const shareExcelFile = async (filePath: string, fileName: string): Promise<void> => {
  try {
    const contentUri = await FileSystem.getContentUriAsync(filePath);
    
    const result = await Share.share({
      url: contentUri,
      title: 'ID Scan Data',
      message: 'Here is the exported ID scan data'
    });
    
    if (result.action === Share.sharedAction) {
      console.log(result.activityType ? 
        `Shared with ${result.activityType}` : 
        'Shared successfully'
      );
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    console.error('Error sharing Excel file:', error);
    Alert.alert(
      'File Available',
      `The Excel file has been saved to ${filePath}. You can access it through your file manager.`
    );
  }
};